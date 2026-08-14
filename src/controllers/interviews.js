const prisma=require("../config/prisma");
async function cid(id){const c=await prisma.company.findUnique({where:{userId:id},select:{id:true}});return c?.id}
async function schedule(req,res,next){try{
 const companyId=await cid(req.user.id);
 const a=await prisma.application.findFirst({where:{id:req.params.applicationId,internship:{companyId}}});
 if(!a)return res.status(404).json({success:false,message:"Application not found or not owned by company"});
 if(a.status!=="SHORTLISTED")return res.status(400).json({success:false,message:"Only shortlisted candidates can be scheduled"});
 const x=await prisma.interview.create({data:{...req.body,applicationId:a.id,studentId:a.studentId}});
 res.status(201).json({success:true,data:x});
}catch(e){next(e)}}
async function companyList(req,res,next){try{
 const companyId=await cid(req.user.id);
 const data=await prisma.interview.findMany({where:{application:{internship:{companyId}}},orderBy:{scheduledAt:"asc"},include:{application:{include:{internship:true,student:{select:{id:true,email:true,profile:true}}}},evaluation:true}});
 res.json({success:true,data});
}catch(e){next(e)}}
async function details(req,res,next){try{
 const companyId=await cid(req.user.id);
 const x=await prisma.interview.findFirst({where:{id:req.params.interviewId,application:{internship:{companyId}}},include:{application:{include:{internship:true,student:{select:{id:true,email:true,profile:true}}}},evaluation:true}});
 if(!x)return res.status(404).json({success:false,message:"Interview not found or not owned by company"});
 res.json({success:true,data:x});
}catch(e){next(e)}}
async function studentList(req,res,next){try{
 const data=await prisma.interview.findMany({where:{studentId:req.user.id},orderBy:{scheduledAt:"asc"},select:{
  id:true,scheduledAt:true,durationMins:true,meetingLink:true,interviewType:true,round:true,interviewer:true,notes:true,
  application:{select:{status:true,internship:{select:{id:true,title:true,company:{select:{id:true,name:true}}}}}}
 }});
 res.json({success:true,data});
}catch(e){next(e)}}
module.exports={schedule,companyList,details,studentList};
