const express = require("express");
const authController = require("./auth.controller");
const validate = require("../../middlewares/validate.middleware");
const authenticate = require("../../middlewares/auth.middleware");
const {
  registerSchema,
  loginSchema,
  updatePasswordSchema,
  forgotPasswordSchema,
} = require("./auth.validation");

const router = express.Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user (Student by default)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: "student@example.com" }
 *               password: { type: string, format: password, example: "Passw0rd!23" }
 *               role: { type: string, enum: [Student, Company, SuperAdmin], example: "Student" }
 *     responses:
 *       201:
 *         description: Registration successful
 *       409:
 *         description: Email already registered
 *       422:
 *         description: Validation failed
 */
router.post("/register", validate(registerSchema), authController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in and receive a JWT access token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: "student@example.com" }
 *               password: { type: string, format: password, example: "Passw0rd!23" }
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid email or password
 */
router.post("/login", validate(loginSchema), authController.login);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get the currently authenticated user's profile
 *     responses:
 *       200:
 *         description: Current user fetched successfully
 *       401:
 *         description: Not authenticated
 */
router.get("/me", authenticate, authController.getCurrentUser);

/**
 * @openapi
 * /auth/update-password:
 *   patch:
 *     tags: [Auth]
 *     summary: Update the logged-in user's password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string, format: password, example: "Passw0rd!23" }
 *               newPassword: { type: string, format: password, example: "NewPassw0rd!45" }
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       401:
 *         description: Current password incorrect / not authenticated
 */
router.patch("/update-password", authenticate, validate(updatePasswordSchema), authController.updatePassword);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Start the forgot-password flow (structure only)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email, example: "student@example.com" }
 *     responses:
 *       200:
 *         description: Generic confirmation message (does not reveal if the email exists)
 */
router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Log out the current user
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Not authenticated
 */
router.post("/logout", authenticate, authController.logout);

module.exports = router;
