const morgan = require("morgan");
const env = require("../config/env");

// method  path  status  response-time ms
const format = ":method :url :status :res[content-length] - :response-time ms";

const requestLogger = morgan(format, {
  skip: () => env.NODE_ENV === "test",
});

module.exports = requestLogger;
