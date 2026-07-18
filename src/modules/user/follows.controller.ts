// Controller class for follow feature.
// This class will handle the incoming HTTP requests related to following/unfollowing users and delegate the business logic to the FollowService.

import { NextFunction, Request, Response } from "express";
import { FollowService } from "./follows.service";

export class FollowController {
  private followService: FollowService;

  constructor(followService: FollowService) {
    this.followService = followService;
  }

  // create follow
  async createFollow(req: Request, res: Response, next: NextFunction) {
    try {
      const following_id = req.params.id;
      const follower_id = req.user?.id as string;
      const follow = await this.followService.createFollow(
        follower_id,
        following_id,
      );
      res.status(201).json(follow);
    } catch (error) {
      next(error);
    }
  }

  // unfollow
  async unfollow(req: Request, res: Response, next: NextFunction) {
    try {
      const following_id = req.params.id;
      const follower_id = req.user?.id as string;
      const result = await this.followService.unfollow(
        follower_id,
        following_id,
      );
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // get followers
  async getFollowers(req: Request, res: Response, next: NextFunction) {
    try {
      const user_id = req.params.id;
      // 1. Extract query params from the incoming HTTP request URL
      const { page, limit } = req.query;
      const followers = await this.followService.getFollowers(
        user_id,
        page,
        limit,
      );
      res.status(200).json(followers);
    } catch (error) {
      next(error);
    }
  }

  // get following
  async getFollowing(req: Request, res: Response, next: NextFunction) {
    try {
      const user_id = req.params.id;
      // 1. Extract query params from the incoming HTTP request URL
      const { page, limit } = req.query;
      const following = await this.followService.getFollowing(
        user_id,
        page,
        limit,
      );
      res.status(200).json(following);
    } catch (error) {
      next(error);
    }
  }

  // check mutual follow
  async checkMutualFollow(req: Request, res: Response, next: NextFunction) {
    try {
      const following_id = req.params.id;
      const follower_id = req.user?.id as string;
      const is_mutual = await this.followService.checkMutual(
        follower_id,
        following_id,
      );
      res.status(200).json({ is_mutual: is_mutual });
    } catch (error) {
      next(error);
    }
  }
}
