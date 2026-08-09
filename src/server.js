const app = require("./app");
const env = require("./config/env");
const prisma = require("./config/prisma");

async function start() {
  try {
    await prisma.$connect();
    // eslint-disable-next-line no-console
    console.log("[db] Connected to PostgreSQL via Prisma.");

    app.listen(env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`[server] Running on http://localhost:${env.PORT}`);
      // eslint-disable-next-line no-console
      console.log(`[server] Swagger docs at http://localhost:${env.PORT}/api-docs`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[server] Failed to start:", err);
    process.exit(1);
  }
}

process.on("unhandledRejection", (err) => {
  // eslint-disable-next-line no-console
  console.error("[UNHANDLED REJECTION]", err);
  process.exit(1);
});

start();
