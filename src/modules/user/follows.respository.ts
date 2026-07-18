// This is the follows repository, which is responsible for managing the follow relationships between users in the application. It provides methods to create, retrieve, and delete follow relationships, as well as to check if a user is following another user. The repository interacts with the database to perform these operations and ensures that the data integrity is maintained.

import pool from "../../config/db";
import { Follow, FollowWithUser } from "./follow.types";

export const followsRepository = {
  // Method to create a new follow relationship
  async createFollow(follow: Follow): Promise<void> {
    const { follower_id, following_id } = follow;
    await pool.execute(
      `INSERT INTO follows (follower_id, following_id) VALUES (?, ?)`,
      [follower_id, following_id],
    );
  },

  // Method to get all followers of a user
  async getFollowers(userId: string): Promise<FollowWithUser[]> {
    const [rows] = await pool.execute(
      `SELECT f.id, f.follower_id, f.following_id, f.created_at, u.username, u.first_name, u.last_name 
       FROM follows AS f 
       JOIN users AS u ON f.follower_id = u.id 
       WHERE f.following_id = ?`,
      [userId],
    );
    return rows as FollowWithUser[];
  },

  // Method to get all users that a user is following
  async getFollowing(userId: string): Promise<FollowWithUser[]> {
    const [rows] = await pool.execute(
      `SELECT f.id, f.follower_id, f.following_id, f.created_at, u.username, u.first_name, u.last_name 
       FROM follows AS f 
       JOIN users AS u ON f.following_id = u.id 
       WHERE f.follower_id = ?`,
      [userId],
    );
    return rows as FollowWithUser[];
  },

  // Method to check is a user is already following another user.
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const [rows] = await pool.execute(
      `SELECT EXISTS (
                    SELECT 1 FROM follows
                    WHERE follower_id = ? AND following_id = ?
        ) AS is_following`,
      [followerId, followingId],
    );
    return (rows as any)[0].is_following === 1;
  },

  // Method to check if 2 users are mutual

  async checkMutual(followerId: string, followingId: string): Promise<boolean> {
    //1. I need both follower_id and following_id
    //2. if the first relationship exists (User 1 follows User 2), and then uses a subquery to check if the reverse relationship also exists.

    const [rows] = await pool.execute(
      `SELECT EXISTS (
                SELECT 1 FROM follows 
                WHERE follower_id = ? AND following_id = ?
            )
            AND EXISTS (
                SELECT 1 FROM follows 
                WHERE follower_id = ? AND following_id = ?
            ) AS is_mutual`,
      [followerId, followingId, followingId, followerId],
    );
    const isMutual = (rows as any)[0].is_mutual;
    return isMutual === 1; // Returns true if User 1 follows User 2, false otherwise
  },

  // Method to delete a follow relationship
  async deleteFollow(followerId: string, followingId: string): Promise<void> {
    await pool.execute(
      `DELETE FROM follows WHERE follower_id = ? AND following_id = ?`,
      [followerId, followingId],
    );
  },
};
