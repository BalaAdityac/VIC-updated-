const { z } = require("zod");
const uuid = z.string().uuid("Invalid UUID");
const pageQuery = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20) });
module.exports = {
  uuidParam: z.object({ id: uuid }),
  paginationQuery: pageQuery,
  usersQuery: pageQuery.extend({ search: z.string().trim().max(100).optional(), role: z.enum(["STUDENT", "COMPANY", "SUPER_ADMIN"]).optional(), status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional() }),
  companiesQuery: pageQuery.extend({ search: z.string().trim().max(100).optional(), verificationStatus: z.enum(["PENDING", "VERIFIED", "REJECTED"]).optional(), status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional() }),
  auditQuery: pageQuery.extend({ action: z.string().trim().max(100).optional(), entityType: z.string().trim().max(50).optional(), adminId: uuid.optional() }),
  trendQuery: z.object({ days: z.coerce.number().int().min(1).max(365).default(30) }),
  verificationBody: z.object({ verificationStatus: z.enum(["PENDING", "VERIFIED", "REJECTED"]), reason: z.string().trim().max(500).optional() }),
};
