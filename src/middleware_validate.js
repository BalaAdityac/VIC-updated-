module.exports = (schema, source="body") => (req,res,next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) return res.status(400).json({success:false,message:"Validation failed",errors:result.error.issues});
  req[source] = result.data;
  next();
};
