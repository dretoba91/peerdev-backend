import { Router } from "express";
import { AuthContoller } from "../controllers/auth.controller";

const router = Router();
const authController = new AuthContoller();

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
 *                 full_name: "John Doe"
 *                 email: "john.doe@example.com"
 *                 password: "SecurePassword123!"
 *                 experience_level: "mid_level"
 *             senior:
 *               summary: Register as senior developer
 *               value:
 *                 full_name: "Jane Smith"
 *                 email: "jane.smith@example.com"
 *                 password: "StrongPassword456!"
 *                 experience_level: "senior"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserWithToken'
 *             example:
 *               id: "cb26fcea-5356-4201-8ead-d98c66e1e543"
 *               full_name: "John Doe"
 *               email: "john.doe@example.com"
 *               role_id: "aa933299-7d29-11f0-9050-b248b0b45048"
 *               experience_level: "mid_level"
 *               created_at: "2025-08-19T17:47:56.000Z"
 *               updated_at: "2025-08-19T17:47:56.000Z"
 *               access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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
router.post("/register", authController.registerUser.bind(authController));

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
 *               $ref: '#/components/schemas/UserWithToken'
 *             example:
 *               id: "cb26fcea-5356-4201-8ead-d98c66e1e543"
 *               full_name: "John Doe"
 *               email: "john.doe@example.com"
 *               role_id: "aa933299-7d29-11f0-9050-b248b0b45048"
 *               experience_level: "mid_level"
 *               created_at: "2025-08-19T17:47:56.000Z"
 *               updated_at: "2025-08-19T17:47:56.000Z"
 *               access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
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
router.post("/login", authController.loginUser.bind(authController));

export default router;
