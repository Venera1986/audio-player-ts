import { el } from 'redom';
import { createProfileCard } from '../components/ProfileCard';

interface ProfilePageOptions {
  username: string;
  tracksCount: number;
  favoritesCount: number;
  onLogout: () => void;
}

export function createProfilePage(options: ProfilePageOptions): HTMLElement {
  return el(
    'main',
    { className: 'content content--profile' },
    createProfileCard(options),
  );
}
