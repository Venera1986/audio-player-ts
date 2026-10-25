import { el, setChildren } from 'redom';
import BScroll from '@better-scroll/core';
import type { BScrollInstance } from '@better-scroll/core';
import { login, logout, registerAndLogin } from '../controllers/authController';
import {
  addLocalFavorite,
  hasFavorite,
  removeLocalFavorite,
  syncFavorite,
} from '../controllers/favoritesController';
import { PlayerController } from '../controllers/playerController';
import { createBottomPlayer, updateRangeFill } from '../components/BottomPlayer';
import { createHeader } from '../components/Header';
import { createSidebar } from '../components/Sidebar';
import { createFavoritesPage } from '../pages/FavoritesPage';
import { createLoginPage } from '../pages/LoginPage';
import { createProfilePage } from '../pages/ProfilePage';
import { createRegisterPage } from '../pages/RegisterPage';
import { createTracksPage } from '../pages/TracksPage';
import { getFavorites } from '../services/favoritesService';
import { getTracks } from '../services/tracksService';
import { createAppState, PAGE_SIZE, type AppState } from '../state/appState';
import type { AuthCredentials } from '../types/Auth';
import type { Track } from '../types/Track';
import { formatTime } from '../utils/formatTime';
import { getUsername, isAuthorized } from '../utils/storage';
import { getCurrentRoute, navigate, type RouteName } from './router';

export class App {
  public readonly el = el('div.app-shell');

  private readonly state: AppState = createAppState();
  private readonly player = new PlayerController({
    getVisibleTracks: () => this.getVisiblePlaybackTracks(),
    onProgress: () => this.updatePlayerProgress(),
    onTrackEnd: () => {
      void this.playNext();
    },
  });

  private progressInput: HTMLInputElement | null = null;
  private currentTimeLabel: HTMLElement | null = null;
  private durationLabel: HTMLElement | null = null;
  private trackCardsScroll: BScrollInstance | null = null;
  private trackCardsScrollToken = 0;

  constructor() {
    const mobileMedia = window.matchMedia('(max-width: 900px)');

    window.addEventListener('hashchange', () => {
      void this.render();
    });

    window.addEventListener('keydown', (event) => this.handleKeyboard(event));
    mobileMedia.addEventListener('change', (event) => {
      this.state.isMobileView = event.matches;
      this.state.currentPage = 1;
      void this.render();
    });
  }

  public async init(): Promise<void> {
    await this.render();
  }

  private async render(): Promise<void> {
    const route = getCurrentRoute();

    if (!isAuthorized() && route !== 'login' && route !== 'register') {
      navigate('login');
      return;
    }

    if (isAuthorized() && (route === 'login' || route === 'register')) {
      navigate('tracks');
      return;
    }

    if (isAuthorized()) {
      await this.ensureData();
    }

    this.alignPlayerWithRoute(route);

    if (route === 'login') {
      setChildren(this.el, [
        createLoginPage({
          message: this.state.message,
          onSubmit: (credentials) => void this.handleLogin(credentials),
          onRegister: () => navigate('register'),
        }),
      ]);
      this.destroyTrackCardsScroll();
      return;
    }

    if (route === 'register') {
      setChildren(this.el, [
        createRegisterPage({
          message: this.state.message,
          onSubmit: (credentials) => void this.handleRegister(credentials),
          onLogin: () => navigate('login'),
        }),
      ]);
      this.destroyTrackCardsScroll();
      return;
    }

    setChildren(this.el, [this.createProtectedLayout(route)]);
    this.refreshTrackCardsScroll();
  }

  private createProtectedLayout(route: RouteName): HTMLElement {
    const hasPlayer = this.shouldRenderPlayer(route);
    let layoutClass = `layout layout--${route}`;

    if (!hasPlayer) {
      layoutClass += ' layout--without-player';
    }

    return el(
      'div',
      { className: layoutClass },
      createSidebar({
        activeRoute: route,
        onNavigate: navigate,
      }),
      el(
        'div.layout__main',
        createHeader({
          username: getUsername(),
          searchQuery: this.state.searchQuery,
          activeRoute: route,
          onSearch: (value) => void this.handleSearch(value),
          onNavigate: navigate,
          onLogout: () => this.handleLogout(),
        }),
        this.createRoutePage(route),
      ),
      hasPlayer ? this.createPlayer() : el('span.player-placeholder'),
    );
  }

  private createRoutePage(route: RouteName): HTMLElement {
    const filteredTracks = this.getFilteredTracks();
    const totalPages = Math.max(Math.ceil(filteredTracks.length / PAGE_SIZE), 1);
    const currentTrackId = this.player.currentTrack ? this.player.currentTrack.id : null;
    const pageTracks = this.state.isMobileView
      ? filteredTracks
      : filteredTracks.slice(
          (this.state.currentPage - 1) * PAGE_SIZE,
          this.state.currentPage * PAGE_SIZE,
        );
    const favoriteIds = new Set(this.state.favorites.map((track) => track.id));

    if (route === 'favorites') {
      const filteredFavorites = this.state.favorites.filter((track) => this.matchesSearch(track));
      const favoriteTracks = this.state.isMobileView
        ? filteredFavorites
        : filteredFavorites;

      return createFavoritesPage({
        tracks: favoriteTracks,
        favoriteIds,
        currentTrackId,
        onPlay: (track) => void this.playTrack(track),
        onToggleFavorite: (track) => void this.toggleFavoriteFromFavorites(track),
      });
    }

    if (route === 'profile') {
      return createProfilePage({
        username: getUsername(),
        tracksCount: this.state.tracks.length,
        favoritesCount: this.state.favorites.length,
        onLogout: () => this.handleLogout(),
      });
    }

    return createTracksPage({
      tracks: pageTracks,
      favoriteIds: this.state.trackFavoriteIds,
      currentTrackId,
      currentPage: this.state.currentPage,
      totalPages: this.state.isMobileView ? 1 : totalPages,
      onPageChange: (page) => {
        this.state.currentPage = page;
        void this.render();
      },
      onPlay: (track) => void this.playTrack(track),
      onToggleFavorite: (track) => void this.toggleFavoriteFromTracks(track),
    });
  }

  private createPlayer(): HTMLElement {
    return createBottomPlayer({
      track: this.player.currentTrack,
      isPlaying: this.player.isPlaying,
      currentTime: this.player.currentTime,
      duration: this.player.duration,
      volume: this.player.volume,
      onTogglePlay: () => void this.togglePlay(),
      onNext: () => void this.playNext(),
      onPrevious: () => void this.playPrevious(),
      onSeek: (time) => this.player.seek(time),
      onRewind: (seconds) => this.player.rewind(seconds),
      onVolume: (volume) => this.player.setVolume(volume),
      isFavorite: this.player.currentTrack
        ? this.state.trackFavoriteIds.has(this.player.currentTrack.id)
        : false,
      onToggleFavorite: () => {
        if (this.player.currentTrack) {
          void this.toggleFavoriteFromTracks(this.player.currentTrack);
        }
      },
      registerProgress: (input, current, duration) => {
        this.progressInput = input;
        this.currentTimeLabel = current;
        this.durationLabel = duration;
      },
    });
  }

  private destroyTrackCardsScroll(): void {
    this.trackCardsScrollToken += 1;
    this.trackCardsScroll?.destroy();
    this.trackCardsScroll = null;
  }

  private refreshTrackCardsScroll(): void {
    this.destroyTrackCardsScroll();

    if (!this.state.isMobileView) {
      return;
    }

    const wrapper = this.el.querySelector<HTMLElement>('.track-cards-scroll');

    if (!wrapper) {
      return;
    }

    const token = this.trackCardsScrollToken;

    window.requestAnimationFrame(() => {
      if (token !== this.trackCardsScrollToken || !wrapper.isConnected || !this.state.isMobileView) {
        return;
      }

      this.trackCardsScroll = new BScroll(wrapper, {
        scrollY: true,
        scrollX: false,
        click: true,
        bounce: false,
        disableMouse: false,
      });
    });
  }

  private shouldRenderPlayer(route: RouteName): boolean {
    if (route !== 'favorites') {
      return true;
    }

    return this.state.favorites.length > 0;
  }

  private alignPlayerWithRoute(route: RouteName): void {
    if (route !== 'favorites') {
      return;
    }

    const visibleFavorites = this.state.favorites.filter((track) => this.matchesSearch(track));
    const currentTrackId = this.player.currentTrack ? this.player.currentTrack.id : null;
    const currentTrackIsVisibleFavorite = visibleFavorites.some((track) => track.id === currentTrackId);

    if (currentTrackIsVisibleFavorite) {
      return;
    }

    if (visibleFavorites[0]) {
      if (this.player.isPlaying) {
        this.player.pause();
      }

      this.player.selectTrack(visibleFavorites[0]);
      return;
    }

    if (this.player.currentTrack) {
      this.player.stop();
    }
  }

  private async ensureData(): Promise<void> {
    if (this.state.tracks.length > 0) {
      return;
    }

    try {
      const tracks = await getTracks();
      const favorites = await getFavorites();
      this.state.tracks = tracks;
      this.state.favorites = favorites;
      this.state.trackFavoriteIds = new Set(favorites.map((track) => track.id));
    } catch (error) {
      console.error(error);
      logout();
      this.state.message = 'Пожалуйста, войдите снова';
      this.state.tracks = [];
      this.state.favorites = [];
      this.state.trackFavoriteIds = new Set();
      navigate('login');
    }
  }

  private async handleRegister(credentials: AuthCredentials): Promise<void> {
    try {
      await registerAndLogin(credentials);
      this.state.message = '';
      navigate('tracks');
    } catch (error) {
      this.state.message = error instanceof Error
        ? error.message
        : 'Не удалось зарегистрироваться';
      await this.render();
    }
  }

  private async handleLogin(credentials: AuthCredentials): Promise<void> {
    try {
      await login(credentials);
      this.state.message = '';
      navigate('tracks');
    } catch (error) {
      this.state.message = error instanceof Error ? error.message : 'Не удалось войти';
      await this.render();
    }
  }

  private handleLogout(): void {
    logout();
    this.state.tracks = [];
    this.state.favorites = [];
    this.state.trackFavoriteIds = new Set();
    this.player.stop();
    navigate('login');
  }

  private async playTrack(track: Track): Promise<void> {
    try {
      await this.player.play(track);
    } catch (error) {
      console.error(error);
      this.player.pause();
    }

    await this.render();
  }

  private async togglePlay(): Promise<void> {
    try {
      await this.player.toggle();
    } catch (error) {
      console.error(error);
      this.player.pause();
    }

    await this.render();
  }

  private async playNext(): Promise<void> {
    const nextTrack = this.player.getSiblingTrack(1);

    if (nextTrack) {
      await this.playTrack(nextTrack);
    }
  }

  private async playPrevious(): Promise<void> {
    const previousTrack = this.player.getSiblingTrack(-1);

    if (previousTrack) {
      await this.playTrack(previousTrack);
    }
  }

  private async toggleFavoriteFromTracks(track: Track): Promise<void> {
    const isFavorite = this.state.trackFavoriteIds.has(track.id);

    try {
      this.state.favorites = isFavorite
        ? removeLocalFavorite(this.state.favorites, track.id)
        : addLocalFavorite(this.state.favorites, track);
      this.state.trackFavoriteIds = new Set(this.state.favorites.map((favorite) => favorite.id));

      await this.render();
      this.state.favorites = await syncFavorite(track, isFavorite);
      this.state.trackFavoriteIds = new Set(this.state.favorites.map((favorite) => favorite.id));
      await this.render();
    } catch (error) {
      console.error(error);
      await this.render();
    }
  }

  private async toggleFavoriteFromFavorites(track: Track): Promise<void> {
    const isFavorite = hasFavorite(this.state.favorites, track.id);

    try {
      this.state.favorites = isFavorite
        ? removeLocalFavorite(this.state.favorites, track.id)
        : addLocalFavorite(this.state.favorites, track);
      this.state.trackFavoriteIds = new Set(this.state.favorites.map((favorite) => favorite.id));

      await this.render();
      this.state.favorites = await syncFavorite(track, isFavorite);
      this.state.trackFavoriteIds = new Set(this.state.favorites.map((favorite) => favorite.id));
      await this.render();
    } catch (error) {
      console.error(error);
      await this.render();
    }
  }

  private getFilteredTracks(): Track[] {
    return this.state.tracks.filter((track) => this.matchesSearch(track));
  }

  private async handleSearch(value: string): Promise<void> {
    this.state.searchQuery = value.slice(0, 100);
    this.state.currentPage = 1;
    await this.render();

    const searchInput = this.el.querySelector<HTMLInputElement>('.topbar__search-input');

    if (searchInput) {
      searchInput.focus();
      searchInput.setSelectionRange(this.state.searchQuery.length, this.state.searchQuery.length);
    }
  }

  private matchesSearch(track: Track): boolean {
    const query = this.state.searchQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return `${track.title} ${track.artist}`.toLowerCase().includes(query);
  }

  private getVisiblePlaybackTracks(): Track[] {
    const route = getCurrentRoute();

    if (route === 'favorites') {
      return this.state.favorites.filter((track) => this.matchesSearch(track));
    }

    return this.getFilteredTracks();
  }

  private updatePlayerProgress(): void {
    if (this.progressInput) {
      const max = Math.max(this.player.duration, 1);
      const value = Math.min(
        this.player.currentTime,
        this.player.duration,
      );

      this.progressInput.max = max.toString();
      this.progressInput.value = value.toString();
      updateRangeFill(this.progressInput);
    }

    if (this.currentTimeLabel) {
      this.currentTimeLabel.textContent = formatTime(this.player.currentTime);
    }

    if (this.durationLabel) {
      this.durationLabel.textContent = formatTime(
        Math.max(this.player.duration - this.player.currentTime, 0),
      );
    }
  }

  private handleKeyboard(event: KeyboardEvent): void {
    if (event.target instanceof HTMLInputElement) {
      return;
    }

    if (event.key === 'ArrowLeft') {
      this.player.rewind(-10);
    }

    if (event.key === 'ArrowRight') {
      this.player.rewind(10);
    }

    if (event.code === 'Space') {
      event.preventDefault();
      void this.togglePlay();
    }
  }
}
