const prisma = require("../config/prisma");
async function logAdminAction({ adminId, action, entityType, entityId = null, metadata = null, tx = prisma }) {
  return tx.auditLog.create({ data: { adminId, action, entityType, entityId, metadata: metadata == null ? undefined : metadata } });
}
module.exports = { logAdminAction };
