const { verifyToken } = require("../utils/jwt");
function auth(req, res, next) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith("Bearer ")) return res.status(401).json({success:false,message:"Bearer token required"});
  try { req.user = verifyToken(h.slice(7)); next(); }
  catch { return res.status(401).json({success:false,message:"Invalid or expired token"}); }
}
function requireRole(...roles) {
  return (req,res,next) => roles.includes(req.user.role)
    ? next() : res.status(403).json({success:false,message:"Forbidden"});
}
module.exports = { auth, requireRole };
