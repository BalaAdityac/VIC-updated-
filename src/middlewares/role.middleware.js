const AppError = require("../utils/AppError");

/**
 * Restricts a route to one or more roles. Must run AFTER the `authenticate`
 * middleware, since it relies on req.user.role being set.
 *
 * Usage: router.get("/admin-only", authenticate, authorize("SuperAdmin"), handler)
 * Usage: router.get("/staff", authenticate, authorize("Company", "SuperAdmin"), handler)
 *
 * @param {...string} allowedRoles - e.g. "Student", "Company", "SuperAdmin"
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required before authorization can be checked.", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(`Role '${req.user.role}' is not permitted to access this resource.`, 403)
      );
    }

    next();
  };
}

module.exports = authorize;
