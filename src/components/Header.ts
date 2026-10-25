import { el } from 'redom';
import type { RouteName } from '../app/router';

interface HeaderOptions {
  username: string;
  searchQuery: string;
  activeRoute: RouteName;
  onSearch: (value: string) => void;
  onNavigate: (route: RouteName) => void;
  onLogout: () => void;
}

function createMobileTab(
  label: string,
  route: RouteName,
  activeRoute: RouteName,
  onNavigate: (route: RouteName) => void,
): HTMLElement {
  let className = `mobile-tabs__button mobile-tabs__button--${route}`;

  if (route === activeRoute) {
    className += ' mobile-tabs__button--active';
  }

  return el('button', { className, type: 'button', onclick: () => onNavigate(route) }, label);
}

export function createHeader(options: HeaderOptions): HTMLElement {
  const searchInput = el('input.topbar__search-input', {
    type: 'search',
    maxLength: 100,
    placeholder: 'What are you looking for?',
    value: options.searchQuery,
    oninput: (event: Event) => {
      const target = event.target as HTMLInputElement;
      options.onSearch(target.value);
    },
  });

  return el(
    'header.header',
    el(
      'div.header__mobile-top',
      el(
        'button',
        { className: 'logo logo--mobile', type: 'button', onclick: () => options.onNavigate('tracks') },
        el('span.logo__mark'),
        el('span.logo__text', 'VibeCast Studio'),
      ),
      el(
        'button',
        { className: 'user-chip user-chip--mobile', type: 'button', onclick: () => options.onNavigate('profile') },
        el('span.user-chip__avatar'),
        el('span.user-chip__name', options.username),
        el('span.user-chip__arrow', '›'),
      ),
    ),
    el(
      'div.topbar',
      el('label.topbar__search', el('span.topbar__search-icon'), searchInput),
      el(
        'button.user-chip',
        { type: 'button', onclick: () => options.onNavigate('profile') },
        el('span.user-chip__avatar'),
        el('span.user-chip__name', options.username),
        el(
          'span.user-chip__arrow',
          {
            role: 'button',
            title: 'Log out',
            onclick: (event: MouseEvent) => {
              event.stopPropagation();
              options.onLogout();
            },
          },
          '›',
        ),
      ),
    ),
    el(
      'nav.mobile-tabs',
      createMobileTab('Tracks', 'tracks', options.activeRoute, options.onNavigate),
      createMobileTab('Favorites', 'favorites', options.activeRoute, options.onNavigate),
    ),
  );
}
