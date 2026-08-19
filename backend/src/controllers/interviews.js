const prisma = require("../config/prisma");

async function companyIdForUser(userId) {
  const company = await prisma.company.findUnique({
    where: { userId },
    select: { id: true },
  });
  return company?.id;
}

async function ownedInterview(interviewId, userId) {
  const companyId = await companyIdForUser(userId);
  if (!companyId) return null;

  return prisma.interview.findFirst({
    where: {
      id: interviewId,
      application: { internship: { companyId } },
    },
    include: { application: true },
  });
}

async function schedule(req, res, next) {
  try {
    const companyId = await companyIdForUser(req.user.id);
    if (!companyId) return res.status(404).json({ success: false, message: "Company not found" });

    const application = await prisma.application.findFirst({
      where: { id: req.params.applicationId, internship: { companyId } },
    });

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found or not owned by company" });
    }

    if (application.status !== "SHORTLISTED") {
      return res.status(400).json({ success: false, message: "Only shortlisted candidates can be scheduled" });
    }

    const existing = await prisma.interview.findUnique({
      where: { applicationId: application.id },
      select: { id: true, status: true },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Interview already scheduled for this application. Use the reschedule endpoint.",
        data: existing,
      });
    }

    const interview = await prisma.interview.create({
      data: {
        ...req.body,
        applicationId: application.id,
        studentId: application.studentId,
        status: "SCHEDULED",
      },
    });

    res.status(201).json({ success: true, data: interview });
  } catch (e) {
    next(e);
  }
}

async function reschedule(req, res, next) {
  try {
    const interview = await ownedInterview(req.params.interviewId, req.user.id);
    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found or not owned by company" });
    }

    if (!["SCHEDULED", "RESCHEDULED"].includes(interview.status)) {
      return res.status(400).json({
        success: false,
        message: `Interview cannot be rescheduled from status ${interview.status}`,
      });
    }

    const updated = await prisma.interview.update({
      where: { id: interview.id },
      data: { ...req.body, status: "RESCHEDULED" },
    });

    res.json({ success: true, data: updated });
  } catch (e) {
    next(e);
  }
}

async function companyList(req, res, next) {
  try {
    const companyId = await companyIdForUser(req.user.id);
    if (!companyId) return res.status(404).json({ success: false, message: "Company not found" });

    const data = await prisma.interview.findMany({
      where: { application: { internship: { companyId } } },
      orderBy: { scheduledAt: "asc" },
      include: {
        application: {
          include: {
            internship: true,
            student: { select: { id: true, email: true, profile: true } },
          },
        },
        evaluation: true,
      },
    });

    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

async function details(req, res, next) {
  try {
    const companyId = await companyIdForUser(req.user.id);
    if (!companyId) return res.status(404).json({ success: false, message: "Company not found" });

    const interview = await prisma.interview.findFirst({
      where: { id: req.params.interviewId, application: { internship: { companyId } } },
      include: {
        application: {
          include: {
            internship: true,
            student: { select: { id: true, email: true, profile: true } },
          },
        },
        evaluation: true,
      },
    });

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found or not owned by company" });
    }

    res.json({ success: true, data: interview });
  } catch (e) {
    next(e);
  }
}

async function studentList(req, res, next) {
  try {
    const data = await prisma.interview.findMany({
      where: { studentId: req.user.id },
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
        application: {
          select: {
            id: true,
            status: true,
            internship: {
              select: {
                id: true,
                title: true,
                company: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

module.exports = { schedule, reschedule, companyList, details, studentList };
