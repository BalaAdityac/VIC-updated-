/**
 * Wraps an async Express route/controller handler so any rejected promise
 * is forwarded to next(err) and handled by the global error middleware,
 * instead of needing a try/catch block in every controller.
 */
function catchAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = catchAsync;
