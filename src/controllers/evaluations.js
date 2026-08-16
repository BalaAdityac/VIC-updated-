const prisma=require("../config/prisma");
async function cid(id){const c=await prisma.company.findUnique({where:{userId:id},select:{id:true}});return c?.id}
async function upsert(req,res,next){try{
 const companyId=await cid(req.user.id);
 const i=await prisma.interview.findFirst({where:{id:req.params.interviewId,application:{internship:{companyId}}},include:{application:true}});
 if(!i)return res.status(404).json({success:false,message:"Interview not found or not owned by company"});
 const e=await prisma.evaluation.upsert({where:{interviewId:i.id},create:{...req.body,interviewId:i.id,evaluatedBy:req.user.id},update:{...req.body,evaluatedBy:req.user.id}});
 if(req.body.recommendation==="SELECTED")await prisma.application.update({where:{id:i.applicationId},data:{status:"SELECTED"}});
 if(req.body.recommendation==="REJECTED")await prisma.application.update({where:{id:i.applicationId},data:{status:"REJECTED"}});
 res.json({success:true,data:e});
}catch(e){next(e)}}
async function get(req,res,next){try{
 const companyId=await cid(req.user.id);
 const e=await prisma.evaluation.findFirst({where:{interviewId:req.params.interviewId,interview:{application:{internship:{companyId}}}}});
 if(!e)return res.status(404).json({success:false,message:"Evaluation not found"});
 res.json({success:true,data:e});
}catch(e){next(e)}}
module.exports={upsert,get};
