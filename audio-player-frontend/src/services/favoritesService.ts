import { apiRequest } from './api';
import type { MessageResponse } from '../types/Auth';
import type { Track } from '../types/Track';
import { enrichTracks } from '../utils/trackMetadata';

interface FavoritePayload {
  trackId?: number;
  track_id?: number;
}

export async function getFavorites(): Promise<Track[]> {
  const tracks = await apiRequest<Track[]>('/favorites');

  return enrichTracks(tracks);
}

function requestFavorite(
  method: 'POST' | 'DELETE',
  body: FavoritePayload,
): Promise<MessageResponse> {
  return apiRequest<MessageResponse>('/favorites', {
    method,
    body: JSON.stringify(body),
  });
}

function requestFavoriteByPath(
  method: 'POST' | 'DELETE',
  trackId: number,
): Promise<MessageResponse> {
  return apiRequest<MessageResponse>(`/favorites/${trackId}`, { method });
}

async function requestFavoriteWithFallback(
  method: 'POST' | 'DELETE',
  trackId: number,
): Promise<MessageResponse> {
  try {
    return await requestFavorite(method, { trackId });
  } catch (error) {
    console.warn(error);
  }

  try {
    return await requestFavorite(method, { track_id: trackId });
  } catch (error) {
    console.warn(error);

    return requestFavoriteByPath(method, trackId);
  }
}

export function addFavorite(trackId: number): Promise<MessageResponse> {
  return requestFavoriteWithFallback('POST', trackId);
}

export function removeFavorite(trackId: number): Promise<MessageResponse> {
  return requestFavoriteWithFallback('DELETE', trackId);
}
