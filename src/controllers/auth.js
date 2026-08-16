const prisma=require("../config/prisma");
const {hashPassword,comparePassword}=require("../utils/hash");
const {signToken}=require("../utils/jwt");
async function register(req,res,next){try{
 const {email,password,role,companyName,fullName}=req.body;
 if(await prisma.user.findUnique({where:{email}})) return res.status(409).json({success:false,message:"Email already registered"});
 const user=await prisma.user.create({data:{
  email,password:await hashPassword(password),role,
  company:role==="COMPANY"?{create:{name:companyName||"Unnamed Company"}}:undefined,
  profile:role==="STUDENT"?{create:{fullName:fullName||"Student"}}:undefined
 },select:{id:true,email:true,role:true,status:true}});
 res.status(201).json({success:true,data:{user,token:signToken(user)}});
}catch(e){next(e)}}
async function login(req,res,next){try{
 const user=await prisma.user.findUnique({where:{email:req.body.email}});
 if(!user||!(await comparePassword(req.body.password,user.password))) return res.status(401).json({success:false,message:"Invalid credentials"});
 if(user.status!=="ACTIVE") return res.status(403).json({success:false,message:"Account is not active"});
 res.json({success:true,data:{user:{id:user.id,email:user.email,role:user.role},token:signToken(user)}});
}catch(e){next(e)}}
module.exports={register,login};
