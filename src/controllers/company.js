const prisma=require("../config/prisma");
async function companyId(id){const c=await prisma.company.findUnique({where:{userId:id},select:{id:true}});return c?.id}
async function me(req,res,next){try{
 const c=await prisma.company.findUnique({where:{userId:req.user.id},include:{internships:true}});
 if(!c)return res.status(404).json({success:false,message:"Company not found"});
 res.json({success:true,data:c});
}catch(e){next(e)}}
async function createInternship(req,res,next){try{
 const companyIdValue=await companyId(req.user.id); if(!companyIdValue)return res.status(404).json({success:false,message:"Company not found"});
 const x=await prisma.internship.create({data:{...req.body,companyId:companyIdValue}});
 res.status(201).json({success:true,data:x});
}catch(e){next(e)}}
async function listInternships(req,res,next){try{
 const companyIdValue=await companyId(req.user.id); if(!companyIdValue)return res.status(404).json({success:false,message:"Company not found"});
 res.json({success:true,data:await prisma.internship.findMany({where:{companyId:companyIdValue},orderBy:{createdAt:"desc"}})});
}catch(e){next(e)}}
module.exports={me,createInternship,listInternships};
