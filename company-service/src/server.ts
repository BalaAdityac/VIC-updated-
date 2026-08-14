import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import {
  PrismaClient,
  CompanyStatus,
  InternshipStatus,
  InternshipMode,
  ApplicationStatus,
  InterviewStatus,
  OfferStatus,
  OnboardingStatus
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const prisma = new PrismaClient();
const app: FastifyInstance = Fastify({ logger: true });

// Register CORS
app.register(cors, {
  origin: true
});

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
  companyName: z.string().min(2, "Company name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  description: z.string().max(2000).optional(),
  address: z.string().optional(),
  gstNumber: z.string().max(50).optional()
});

const LoginCompanySchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required")
});

const UpdateCompanyProfileSchema = z.object({
  companyName: z.string().min(2).max(100).optional(),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().max(2000).optional(),
  address: z.string().optional(),
  gstNumber: z.string().max(50).optional()
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters")
});

const VerifyCompanySchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED'])
});

const CreateInternshipSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(150),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(2, "Location is required"),
  mode: z.enum(['REMOTE', 'HYBRID', 'ON_SITE']).default('REMOTE'),
  salary: z.number().nonnegative().optional(),
  stipend: z.number().nonnegative().optional(),
  durationMonths: z.number().int().positive().optional(),
  skills: z.array(z.string()).min(1, "Specify at least one skill"),
  status: z.enum(['DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED']).default('DRAFT'),
  deadline: z.string().datetime().optional()
});

const UpdateInternshipSchema = CreateInternshipSchema.partial();

const ChangeInternshipStatusSchema = z.object({
  status: z.enum(['DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED'])
});

const InternshipQuerySchema = z.object({
  status: z.enum(['DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED']).optional()
});

const SearchInternshipQuerySchema = z.object({
  search: z.string().optional(),
  mode: z.enum(['REMOTE', 'HYBRID', 'ON_SITE']).optional(),
  location: z.string().optional()
});

const CreateApplicationSchema = z.object({
  internshipId: z.string().uuid("Invalid Internship UUID"),
  studentId: z.string().uuid("Invalid Student UUID"),
  resumeUrl: z.string().url("Valid resume URL is required"),
  coverLetter: z.string().max(3000).optional(),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal(''))
});

const StudentApplySchema = z.object({
  internshipId: z.string().uuid("Invalid Internship UUID"),
  resumeUrl: z.string().url("Valid resume URL is required"),
  coverLetter: z.string().max(3000).optional(),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal(''))
});

const UpdateApplicationStatusSchema = z.object({
  status: z.enum(['APPLIED', 'SHORTLISTED', 'INTERVIEWING', 'OFFERED', 'REJECTED', 'WITHDRAWN'])
});

const CreateInterviewSchema = z.object({
  applicationId: z.string().uuid("Invalid Application UUID"),
  roundNumber: z.number().int().positive("Round number must be positive"),
  roundName: z.string().min(2).max(100),
  meetingUrl: z.string().url().optional().or(z.literal('')),
  scheduledAt: z.string().datetime("Scheduled time must be an ISO date string")
});

const UpdateInterviewStatusSchema = z.object({
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED'])
});

const CreateEvaluationSchema = z.object({
  interviewId: z.string().uuid("Invalid Interview UUID"),
  evaluatorId: z.string().uuid("Invalid Evaluator UUID"),
  score: z.number().min(0).max(10, "Score must be between 0 and 10"),
  passed: z.boolean(),
  feedback: z.string().min(5, "Feedback must be at least 5 characters")
});

const CreateOfferSchema = z.object({
  applicationId: z.string().uuid("Invalid Application UUID"),
  stipendAmount: z.number().positive("Stipend amount must be positive"),
  joiningDate: z.string().datetime("Joining date must be an ISO date string"),
  offerLetterUrl: z.string().url("Valid offer letter URL is required")
});

const RespondOfferSchema = z.object({
  status: z.enum(['ACCEPTED', 'DECLINED'])
});

const CreateOnboardingSchema = z.object({
  offerId: z.string().uuid("Invalid Offer UUID"),
  startDate: z.string().datetime("Start date must be an ISO date string"),
  notes: z.string().optional()
});

const UpdateOnboardingStatusSchema = z.object({
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'])
});

// ==========================================
// MIDDLEWARES & OWNERSHIP HELPERS
// ==========================================
async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Bearer token missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    request.user = jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch (err) {
    return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or expired JWT token' });
  }
}

async function checkInternshipOwnership(internshipId: string, companyId: string) {
  const internship = await prisma.internship.findFirst({
    where: { id: internshipId, deletedAt: null }
  });

  if (!internship) return { error: 'NOT_FOUND', message: 'Internship posting not found' };
  if (internship.companyId !== companyId) return { error: 'FORBIDDEN', message: 'Forbidden: You do not own this internship' };

  return { internship };
}

// ==========================================
// ROUTE HANDLERS
// ==========================================

// 1. Root, Health Check & Favicon
app.get('/', async () => ({
  message: 'Welcome to ATS Company & Application Service API',
  version: '1.0.0',
  documentation: '/health',
  status: 'ONLINE'
}));

app.get('/health', async () => ({
  status: 'UP',
  service: 'Full ATS Platform API',
  timestamp: new Date().toISOString()
}));

app.get('/favicon.ico', (request, reply) => {
  reply.status(204).send();
});

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

// --- PHASE 1: COMPANY AUTH & PROFILE ---

app.post('/api/company/register', async (request, reply) => {
  const validation = RegisterCompanySchema.safeParse(request.body);
  if (!validation.success) return reply.status(400).send({ error: 'Validation Error', details: validation.error.format() });

  const { companyName, email, password, website, description, address, gstNumber } = validation.data;
  const existing = await prisma.company.findUnique({ where: { email } });
  if (existing) return reply.status(400).send({ error: 'Conflict', message: 'Email address is already registered' });

  const passwordHash = await bcrypt.hash(password, 12);
  const company = await prisma.company.create({
    data: {
      companyName,
      email,
      passwordHash,
      website: website || null,
      description: description || null,
      address: address || null,
      gstNumber: gstNumber || null
    },
    select: { id: true, companyName: true, email: true, website: true, description: true, address: true, gstNumber: true, status: true, createdAt: true }
  });

  const token = jwt.sign({ id: company.id, email: company.email, role: 'COMPANY' }, JWT_SECRET, { expiresIn: '7d' });
  return reply.status(201).send({ message: 'Company registered successfully', token, company });
});

app.post('/api/company/login', async (request, reply) => {
  const validation = LoginCompanySchema.safeParse(request.body);
  if (!validation.success) return reply.status(400).send({ error: 'Validation Error', details: validation.error.format() });

  const { email, password } = validation.data;
  const company = await prisma.company.findFirst({ where: { email, deletedAt: null } });
  if (!company || !(await bcrypt.compare(password, company.passwordHash))) {
    return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: company.id, email: company.email, role: 'COMPANY' }, JWT_SECRET, { expiresIn: '7d' });
  return reply.send({ message: 'Login successful', token, company: { id: company.id, companyName: company.companyName, email: company.email } });
});

app.get('/api/company/profile', { preHandler: [authenticate] }, async (request, reply) => {
  const company = await prisma.company.findUnique({
    where: { id: request.user!.id },
    select: { id: true, companyName: true, email: true, website: true, description: true, address: true, gstNumber: true, status: true, createdAt: true }
  });

  return reply.send({ company });
});

app.patch('/api/company/profile', { preHandler: [authenticate] }, async (request, reply) => {
  const validation = UpdateCompanyProfileSchema.safeParse(request.body);
  if (!validation.success) return reply.status(400).send({ error: 'Validation Error', details: validation.error.format() });

  const updatedCompany = await prisma.company.update({
    where: { id: request.user!.id },
    data: validation.data
  });

  return reply.send({ message: 'Profile updated successfully', company: updatedCompany });
});

app.delete('/api/company/profile', { preHandler: [authenticate] }, async (request, reply) => {
  const companyId = request.user!.id;

  await prisma.$transaction([
    prisma.company.update({ where: { id: companyId }, data: { deletedAt: new Date() } }),
    prisma.internship.updateMany({ where: { companyId, deletedAt: null }, data: { status: InternshipStatus.ARCHIVED, deletedAt: new Date() } })
  ]);

  return reply.send({ message: 'Company account deactivated successfully' });
});

// --- INTERNSHIP MANAGEMENT & DISCOVERY ---

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
      durationMonths: data.durationMonths || null,
      skills: data.skills,
      status: data.status as InternshipStatus,
      deadline: data.deadline ? new Date(data.deadline) : null
    }
  });

  return reply.status(201).send({ message: 'Internship created successfully', internship });
});

app.get('/api/internships/my-internships', { preHandler: [authenticate] }, async (request, reply) => {
  const queryValidation = InternshipQuerySchema.safeParse(request.query);
  if (!queryValidation.success) return reply.status(400).send({ error: 'Invalid Query Params', details: queryValidation.error.format() });

  const { status } = queryValidation.data;
  const whereClause: any = { companyId: request.user!.id, deletedAt: null };
  if (status) whereClause.status = status as InternshipStatus;

  const internships = await prisma.internship.findMany({
    where: whereClause,
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return reply.send({ count: internships.length, internships });
});

app.get('/api/internships', async (request, reply) => {
  const queryValidation = SearchInternshipQuerySchema.safeParse(request.query);
  if (!queryValidation.success) {
    return reply.status(400).send({ error: 'Invalid Query Params', details: queryValidation.error.format() });
  }

  const { search, mode, location } = queryValidation.data;
  const whereClause: any = { status: InternshipStatus.ACTIVE, deletedAt: null };

  if (mode) whereClause.mode = mode as InternshipMode;
  if (location) whereClause.location = { contains: location, mode: 'insensitive' };
  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { skills: { hasSome: [search] } }
    ];
  }

  const internships = await prisma.internship.findMany({
    where: whereClause,
    include: {
      company: {
        select: { id: true, companyName: true, website: true, description: true }
      }
    },
    orderBy: { publishedAt: 'desc' }
  });

  return reply.send({ count: internships.length, internships });
});

app.get('/api/internships/:id', async (request, reply) => {
  const { id } = request.params as { id: string };

  const internship = await prisma.internship.findFirst({
    where: { id, deletedAt: null },
    include: { company: { select: { id: true, companyName: true, website: true, description: true } } }
  });

  if (!internship) return reply.status(404).send({ error: 'Not Found', message: 'Internship posting not found' });

  return reply.send({ internship });
});

app.patch('/api/internships/:id', { preHandler: [authenticate] }, async (request, reply) => {
  const { id } = request.params as { id: string };

  const ownership = await checkInternshipOwnership(id, request.user!.id);
  if (ownership.error === 'NOT_FOUND') return reply.status(404).send({ error: 'Not Found', message: ownership.message });
  if (ownership.error === 'FORBIDDEN') return reply.status(403).send({ error: 'Forbidden', message: ownership.message });

  const validation = UpdateInternshipSchema.safeParse(request.body);
  if (!validation.success) return reply.status(400).send({ error: 'Validation Error', details: validation.error.format() });

  const data = validation.data;
  const updatedInternship = await prisma.internship.update({
    where: { id },
    data: {
      ...data,
      mode: data.mode ? (data.mode as InternshipMode) : undefined,
      status: data.status ? (data.status as InternshipStatus) : undefined,
      deadline: data.deadline ? new Date(data.deadline) : undefined
    }
  });

  return reply.send({ message: 'Internship updated successfully', internship: updatedInternship });
});

app.patch('/api/internships/:id/status', { preHandler: [authenticate] }, async (request, reply) => {
  const { id } = request.params as { id: string };

  const ownership = await checkInternshipOwnership(id, request.user!.id);
  if (ownership.error === 'NOT_FOUND') return reply.status(404).send({ error: 'Not Found', message: ownership.message });
  if (ownership.error === 'FORBIDDEN') return reply.status(403).send({ error: 'Forbidden', message: ownership.message });

  const validation = ChangeInternshipStatusSchema.safeParse(request.body);
  if (!validation.success) return reply.status(400).send({ error: 'Validation Error', details: validation.error.format() });

  const updatedInternship = await prisma.internship.update({
    where: { id },
    data: { status: validation.data.status as InternshipStatus }
  });

  return reply.send({ message: `Status updated to ${validation.data.status}`, internship: updatedInternship });
});

app.delete('/api/internships/:id', { preHandler: [authenticate] }, async (request, reply) => {
  const { id } = request.params as { id: string };

  const ownership = await checkInternshipOwnership(id, request.user!.id);
  if (ownership.error === 'NOT_FOUND') return reply.status(404).send({ error: 'Not Found', message: ownership.message });
  if (ownership.error === 'FORBIDDEN') return reply.status(403).send({ error: 'Forbidden', message: ownership.message });

  await prisma.internship.update({
    where: { id },
    data: { deletedAt: new Date(), status: InternshipStatus.ARCHIVED }
  });

  return reply.send({ message: 'Internship posting deleted successfully' });
});

// --- PHASE 2 & STUDENT APPLICATIONS MODULE ---

app.post('/api/applications', async (request, reply) => {
  const validation = CreateApplicationSchema.safeParse(request.body);
  if (!validation.success) return reply.status(400).send({ error: 'Validation Error', details: validation.error.format() });

  const { internshipId, studentId, resumeUrl, coverLetter, portfolioUrl, githubUrl } = validation.data;

  const internship = await prisma.internship.findFirst({
    where: { id: internshipId, deletedAt: null }
  });

  if (!internship) return reply.status(404).send({ error: 'Not Found', message: 'Internship posting does not exist' });
  if (internship.status !== InternshipStatus.ACTIVE) {
    return reply.status(400).send({ error: 'Bad Request', message: 'Applications are closed for this posting' });
  }

  const existingApplication = await prisma.application.findUnique({
    where: { internshipId_studentId: { internshipId, studentId } }
  });

  if (existingApplication) return reply.status(409).send({ error: 'Conflict', message: 'You have already applied for this internship' });

  const application = await prisma.application.create({
    data: {
      internshipId,
      studentId,
      resumeUrl,
      coverLetter: coverLetter || null,
      portfolioUrl: portfolioUrl || null,
      githubUrl: githubUrl || null
    }
  });

  return reply.status(201).send({ message: 'Application submitted successfully', application });
});

app.post('/api/applications/student/apply', { preHandler: [authenticate] }, async (request, reply) => {
  const studentId = request.user!.id;

  const validation = StudentApplySchema.safeParse(request.body);
  if (!validation.success) {
    return reply.status(400).send({ error: 'Validation Error', details: validation.error.format() });
  }

  const { internshipId, resumeUrl, coverLetter, portfolioUrl, githubUrl } = validation.data;

  const internship = await prisma.internship.findFirst({
    where: { id: internshipId, deletedAt: null }
  });

  if (!internship) {
    return reply.status(404).send({ error: 'Not Found', message: 'Internship posting does not exist' });
  }

  if (internship.status !== InternshipStatus.ACTIVE) {
    return reply.status(400).send({ error: 'Bad Request', message: 'Applications are closed for this internship posting' });
  }

  if (internship.deadline && new Date() > new Date(internship.deadline)) {
    return reply.status(400).send({ error: 'Bad Request', message: 'Application deadline has passed' });
  }

  const existingApplication = await prisma.application.findUnique({
    where: {
      internshipId_studentId: {
        internshipId,
        studentId
      }
    }
  });

  if (existingApplication) {
    return reply.status(409).send({
      error: 'Conflict',
      message: 'You have already submitted an application for this internship posting'
    });
  }

  const application = await prisma.application.create({
    data: {
      internshipId,
      studentId,
      resumeUrl,
      coverLetter: coverLetter || null,
      portfolioUrl: portfolioUrl || null,
      githubUrl: githubUrl || null
    },
    include: {
      internship: {
        select: { title: true, company: { select: { companyName: true } } }
      }
    }
  });

  return reply.status(201).send({
    message: 'Application submitted successfully',
    application
  });
});

app.get('/api/applications/my-applications', { preHandler: [authenticate] }, async (request, reply) => {
  const studentId = request.user!.id;

  const applications = await prisma.application.findMany({
    where: { studentId, deletedAt: null },
    include: {
      internship: {
        select: {
          id: true,
          title: true,
          location: true,
          mode: true,
          stipend: true,
          company: { select: { companyName: true, website: true } }
        }
      },
      interviews: {
        select: { id: true, roundName: true, roundNumber: true, scheduledAt: true, status: true, meetingUrl: true },
        orderBy: { roundNumber: 'asc' }
      },
      offers: {
        select: { id: true, stipendAmount: true, joiningDate: true, offerLetterUrl: true, status: true }
      }
    },
    orderBy: { appliedAt: 'desc' }
  });

  return reply.send({ count: applications.length, applications });
});

app.get('/api/applications/internship/:internshipId', { preHandler: [authenticate] }, async (request, reply) => {
  const { internshipId } = request.params as { internshipId: string };

  const ownership = await checkInternshipOwnership(internshipId, request.user!.id);
  if (ownership.error === 'NOT_FOUND') return reply.status(404).send({ error: 'Not Found', message: ownership.message });
  if (ownership.error === 'FORBIDDEN') return reply.status(403).send({ error: 'Forbidden', message: ownership.message });

  const applications = await prisma.application.findMany({
    where: { internshipId, deletedAt: null },
    orderBy: { appliedAt: 'desc' }
  });

  return reply.send({ count: applications.length, applications });
});

app.get('/api/applications/student/:studentId', async (request, reply) => {
  const { studentId } = request.params as { studentId: string };

  const applications = await prisma.application.findMany({
    where: { studentId, deletedAt: null },
    include: {
      internship: {
        select: { title: true, location: true, mode: true, company: { select: { companyName: true } } }
      }
    },
    orderBy: { appliedAt: 'desc' }
  });

  return reply.send({ count: applications.length, applications });
});

app.get('/api/applications/:id', async (request, reply) => {
  const { id } = request.params as { id: string };

  const application = await prisma.application.findFirst({
    where: { id, deletedAt: null },
    include: {
      internship: { select: { title: true, companyId: true, company: { select: { companyName: true } } } }
    }
  });

  if (!application) return reply.status(404).send({ error: 'Not Found', message: 'Application record not found' });

  return reply.send({ application });
});

app.patch('/api/applications/:id/status', { preHandler: [authenticate] }, async (request, reply) => {
  const { id } = request.params as { id: string };

  const application = await prisma.application.findFirst({
    where: { id, deletedAt: null },
    include: { internship: true }
  });

  if (!application) return reply.status(404).send({ error: 'Not Found', message: 'Application record not found' });
  if (application.internship.companyId !== request.user!.id) {
    return reply.status(403).send({ error: 'Forbidden', message: 'You do not have permission to manage this application' });
  }

  const validation = UpdateApplicationStatusSchema.safeParse(request.body);
  if (!validation.success) return reply.status(400).send({ error: 'Validation Error', details: validation.error.format() });

  const updatedApplication = await prisma.application.update({
    where: { id },
    data: { status: validation.data.status as ApplicationStatus }
  });

  return reply.send({ message: `Application status updated to ${validation.data.status}`, application: updatedApplication });
});

app.patch('/api/applications/:id/withdraw', async (request, reply) => {
  const { id } = request.params as { id: string };

  const application = await prisma.application.findFirst({ where: { id, deletedAt: null } });
  if (!application) return reply.status(404).send({ error: 'Not Found', message: 'Application record not found' });

  const updatedApplication = await prisma.application.update({
    where: { id },
    data: { status: ApplicationStatus.WITHDRAWN }
  });

  return reply.send({ message: 'Application withdrawn successfully', application: updatedApplication });
});

// --- PHASE 3: INTERVIEWS MODULE ---

app.post('/api/interviews', { preHandler: [authenticate] }, async (request, reply) => {
  const validation = CreateInterviewSchema.safeParse(request.body);
  if (!validation.success) return reply.status(400).send({ error: 'Validation Error', details: validation.error.format() });

  const { applicationId, roundNumber, roundName, meetingUrl, scheduledAt } = validation.data;

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { internship: true }
  });

  if (!application) return reply.status(404).send({ error: 'Not Found', message: 'Application not found' });
  if (application.internship.companyId !== request.user!.id) return reply.status(403).send({ error: 'Forbidden', message: 'You do not own this job posting' });

  const interview = await prisma.$transaction([
    prisma.interview.create({
      data: { applicationId, roundNumber, roundName, meetingUrl: meetingUrl || null, scheduledAt: new Date(scheduledAt) }
    }),
    prisma.application.update({
      where: { id: applicationId },
      data: { status: ApplicationStatus.INTERVIEWING }
    })
  ]);

  return reply.status(201).send({ message: 'Interview scheduled successfully', interview: interview[0] });
});

app.get('/api/interviews/application/:applicationId', async (request, reply) => {
  const { applicationId } = request.params as { applicationId: string };
  const interviews = await prisma.interview.findMany({ where: { applicationId }, orderBy: { roundNumber: 'asc' } });
  return reply.send({ count: interviews.length, interviews });
});

app.patch('/api/interviews/:id/status', { preHandler: [authenticate] }, async (request, reply) => {
  const { id } = request.params as { id: string };
  const validation = UpdateInterviewStatusSchema.safeParse(request.body);
  if (!validation.success) return reply.status(400).send({ error: 'Validation Error', details: validation.error.format() });

  const interview = await prisma.interview.update({
    where: { id },
    data: { status: validation.data.status as InterviewStatus }
  });

  return reply.send({ message: `Interview status changed to ${validation.data.status}`, interview });
});

// --- PHASE 4: EVALUATIONS & OFFERS MODULE ---

app.post('/api/evaluations', { preHandler: [authenticate] }, async (request, reply) => {
  const validation = CreateEvaluationSchema.safeParse(request.body);
  if (!validation.success) return reply.status(400).send({ error: 'Validation Error', details: validation.error.format() });

  const { interviewId, evaluatorId, score, passed, feedback } = validation.data;

  const evaluation = await prisma.evaluation.create({
    data: { interviewId, evaluatorId, score, passed, feedback }
  });

  return reply.status(201).send({ message: 'Evaluation submitted successfully', evaluation });
});

app.get('/api/evaluations/interview/:interviewId', async (request, reply) => {
  const { interviewId } = request.params as { interviewId: string };
  const evaluation = await prisma.evaluation.findUnique({ where: { interviewId } });
  if (!evaluation) return reply.status(404).send({ error: 'Not Found', message: 'No evaluation logged for this interview' });

  return reply.send({ evaluation });
});

app.post('/api/offers', { preHandler: [authenticate] }, async (request, reply) => {
  const validation = CreateOfferSchema.safeParse(request.body);
  if (!validation.success) return reply.status(400).send({ error: 'Validation Error', details: validation.error.format() });

  const { applicationId, stipendAmount, joiningDate, offerLetterUrl } = validation.data;

  const application = await prisma.application.findUnique({ where: { id: applicationId }, include: { internship: true } });
  if (!application) return reply.status(404).send({ error: 'Not Found', message: 'Application record not found' });
  if (application.internship.companyId !== request.user!.id) return reply.status(403).send({ error: 'Forbidden', message: 'You do not own this job posting' });

  const offer = await prisma.$transaction([
    prisma.offer.create({
      data: { applicationId, stipendAmount, joiningDate: new Date(joiningDate), offerLetterUrl }
    }),
    prisma.application.update({
      where: { id: applicationId },
      data: { status: ApplicationStatus.OFFERED }
    })
  ]);

  return reply.status(201).send({ message: 'Offer letter generated and sent', offer: offer[0] });
});

app.patch('/api/offers/:id/respond', async (request, reply) => {
  const { id } = request.params as { id: string };
  const validation = RespondOfferSchema.safeParse(request.body);
  if (!validation.success) return reply.status(400).send({ error: 'Validation Error', details: validation.error.format() });

  const offer = await prisma.offer.update({
    where: { id },
    data: { status: validation.data.status as OfferStatus }
  });

  return reply.send({ message: `Offer ${validation.data.status.toLowerCase()} successfully`, offer });
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

// ==========================================
// SERVER INITIALIZATION FUNCTION
// ==========================================
const start = async () => {
  try {
    const address = await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 Complete ATS Backend API running at ${address}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();