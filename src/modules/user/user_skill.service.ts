import { BadRequestError, ConflictError } from "../../shared/utils/errors";
import { logger } from "../../shared/utils/loggers";
import { MessageResponse } from "../../shared/utils/response";
import { Skill } from "../skills/skill.type";
import { User } from "./user.types";
import { UserSkillRepository } from "./user_skill.respository";



export class UserSkillService {
    // add skill to user
    async addUserSkill(userId: string, skillId: string): Promise<MessageResponse> {
        try {
            // Check if the skill exists before adding
            const alreadyHasSkill = await UserSkillRepository.userHasSkill(userId, skillId);
            if (alreadyHasSkill) {
                throw new ConflictError("User already has this skill.");
            }
            await UserSkillRepository.addUserSkill(userId, skillId);
            return { message: "Skill added to user successfully." };
        } catch (error) {
            logger.error("Add user skill error:", error);
            throw error;
        }
    }

    // get all skills of a user
    async getUserSkills(userId: string): Promise<Skill[]> {
        try {
            return await UserSkillRepository.getUserSkills(userId);
        } catch (error) {
            logger.error("Get user skills error:", error);
            throw error;
        }
    }

    // get all users by skill
    async getUsersBySkill(skillId: string): Promise<User[]> {
        try {
            return await UserSkillRepository.getUsersBySkill(skillId);
        } catch (error) {
            logger.error("Get users by skill error:", error);
            throw error;
        }
    }

    // get all skills of a user by user id
    async getUserSkillsByUserId(userId: string): Promise<Skill[]> {
        try {
            return await UserSkillRepository.getUserSkills(userId);
        } catch (error) {
            logger.error("Get user skills by user id error:", error);
            throw error;
        }
    }

    // remove skill from user
    async removeUserSkill(userId: string, skillId: string): Promise<void> {
        try {
            const hasSkill = await UserSkillRepository.userHasSkill(userId, skillId);
            if (!hasSkill) {
                throw new BadRequestError("User does not have this skill.");
            }
            await UserSkillRepository.removeUserSkill(userId, skillId);
        } catch (error) {
            logger.error("Remove user skill error:", error);
            throw error;
        }
     }
}