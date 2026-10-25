import { loginUser, registerUser } from '../services/authService';
import type { AuthCredentials } from '../types/Auth';
import { clearAuthStorage, setToken, setUsername } from '../utils/storage';

export async function registerAndLogin(credentials: AuthCredentials): Promise<void> {
  await registerUser(credentials);
  const response = await loginUser(credentials);

  setToken(response.token);
  setUsername(credentials.username);
}

export async function login(credentials: AuthCredentials): Promise<void> {
  const response = await loginUser(credentials);

  setToken(response.token);
  setUsername(credentials.username);
}

export function logout(): void {
  clearAuthStorage();
}
