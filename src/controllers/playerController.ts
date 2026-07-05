import type { Track } from '../types/Track';
import { trackDurationToSeconds } from '../utils/formatTime';

interface PlayerControllerOptions {
  getVisibleTracks: () => Track[];
  onProgress: () => void;
  onTrackEnd: () => void;
}

export class PlayerController {
  public currentTrack: Track | null = null;
  public isPlaying = false;
  public volume = 0.75;
  public currentTime = 0;
  public duration = 0;

  private timerId: number | null = null;
  private audioContext: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private readonly getVisibleTracks: () => Track[];
  private readonly onProgress: () => void;
  private readonly onTrackEnd: () => void;

  constructor(options: PlayerControllerOptions) {
    this.getVisibleTracks = options.getVisibleTracks;
    this.onProgress = options.onProgress;
    this.onTrackEnd = options.onTrackEnd;
  }

  public selectTrack(track: Track): void {
    if (this.currentTrack && this.currentTrack.id === track.id) {
      return;
    }

    this.currentTrack = track;
    this.currentTime = 0;
    this.duration = trackDurationToSeconds(track.duration);
  }

  public async play(track?: Track): Promise<void> {
    if (track) {
      this.selectTrack(track);
    }

    if (!this.currentTrack) {
      const firstTrack = this.getVisibleTracks()[0];
      if (!firstTrack) {
        return;
      }

      this.selectTrack(firstTrack);
    }

    await this.startSynth();
    this.startTimer();
    this.isPlaying = true;
  }

  public pause(): void {
    this.stopTimer();
    this.stopSynth();
    this.isPlaying = false;
  }

  public stop(): void {
    this.pause();
    this.currentTrack = null;
    this.currentTime = 0;
    this.duration = 0;
    this.onProgress();
  }

  public toggle(): Promise<void> | void {
    if (this.isPlaying) {
      this.pause();
      return;
    }

    return this.play();
  }

  public getSiblingTrack(direction: 1 | -1): Track | null {
    const tracks = this.getVisibleTracks();

    if (tracks.length === 0) {
      return null;
    }

    if (!this.currentTrack) {
      return tracks[0];
    }

    const currentTrackId = this.currentTrack.id;
    const currentIndex = tracks.findIndex((track) => track.id === currentTrackId);
    const nextIndex = currentIndex === -1
      ? 0
      : (currentIndex + direction + tracks.length) % tracks.length;

    const nextTrack = tracks[nextIndex];

    if (!nextTrack) {
      return null;
    }

    return nextTrack;
  }

  public seek(time: number): void {
    if (!this.currentTrack) {
      return;
    }

    this.currentTime = Math.min(Math.max(time, 0), this.duration || time);
    this.onProgress();
  }

  public rewind(seconds: number): void {
    this.seek(this.currentTime + seconds);
  }

  public setVolume(volume: number): void {
    this.volume = volume;

    if (this.gainNode) {
      this.gainNode.gain.value = this.volume * 0.08;
    }
  }

  private startTimer(): void {
    if (this.timerId !== null) {
      return;
    }

    let previousTime = performance.now();

    this.timerId = window.setInterval(() => {
      const nextTime = performance.now();
      const delta = (nextTime - previousTime) / 1000;
      previousTime = nextTime;

      this.currentTime = Math.min(this.currentTime + delta, this.duration);

      if (this.currentTime >= this.duration) {
        this.pause();
        this.onTrackEnd();
      }

      this.onProgress();
    }, 250);
  }

  private stopTimer(): void {
    if (this.timerId === null) {
      return;
    }

    window.clearInterval(this.timerId);
    this.timerId = null;
  }

  private async startSynth(): Promise<void> {
    if (!this.currentTrack) {
      return;
    }

    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.stopSynth();

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 180 + (this.currentTrack.id % 9) * 35;
    gainNode.gain.value = this.volume * 0.08;

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    oscillator.start();

    this.oscillator = oscillator;
    this.gainNode = gainNode;
  }

  private stopSynth(): void {
    if (!this.oscillator) {
      return;
    }

    this.oscillator.stop();
    this.oscillator.disconnect();
    if (this.gainNode) {
      this.gainNode.disconnect();
    }
    this.oscillator = null;
    this.gainNode = null;
  }
}
