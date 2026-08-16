const p=require("../config/prisma");

async function create(req,res){
  if(req.user.role!=="COMPANY") return res.status(403).json({message:"Company access required"});
  const c=await p.company.findUnique({where:{userId:req.user.userId}});
  if(!c) return res.status(404).json({message:"Company profile not found"});
  const a=await p.application.findFirst({
    where:{id:req.body.applicationId,internship:{companyId:c.id}},
    include:{student:true}
  });
  if(!a) return res.status(404).json({message:"Application not found for this company"});
  if(a.status!=="SHORTLISTED") return res.status(400).json({message:"Only shortlisted candidates can be scheduled"});
  const existing=await p.interview.findUnique({where:{applicationId:a.id}});
  if(existing) return res.status(409).json({message:"Interview already scheduled for this application"});
  const x=await p.interview.create({
    data:{
      dateTime:new Date(req.body.dateTime),
      meetingLink:req.body.meetingLink,
      type:req.body.type,
      round:req.body.round,
      notes:req.body.notes,
      applicationId:a.id,
      companyId:c.id,
      studentId:a.studentId
    }
  });
  res.status(201).json(x);
}

async function companyList(req,res){
  if(req.user.role!=="COMPANY") return res.status(403).json({message:"Company access required"});
  const c=await p.company.findUnique({where:{userId:req.user.userId}});
  if(!c) return res.status(404).json({message:"Company profile not found"});
  res.json(await p.interview.findMany({
    where:{companyId:c.id},orderBy:{dateTime:"asc"},
    include:{application:{select:{id:true,status:true,internship:{select:{id:true,title:true}}}},student:{select:{id:true,email:true,profile:true}}}
  }));
}

async function companyGet(req,res){
  if(req.user.role!=="COMPANY") return res.status(403).json({message:"Company access required"});
  const c=await p.company.findUnique({where:{userId:req.user.userId}});
  const x=await p.interview.findFirst({where:{id:req.params.id,companyId:c?.id},include:{application:true,student:{select:{id:true,email:true,profile:true}}}});
  if(!x) return res.status(404).json({message:"Interview not found"});
  res.json(x);
}

async function studentList(req,res){
  if(req.user.role!=="STUDENT") return res.status(403).json({message:"Student access required"});
  const data=await p.interview.findMany({
    where:{studentId:req.user.userId},orderBy:{dateTime:"asc"},
    include:{company:{select:{id:true,name:true,logo:true}},application:{select:{id:true,status:true,internship:{select:{id:true,title:true}}}}}
  });
  res.json(data);
}

async function studentGet(req,res){
  if(req.user.role!=="STUDENT") return res.status(403).json({message:"Student access required"});
  const x=await p.interview.findFirst({
    where:{id:req.params.id,studentId:req.user.userId},
    include:{company:{select:{id:true,name:true,logo:true}},application:{select:{id:true,status:true,internship:{select:{id:true,title:true}}}}}
  });
  if(!x) return res.status(404).json({message:"Interview not found"});
  res.json(x);
}
module.exports={create,companyList,companyGet,studentList,studentGet};
