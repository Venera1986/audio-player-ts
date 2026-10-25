import { el } from 'redom';
import { createPagination } from '../components/Pagination';
import { createTrackList } from '../components/TrackList';
import type { Track } from '../types/Track';

interface TracksPageOptions {
  tracks: Track[];
  favoriteIds: Set<number>;
  currentTrackId: number | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPlay: (track: Track) => void;
  onToggleFavorite: (track: Track) => void;
}

export function createTracksPage(options: TracksPageOptions): HTMLElement {
  return el(
    'main.content',
    el('h1.content__title', 'Audio Files & Tracks'),
    createTrackList(options),
    createPagination({
      currentPage: options.currentPage,
      totalPages: options.totalPages,
      onPageChange: options.onPageChange,
    }),
  );
}
