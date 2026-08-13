const r=require("express").Router(),a=require("../middlewares/auth"),c=require("../controllers/company.controller");
r.use(a);r.get("/profile",c.getProfile);r.post("/profile",c.createOrUpdate);module.exports=r;
