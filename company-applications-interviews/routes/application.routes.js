const r=require("express").Router(),a=require("../middlewares/auth"),c=require("../controllers/application.controller");
r.use(a);
r.get("/company",c.company);
r.get("/company/:id",c.candidate);
r.patch("/company/:id/status",c.updateStatus);
r.get("/student",c.student);
module.exports=r;
