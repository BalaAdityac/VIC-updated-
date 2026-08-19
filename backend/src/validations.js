const { z } = require("zod");
module.exports = {
  registerSchema: z.object({
    email:z.string().email(), password:z.string().min(6),
    role:z.enum(["STUDENT","COMPANY"]), companyName:z.string().min(2).optional(),
    fullName:z.string().min(2).optional()
  }),
  internshipSchema: z.object({
    title:z.string().min(2), description:z.string().min(5),
    location:z.string().optional(), workMode:z.string().optional(),
    stipend:z.string().optional(), skills:z.string().optional(),
    deadline:z.coerce.date().optional()
  }),
  statusSchema: z.object({status:z.enum(["APPLIED","UNDER_REVIEW","SHORTLISTED","REJECTED"])}),
  interviewSchema: z.object({
    scheduledAt:z.coerce.date(), durationMins:z.number().int().min(15).max(240).optional(),
    meetingLink:z.string().url().optional(), interviewType:z.enum(["ONLINE","OFFLINE"]),
    round:z.enum(["HR","TECHNICAL","MANAGERIAL","FINAL"]),
    interviewer:z.string().optional(), notes:z.string().optional()
  }),
  evaluationSchema: z.object({
    score:z.number().min(0).max(100).optional(), remarks:z.string().max(5000).optional(),
    recommendation:z.enum(["SELECTED","REJECTED","HOLD"]), evaluatedBy:z.string().optional()
  })
};
