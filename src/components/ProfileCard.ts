import { el } from 'redom';

interface ProfileCardOptions {
  username: string;
  favoritesCount: number;
  tracksCount: number;
  onLogout: () => void;
}

export function createProfileCard(options: ProfileCardOptions): HTMLElement {
  return el(
    'section.profile-card',
    el('div.profile-card__avatar'),
    el('div.profile-card__body', el('h1.profile-card__name', options.username), el('p.profile-card__text', 'Профиль слушателя VibeCast Studio')),
    el('div.profile-card__stats', el('span.profile-card__stat', `${options.tracksCount} треков`), el('span.profile-card__stat', `${options.favoritesCount} в избранном`)),
    el('button.profile-card__logout', { type: 'button', onclick: options.onLogout }, 'Выйти'),
  );
}
