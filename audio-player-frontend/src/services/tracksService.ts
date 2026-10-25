import { apiRequest } from './api';
import type { Track } from '../types/Track';
import { enrichTracks } from '../utils/trackMetadata';

export async function getTracks(): Promise<Track[]> {
  const tracks = await apiRequest<Track[]>('/tracks');

  return enrichTracks(tracks);
}
