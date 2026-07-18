import { Router } from "express";
import { RoleService } from "./role.service";
import { UserService } from "./user.service";
import { FollowService } from "./follows.service";
import { UserController } from "./user.controller";
import { RBACMiddleware } from "../../shared/middleware/rbac.middleware";
import { MiddlewareCombo, ValidationMiddleware } from "../../shared/middleware";
import { FollowController } from "./follows.controller";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { addSkillLimiter, followsLimiter, removeSkillLimiter } from "../../shared/middleware/rateLimiter";
import { UserSkillService } from "./user_skill.service";
import { UserSkillController } from "./user_skill.controller";

const router = Router();
const roleService = new RoleService();
const userService = new UserService(roleService);
const followService = new FollowService(userService);
const userSkillService = new UserSkillService();
const userController = new UserController(userService);
const followController = new FollowController(followService);
const userSkillController = new UserSkillController(userSkillService);


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
// router.post("/", userController.createUser.bind(userController));

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
// Must be authorized, admin, super_admin, moderator, or mentor to view all users
router.get(
  "/",
  ...MiddlewareCombo.authWithAdminRole(),
  userController.getAllUsers.bind(userController),
);

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
router.get(
  "/:id",
  ...MiddlewareCombo.authWithOwnershipOrAdmin(),
  userController.getUserById.bind(userController),
);

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
router.put(
  "/:id",
  ...MiddlewareCombo.authWithOwnershipOrAdmin(),
  userController.updateUser.bind(userController),
);

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
router.delete(
  "/:id",
  ...MiddlewareCombo.authWithOwnershipOrAdmin(),
  userController.deleteUser.bind(userController),
);

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
 *               user_id:
 *                 type: string
 *                 format: uuid
 *                 description: User UUID
 *                 example: "cb26fcea-5356-4201-8ead-d98c66e1e543"
 *               role_id:
 *                 type: string
 *                 format: uuid
 *                 description: New role UUID for the user
 *                 example: "aa933299-7d29-11f0-9050-b248b0b45048"
 *             required: [user_id, role_id]
 *           example:
 *             user_id: "cb26fcea-5356-4201-8ead-d98c66e1e543"
 *             role_id: "aa933299-7d29-11f0-9050-b248b0b45048"
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
router.put(
  "/role",
  ...MiddlewareCombo.roleAssignmentChain(),
  userController.updateUserRole.bind(userController),
);

// follow routes — sub-resource of users

/**
 * @swagger
 * /users/{id}/follow:
 *   post:
 *     summary: Follow a user
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
 *         description: UUID of the user to follow
 *         example: "def456gh-7890-1234-ijkl-mnopqrstuvwx"
 *     responses:
 *       201:
 *         description: Successfully followed the user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *             example:
 *               message: "You are now following this user"
 *       400:
 *         description: Invalid UUID format or trying to follow oneself
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "You cannot follow yourself."
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User to follow not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "User not found"
 */
router.post(
  "/:id/follow",
  followsLimiter,
  authenticate,
  followController.createFollow.bind(followController),
);

/**
 * @swagger
 * /users/{id}/follow:
 *   delete:
 *     summary: Unfollow a user
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
 *         description: UUID of the user to unfollow
 *         example: "def456gh-7890-1234-ijkl-mnopqrstuvwx"
 *     responses:
 *       204:
 *         description: Successfully unfollowed the user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *             example:
 *               message: "You are no longer following this user"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User to unfollow not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "User not found"
 */
router.delete(
  "/:id/follow",
  followsLimiter,
  authenticate,
  followController.unfollow.bind(followController),
);
router.get(
  "/:id/followers",
  ValidationMiddleware.validateUUID("id"),
  authenticate,
  followController.getFollowers.bind(followController),
);
router.get(
  "/:id/following",
  ValidationMiddleware.validateUUID("id"),
  authenticate,
  followController.getFollowing.bind(followController),
);
router.get(
  "/:id/mutual",
  ValidationMiddleware.validateUUID("id"),
  authenticate,
  followController.checkMutualFollow.bind(followController),
);

// Additional routes for user skills can be added here
router.post("/skills", addSkillLimiter, authenticate, userSkillController.addUserSkill.bind(userSkillController));

router.get("/skills", authenticate, userSkillController.getUserSkills.bind(userSkillController));

router.get("/skills/:skillId", userSkillController.getUsersBySkill.bind(userSkillController));

router.get("/:userId/skills", ValidationMiddleware.validateUUID("userId"), authenticate, userSkillController.getUserSkillsByUserId.bind(userSkillController));

router.delete("/skills/:skillId", removeSkillLimiter, authenticate, userSkillController.removeUserSkill.bind(userSkillController));

export default router;
