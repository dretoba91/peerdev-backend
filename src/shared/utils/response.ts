export interface MessageResponse {
  message: string;
}

export interface SuccessResponse<T> {
  data: T;
  message?: string;
}