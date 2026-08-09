require("dotenv").config();

const required = ["DATABASE_URL", "JWT_SECRET"];

for (const key of required) {
  if (!process.env[key]) {
    // eslint-disable-next-line no-console
    console.warn(`[config] Warning: environment variable ${key} is not set. Check your .env file.`);
  }
}

module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret-change-me",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10),
};
