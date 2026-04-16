export interface User {
  id?:                          string;

  first_name:                   string;
  last_name:                    string;

  email:                        string;
  password:                     string;

  username?:                    string;
  profile_picture?:             string;
  bio?:                         string;
  location?:                    string;

  github_url?:                  string;
  linkedin_url?:                string;
  portfolio_url?:               string;

  experience_level?:            ExperienceLevel;
  role_id:                      string;

  is_active?:                   boolean;
  last_login?:                  Date;

  // email verification
  email_verified?:              boolean;
  verification_token?:          string | null;
  verification_token_expires?:  Date | null;
  refresh_token?:               string | null;

  created_at?:                  Date;
  updated_at?:                  Date;
}

export type ExperienceLevel =
  | 'beginner'
  | 'junior'
  | 'mid_level'
  | 'senior'
  | 'lead'
  | 'manager'
  | 'principal'
  | 'architect';

export interface Role {
  id?:          string;
  name:         string;
  description?: string;
  created_at?:  Date;
  updated_at?:  Date;
}

// Utility type — strips sensitive fields before sending response
export type SafeUser = Omit<User,
  | 'password'
  | 'verification_token'
  | 'verification_token_expires'
  | 'refresh_token'
>;