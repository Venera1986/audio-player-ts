import { el } from 'redom';
import type { RouteName } from '../app/router';
import favoritesTextUrl from '../assets/icons/sidebar-favorites-text.svg';
import tracksTextUrl from '../assets/icons/sidebar-tracks-text.svg';

interface SidebarOptions {
  activeRoute: RouteName;
  onNavigate: (route: RouteName) => void;
}

type SidebarRoute = 'favorites' | 'tracks';

const sidebarTextByRoute: { favorites: string; tracks: string } = {
  favorites: favoritesTextUrl,
  tracks: tracksTextUrl,
};

function createNavButton(
  label: string,
  route: SidebarRoute,
  activeRoute: RouteName,
  onNavigate: (route: RouteName) => void,
): HTMLElement {
  const className = route === activeRoute
    ? `sidebar__link sidebar__link--${route} sidebar__link--active`
    : `sidebar__link sidebar__link--${route}`;

  return el(
    'button',
    {
      className,
      type: 'button',
      onclick: () => onNavigate(route),
    },
    el('span.sidebar__icon', { 'aria-hidden': 'true' }),
    el('span.sidebar__text', el('img.sidebar__text-image', { src: sidebarTextByRoute[route], alt: label })),
  );
}

export function createSidebar(options: SidebarOptions): HTMLElement {
  return el(
    'aside.sidebar',
    el(
      'button.logo',
      { type: 'button', onclick: () => options.onNavigate('tracks') },
      el('span.logo__mark'),
      el('span.logo__text', 'VibeCast Studio'),
    ),
    el(
      'nav.sidebar__nav',
      createNavButton('Избранное', 'favorites', options.activeRoute, options.onNavigate),
      createNavButton('Аудиокомпозиции', 'tracks', options.activeRoute, options.onNavigate),
    ),
  );
}
