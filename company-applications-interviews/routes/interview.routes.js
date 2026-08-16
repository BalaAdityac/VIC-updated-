const r=require("express").Router(),a=require("../middlewares/auth"),c=require("../controllers/interview.controller");
r.use(a);
r.post("/",c.create);
r.get("/company",c.companyList);
r.get("/company/:id",c.companyGet);
r.get("/student",c.studentList);
r.get("/student/:id",c.studentGet);
module.exports=r;
