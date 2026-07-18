export interface UserSession {
  id?:           string;
  user_id:       string;
  refresh_token: string;
  device_id?:    string;
  ip_address?:   string;
  created_at?:   Date;
}