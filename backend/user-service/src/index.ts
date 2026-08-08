import Fastify from "fastify";

const app = Fastify({
  logger: true,
});

app.get("/", async () => {
  return {
    message: "User Service is Running ",
  };
});

const start = async () => {
  try {
    await app.listen({
      port: 3001,
      host: "0.0.0.0",
    });

    console.log("User Service running on http://localhost:3001");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();