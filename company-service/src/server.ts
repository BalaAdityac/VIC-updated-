import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient, InternshipStatus, InternshipMode, ApplicationStatus, InterviewStatus, OfferStatus, OnboardingStatus, CompanyStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import cors from '@fastify/cors';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const prisma = new PrismaClient();
const app: FastifyInstance = Fastify({ logger: true });



// ==========================================
// TYPES & EXTENSIONS
// ==========================================
export interface AuthUser {
  id: string;
  email: string;
  role: 'COMPANY' | 'STUDENT' | 'ADMIN';
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

// ==========================================
// ZOD VALIDATION SCHEMAS
// ==========================================
const RegisterCompanySchema = z.object({
  companyName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().max(2000).optional(),
  address: z.string().optional(),
  gstNumber: z.string().max(50).optional()
});

const LoginCompanySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6)
});

const CreateInternshipSchema = z.object({
  title: z.string().min(3).max(150),
  description: z.string().min(10),
  location: z.string().min(2),
  mode: z.enum(['REMOTE', 'HYBRID', 'ON_SITE']).default('REMOTE'),
  salary: z.number().nonnegative().optional(),
  stipend: z.number().nonnegative().optional(),
  durationMonths: z.number().int().positive().optional(),
  skills: z.array(z.string()).min(1),
  status: z.enum(['DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED']).default('DRAFT'),
  deadline: z.string().datetime().optional()
});

const CreateApplicationSchema = z.object({
  internshipId: z.string().uuid(),
  studentId: z.string().uuid(),
  resumeUrl: z.string().url(),
  coverLetter: z.string().max(3000).optional(),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal(''))
});

const CreateInterviewSchema = z.object({
  applicationId: z.string().uuid(),
  roundNumber: z.number().int().positive(),
  roundName: z.string().min(2).max(100),
  meetingUrl: z.string().url().optional().or(z.literal('')),
  scheduledAt: z.string().datetime()
});

const CreateEvaluationSchema = z.object({
  interviewId: z.string().uuid(),
  evaluatorId: z.string().uuid(),
  score: z.number().min(0).max(10),
  passed: z.boolean(),
  feedback: z.string().min(5)
});

const CreateOfferSchema = z.object({
  applicationId: z.string().uuid(),
  stipendAmount: z.number().positive(),
  joiningDate: z.string().datetime(),
  offerLetterUrl: z.string().url()
});

const RespondOfferSchema = z.object({
  status: z.enum(['ACCEPTED', 'DECLINED'])
});

const CreateOnboardingSchema = z.object({
  offerId: z.string().uuid(),
  startDate: z.string().datetime(),
  notes: z.string().optional()
});

const UpdateOnboardingStatusSchema = z.object({
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'])
});

const VerifyCompanySchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED'])
});

// ==========================================
// MIDDLEWARES & HELPERS
// ==========================================
async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Bearer token missing' });
    }
    const token = authHeader.split(' ')[1];
    request.user = jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch (err) {
    return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
}

async function checkInternshipOwnership(internshipId: string, companyId: string) {
  const internship = await prisma.internship.findFirst({
    where: { id: internshipId, deletedAt: null }
  });
  if (!internship) return { error: 'NOT_FOUND', message: 'Internship posting not found' };
  if (internship.companyId !== companyId) return { error: 'FORBIDDEN', message: 'Forbidden' };
  return { internship };
}

// ==========================================
// ROUTES
// ==========================================

app.get('/', async () => ({ message: 'Welcome to ATS Service API', version: '1.0.0', status: 'ONLINE' }));
app.get('/health', async () => ({ status: 'UP', timestamp: new Date().toISOString() }));
app.get('/favicon.ico', (request, reply) => reply.status(204).send());

// --- DASHBOARD & SETTINGS ---
app.get('/api/company/dashboard', { preHandler: [authenticate] }, async (request, reply) => {
  const companyId = request.user!.id;

  const [totalJobs, activeJobs, totalApplications, totalOffers, acceptedOffers] = await Promise.all([
    prisma.internship.count({ where: { companyId, deletedAt: null } }),
    prisma.internship.count({ where: { companyId, status: InternshipStatus.ACTIVE, deletedAt: null } }),
    prisma.application.count({ where: { internship: { companyId }, deletedAt: null } }),
    prisma.offer.count({ where: { application: { internship: { companyId } } } }),
    prisma.offer.count({ where: { application: { internship: { companyId } }, status: OfferStatus.ACCEPTED } })
  ]);

  return reply.send({ stats: { totalJobs, activeJobs, totalApplications, totalOffers, acceptedOffers } });
});

app.patch('/api/company/change-password', { preHandler: [authenticate] }, async (request, reply) => {
  const validation = ChangePasswordSchema.safeParse(request.body);
  if (!validation.success) return reply.status(400).send({ error: 'Validation Error', details: validation.error.format() });

  const { currentPassword, newPassword } = validation.data;
  const company = await prisma.company.findUnique({ where: { id: request.user!.id } });

  if (!company || !(await bcrypt.compare(currentPassword, company.passwordHash))) {
    return reply.status(400).send({ error: 'Bad Request', message: 'Current password is incorrect' });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.company.update({ where: { id: company.id }, data: { passwordHash } });

  return reply.send({ message: 'Password updated successfully' });
});

// --- ADMIN VERIFICATION ---
app.patch('/api/admin/companies/:id/verify', async (request, reply) => {
  const { id } = request.params as { id: string };
  const validation = VerifyCompanySchema.safeParse(request.body);
  if (!validation.success) return reply.status(400).send({ error: 'Validation Error', details: validation.error.format() });

  const company = await prisma.company.update({
    where: { id },
    data: { status: validation.data.status as CompanyStatus }
  });

  return reply.send({ message: `Company verification status set to ${validation.data.status}`, company });
});

// --- COMPANY AUTH & PROFILE ---
app.post('/api/company/register', async (request, reply) => {
  const validation = RegisterCompanySchema.safeParse(request.body);
  if (!validation.success) return reply.status(400).send({ error: 'Validation Error', details: validation.error.format() });

  const { companyName, email, password, website, description, address, gstNumber } = validation.data;
  const existing = await prisma.company.findUnique({ where: { email } });
  if (existing) return reply.status(400).send({ error: 'Conflict', message: 'Email address already registered' });

  const passwordHash = await bcrypt.hash(password, 12);
  const company = await prisma.company.create({
    data: { companyName, email, passwordHash, website: website || null, description: description || null, address: address || null, gstNumber: gstNumber || null }
  });

  const token = jwt.sign({ id: company.id, email: company.email, role: 'COMPANY' }, JWT_SECRET, { expiresIn: '7d' });
  return reply.status(201).send({ message: 'Company registered', token, company });
});

app.post('/api/company/login', async (request, reply) => {
  const validation = LoginCompanySchema.safeParse(request.body);
  if (!validation.success) return reply.status(400).send({ error: 'Validation Error', details: validation.error.format() });

  const { email, password } = validation.data;
  const company = await prisma.company.findFirst({ where: { email, deletedAt: null } });
  if (!company || !(await bcrypt.compare(password, company.passwordHash))) {
    return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: company.id, email: company.email, role: 'COMPANY' }, JWT_SECRET, { expiresIn: '7d' });
  return reply.send({ message: 'Login successful', token });
});

// --- INTERNSHIPS ---
app.post('/api/internships', { preHandler: [authenticate] }, async (request, reply) => {
  const validation = CreateInternshipSchema.safeParse(request.body);
  if (!validation.success) return reply.status(400).send({ error: 'Validation Error', details: validation.error.format() });

  const data = validation.data;
  const internship = await prisma.internship.create({
    data: {
      companyId: request.user!.id,
      title: data.title,
      description: data.description,
      location: data.location,
      mode: data.mode as InternshipMode,
      salary: data.salary || null,
      stipend: data.stipend || null,
      skills: data.skills,
      status: data.status as InternshipStatus,
      deadline: data.deadline ? new Date(data.deadline) : null
    }
  });

  return reply.status(201).send({ message: 'Internship created', internship });
});

// --- APPLICATIONS ---
app.post('/api/applications', async (request, reply) => {
  const validation = CreateApplicationSchema.safeParse(request.body);
  if (!validation.success) return reply.status(400).send({ error: 'Validation Error', details: validation.error.format() });

  const { internshipId, studentId, resumeUrl, coverLetter, portfolioUrl, githubUrl } = validation.data;
  const application = await prisma.application.create({
    data: { internshipId, studentId, resumeUrl, coverLetter: coverLetter || null, portfolioUrl: portfolioUrl || null, githubUrl: githubUrl || null }
  });

  return reply.status(201).send({ message: 'Application submitted', application });
});

// --- INTERVIEWS ---
app.post('/api/interviews', { preHandler: [authenticate] }, async (request, reply) => {
  const validation = CreateInterviewSchema.safeParse(request.body);
  if (!validation.success) return reply.status(400).send({ error: 'Validation Error', details: validation.error.format() });

  const { applicationId, roundNumber, roundName, meetingUrl, scheduledAt } = validation.data;
  const interview = await prisma.$transaction([
    prisma.interview.create({
      data: { applicationId, roundNumber, roundName, meetingUrl: meetingUrl || null, scheduledAt: new Date(scheduledAt) }
    }),
    prisma.application.update({ where: { id: applicationId }, data: { status: ApplicationStatus.INTERVIEWING } })
  ]);

  return reply.status(201).send({ message: 'Interview scheduled', interview: interview[0] });
});

// --- EVALUATIONS & OFFERS ---
app.post('/api/evaluations', { preHandler: [authenticate] }, async (request, reply) => {
  const validation = CreateEvaluationSchema.safeParse(request.body);
  if (!validation.success) return reply.status(400).send({ error: 'Validation Error', details: validation.error.format() });

  const evaluation = await prisma.evaluation.create({ data: validation.data });
  return reply.status(201).send({ message: 'Evaluation saved', evaluation });
});

app.post('/api/offers', { preHandler: [authenticate] }, async (request, reply) => {
  const validation = CreateOfferSchema.safeParse(request.body);
  if (!validation.success) return reply.status(400).send({ error: 'Validation Error', details: validation.error.format() });

  const { applicationId, stipendAmount, joiningDate, offerLetterUrl } = validation.data;
  const offer = await prisma.$transaction([
    prisma.offer.create({ data: { applicationId, stipendAmount, joiningDate: new Date(joiningDate), offerLetterUrl } }),
    prisma.application.update({ where: { id: applicationId }, data: { status: ApplicationStatus.OFFERED } })
  ]);

  return reply.status(201).send({ message: 'Offer issued', offer: offer[0] });
});

app.patch('/api/offers/:id/respond', async (request, reply) => {
  const { id } = request.params as { id: string };
  const validation = RespondOfferSchema.safeParse(request.body);
  if (!validation.success) return reply.status(400).send({ error: 'Validation Error', details: validation.error.format() });

  const offer = await prisma.offer.update({ where: { id }, data: { status: validation.data.status as OfferStatus } });
  return reply.send({ message: `Offer ${validation.data.status.toLowerCase()}`, offer });
});

// --- ONBOARDING MODULE ---
app.post('/api/onboarding', { preHandler: [authenticate] }, async (request, reply) => {
  const validation = CreateOnboardingSchema.safeParse(request.body);
  if (!validation.success) return reply.status(400).send({ error: 'Validation Error', details: validation.error.format() });

  const { offerId, startDate, notes } = validation.data;
  const offer = await prisma.offer.findUnique({ where: { id: offerId } });

  if (!offer || offer.status !== OfferStatus.ACCEPTED) {
    return reply.status(400).send({ error: 'Bad Request', message: 'Onboarding can only be initiated for accepted offers' });
  }

  const onboarding = await prisma.onboarding.create({
    data: { offerId, startDate: new Date(startDate), notes: notes || null }
  });

  return reply.status(201).send({ message: 'Candidate onboarding initiated', onboarding });
});

app.patch('/api/onboarding/:id/status', { preHandler: [authenticate] }, async (request, reply) => {
  const { id } = request.params as { id: string };
  const validation = UpdateOnboardingStatusSchema.safeParse(request.body);
  if (!validation.success) return reply.status(400).send({ error: 'Validation Error', details: validation.error.format() });

  const onboarding = await prisma.onboarding.update({
    where: { id },
    data: { status: validation.data.status as OnboardingStatus }
  });

  return reply.send({ message: `Onboarding status updated to ${validation.data.status}`, onboarding });
});

// Global Error Handler
app.setErrorHandler((error, request, reply) => {
  app.log.error(error);
  reply.status(500).send({ error: 'Internal Server Error', message: (error as Error).message || 'Unexpected Error' });
});

// Start Server
const start = async () => {
  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 Complete ATS Backend API running at http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();