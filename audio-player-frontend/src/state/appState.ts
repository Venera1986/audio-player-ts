import type { Track } from '../types/Track';

export const PAGE_SIZE = 8;

export interface AppState {
  tracks: Track[];
  favorites: Track[];
  trackFavoriteIds: Set<number>;
  currentTrack: Track | null;
  currentPage: number;
  searchQuery: string;
  message: string;
  isMobileView: boolean;
}

export function createAppState(): AppState {
  return {
    tracks: [],
    favorites: [],
    trackFavoriteIds: new Set(),
    currentTrack: null,
    currentPage: 1,
    searchQuery: '',
    message: '',
    isMobileView: window.matchMedia('(max-width: 900px)').matches,
  };
}
