# VibeCast Studio — Audio Player

A single-page audio player built with **TypeScript** and **RE:DOM**, without a UI framework. Users sign up, browse a catalog of tracks, search it, keep a list of favorites, and control playback from a persistent bottom player. The layout adapts from desktop to mobile.

The focus of this project is the frontend ([`audio-player-frontend/`](audio-player-frontend)). The small Express server in [`express-backend/`](express-backend) exists only to provide a working API for authentication, tracks and favorites.

## Features

- **Authentication.** Sign up and log in with a JWT. The token is kept in `localStorage`, protected routes redirect to the login page, and an expired session sends the user back to log in.
- **Track catalog.** A table of tracks with cover, title, artist, album and duration. On desktop the list is paginated (8 tracks per page).
- **Search.** Live filtering by title or artist, on the catalog and on the favorites page.
- **Favorites.** Add or remove a track from the list, from the table or from the player. The UI updates right away (optimistic update) and then syncs with the server.
- **Bottom player.** Play/pause, previous/next track, seeking with a progress bar, 10-second rewind and fast-forward, and volume control. When a track ends, the next one starts.
- **Keyboard shortcuts.** `Space` toggles play/pause, `←` and `→` seek by 10 seconds. Shortcuts are ignored while you type in an input.
- **Profile page.** Username, number of tracks and favorites, and a log-out button.
- **Responsive layout.** Breakpoints at 1180, 1020 and 900 px. On mobile the sidebar becomes tabs, the table becomes cards, and the whole list scrolls smoothly with BetterScroll instead of pages.

> **About playback.** The demo API returns placeholder strings instead of real audio files. To make the player usable anyway, `PlayerController` plays a short synthesized tone through the Web Audio API (the pitch depends on the track) and tracks progress against the track's duration. Everything else (state, controls, progress, auto-advance) works the same as with real audio.

## Tech stack

| Area | Tools |
| --- | --- |
| Language | TypeScript (strict compiler options, no `any`) |
| UI | [RE:DOM](https://redom.js.org/): lightweight DOM helpers, no virtual DOM |
| Build / dev server | [Vite](https://vite.dev/) |
| Mobile scrolling | [@better-scroll/core](https://github.com/ustbhuangyi/better-scroll) |
| Audio | Web Audio API |
| Linting | ESLint + `@typescript-eslint`, file naming rules |
| Demo backend | Node.js, Express, JWT, bcryptjs |

## Frontend architecture

```
audio-player-frontend/src
├── main.ts            # entry point: mounts the App
├── app/
│   ├── App.ts         # root component: rendering, routing, wiring of state and player
│   └── router.ts      # hash router (#/login, #/register, #/tracks, #/favorites, #/profile)
├── pages/             # page components (Tracks, Favorites, Profile, Login, Register)
├── components/        # UI components (Header, Sidebar, TrackList, BottomPlayer, Pagination, ...)
├── controllers/       # app logic: auth, favorites sync, PlayerController
├── services/          # API layer: fetch wrapper with token handling, endpoint calls
├── state/             # app state shape and defaults
├── types/             # shared TypeScript types
├── utils/             # helpers: time formatting, localStorage, track metadata
└── styles/            # CSS split by area (base, layout, tracks, player, auth, responsive)
```

The code is split into layers:

- **Components and pages** are plain functions that take an options object and return an `HTMLElement` built with RE:DOM's `el()`. They hold no state of their own.
- **`App`** owns the state, re-renders the current route when it changes, and passes data and callbacks down to pages.
- **Controllers** contain the logic: `PlayerController` handles playback, timing and next/previous track; `favoritesController` handles optimistic updates and server sync.
- **Services** are the only place that talks to the API. `apiRequest()` adds the `Authorization` header, parses JSON and turns error responses into `Error`s with the server's message.

In development, Vite proxies `/api/*` to `http://localhost:8000` (see [`vite.config.js`](audio-player-frontend/vite.config.js)), so the frontend uses relative URLs and no CORS setup is needed.

## Getting started

### Requirements

- [Node.js](https://nodejs.org/) **22.12 or newer** (the backend loads `.env` with a built-in Node flag, and Vite 8 needs a recent Node)
- npm

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-folder>
```

### 2. Start the backend

```bash
cd express-backend
npm install
cp .env.example .env
```

Open `.env` and set `JWT_SECRET` to any random string. You can generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then start the server:

```bash
npm start
```

The API runs at `http://localhost:8000/api`. Keep this terminal open.

### 3. Start the frontend

In a second terminal, from the repository root:

```bash
cd audio-player-frontend
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`), create an account on the **Sign up** page, and you're in.

### Frontend scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Type-check with `tsc` and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint on `src/` |

`npm run preview` uses the same `/api` proxy, so the backend must be running for it too.

## Demo API

The backend stores users and favorites in `express-backend/data/users.json`. The file is created automatically on the first sign-up and is not committed to git. The track catalog (50 tracks) lives in `express-backend/data/tracks.js`.

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/register` | — | Create a user: `{ "username", "password" }` |
| `POST` | `/api/login` | — | Log in, returns `{ "token" }` |
| `GET` | `/api/tracks` | Bearer token | List all tracks |
| `GET` | `/api/favorites` | Bearer token | List the user's favorite tracks |
| `POST` | `/api/favorites` | Bearer token | Add to favorites: `{ "trackId" }` |
| `DELETE` | `/api/favorites` | Bearer token | Remove from favorites: `{ "trackId" }` |

Tokens expire after 1 hour.
