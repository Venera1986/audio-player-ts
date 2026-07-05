import type { User } from './User';

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface MessageResponse {
  message: string;
}

export interface RegisterResponse extends MessageResponse {
  user: User;
}

export interface LoginResponse extends MessageResponse {
  token: string;
}

export interface ApiErrorResponse {
  message: string;
}
