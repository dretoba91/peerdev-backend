import { Request, Response, NextFunction } from "express";
import { UserSkillService } from "./user_skill.service";


export class UserSkillController {
    private userSkillService: UserSkillService;

    constructor(userSkillService: UserSkillService) {
        this.userSkillService = userSkillService;
    }

    // add skill to user
    async addUserSkill(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id as string;
            const skillId = req.body.skillId;
            await this.userSkillService.addUserSkill(userId, skillId);
            res.status(201).json({ message: "Skill added to user successfully." });
        } catch (error) {
            next(error)
        }
    }

    // get skills of a user
    async getUserSkills(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id as string;
            const skills = await this.userSkillService.getUserSkills(userId);
            res.status(200).json(skills);
        } catch (error) {
            next(error)
        }
    }

    // get users by skill
    async getUsersBySkill(req: Request, res: Response, next: NextFunction) {
        try {
            const skillId = req.params.skillId;
            const users = await this.userSkillService.getUsersBySkill(skillId);
            res.status(200).json(users);
        } catch (error) {
            next(error)
        }
    }

    // get skills of a user by user id
    async getUserSkillsByUserId(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.userId;
            const skills = await this.userSkillService.getUserSkillsByUserId(userId);
            res.status(200).json(skills);
        } catch (error) {
            next(error)
        }
    }

    // remove skill from user
    async removeUserSkill(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id as string;
            const skillId = req.params.skillId;
            await this.userSkillService.removeUserSkill(userId, skillId);
            res.status(204).send();
        } catch (error) {
            next(error)
        }
     }

}
