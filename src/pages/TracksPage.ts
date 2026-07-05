import { el } from 'redom';
// import { createPagination } from '../components/Pagination';
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
    el('h1.content__title', 'Аудиофайлы и треки'),
    createTrackList(options),
    // Pagination is hidden because it is absent in the Figma layout.
    // Keep this block for a quick rollback if the curator asks to restore it.
    // createPagination({
    //   currentPage: options.currentPage,
    //   totalPages: options.totalPages,
    //   onPageChange: options.onPageChange,
    // }),
  );
}
