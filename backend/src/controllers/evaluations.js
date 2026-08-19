const prisma = require("../config/prisma");

async function companyIdForUser(userId) {
  const company = await prisma.company.findUnique({ where: { userId }, select: { id: true } });
  return company?.id;
}

async function ownedInterview(interviewId, userId) {
  const companyId = await companyIdForUser(userId);
  if (!companyId) return null;

  return prisma.interview.findFirst({
    where: { id: interviewId, application: { internship: { companyId } } },
    include: { application: true },
  });
}

async function upsert(req, res, next) {
  try {
    const interview = await ownedInterview(req.params.interviewId, req.user.id);
    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found or not owned by company" });
    }

    if (["CANCELLED", "NO_SHOW"].includes(interview.status)) {
      return res.status(400).json({ success: false, message: "Cannot evaluate a cancelled or no-show interview" });
    }

    const evaluation = await prisma.$transaction(async (tx) => {
      const result = await tx.evaluation.upsert({
        where: { interviewId: interview.id },
        create: {
          ...req.body,
          interviewId: interview.id,
          evaluatedBy: req.user.id,
        },
        update: {
          ...req.body,
          evaluatedBy: req.user.id,
        },
      });

      await tx.interview.update({
        where: { id: interview.id },
        data: { status: "COMPLETED" },
      });

      if (req.body.recommendation === "SELECTED") {
        await tx.application.update({ where: { id: interview.applicationId }, data: { status: "SELECTED" } });
      } else if (req.body.recommendation === "REJECTED") {
        await tx.application.update({ where: { id: interview.applicationId }, data: { status: "REJECTED" } });
      }

      return result;
    });

    res.json({ success: true, data: evaluation });
  } catch (e) {
    next(e);
  }
}

async function get(req, res, next) {
  try {
    const interview = await ownedInterview(req.params.interviewId, req.user.id);
    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found or not owned by company" });
    }

    const evaluation = await prisma.evaluation.findUnique({ where: { interviewId: interview.id } });
    if (!evaluation) return res.status(404).json({ success: false, message: "Evaluation not found" });

    res.json({ success: true, data: evaluation });
  } catch (e) {
    next(e);
  }
}

module.exports = { upsert, get };
