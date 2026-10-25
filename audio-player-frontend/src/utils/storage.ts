const TOKEN_KEY = 'audio-player-token';
const USERNAME_KEY = 'audio-player-username';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getUsername(): string {
  const username = localStorage.getItem(USERNAME_KEY);

  if (username) {
    return username;
  }

  return 'username';
}

export function setUsername(username: string): void {
  localStorage.setItem(USERNAME_KEY, username);
}

export function clearAuthStorage(): void {
  removeToken();
  localStorage.removeItem(USERNAME_KEY);
}

export function isAuthorized(): boolean {
  return Boolean(getToken());
}
