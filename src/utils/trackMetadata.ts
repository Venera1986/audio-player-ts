import type { Track } from '../types/Track';

interface TrackMetadata {
  title: string;
  artist: string;
  album?: string;
  coverUrl?: string;
}

const TRACK_METADATA: { [id: number]: TrackMetadata } = {
  1: {
    title: 'In Bloom',
    artist: 'Nirvana',
    album: 'Nirvana',
    coverUrl: '/images/covers/nirvana-in-bloom.png',
  },
  2: {
    title: "Gangsta's Paradise",
    artist: 'Coolio, L.V.',
    album: "Gangsta's Paradise",
    coverUrl: '/images/covers/coolio-gangstas-paradise.png',
  },
  3: {
    title: 'Разговоры о животных',
    artist: 'Подкаст-студия Константина Петрова',
    coverUrl: '/images/covers/podcast-animals.png',
  },
  4: {
    title: 'Animal I Have Become',
    artist: 'Three Days Grace',
    album: 'One-X',
    coverUrl: '/images/covers/three-days-grace-one-x.png',
  },
  5: {
    title: 'Comic news',
    artist: 'Команда КВН Плохие новости',
    coverUrl: '/images/covers/comic-news.png',
  },
  6: {
    title: 'To The Skies From A Hillside',
    artist: 'Maybeshewill',
    album: 'To The Skies From A Hillside',
    coverUrl: '/images/covers/maybeshewill-skies-hillside.png',
  },
  7: {
    title: 'Co-Conspirators',
    artist: 'Maybeshewill',
    album: 'Sing The Word Hope In Four-Part Harmony',
    coverUrl: '/images/covers/maybeshewill-co-conspirators.png',
  },
  8: {
    title: 'Surrounded By Spies',
    artist: 'Placebo',
    album: 'Surrounded By Spies',
    coverUrl: '/images/covers/placebo-surrounded-by-spies.png',
  },
};

export function enrichTrack(track: Track): Track {
  const metadata = TRACK_METADATA[track.id];

  if (!metadata) {
    const album = track.album ? track.album : track.title;

    return {
      ...track,
      album,
    };
  }

  return {
    ...track,
    ...metadata,
  };
}

export function enrichTracks(tracks: Track[]): Track[] {
  return tracks.map(enrichTrack);
}
