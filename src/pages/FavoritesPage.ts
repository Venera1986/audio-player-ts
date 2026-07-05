import { el } from 'redom';
import { createTrackList } from '../components/TrackList';
import type { Track } from '../types/Track';

interface FavoritesPageOptions {
  tracks: Track[];
  favoriteIds: Set<number>;
  currentTrackId: number | null;
  onPlay: (track: Track) => void;
  onToggleFavorite: (track: Track) => void;
}

export function createFavoritesPage(options: FavoritesPageOptions): HTMLElement {
  return el(
    'main.content',
    el('h1.content__title', 'Избранное'),
    createTrackList({
      tracks: options.tracks,
      favoriteIds: options.favoriteIds,
      currentTrackId: options.currentTrackId,
      onPlay: options.onPlay,
      onToggleFavorite: options.onToggleFavorite,
    }),
  );
}
