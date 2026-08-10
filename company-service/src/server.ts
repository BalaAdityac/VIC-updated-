import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient, InternshipStatus, InternshipMode, ApplicationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const prisma = new PrismaClient();
const app: FastifyInstance = Fastify({ logger: true });

// ==========================================
// TYPES & EXTENSIONS
// ==========================================
export interface AuthUser {
  id: string; // companyId or studentId
  email: string;
  role: 'COMPANY' | 'STUDENT';
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

const CreateInternshipSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(150),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(2, "Location is required"),
  mode: z.enum(['REMOTE', 'HYBRID', 'ON_SITE']).default('REMOTE'),
  salary: z.number().nonnegative().optional(),
  stipend: z.number().nonnegative().optional(),
  durationMonths: z.number().int().positive().optional(),
  skills: z.array(z.string()).min(1, "Specify at least one skill required"),
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

// Applications Schemas
const CreateApplicationSchema = z.object({
  internshipId: z.string().uuid("Invalid Internship UUID"),
  studentId: z.string().uuid("Invalid Student UUID"),
  resumeUrl: z.string().url("Valid resume URL is required"),
  coverLetter: z.string().max(3000).optional(),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal(''))
});

const UpdateApplicationStatusSchema = z.object({
  status: z.enum(['APPLIED', 'SHORTLISTED', 'INTERVIEWING', 'OFFERED', 'REJECTED', 'WITHDRAWN'])
});

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================
async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Bearer token missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;

    request.user = decoded;
  } catch (err) {
    return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or expired JWT token' });
  }
}

// ==========================================
// OWNERSHIP VALIDATION HELPERS
// ==========================================
async function checkInternshipOwnership(internshipId: string, companyId: string) {
  const internship = await prisma.internship.findFirst({
    where: { id: internshipId, deletedAt: null }
  });

  if (!internship) {
    return { error: 'NOT_FOUND', message: 'Internship posting not found' };
  }

  if (internship.companyId !== companyId) {
    return { error: 'FORBIDDEN', message: 'Forbidden: You do not own this internship posting' };
  }

  return { internship };
}

// ==========================================
// API ROUTES
// ==========================================

app.get('/health', async () => ({ status: 'UP', module: 'Company & Applications Service', timestamp: new Date().toISOString() }));

// --- COMPANY AUTH & PROFILE ---

app.post('/api/company/register', async (request, reply) => {
  const validation = RegisterCompanySchema.safeParse(request.body);
  if (!validation.success) {
    return reply.status(400).send({ error: 'Validation Error', details: validation.error.format() });
  }

  const { companyName, email, password, website, description, address, gstNumber } = validation.data;

  const existingCompany = await prisma.company.findUnique({ where: { email } });
  if (existingCompany) {
    return reply.status(400).send({ error: 'Conflict', message: 'Email address is already registered' });
  }

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
    select: {
      id: true,
      companyName: true,
      email: true,
      website: true,
      description: true,
      address: true,
      gstNumber: true,
      status: true,
      createdAt: true
    }
  });

  const token = jwt.sign({ id: company.id, email: company.email, role: 'COMPANY' }, JWT_SECRET, { expiresIn: '7d' });

  return reply.status(201).send({ message: 'Company registered successfully', token, company });
});

app.post('/api/company/login', async (request, reply) => {
  const validation = LoginCompanySchema.safeParse(request.body);
  if (!validation.success) {
    return reply.status(400).send({ error: 'Validation Error', details: validation.error.format() });
  }

  const { email, password } = validation.data;

  const company = await prisma.company.findFirst({
    where: { email, deletedAt: null }
  });

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
  if (!validation.success) {
    return reply.status(400).send({ error: 'Validation Error', details: validation.error.format() });
  }

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

// --- INTERNSHIP MANAGEMENT ---

app.post('/api/internships', { preHandler: [authenticate] }, async (request, reply) => {
  const validation = CreateInternshipSchema.safeParse(request.body);
  if (!validation.success) {
    return reply.status(400).send({ error: 'Validation Error', details: validation.error.format() });
  }

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
  if (!queryValidation.success) {
    return reply.status(400).send({ error: 'Invalid Query Params', details: queryValidation.error.format() });
  }

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

app.get('/api/internships/:id', async (request, reply) => {
  const { id } = request.params as { id: string };

  const internship = await prisma.internship.findFirst({
    where: { id, deletedAt: null },
    include: { company: { select: { id: true, companyName: true, website: true } } }
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

// ==========================================
// PHASE 2: APPLICATIONS MODULE
// ==========================================

// 1. Submit Application
app.post('/api/applications', async (request, reply) => {
  const validation = CreateApplicationSchema.safeParse(request.body);
  if (!validation.success) {
    return reply.status(400).send({ error: 'Validation Error', details: validation.error.format() });
  }

  const { internshipId, studentId, resumeUrl, coverLetter, portfolioUrl, githubUrl } = validation.data;

  // Check if internship exists and is active
  const internship = await prisma.internship.findFirst({
    where: { id: internshipId, deletedAt: null }
  });

  if (!internship) {
    return reply.status(404).send({ error: 'Not Found', message: 'Internship posting does not exist' });
  }

  if (internship.status !== InternshipStatus.ACTIVE) {
    return reply.status(400).send({ error: 'Bad Request', message: 'Applications are closed for this posting' });
  }

  // Prevent Duplicate Applications
  const existingApplication = await prisma.application.findUnique({
    where: {
      internshipId_studentId: { internshipId, studentId }
    }
  });

  if (existingApplication) {
    return reply.status(400).send({ error: 'Conflict', message: 'You have already applied for this internship' });
  }

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

// 2. View Applications for an Internship (Company Only - Ownership Guarded)
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

// 3. View Applications Submitted by a Student
app.get('/api/applications/student/:studentId', async (request, reply) => {
  const { studentId } = request.params as { studentId: string };

  const applications = await prisma.application.findMany({
    where: { studentId, deletedAt: null },
    include: {
      internship: {
        select: {
          title: true,
          location: true,
          mode: true,
          company: { select: { companyName: true } }
        }
      }
    },
    orderBy: { appliedAt: 'desc' }
  });

  return reply.send({ count: applications.length, applications });
});

// 4. View Single Application Details
app.get('/api/applications/:id', async (request, reply) => {
  const { id } = request.params as { id: string };

  const application = await prisma.application.findFirst({
    where: { id, deletedAt: null },
    include: {
      internship: {
        select: {
          title: true,
          companyId: true,
          company: { select: { companyName: true } }
        }
      }
    }
  });

  if (!application) {
    return reply.status(404).send({ error: 'Not Found', message: 'Application record not found' });
  }

  return reply.send({ application });
});

// 5. Update Application Status (Company Only - Shortlist / Reject / Interview / Offer)
app.patch('/api/applications/:id/status', { preHandler: [authenticate] }, async (request, reply) => {
  const { id } = request.params as { id: string };

  const application = await prisma.application.findFirst({
    where: { id, deletedAt: null },
    include: { internship: true }
  });

  if (!application) {
    return reply.status(404).send({ error: 'Not Found', message: 'Application record not found' });
  }

  // Verify Company owns the internship that received this application
  if (application.internship.companyId !== request.user!.id) {
    return reply.status(403).send({ error: 'Forbidden', message: 'You do not have permission to manage this application' });
  }

  const validation = UpdateApplicationStatusSchema.safeParse(request.body);
  if (!validation.success) {
    return reply.status(400).send({ error: 'Validation Error', details: validation.error.format() });
  }

  const updatedApplication = await prisma.application.update({
    where: { id },
    data: { status: validation.data.status as ApplicationStatus }
  });

  return reply.send({ message: `Application status updated to ${validation.data.status}`, application: updatedApplication });
});

// 6. Withdraw Application (Student)
app.patch('/api/applications/:id/withdraw', async (request, reply) => {
  const { id } = request.params as { id: string };

  const application = await prisma.application.findFirst({
    where: { id, deletedAt: null }
  });

  if (!application) {
    return reply.status(404).send({ error: 'Not Found', message: 'Application record not found' });
  }

  const updatedApplication = await prisma.application.update({
    where: { id },
    data: { status: ApplicationStatus.WITHDRAWN }
  });

  return reply.send({ message: 'Application withdrawn successfully', application: updatedApplication });
});

// Global Error Handler
app.setErrorHandler((error, request, reply) => {
  app.log.error(error);
  reply.status(500).send({ error: 'Internal Server Error', message: error.message || 'An unexpected error occurred' });
});

// Start Server
const start = async () => {
  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 Company & Applications Service API running at http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();