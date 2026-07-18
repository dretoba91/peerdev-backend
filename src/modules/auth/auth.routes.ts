import { Router } from "express";
import { RoleService } from "../user/role.service";
import { UserService } from "../user/user.service";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import {
  loginLimiter,
  otpLimiter,
  refreshLimiter,
  registrationLimiter,
  resendOtpLimiter,
} from "../../shared/middleware/rateLimiter";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { MiddlewareCombo } from "../../shared/middleware";

const router = Router();
const roleService = new RoleService();
const userService = new UserService(roleService);
const authService = new AuthService(userService);
const authController = new AuthController(authService);


/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and registration endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegistration'
 *           examples:
 *             developer:
 *               summary: Register as developer
 *               value:
 *                 first_name: "John"
 *                 last_name: "Doe"
 *                 email: "john.doe@example.com"
 *                 password: "SecurePassword123!"
 *                 experience_level: "mid_level"
 *             senior:
 *               summary: Register as senior developer
 *               value:
 *                 first_name: "John"
 *                 last_name: "Doe"
 *                 email: "john.doe@example.com"
 *                 password: "SecurePassword123!"
 *                 experience_level: "mid_level"
 *             senior:
 *               summary: Register as senior developer
 *               value:
 *                 first_name: "Jane"
 *                 last_name: "Smith"
 *                 email: "jane.smith@example.com"
 *                 password: "StrongPassword456!"
 *                 experience_level: "senior"
 *     responses:
 *       201:
 *         description: Registration successful. Please verify your email.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *             example:
 *               message: "Registration successful. Please verify your email."
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Email is required"
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "User with this email already exists"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/register",
  registrationLimiter,
  ...MiddlewareCombo.userRegistrationChain(),
  authController.registerUser.bind(authController),
);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP and receive access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, code]
 *             properties:
 *               user_id:
 *                 type: string
 *               code:
 *                 type: string
 *                 example: "482931"
 *     responses:
 *       200:
 *         description: OTP verified. Access and refresh tokens issued.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthUserResponse'
 *             example:
 *               user:
 *                 id: "cb26fcea-5356-4201-8ead-d98c66e1e543"
 *                 first_name: "John"
 *                 last_name: "Doe"
 *                 email: "john.doe@example.com"
 *                 role_id: "aa933299-7d29-11f0-9050-b248b0b45048"
 *                 experience_level: "mid_level"
 *                 created_at: "2025-08-19T17:47:56.000Z"
 *                 updated_at: "2025-08-19T17:47:56.000Z"
 *               access_token: "eyJhbGciOiJIUzI1NiJ9..."
 *               refresh_token: "eyJhbGciOiJIUzI1NiJ9..."               
 *               session_id: "cb26fcea-5356-4201-8ead-d98c66e1e543" *       400:
 *         description: Missing fields
 *       401:
 *         description: Invalid or expired OTP
 */
router.post(
  "/verify-otp",
  otpLimiter,
  authController.verifyOTP.bind(authController),
);

/**
 * @swagger
 * /auth/resend-otp:
 *   post:
 *     summary: Resend OTP to unverified user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "A new verification code has been sent."
 *       400:
 *         description: Missing email
 *       404:
 *         description: User not found
 */
router.post(
  "/resend-otp",
  resendOtpLimiter,
  authController.resendOTP.bind(authController),
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *           example:
 *             email: "john.doe@example.com"
 *             password: "SecurePassword123!"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthUserResponse'
 *             example:
 *               user:
 *                 id: "cb26fcea-5356-4201-8ead-d98c66e1e543"
 *                 first_name: "John"
 *                 last_name: "Doe"
 *                 email: "john.doe@example.com"
 *                 role_id: "aa933299-7d29-11f0-9050-b248b0b45048"
 *                 experience_level: "mid_level"
 *                 created_at: "2025-08-19T17:47:56.000Z"
 *                 updated_at: "2025-08-19T17:47:56.000Z"
 *               access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."               
 *               session_id: "cb26fcea-5356-4201-8ead-d98c66e1e543" *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Email and password are required"
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Invalid email or password"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/login",
  loginLimiter,
  ...MiddlewareCombo.userLoginChain(),
  authController.loginUser.bind(authController),
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user and invalidate refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id]
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *                 example: "cb26fcea-5356-4201-8ead-d98c66e1e543"
 *               refresh_token:
 *                 type: string
 *                 description: Current refresh token to invalidate
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             example:
 *               message: "Logged out successfully"
 *       400:
 *         description: Missing user_id
 *       401:
 *         description: Invalid refresh token
 *       404:
 *         description: User not found
 */
router.post(
  "/logout",
  authenticate,
  authController.logoutUser.bind(authController),
);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token using a valid refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refresh_token]
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 description: Refresh token issued at login
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: New access token issued.
 *         content:
 *           application/json:
 *             example:
 *               access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Missing refresh_token
 *       401:
 *         description: Invalid refresh token
 *       404:
 *         description: User not found
 */
router.post(
  "/refresh",
  refreshLimiter,
  authController.refreshToken.bind(authController),
);

export default router;
