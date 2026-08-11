const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");

const requestLogger = require("./middlewares/logger.middleware");
const globalErrorHandler = require("./middlewares/error.middleware");
const AppError = require("./utils/AppError");
const routes = require("./routes");
const swaggerSpec = require("./config/swagger");

const app = express();

// ---------- Core middleware ----------
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// ---------- Static assets (custom Swagger logo, favicon, etc.) ----------
app.use("/public", express.static(path.join(__dirname, "..", "public")));

// ---------- Health check ----------
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is healthy", data: { uptime: process.uptime() } });
});

// ---------- API docs (custom branding: name, logo, favicon) ----------
const swaggerUiOptions = {
  customSiteTitle: "VIC — API Docs",
  customfavIcon: "/public/logo.png",
  customCss: `
    .swagger-ui .topbar { background-color: #0f1b2d; padding: 10px 0; }
    .swagger-ui .topbar-wrapper a svg { display: none; }
    .swagger-ui .topbar-wrapper a::before {
      content: "";
      display: inline-block;
      width: 32px;
      height: 32px;
      background-image: url('/public/logo.png');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      border-radius: 6px;
      flex-shrink: 0;
    }
    .swagger-ui .info .title { color: #1F3864; }
  `,
};
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// ---------- API routes ----------
app.use("/api", routes);

// ---------- 404 handler ----------
app.use((req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
});

// ---------- Global error handler (must be last) ----------
app.use(globalErrorHandler);

module.exports = app;
