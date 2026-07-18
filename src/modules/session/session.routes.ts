import { Router } from "express";
import { SessionService } from "./session.service";
import { SessionController } from "./session.controller";
import { authenticate } from "../../shared/middleware/auth.middleware";


const router = Router();

const sessionService = new SessionService();
const sessionController = new SessionController(sessionService);


router.post("/sessions", authenticate, sessionController.createSession.bind(sessionController));
router.get("/sessions", authenticate, sessionController.getSessions.bind(sessionController));
router.get("/sessions/:id", authenticate, sessionController.getSessionById.bind(sessionController));
router.patch("/sessions/:id", authenticate, sessionController.updateSession.bind(sessionController));
router.patch("/sessions/:id/cancel", authenticate, sessionController.cancelSession.bind(sessionController));
router.patch("/sessions/:id/complete", authenticate, sessionController.completeSession.bind(sessionController));

export default router;