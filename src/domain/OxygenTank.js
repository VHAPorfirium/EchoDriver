/** Oxigênio medido em segundos de mergulho. Acabou, acabou a partida. */
export class OxygenTank {
  constructor(maximumOxygenInSeconds) {
    this.maximumOxygenInSeconds = maximumOxygenInSeconds;
    this.remainingOxygenInSeconds = maximumOxygenInSeconds;
  }

  consume(elapsedSeconds) {
    this.remainingOxygenInSeconds = Math.max(0, this.remainingOxygenInSeconds - elapsedSeconds);
  }

  refill(oxygenToAddInSeconds) {
    this.remainingOxygenInSeconds = Math.min(this.maximumOxygenInSeconds, this.remainingOxygenInSeconds + oxygenToAddInSeconds);
  }

  get remainingOxygenRatio() {
    return this.remainingOxygenInSeconds / this.maximumOxygenInSeconds;
  }

  get isEmpty() {
    return this.remainingOxygenInSeconds <= 0;
  }
}
