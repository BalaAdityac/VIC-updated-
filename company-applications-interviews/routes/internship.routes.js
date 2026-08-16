const r=require("express").Router(),a=require("../middlewares/auth"),c=require("../controllers/internship.controller");
r.use(a,c.companyOnly);r.post("/",c.create);r.get("/",c.listMine);r.get("/:id",c.getMine);module.exports=r;
