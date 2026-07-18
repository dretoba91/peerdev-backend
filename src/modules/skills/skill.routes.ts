import { Router } from "express";
import { SkillService } from "./skill.service";
import { SkillController } from "./skill.controller";
import { MiddlewareCombo } from "../../shared/middleware";
import { authenticate } from "../../shared/middleware/auth.middleware";


const router = Router();
const skillService = new SkillService();
const skillController = new SkillController(skillService);

// create skill
router.post("/", ...MiddlewareCombo.authWithAdminRole(), skillController.createSkill.bind(skillController));

// get skills by name
router.get("/", authenticate, skillController.getSkillsByName.bind(skillController));

export default router;
