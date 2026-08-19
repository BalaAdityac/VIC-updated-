require("dotenv").config();
const bcrypt = require("bcrypt");
const prisma = require("../src/config/prisma");

async function main() {
  const [, , email, password] = process.argv;
  if (!email || !password) {
    console.error("Usage: node scripts/create-super-admin.js <email> <password>");
    process.exitCode = 1;
    return;
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exitCode = 1;
    return;
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  const hash = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS || 12));
  const user = existing
    ? await prisma.user.update({ where: { id: existing.id }, data: { password: hash, role: "SUPER_ADMIN", status: "ACTIVE" }, select: { id: true, email: true, role: true, status: true } })
    : await prisma.user.create({ data: { email, password: hash, role: "SUPER_ADMIN", status: "ACTIVE" }, select: { id: true, email: true, role: true, status: true } });
  console.log(JSON.stringify({ success: true, message: "Super Admin ready. Use POST /api/auth/login with these credentials.", user }, null, 2));
}

main().catch(err => { console.error(err); process.exitCode = 1; }).finally(async () => { await prisma.$disconnect(); });
