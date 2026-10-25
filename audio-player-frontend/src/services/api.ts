import { getToken } from '../utils/storage';
import type { ApiErrorResponse } from '../types/Auth';

const API_BASE_URL = '/api';

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof value.message === 'string'
  );
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const responseContentType = response.headers.get('Content-Type');
  const contentType = responseContentType ? responseContentType : '';
  const data: unknown = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = isApiErrorResponse(data)
      ? data.message
      : `Request failed: ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}
