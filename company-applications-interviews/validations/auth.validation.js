const {z}=require("zod");
const registerSchema=z.object({body:z.object({email:z.string().email(),password:z.string().min(6),role:z.enum(["STUDENT","COMPANY","SUPER_ADMIN"]).default("STUDENT")}),params:z.object({}),query:z.object({})});
const loginSchema=z.object({body:z.object({email:z.string().email(),password:z.string().min(1)}),params:z.object({}),query:z.object({})});
module.exports={registerSchema,loginSchema};