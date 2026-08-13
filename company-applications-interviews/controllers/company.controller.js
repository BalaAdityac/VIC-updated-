const p=require("../config/prisma");

async function getProfile(req,res){
  const c=await p.company.findUnique({where:{userId:req.user.userId}});
  if(!c) return res.status(404).json({message:"Company profile not found"});
  res.json(c);
}
async function createOrUpdate(req,res){
  if(req.user.role!=="COMPANY") return res.status(403).json({message:"Company access required"});
  const data=req.body;
  const c=await p.company.upsert({
    where:{userId:req.user.userId},
    update:data,
    create:{...data,userId:req.user.userId}
  });
  res.status(201).json(c);
}
module.exports={getProfile,createOrUpdate};
