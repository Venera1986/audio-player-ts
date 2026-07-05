export interface Track {
  id: number;
  title: string;
  artist: string;
  album?: string;
  coverUrl?: string;
  duration: number;
  size_mb: number;
  encoded_audio: string;
}
