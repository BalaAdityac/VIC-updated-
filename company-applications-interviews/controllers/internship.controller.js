const p=require("../config/prisma");

function companyOnly(req,res,next){
  if(req.user.role!=="COMPANY") return res.status(403).json({message:"Company access required"});
  next();
}
async function create(req,res){
  const c=await p.company.findUnique({where:{userId:req.user.userId}});
  if(!c) return res.status(404).json({message:"Company profile not found"});
  const x=await p.internship.create({data:{...req.body,companyId:c.id}});
  res.status(201).json(x);
}
async function listMine(req,res){
  const c=await p.company.findUnique({where:{userId:req.user.userId}});
  if(!c) return res.status(404).json({message:"Company profile not found"});
  res.json(await p.internship.findMany({where:{companyId:c.id},orderBy:{createdAt:"desc"}}));
}
async function getMine(req,res){
  const c=await p.company.findUnique({where:{userId:req.user.userId}});
  const x=await p.internship.findFirst({where:{id:req.params.id,companyId:c?.id}});
  if(!x) return res.status(404).json({message:"Internship not found"});
  res.json(x);
}
module.exports={create,listMine,getMine,companyOnly};
