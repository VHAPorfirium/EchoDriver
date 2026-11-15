import { SonarPulse } from "./SonarPulse.js";

/** Dispara pulsos de sonar respeitando o tempo de recarga. */
export class SonarEmitter {
  constructor(sonarSettings) {
    this.ringSpeedInPixelsPerSecond = sonarSettings.ringSpeedInPixelsPerSecond;
    this.maximumRadiusInPixels = sonarSettings.maximumRadiusInPixels;
    this.cooldownInSeconds = sonarSettings.cooldownInSeconds;
    this.remainingCooldownInSeconds = 0;
  }

  advance(elapsedSeconds) {
    this.remainingCooldownInSeconds = Math.max(0, this.remainingCooldownInSeconds - elapsedSeconds);
  }

  get isReady() {
    return this.remainingCooldownInSeconds <= 0;
  }

  /** 0 logo depois de disparar, 1 quando está pronto de novo. */
  get readinessRatio() {
    return 1 - this.remainingCooldownInSeconds / this.cooldownInSeconds;
  }

  /** Devolve o pulso novo, ou null se ainda está recarregando. */
  tryEmitPulse(originPosition) {
    if (!this.isReady) {
      return null;
    }
    this.remainingCooldownInSeconds = this.cooldownInSeconds;
    return new SonarPulse(originPosition, this.ringSpeedInPixelsPerSecond, this.maximumRadiusInPixels);
  }
}
