export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const minutes = Math.floor(seconds / 60);
  const restSeconds = Math.floor(seconds % 60);

  return `${minutes}:${restSeconds.toString().padStart(2, '0')}`;
}

export function trackDurationToSeconds(duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0) {
    return 0;
  }

  const minutes = Math.trunc(duration);
  const secondsPart = Math.round((duration - minutes) * 100);
  const seconds = Math.min(secondsPart, 59);

  return minutes * 60 + seconds;
}
