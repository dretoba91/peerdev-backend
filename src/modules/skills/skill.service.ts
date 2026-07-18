import { ConflictError } from "../../shared/utils/errors";
import { logger } from "../../shared/utils/loggers";
import {
  buildPagination,
  PaginatedResponse,
} from "../../shared/utils/pagination";
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
  async getSkillsByName(
    name: string,
    page: any,
    limit: any,
  ): Promise<PaginatedResponse<Skill>> {
    try {
      const parsedPage = Math.max(1, parseInt(page) || 1);
      const parsedLimit = Math.max(1, Math.min(100, parseInt(limit) || 10));
      const offset = (parsedPage - 1) * parsedLimit;
      // if name is empty string, it will return all skills. Otherwise, it will return skills that match the name search.
      if (!name) {
        const { skills, total } = await SkillRepository.findAll(
          parsedLimit,
          offset,
        );
        const pagination = buildPagination(total, parsedPage, parsedLimit);
        return { data: skills, pagination };
      }

      const {skills, total} = await SkillRepository.findByName(name, parsedLimit, offset);
      const pagination = buildPagination(
        total,
        parsedPage,
        parsedLimit,
      );
      return { data: skills, pagination };
    } catch (error) {
      logger.error("Get skills by name error:", error);
      throw error;
    }
  }
}
