import { el } from 'redom';
import type { Track } from '../types/Track';
import { formatTime, trackDurationToSeconds } from '../utils/formatTime';

interface TrackListOptions {
  tracks: Track[];
  favoriteIds: Set<number>;
  currentTrackId: number | null;
  onPlay: (track: Track) => void;
  onToggleFavorite: (track: Track) => void;
}

function getCoverClass(track: Track): string {
  return `track-cover track-cover--${(track.id % 5) + 1}`;
}

function createCover(track: Track): HTMLElement {
  if (track.coverUrl) {
    return el(
      'div',
      { className: 'track-cover track-cover--image' },
      el('img.track-cover__image', {
        src: track.coverUrl,
        alt: `${track.title} - ${track.artist}`,
      }),
    );
  }

  return el('div', { className: getCoverClass(track) }, el('span.track-cover__note', '♪'));
}

function createFavoriteButton(
  track: Track,
  isFavorite: boolean,
  onToggleFavorite: (track: Track) => void,
): HTMLElement {
  return el(
    'button',
    {
      className: isFavorite ? 'favorite-button favorite-button--active' : 'favorite-button',
      type: 'button',
      title: isFavorite ? 'Убрать из избранного' : 'Добавить в избранное',
      'aria-label': isFavorite ? 'Убрать из избранного' : 'Добавить в избранное',
      onclick: (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        onToggleFavorite(track);
      },
    },
    isFavorite ? '♥' : '♡',
  );
}

function createMoreButton(): HTMLElement {
  return el(
    'button',
    {
      className: 'track-more',
      type: 'button',
      title: 'Меню трека',
      'aria-label': 'Меню трека',
      onclick: (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
      },
    },
    '•••',
  );
}

function handleTrackKeydown(event: KeyboardEvent, onActivate: () => void): void {
  if (event.key === 'Enter' || event.code === 'Space') {
    event.preventDefault();
    onActivate();
  }
}

function createDesktopRow(
  track: Track,
  index: number,
  options: TrackListOptions,
): HTMLElement {
  const isFavorite = options.favoriteIds.has(track.id);
  const isActive = options.currentTrackId === track.id;
  const album = track.album ? track.album : '-';

  return el(
    'div',
    {
      className: isActive ? 'tracks-table__row tracks-table__row--active' : 'tracks-table__row',
      role: 'button',
      tabIndex: 0,
      onclick: () => options.onPlay(track),
      onkeydown: (event: KeyboardEvent) => handleTrackKeydown(event, () => options.onPlay(track)),
    },
    el('span.tracks-table__number', index.toString()),
    el(
      'span.tracks-table__track',
      createCover(track),
      el(
        'span.tracks-table__track-meta',
        el('span.tracks-table__title', track.title),
        el('span.tracks-table__artist', track.artist),
      ),
    ),
    el('span.tracks-table__album', album),
    el('span.tracks-table__date', `${5 + (track.id % 6)} дней назад`),
    el(
      'span.tracks-table__duration',
      createFavoriteButton(track, isFavorite, options.onToggleFavorite),
      el('span.tracks-table__duration-text', formatTime(trackDurationToSeconds(track.duration))),
    ),
    createMoreButton(),
  );
}

function createMobileCard(track: Track, options: TrackListOptions): HTMLElement {
  const isFavorite = options.favoriteIds.has(track.id);
  const isActive = options.currentTrackId === track.id;

  return el(
    'div',
    {
      className: isActive ? 'track-card track-card--active' : 'track-card',
      role: 'button',
      tabIndex: 0,
      onclick: () => options.onPlay(track),
      onkeydown: (event: KeyboardEvent) => handleTrackKeydown(event, () => options.onPlay(track)),
    },
    createCover(track),
    el(
      'span.track-card__meta',
      el('span.track-card__title', track.title),
      el('span.track-card__artist', track.artist),
    ),
    createFavoriteButton(track, isFavorite, options.onToggleFavorite),
    createMoreButton(),
  );
}

export function createTrackList(options: TrackListOptions): HTMLElement {
  if (options.tracks.length === 0) {
    return el('div.empty-state', 'Треки не найдены');
  }

  return el(
    'section.tracks',
    el(
      'div.tracks-table',
      el(
        'div.tracks-table__head',
        el('span.tracks-table__number-head', { role: 'img', 'aria-label': 'Номер' }),
        el('span', 'Название'),
        el('span', 'Альбом'),
        el('span.tracks-table__head-icon tracks-table__head-icon--calendar', { 'aria-label': 'Дата' }),
        el('span.tracks-table__head-icon tracks-table__head-icon--clock', { 'aria-label': 'Время' }),
        el('span', ''),
      ),
      options.tracks.map((track, index) => createDesktopRow(track, index + 1, options)),
    ),
    el('div.track-cards-scroll', el('div.track-cards', options.tracks.map((track) => createMobileCard(track, options)))),
  );
}
