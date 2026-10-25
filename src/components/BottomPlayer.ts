import { el } from 'redom';
import type { Track } from '../types/Track';
import { formatTime } from '../utils/formatTime';

interface BottomPlayerOptions {
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  onRewind: (seconds: number) => void;
  onVolume: (volume: number) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  registerProgress: (input: HTMLInputElement, current: HTMLElement, duration: HTMLElement) => void;
}

export function updateRangeFill(input: HTMLInputElement): void {
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const value = Number(input.value || 0);
  const fill = max > min ? ((value - min) / (max - min)) * 100 : 0;

  input.style.setProperty('--range-fill', `${Math.min(Math.max(fill, 0), 100)}%`);
}

function createPlayerCover(track: Track | null): HTMLElement {
  if (track && track.coverUrl) {
    return el(
      'div.player__cover.player__cover--image',
      el('img.player__cover-image', {
        src: track.coverUrl,
        alt: `${track.title} - ${track.artist}`,
      }),
    );
  }

  return el('span.player__cover-placeholder');
}

export function createBottomPlayer(options: BottomPlayerOptions): HTMLElement {
  const hasTrack = Boolean(options.track);
  let playButtonClass = 'button.player__play.player__play--play';
  let playButtonLabel = 'Play';
  let favoriteButtonClass = 'button.player__favorite';

  if (options.isPlaying) {
    playButtonClass = 'button.player__play.player__play--pause';
    playButtonLabel = 'Pause';
  }

  if (options.isFavorite) {
    favoriteButtonClass = 'button.player__favorite.player__favorite--active';
  }
  const progressInput = el('input.player__progress', {
    type: 'range',
    min: '0',
    max: Math.max(options.duration, 1).toString(),
    value: Math.min(options.currentTime, options.duration || 0).toString(),
    step: '1',
    oninput: (event: Event) => {
      const target = event.target as HTMLInputElement;
      updateRangeFill(target);
      options.onSeek(Number(target.value));
    },
  }) as HTMLInputElement;

  const currentTime = el('span.player__time', formatTime(options.currentTime));
  const remainingTime = Math.max(options.duration - options.currentTime, 0);
  const duration = el('span.player__time', formatTime(remainingTime));
  const volumeInput = el('input.player__volume-input', {
    type: 'range',
    min: '0',
    max: '1',
    step: '0.05',
    value: options.volume.toString(),
    oninput: (event: Event) => {
      const target = event.target as HTMLInputElement;
      updateRangeFill(target);
      options.onVolume(Number(target.value));
    },
  }) as HTMLInputElement;

  updateRangeFill(progressInput);
  updateRangeFill(volumeInput);
  options.registerProgress(progressInput, currentTime, duration);

  let title = 'Выберите трек';
  let artist = 'VibeCast Studio';

  if (options.track) {
    title = options.track.title;
    artist = options.track.artist;
  }

  return el(
    hasTrack ? 'footer.player' : 'footer.player.player--empty',
    el(
      'div.player__track',
      createPlayerCover(options.track),
      el(
        'div.player__meta',
        el(
          'span.player__title-row',
          el('span.player__title', title),
          options.track
            ? el(favoriteButtonClass, {
                type: 'button',
                title: options.isFavorite ? 'Убрать из избранного' : 'Добавить в избранное',
                'aria-label': options.isFavorite ? 'Убрать из избранного' : 'Добавить в избранное',
                onclick: options.onToggleFavorite,
              })
            : el('span.player__favorite-placeholder'),
        ),
        hasTrack ? el('span.player__artist', artist) : el('span.player__artist-placeholder'),
      ),
    ),
    el(
      'div.player__controls',
      el(
        'div.player__buttons',
        el('button.player__button.player__button--shuffle', { type: 'button', title: 'Shuffle', 'aria-label': 'Shuffle', onclick: () => options.onRewind(-10) }),
        el('button.player__button.player__button--previous', { type: 'button', title: 'Previous', 'aria-label': 'Previous', onclick: options.onPrevious }),
        el(playButtonClass, {
          type: 'button',
          title: playButtonLabel,
          'aria-label': playButtonLabel,
          disabled: !hasTrack,
          onclick: options.onTogglePlay,
        }),
        el('button.player__button.player__button--next', { type: 'button', title: 'Next', 'aria-label': 'Next', onclick: options.onNext }),
        el('button.player__button.player__button--repeat', { type: 'button', title: 'Repeat', 'aria-label': 'Repeat', onclick: () => options.onRewind(10) }),
      ),
      el('div.player__timeline', currentTime, progressInput, duration),
    ),
    el(
      'label.player__volume',
      el('span.player__volume-icon', { 'aria-hidden': 'true' }),
      volumeInput,
    ),
  );
}
