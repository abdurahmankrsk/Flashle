// Audio is completely disabled per user preference
class SoundManager {
  public enabled: boolean = false;
  playClick(): void {}
  playFlip(): void {}
  playVictory(): void {}
  playDefeat(): void {}
}

export const sound = new SoundManager();
