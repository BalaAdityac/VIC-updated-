const prisma = require("../../config/prisma");

function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

function findById(id) {
  return prisma.user.findUnique({ where: { id } });
}

function createUser({ email, password, role }) {
  return prisma.user.create({
    data: { email, password, role },
  });
}

function updatePassword(id, hashedPassword) {
  return prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  });
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  updatePassword,
};
