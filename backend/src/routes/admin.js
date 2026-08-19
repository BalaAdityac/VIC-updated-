const express = require("express");
const validate = require("../middleware_validate");
const { auth, requireRole } = require("../middlewares/auth");
const admin = require("../controllers/admin");
const v = require("../validations/admin");

const r = express.Router();
r.use(auth, requireRole("SUPER_ADMIN"));

r.get("/me", admin.me);
r.get("/dashboard", admin.dashboard);

r.get("/users", validate(v.usersQuery, "query"), admin.listUsers);
r.get("/users/:id", validate(v.uuidParam, "params"), admin.userDetails);
r.get("/users/:id/applications", validate(v.uuidParam, "params"), admin.userApplications);
r.patch("/users/:id/block", validate(v.uuidParam, "params"), admin.changeUserStatus);
r.patch("/users/:id/unblock", validate(v.uuidParam, "params"), admin.changeUserStatus);
r.delete("/users/:id", validate(v.uuidParam, "params"), admin.deleteUser);

r.get("/companies", validate(v.companiesQuery, "query"), admin.listCompanies);
r.get("/companies/:id", validate(v.uuidParam, "params"), admin.companyDetails);
r.patch("/companies/:id/verification", validate(v.uuidParam, "params"), validate(v.verificationBody), admin.verifyCompany);
r.patch("/companies/:id/block", validate(v.uuidParam, "params"), admin.changeCompanyStatus);
r.patch("/companies/:id/unblock", validate(v.uuidParam, "params"), admin.changeCompanyStatus);
r.delete("/companies/:id", validate(v.uuidParam, "params"), admin.deleteCompany);

r.get("/analytics/applications", admin.applicationStats);
r.get("/analytics/interviews", admin.interviewStats);
r.get("/analytics/trends/applications", validate(v.trendQuery, "query"), admin.applicationTrend);
r.get("/analytics/trends/interviews", validate(v.trendQuery, "query"), admin.interviewTrend);
r.get("/audit-logs", validate(v.auditQuery, "query"), admin.auditLogs);

module.exports = r;
