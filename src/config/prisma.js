const { PrismaClient } = require("@prisma/client");
const env = require("./env");

// Prevent multiple PrismaClient instances in development (nodemon hot reload)
const globalForPrisma = global;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
