import { addFavorite, getFavorites, removeFavorite } from '../services/favoritesService';
import type { Track } from '../types/Track';

export function hasFavorite(favorites: Track[], trackId: number): boolean {
  return favorites.some((favorite) => favorite.id === trackId);
}

export function addLocalFavorite(favorites: Track[], track: Track): Track[] {
  return hasFavorite(favorites, track.id) ? favorites : [...favorites, track];
}

export function removeLocalFavorite(favorites: Track[], trackId: number): Track[] {
  return favorites.filter((favorite) => favorite.id !== trackId);
}

export async function syncFavorite(
  track: Track,
  isFavorite: boolean,
): Promise<Track[]> {
  if (isFavorite) {
    await removeFavorite(track.id);
    return getFavorites();
  }

  await addFavorite(track.id);
  const serverFavorites = await getFavorites();

  return addLocalFavorite(serverFavorites, track);
}
