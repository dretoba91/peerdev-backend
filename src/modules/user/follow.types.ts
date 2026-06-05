export interface Follow {
  id?:           string;
  follower_id:   string;
  following_id:  string;
  created_at?:   Date;
}

export type FollowWithUser = Follow & {
  username?: string;
  first_name: string;
  last_name: string;
}