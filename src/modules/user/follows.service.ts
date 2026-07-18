// Service class for follow feature.

import {
  ConflictError,
  BadRequestError,
  NotFoundError,
} from "../../shared/utils/errors";
import { logger } from "../../shared/utils/loggers";
import { buildPagination, PaginatedResponse } from "../../shared/utils/pagination";
import { MessageResponse } from "../../shared/utils/response";
import { FollowWithUser } from "./follow.types";
import { followsRepository } from "./follows.respository";
import { UserService } from "./user.service";

export class FollowService {
  private user_service: UserService;

  constructor(userService: UserService) {
    this.user_service = userService;
  }
  // create a follow.
  async createFollow(
    follower_id: string,
    following_id: string,
  ): Promise<MessageResponse> {
    try {
      // check if both users are already following each other.
      if (follower_id === following_id) {
        throw new BadRequestError("You cannot follow yourself.");
      }
      // check db if both already exist.
      const alreadyFollowing = await followsRepository.isFollowing(
        follower_id,
        following_id,
      );
      if (alreadyFollowing)
        throw new ConflictError("You're already following this user");

      await followsRepository.createFollow({ follower_id, following_id });
      return { message: "Follow created successfully." };
    } catch (error) {
      logger.error("Create follow error:", error);
      throw error;
    }
  }

  // unfolow a following
  async unfollow(
    follower_id: string,
    following_id: string,
  ): Promise<MessageResponse> {
    try {
      // check if user exist on the follows table.
      const isFollowing = await followsRepository.isFollowing(
        follower_id,
        following_id,
      );
      if (!isFollowing)
        throw new BadRequestError("You're not following this user");
      await followsRepository.deleteFollow(follower_id, following_id);
      return { message: "Successfully unfollowed user" };
    } catch (error) {
      logger.error("Create follow error:", error);
      throw error;
    }
  }

  // get all followers.

  async getFollowers(user_id: string, page: any, limit: any): Promise<PaginatedResponse<FollowWithUser>> {
    try {
      const parsedPage  = Math.max(1, parseInt(page) || 1);
      const parsedLimit = Math.max(1, Math.min(100, parseInt(limit) || 10));
      const offset      = (parsedPage - 1) * parsedLimit;
      // check if user exist
      const existingUser = await this.user_service.findUserById(user_id);
      if (!existingUser) {
        throw new NotFoundError("User not found");
      }
      const {followers, total} = await followsRepository.getFollowers(user_id, parsedLimit, offset);

      // buildPagination calculates totalPages, hasNextPage etc.
        const pagination = buildPagination(total, parsedPage, parsedLimit);
      return { data: followers, pagination: pagination };
    } catch (error) {
      logger.error("Get followers error:", error);
      throw error;
    }
  }

  // get all following.
  async getFollowing(user_id: string, page: any, limit: any): Promise<PaginatedResponse<FollowWithUser>> {
    try {
      const parsedPage  = Math.max(1, parseInt(page) || 1);
      const parsedLimit = Math.max(1, Math.min(100, parseInt(limit) || 10)); 
      const offset      = (parsedPage - 1) * parsedLimit;
      // check if user exist
      const existingUser = await this.user_service.findUserById(user_id);
      if (!existingUser) {
        throw new NotFoundError("User not found");
      }
      const {followings, total} = await followsRepository.getFollowing(user_id, parsedLimit, offset);

      // buildPagination calculates totalPages, hasNextPage etc.
        const pagination = buildPagination(total, parsedPage, parsedLimit);
      return {data: followings, pagination: pagination};
    } catch (error) {
      logger.error("Get following error:", error);
      throw error;
    }
  }

  // check if 2 users are mutual.
  async checkMutual(followerId: string, followingId: string): Promise<boolean> {
    try {
      const isMutual = await followsRepository.checkMutual(
        followerId,
        followingId,
      );
      return isMutual;
    } catch (error) {
      logger.error("Check mutual error:", error);
      throw error;
    }
  }
}
