import type { Track } from '../types/Track';

export function getTrackAudioSrc(track: Track): string {
  return `data:audio/mpeg;base64,${track.encoded_audio}`;
}
