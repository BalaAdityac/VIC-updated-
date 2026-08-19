const prisma = require("../config/prisma");

async function companyIdForUser(userId) {
  const company = await prisma.company.findUnique({ where: { userId }, select: { id: true } });
  return company?.id;
}

const candidate = {
  id: true,
  email: true,
  status: true,
  profile: true,
  education: true,
  projects: true,
  userSkills: { include: { skill: true } },
};

async function list(req, res, next) {
  try {
    const companyId = await companyIdForUser(req.user.id);
    if (!companyId) return res.status(404).json({ success: false, message: "Company not found" });

    const where = { internship: { companyId } };
    if (req.query.status) where.status = req.query.status;
    if (req.query.internshipId) where.internshipId = req.query.internshipId;

    const data = await prisma.application.findMany({
      where,
      orderBy: { appliedAt: "desc" },
      include: {
        internship: { select: { id: true, title: true, companyId: true } },
        student: { select: candidate },
        interviews: { select: { id: true, scheduledAt: true, status: true, round: true, interviewType: true } },
      },
    });

    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

async function candidateView(req, res, next) {
  try {
    const companyId = await companyIdForUser(req.user.id);
    const application = await prisma.application.findFirst({
      where: { id: req.params.applicationId, internship: { companyId } },
      include: {
        internship: true,
        student: { select: candidate },
        interviews: {
          orderBy: { scheduledAt: "desc" },
          select: {
            id: true,
            scheduledAt: true,
            durationMins: true,
            meetingLink: true,
            interviewType: true,
            round: true,
            interviewer: true,
            notes: true,
            status: true,
          },
        },
      },
    });

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found or not owned by company" });
    }

    res.json({
      success: true,
      data: {
        applicationId: application.id,
        status: application.status,
        appliedAt: application.appliedAt,
        internship: application.internship,
        candidate: application.student,
        interviews: application.interviews,
      },
    });
  } catch (e) {
    next(e);
  }
}

async function status(req, res, next) {
  try {
    const companyId = await companyIdForUser(req.user.id);
    const application = await prisma.application.findFirst({
      where: { id: req.params.applicationId, internship: { companyId } },
    });

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found or not owned by company" });
    }

    const allowed = {
      APPLIED: ["UNDER_REVIEW", "SHORTLISTED", "REJECTED"],
      UNDER_REVIEW: ["SHORTLISTED", "REJECTED"],
      SHORTLISTED: ["REJECTED"],
      REJECTED: [],
      SELECTED: [],
    };

    if (!allowed[application.status]?.includes(req.body.status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid transition ${application.status} -> ${req.body.status}`,
      });
    }

    const updated = await prisma.application.update({
      where: { id: application.id },
      data: { status: req.body.status },
    });

    res.json({ success: true, data: updated });
  } catch (e) {
    next(e);
  }
}

async function apply(req, res, next) {
  try {
    const internship = await prisma.internship.findUnique({ where: { id: req.params.internshipId } });
    if (!internship || !internship.isActive) {
      return res.status(404).json({ success: false, message: "Internship not found or inactive" });
    }

    if (internship.deadline && internship.deadline < new Date()) {
      return res.status(400).json({ success: false, message: "Application deadline has passed" });
    }

    const existing = await prisma.application.findUnique({
      where: { studentId_internshipId: { studentId: req.user.id, internshipId: internship.id } },
    });

    if (existing) return res.status(409).json({ success: false, message: "Already applied" });

    const application = await prisma.application.create({
      data: { studentId: req.user.id, internshipId: internship.id },
      include: { internship: { include: { company: { select: { id: true, name: true } } } } },
    });

    res.status(201).json({ success: true, data: application });
  } catch (e) {
    next(e);
  }
}

async function studentList(req, res, next) {
  try {
    const data = await prisma.application.findMany({
      where: { studentId: req.user.id },
      orderBy: { appliedAt: "desc" },
      include: {
        internship: {
          include: { company: { select: { id: true, name: true } } },
        },
        interviews: {
          orderBy: { scheduledAt: "asc" },
          select: {
            id: true,
            scheduledAt: true,
            durationMins: true,
            meetingLink: true,
            interviewType: true,
            round: true,
            interviewer: true,
            notes: true,
            status: true,
          },
        },
      },
    });

    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

module.exports = { list, candidateView, status, apply, studentList };
