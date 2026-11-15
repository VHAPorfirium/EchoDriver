/** Um anel de sonar que cresce a partir de onde foi disparado até o raio máximo. */
export class SonarPulse {
  constructor(originPosition, ringSpeedInPixelsPerSecond, maximumRadiusInPixels) {
    this.originPosition = { ...originPosition };
    this.ringSpeedInPixelsPerSecond = ringSpeedInPixelsPerSecond;
    this.maximumRadiusInPixels = maximumRadiusInPixels;
    this.secondsSinceEmitted = 0;
  }

  advance(elapsedSeconds) {
    this.secondsSinceEmitted += elapsedSeconds;
  }

  get currentRadiusInPixels() {
    return Math.min(this.maximumRadiusInPixels, this.secondsSinceEmitted * this.ringSpeedInPixelsPerSecond);
  }

  get isFinished() {
    return this.secondsSinceEmitted * this.ringSpeedInPixelsPerSecond >= this.maximumRadiusInPixels;
  }

  /** 1 logo no disparo, 0 no raio máximo. Usado para o anel ir sumindo. */
  get remainingStrengthRatio() {
    return 1 - this.currentRadiusInPixels / this.maximumRadiusInPixels;
  }
}
