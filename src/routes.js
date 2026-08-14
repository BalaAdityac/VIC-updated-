const express=require("express");
const validate=require("./middleware_validate");
const {auth,requireRole}=require("./middlewares/auth");
const {register,login}=require("./controllers/auth");
const company=require("./controllers/company");
const applications=require("./controllers/applications");
const interviews=require("./controllers/interviews");
const evaluations=require("./controllers/evaluations");
const v=require("./validations");
const r=express.Router();

r.post("/auth/register",validate(v.registerSchema),register);
r.post("/auth/login",validate(v.registerSchema.pick({email:true,password:true})),login);

r.get("/company/me",auth,requireRole("COMPANY"),company.me);
r.post("/company/internships",auth,requireRole("COMPANY"),validate(v.internshipSchema),company.createInternship);
r.get("/company/internships",auth,requireRole("COMPANY"),company.listInternships);

r.get("/company/applications",auth,requireRole("COMPANY"),applications.list);
r.get("/company/applications/:applicationId/candidate",auth,requireRole("COMPANY"),applications.candidateView);
r.patch("/company/applications/:applicationId/status",auth,requireRole("COMPANY"),validate(v.statusSchema),applications.status);

r.post("/student/internships/:internshipId/apply",auth,requireRole("STUDENT"),applications.apply);

r.post("/company/applications/:applicationId/interviews",auth,requireRole("COMPANY"),validate(v.interviewSchema),interviews.schedule);
r.get("/company/interviews",auth,requireRole("COMPANY"),interviews.companyList);
r.get("/company/interviews/:interviewId",auth,requireRole("COMPANY"),interviews.details);
r.get("/student/interviews",auth,requireRole("STUDENT"),interviews.studentList);

r.put("/company/interviews/:interviewId/evaluation",auth,requireRole("COMPANY"),validate(v.evaluationSchema),evaluations.upsert);
r.get("/company/interviews/:interviewId/evaluation",auth,requireRole("COMPANY"),evaluations.get);
module.exports=r;
