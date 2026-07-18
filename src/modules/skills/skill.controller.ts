import { NextFunction, Request, Response } from "express";
import { SkillService } from "./skill.service";


export class SkillController {
    private skillService: SkillService;

    constructor(skillService: SkillService) {
        this.skillService = skillService;
    }

    // create skill
    async createSkill(req: Request, res: Response, next: NextFunction) {
        try {
            const { name } = req.body;
            const result = await this.skillService.createSkill(name);
            res.status(201).json(result);
        } catch (error) {
            next(error)
        }
    }

    // get skills by name
    async getSkillsByName(req: Request, res: Response, next: NextFunction) {
        try {
            const { name } = req.query;
            const { page, limit } = req.query;
            // Ensure we pass a string or default to an empty string for "return all"
            const searchTerm = typeof name === 'string' ? name.trim() : '';
            const skills = await this.skillService.getSkillsByName(searchTerm, page, limit);
            res.status(200).json(skills);
        } catch (error) {
            next(error)
        }
    }
}