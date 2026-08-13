const p=require("../config/prisma");

async function company(req,res){
  if(req.user.role!=="COMPANY") return res.status(403).json({message:"Company access required"});
  const c=await p.company.findUnique({where:{userId:req.user.userId}});
  if(!c) return res.status(404).json({message:"Company profile not found"});
  const page=Math.max(Number(req.query.page)||1,1);
  const limit=Math.min(Math.max(Number(req.query.limit)||10,1),100);
  const where={
    internship:{companyId:c.id},
    ...(req.query.status?{status:req.query.status}:{})
  };
  const [data,total]=await Promise.all([
    p.application.findMany({
      where,skip:(page-1)*limit,take:limit,orderBy:{createdAt:"desc"},
      include:{
        internship:{select:{id:true,title:true,companyId:true}},
        student:{select:{id:true,email:true,status:true,profile:true,education:true,projects:true,userSkills:{include:{skill:true}}}}
      }
    }),
    p.application.count({where})
  ]);
  res.json({
    data:data.map(a=>({
      id:a.id,status:a.status,coverLetter:a.coverLetter,resumeReference:a.resumeReference||a.student.profile?.resume||null,
      appliedAt:a.createdAt,updatedAt:a.updatedAt,internship:a.internship,
      candidate:{id:a.student.id,email:a.student.email,status:a.student.status,profile:a.student.profile,education:a.student.education,projects:a.student.projects,skills:a.student.userSkills.map(x=>x.skill)}
    })),
    pagination:{page,limit,total,totalPages:Math.ceil(total/limit)}
  });
}

async function candidate(req,res){
  if(req.user.role!=="COMPANY") return res.status(403).json({message:"Company access required"});
  const c=await p.company.findUnique({where:{userId:req.user.userId}});
  const a=await p.application.findFirst({
    where:{id:req.params.id,internship:{companyId:c?.id}},
    include:{internship:true,student:{select:{id:true,email:true,status:true,profile:true,education:true,projects:true,userSkills:{include:{skill:true}}}}}
  });
  if(!a) return res.status(404).json({message:"Application not found"});
  res.json({
    application:{id:a.id,status:a.status,coverLetter:a.coverLetter,resumeReference:a.resumeReference||a.student.profile?.resume||null,createdAt:a.createdAt,updatedAt:a.updatedAt},
    internship:a.internship,
    candidate:{id:a.student.id,email:a.student.email,status:a.student.status,profile:a.student.profile,education:a.student.education,projects:a.student.projects,skills:a.student.userSkills.map(x=>x.skill)}
  });
}

async function updateStatus(req,res){
  if(req.user.role!=="COMPANY") return res.status(403).json({message:"Company access required"});
  const c=await p.company.findUnique({where:{userId:req.user.userId}});
  const a=await p.application.findFirst({where:{id:req.params.id,internship:{companyId:c?.id}}});
  if(!a) return res.status(404).json({message:"Application not found"});
  const allowed=["APPLIED","UNDER_REVIEW","SHORTLISTED","REJECTED"];
  if(!allowed.includes(req.body.status)) return res.status(400).json({message:"Invalid application status"});
  if(a.status==="REJECTED" && req.body.status!=="REJECTED") return res.status(400).json({message:"Rejected applications cannot be reopened"});
  const x=await p.application.update({where:{id:a.id},data:{status:req.body.status}});
  res.json(x);
}

async function student(req,res){
  if(req.user.role!=="STUDENT") return res.status(403).json({message:"Student access required"});
  const data=await p.application.findMany({
    where:{studentId:req.user.userId},
    orderBy:{createdAt:"desc"},
    include:{internship:{include:{company:true}},interview:true}
  });
  res.json(data.map(a=>({...a,internship:{...a.internship,company: a.internship.company ? {id:a.internship.company.id,name:a.internship.company.name,logo:a.internship.company.logo}:null}})));
}
module.exports={company,candidate,updateStatus,student};
