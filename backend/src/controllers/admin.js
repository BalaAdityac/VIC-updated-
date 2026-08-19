const prisma = require("../config/prisma");
const { logAdminAction } = require("../services/audit");

function pagination(query) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);
  return { page, limit, skip: (page - 1) * limit };
}

function addDaysKey(date) {
  return date.toISOString().slice(0, 10);
}

function dateRange(days) {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, role: true, status: true, createdAt: true },
    });
    if (!user || user.role !== "SUPER_ADMIN") return res.status(403).json({ success: false, message: "Super Admin access required" });
    res.json({ success: true, data: user });
  } catch (e) { next(e); }
}

async function dashboard(req, res, next) {
  try {
    const [totalUsers, totalStudents, totalCompanies, totalInternships, activeInternships, totalApplications, totalInterviews, shortlistedCandidates, selectedCandidates, rejectedCandidates, scheduledInterviews, verifiedCompanies, completedInterviews, heldCandidates] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.company.count(),
      prisma.internship.count(),
      prisma.internship.count({ where: { isActive: true } }),
      prisma.application.count(),
      prisma.interview.count(),
      prisma.application.count({ where: { status: "SHORTLISTED" } }),
      prisma.application.count({ where: { status: "SELECTED" } }),
      prisma.application.count({ where: { status: "REJECTED" } }),
      prisma.interview.count({ where: { status: { in: ["SCHEDULED", "RESCHEDULED"] } } }),
      prisma.company.count({ where: { verificationStatus: "VERIFIED" } }),
      prisma.interview.count({ where: { status: "COMPLETED" } }),
      prisma.evaluation.count({ where: { recommendation: "HOLD" } }),
    ]);
    res.json({ success: true, data: { totalUsers, totalStudents, totalCompanies, totalInternships, activeInternships, totalApplications, totalInterviews, shortlistedCandidates, selectedCandidates, rejectedCandidates, scheduledInterviews, verifiedCompanies, completedInterviews, heldCandidates } });
  } catch (e) { next(e); }
}

async function listUsers(req, res, next) {
  try {
    const { page, limit, skip } = pagination(req.query);
    const { search, role, status } = req.query;
    const where = { ...(role ? { role } : {}), ...(status ? { status } : {}) };
    if (search) where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { profile: { fullName: { contains: search, mode: "insensitive" } } },
      { company: { name: { contains: search, mode: "insensitive" } } },
    ];
    const [total, data] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, select: {
        id: true, email: true, role: true, status: true, createdAt: true, updatedAt: true,
        profile: { select: { fullName: true, phone: true, location: true } },
        company: { select: { id: true, name: true, verificationStatus: true } },
        _count: { select: { applications: true, interviewsAsStudent: true } },
      } }),
    ]);
    res.json({ success: true, data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (e) { next(e); }
}

async function userDetails(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: {
      id: true, email: true, role: true, status: true, createdAt: true, updatedAt: true,
      profile: true,
      education: true, projects: true,
      userSkills: { include: { skill: true } },
      company: { include: { internships: { orderBy: { createdAt: "desc" }, select: { id: true, title: true, isActive: true, createdAt: true } } } },
      applications: { orderBy: { appliedAt: "desc" }, include: {
        internship: { include: { company: { select: { id: true, name: true, verificationStatus: true } } } },
        interviews: { orderBy: { scheduledAt: "desc" }, include: { evaluation: true } },
      } },
    } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const selectedApplications = user.applications.filter(a => a.status === "SELECTED");
    res.json({ success: true, data: { ...user, selected: selectedApplications.map(a => ({ applicationId: a.id, internship: a.internship, outcome: a.status })) } });
  } catch (e) { next(e); }
}

async function userApplications(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: { id: true, email: true, role: true } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const data = await prisma.application.findMany({ where: { studentId: req.params.id }, orderBy: { appliedAt: "desc" }, include: {
      internship: { include: { company: { select: { id: true, name: true, verificationStatus: true } } } },
      interviews: { orderBy: { scheduledAt: "desc" }, include: { evaluation: true } },
    } });
    res.json({ success: true, data: { user, applications: data, selected: data.filter(a => a.status === "SELECTED") } });
  } catch (e) { next(e); }
}

async function changeUserStatus(req, res, next) {
  const action = req.path.endsWith("/block") ? "BLOCK_USER" : "UNBLOCK_USER";
  const targetStatus = action === "BLOCK_USER" ? "SUSPENDED" : "ACTIVE";
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ success: false, message: "A Super Admin cannot block or unblock their own account" });
    const target = await prisma.user.findUnique({ where: { id: req.params.id }, select: { id: true, email: true, role: true, status: true } });
    if (!target) return res.status(404).json({ success: false, message: "User not found" });
    if (target.role === "SUPER_ADMIN") return res.status(403).json({ success: false, message: "Super Admin accounts cannot be modified by this endpoint" });
    if (target.status === targetStatus) return res.json({ success: true, message: `User is already ${targetStatus.toLowerCase()}`, data: target });
    const updated = await prisma.$transaction(async tx => {
      const user = await tx.user.update({ where: { id: target.id }, data: { status: targetStatus }, select: { id: true, email: true, role: true, status: true } });
      await logAdminAction({ tx, adminId: req.user.id, action, entityType: "USER", entityId: target.id, metadata: { previousStatus: target.status, newStatus: targetStatus } });
      return user;
    });
    res.json({ success: true, data: updated });
  } catch (e) { next(e); }
}

async function deleteUser(req, res, next) {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ success: false, message: "A Super Admin cannot delete their own account" });
    const target = await prisma.user.findUnique({ where: { id: req.params.id }, select: { id: true, email: true, role: true, status: true } });
    if (!target) return res.status(404).json({ success: false, message: "User not found" });
    if (target.role === "SUPER_ADMIN") return res.status(403).json({ success: false, message: "Super Admin accounts cannot be deleted" });
    await prisma.$transaction(async tx => {
      await logAdminAction({ tx, adminId: req.user.id, action: "DELETE_USER", entityType: "USER", entityId: target.id, metadata: { email: target.email, role: target.role, previousStatus: target.status } });
      await tx.user.delete({ where: { id: target.id } });
    });
    res.json({ success: true, message: "User permanently deleted" });
  } catch (e) { next(e); }
}

async function listCompanies(req, res, next) {
  try {
    const { page, limit, skip } = pagination(req.query);
    const { search, verificationStatus, status } = req.query;
    const where = { ...(verificationStatus ? { verificationStatus } : {}), ...(status ? { user: { status } } : {}) };
    if (search) where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ];
    const [total, data] = await Promise.all([
      prisma.company.count({ where }),
      prisma.company.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, select: {
        id: true, name: true, description: true, website: true, location: true, verificationStatus: true, createdAt: true, updatedAt: true,
        user: { select: { id: true, email: true, status: true } },
        _count: { select: { internships: true } },
      } }),
    ]);
    res.json({ success: true, data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (e) { next(e); }
}

async function companyDetails(req, res, next) {
  try {
    const company = await prisma.company.findUnique({ where: { id: req.params.id }, include: {
      user: { select: { id: true, email: true, status: true, role: true, createdAt: true } },
      internships: { orderBy: { createdAt: "desc" }, include: {
        _count: { select: { applications: true } },
        applications: { orderBy: { appliedAt: "desc" }, select: { id: true, status: true, appliedAt: true, student: { select: { id: true, email: true, profile: { select: { fullName: true } } } }, interviews: { select: { id: true, scheduledAt: true, status: true, evaluation: true } } } },
      } },
    } });
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });
    res.json({ success: true, data: company });
  } catch (e) { next(e); }
}

async function verifyCompany(req, res, next) {
  try {
    const company = await prisma.company.findUnique({ where: { id: req.params.id }, select: { id: true, verificationStatus: true, name: true } });
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });
    const updated = await prisma.$transaction(async tx => {
      const result = await tx.company.update({ where: { id: company.id }, data: { verificationStatus: req.body.verificationStatus } });
      await logAdminAction({ tx, adminId: req.user.id, action: "UPDATE_COMPANY_VERIFICATION", entityType: "COMPANY", entityId: company.id, metadata: { previousStatus: company.verificationStatus, newStatus: req.body.verificationStatus, reason: req.body.reason || null } });
      return result;
    });
    res.json({ success: true, data: updated });
  } catch (e) { next(e); }
}

async function changeCompanyStatus(req, res, next) {
  const action = req.path.endsWith("/block") ? "BLOCK_COMPANY" : "UNBLOCK_COMPANY";
  const targetStatus = action === "BLOCK_COMPANY" ? "SUSPENDED" : "ACTIVE";
  try {
    const company = await prisma.company.findUnique({ where: { id: req.params.id }, include: { user: { select: { id: true, email: true, status: true } } } });
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });
    if (company.user.id === req.user.id) return res.status(400).json({ success: false, message: "A Super Admin cannot block their own account" });
    const updated = await prisma.$transaction(async tx => {
      const user = await tx.user.update({ where: { id: company.user.id }, data: { status: targetStatus }, select: { id: true, email: true, status: true } });
      await logAdminAction({ tx, adminId: req.user.id, action, entityType: "COMPANY", entityId: company.id, metadata: { userId: company.user.id, previousStatus: company.user.status, newStatus: targetStatus } });
      return user;
    });
    res.json({ success: true, data: { companyId: company.id, user: updated } });
  } catch (e) { next(e); }
}

async function deleteCompany(req, res, next) {
  try {
    const company = await prisma.company.findUnique({ where: { id: req.params.id }, include: { user: { select: { id: true, email: true, role: true } } } });
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });
    if (company.user.id === req.user.id || company.user.role === "SUPER_ADMIN") return res.status(403).json({ success: false, message: "This account cannot be deleted" });
    await prisma.$transaction(async tx => {
      await logAdminAction({ tx, adminId: req.user.id, action: "DELETE_COMPANY", entityType: "COMPANY", entityId: company.id, metadata: { userId: company.user.id, email: company.user.email, companyName: company.name } });
      await tx.user.delete({ where: { id: company.user.id } });
    });
    res.json({ success: true, message: "Company permanently deleted" });
  } catch (e) { next(e); }
}

async function applicationStats(req, res, next) {
  try {
    const [byStatus, total] = await Promise.all([
      prisma.application.groupBy({ by: ["status"], _count: { _all: true }, orderBy: { status: "asc" } }),
      prisma.application.count(),
    ]);
    res.json({ success: true, data: { total, byStatus: Object.fromEntries(byStatus.map(x => [x.status, x._count._all])) } });
  } catch (e) { next(e); }
}

async function interviewStats(req, res, next) {
  try {
    const [byStatus, byRound, byType, total] = await Promise.all([
      prisma.interview.groupBy({ by: ["status"], _count: { _all: true }, orderBy: { status: "asc" } }),
      prisma.interview.groupBy({ by: ["round"], _count: { _all: true }, orderBy: { round: "asc" } }),
      prisma.interview.groupBy({ by: ["interviewType"], _count: { _all: true }, orderBy: { interviewType: "asc" } }),
      prisma.interview.count(),
    ]);
    res.json({ success: true, data: { total, byStatus: Object.fromEntries(byStatus.map(x => [x.status, x._count._all])), byRound: Object.fromEntries(byRound.map(x => [x.round, x._count._all])), byType: Object.fromEntries(byType.map(x => [x.interviewType, x._count._all])) } });
  } catch (e) { next(e); }
}

async function applicationTrend(req, res, next) {
  try {
    const { start, end } = dateRange(Number(req.query.days));
    const rows = await prisma.application.findMany({ where: { appliedAt: { gte: start, lte: end } }, select: { appliedAt: true, status: true } });
    const map = new Map();
    for (let i = 0; i < Number(req.query.days); i++) { const d = new Date(start); d.setDate(start.getDate() + i); map.set(addDaysKey(d), { date: addDaysKey(d), applications: 0, shortlisted: 0, selected: 0, rejected: 0 }); }
    for (const row of rows) { const key = addDaysKey(row.appliedAt); const item = map.get(key); if (!item) continue; item.applications++; if (row.status === "SHORTLISTED") item.shortlisted++; if (row.status === "SELECTED") item.selected++; if (row.status === "REJECTED") item.rejected++; }
    res.json({ success: true, data: Array.from(map.values()) });
  } catch (e) { next(e); }
}

async function interviewTrend(req, res, next) {
  try {
    const { start, end } = dateRange(Number(req.query.days));
    const rows = await prisma.interview.findMany({ where: { scheduledAt: { gte: start, lte: end } }, select: { scheduledAt: true, status: true } });
    const map = new Map();
    for (let i = 0; i < Number(req.query.days); i++) { const d = new Date(start); d.setDate(start.getDate() + i); map.set(addDaysKey(d), { date: addDaysKey(d), interviews: 0, scheduled: 0, completed: 0, cancelled: 0, noShow: 0 }); }
    for (const row of rows) { const key = addDaysKey(row.scheduledAt); const item = map.get(key); if (!item) continue; item.interviews++; if (["SCHEDULED", "RESCHEDULED"].includes(row.status)) item.scheduled++; if (row.status === "COMPLETED") item.completed++; if (row.status === "CANCELLED") item.cancelled++; if (row.status === "NO_SHOW") item.noShow++; }
    res.json({ success: true, data: Array.from(map.values()) });
  } catch (e) { next(e); }
}

async function auditLogs(req, res, next) {
  try {
    const { page, limit, skip } = pagination(req.query);
    const where = {};
    if (req.query.action) where.action = req.query.action;
    if (req.query.entityType) where.entityType = req.query.entityType;
    if (req.query.adminId) where.adminId = req.query.adminId;
    const [total, data] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, include: { admin: { select: { id: true, email: true, role: true } } } }),
    ]);
    res.json({ success: true, data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (e) { next(e); }
}

module.exports = { me, dashboard, listUsers, userDetails, userApplications, changeUserStatus, deleteUser, listCompanies, companyDetails, verifyCompany, changeCompanyStatus, deleteCompany, applicationStats, interviewStats, applicationTrend, interviewTrend, auditLogs };
