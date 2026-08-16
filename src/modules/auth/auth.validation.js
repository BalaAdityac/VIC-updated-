const { z } = require("zod");

const registerSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required" }).email("Invalid email address"),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters long")
      .max(128, "Password is too long"),
    role: z.enum(["Student", "Company", "SuperAdmin"]).optional().default("Student"),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required" }).email("Invalid email address"),
    password: z.string({ required_error: "Password is required" }).min(1, "Password is required"),
  }),
});

const updatePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string({ required_error: "Current password is required" }).min(1),
      newPassword: z
        .string({ required_error: "New password is required" })
        .min(8, "New password must be at least 8 characters long")
        .max(128, "New password is too long"),
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: "New password must be different from the current password",
      path: ["newPassword"],
    }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required" }).email("Invalid email address"),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  updatePasswordSchema,
  forgotPasswordSchema,
};
