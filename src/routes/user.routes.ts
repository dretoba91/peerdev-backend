import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { RBACMiddleware } from "../middleware/rbac.middleware";

const router = Router();
const userController = new UserController();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints (requires authentication)
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegistration'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", userController.createUser.bind(userController));

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *             example:
 *               - id: "cb26fcea-5356-4201-8ead-d98c66e1e543"
 *                 full_name: "John Doe"
 *                 email: "john.doe@example.com"
 *                 role_id: "aa933299-7d29-11f0-9050-b248b0b45048"
 *                 experience_level: "mid_level"
 *                 created_at: "2025-08-19T17:47:56.000Z"
 *                 updated_at: "2025-08-19T17:47:56.000Z"
 *               - id: "def456gh-7890-1234-ijkl-mnopqrstuvwx"
 *                 full_name: "Jane Smith"
 *                 email: "jane.smith@example.com"
 *                 role_id: "bb944399-8e3a-22g1-a161-c359c1f1f159"
 *                 experience_level: "senior"
 *                 created_at: "2025-08-19T18:00:00.000Z"
 *                 updated_at: "2025-08-19T18:00:00.000Z"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", userController.getAllUsers.bind(userController));

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by UUID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User UUID
 *         example: "cb26fcea-5356-4201-8ead-d98c66e1e543"
 *     responses:
 *       200:
 *         description: User found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *             example:
 *               id: "cb26fcea-5356-4201-8ead-d98c66e1e543"
 *               full_name: "John Doe"
 *               email: "john.doe@example.com"
 *               role_id: "aa933299-7d29-11f0-9050-b248b0b45048"
 *               experience_level: "mid_level"
 *               created_at: "2025-08-19T17:47:56.000Z"
 *               updated_at: "2025-08-19T17:47:56.000Z"
 *       400:
 *         description: Invalid UUID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "id must be a valid UUID"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "User not found"
 */
router.get("/:id", userController.getUserById.bind(userController));

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User UUID
 *         example: "cb26fcea-5356-4201-8ead-d98c66e1e543"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: "John Updated Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.updated@example.com"
 *               experience_level:
 *                 type: string
 *                 enum: ['beginner', 'junior', 'mid_level', 'senior', 'lead', 'manager', 'principal', 'architect']
 *                 example: "senior"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input data or UUID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Access denied (can only update own profile or need admin privileges)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:id", userController.updateUser.bind(userController));

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User UUID
 *         example: "cb26fcea-5356-4201-8ead-d98c66e1e543"
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       400:
 *         description: Invalid UUID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Access denied (can only delete own account or need admin privileges)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:id", userController.deleteUser.bind(userController));

/**
 * @swagger
 * /users/role:
 *   put:
 *     summary: Update user role (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *                 description: User UUID
 *                 example: "cb26fcea-5356-4201-8ead-d98c66e1e543"
 *               roleType:
 *                 type: string
 *                 enum: ['developer', 'mentor', 'moderator', 'event_organizer', 'content_creator', 'admin', 'super_admin']
 *                 description: New role for the user
 *                 example: "mentor"
 *             required: [id, roleType]
 *           example:
 *             id: "cb26fcea-5356-4201-8ead-d98c66e1e543"
 *             roleType: "mentor"
 *     responses:
 *       200:
 *         description: User role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Invalid role type: invalid_role"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Admin privileges required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Admin privileges required"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/role", RBACMiddleware.requireAdminRole(), userController.updateUserRole.bind(userController));

export default router;