import { apiRequest } from './api';
import type {
  AuthCredentials,
  LoginResponse,
  RegisterResponse,
} from '../types/Auth';

export function registerUser(
  credentials: AuthCredentials,
): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>('/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function loginUser(credentials: AuthCredentials): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}
