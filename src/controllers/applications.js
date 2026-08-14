const prisma=require("../config/prisma");
async function cid(id){const c=await prisma.company.findUnique({where:{userId:id},select:{id:true}});return c?.id}
const candidate={id:true,email:true,profile:true,education:true,projects:true,userSkills:{include:{skill:true}}};
async function list(req,res,next){try{
 const companyId=await cid(req.user.id); if(!companyId)return res.status(404).json({success:false,message:"Company not found"});
 const where={internship:{companyId}};
 if(req.query.status)where.status=req.query.status;
 if(req.query.internshipId)where.internshipId=req.query.internshipId;
 const data=await prisma.application.findMany({where,orderBy:{appliedAt:"desc"},include:{internship:{select:{id:true,title:true,companyId:true}},student:{select:{id:true,email:true,profile:true}}}});
 res.json({success:true,data});
}catch(e){next(e)}}
async function candidateView(req,res,next){try{
 const companyId=await cid(req.user.id);
 const a=await prisma.application.findFirst({where:{id:req.params.applicationId,internship:{companyId}},include:{internship:true,student:{select:candidate}}});
 if(!a)return res.status(404).json({success:false,message:"Application not found or not owned by company"});
 res.json({success:true,data:{applicationId:a.id,status:a.status,appliedAt:a.appliedAt,internship:a.internship,candidate:a.student}});
}catch(e){next(e)}}
async function status(req,res,next){try{
 const companyId=await cid(req.user.id);
 const a=await prisma.application.findFirst({where:{id:req.params.applicationId,internship:{companyId}}});
 if(!a)return res.status(404).json({success:false,message:"Application not found or not owned by company"});
 const allowed={APPLIED:["UNDER_REVIEW","SHORTLISTED","REJECTED"],UNDER_REVIEW:["SHORTLISTED","REJECTED"],SHORTLISTED:["REJECTED"],REJECTED:[],SELECTED:[]};
 if(!allowed[a.status]?.includes(req.body.status))return res.status(400).json({success:false,message:`Invalid transition ${a.status} -> ${req.body.status}`});
 res.json({success:true,data:await prisma.application.update({where:{id:a.id},data:{status:req.body.status}})});
}catch(e){next(e)}}
async function apply(req,res,next){try{
 if(req.user.role!=="STUDENT")return res.status(403).json({success:false,message:"Student access required"});
 const i=await prisma.internship.findUnique({where:{id:req.params.internshipId}});
 if(!i||!i.isActive)return res.status(404).json({success:false,message:"Internship not found or inactive"});
 const existing=await prisma.application.findUnique({where:{studentId_internshipId:{studentId:req.user.id,internshipId:i.id}}});
 if(existing)return res.status(409).json({success:false,message:"Already applied"});
 res.status(201).json({success:true,data:await prisma.application.create({data:{studentId:req.user.id,internshipId:i.id}})});
}catch(e){next(e)}}
module.exports={list,candidateView,status,apply};
