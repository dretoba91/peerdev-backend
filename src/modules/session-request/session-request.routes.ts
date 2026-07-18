import { Router } from "express";
import { SessionRequestController } from "./session-request.controller";
import { SessionRequestService } from "./session-request.service";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { createSessionRequestLimiter } from "../../shared/middleware/rateLimiter";

const router = Router();
const sessionRequestService = new SessionRequestService();
const sessionRequestController = new SessionRequestController(sessionRequestService);

// create a session request
router.post("/", createSessionRequestLimiter, authenticate, sessionRequestController.createSessionRequest.bind(sessionRequestController));

// get session requests by recipient_id or requester_id
router.get("/", authenticate, sessionRequestController.getRequest.bind(sessionRequestController));

// accept a session request
router.patch("/:id/accept", authenticate, sessionRequestController.acceptRequest.bind(sessionRequestController));

// reject a session request
router.patch("/:id/reject", authenticate, sessionRequestController.rejectRequest.bind(sessionRequestController));

// cancel a session request
router.delete("/:id", authenticate, sessionRequestController.cancelSessionRequest.bind(sessionRequestController));

export default router;