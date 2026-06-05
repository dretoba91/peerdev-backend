import { ConflictError } from "../../shared/utils/errors";
import { logger } from "../../shared/utils/loggers";
import { MessageResponse } from "../../shared/utils/response";
import { SkillRepository } from "./skill.repository";
import { Skill } from "./skill.type";

export class SkillService {
  // create a new skill
  async createSkill(name: string): Promise<MessageResponse> {
    try {
      // make a check for duplicate
      const existing = await SkillRepository.findExact(name);
      if (existing)
        throw new ConflictError("Skill with this name already exists.");
      await SkillRepository.create({ name });
      return { message: "Skill created successfully." };
    } catch (error) {
      logger.error("Create skill error:", error);
      throw error;
    }
  }

  // get all skills
  async getSkillsByName(name: string): Promise<Skill[]> {
    try {
      // if name is empty string, it will return all skills. Otherwise, it will return skills that match the name search.
      if (!name) {
        return await SkillRepository.findAll();
      }

      const skills = await SkillRepository.findByName(name);
      return skills;
    } catch (error) {
      logger.error("Get skills by name error:", error);
      throw error;
    }
  }
}
