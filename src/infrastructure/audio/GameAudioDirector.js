import { GameEventType } from "../../application/GameEventType.js";
import { GamePhase } from "../../application/GamePhase.js";

const lowOxygenWarningRatio = 0.25;
const secondsBetweenLowOxygenBeeps = 1;

/** Traduz os eventos do jogo em sons. A regra do jogo não sabe que o som existe. */
export class GameAudioDirector {
  constructor(proceduralSoundSynthesizer) {
    this.synthesizer = proceduralSoundSynthesizer;
    this.secondsUntilNextLowOxygenBeep = 0;
    this.soundsByGameEventType = {
      [GameEventType.sonarEmitted]: () => this.playSonarPing(),
      [GameEventType.creatureStartedHunting]: () => this.playCreatureGrowl(),
      [GameEventType.oxygenBubbleCollected]: () => this.playBubbleGulp(),
      [GameEventType.pearlCollected]: () => this.playPearlChime(),
      [GameEventType.diverCaught]: () => this.playCaughtSting(),
      [GameEventType.oxygenRanOut]: () => this.playOutOfAirFade(),
      [GameEventType.caveCleared]: () => this.playSurfaceArpeggio(),
      [GameEventType.divingStarted]: () => this.playBubbleGulp(),
    };
  }

  handleGameEvents(gameEvents) {
    gameEvents.forEach((gameEvent) => this.soundsByGameEventType[gameEvent.gameEventType]?.());
  }

  updateContinuousSounds(gameSession, elapsedSeconds) {
    const isOxygenLow = gameSession.currentGamePhase === GamePhase.diving && gameSession.oxygenTank.remainingOxygenRatio <= lowOxygenWarningRatio;
    if (!isOxygenLow) {
      this.secondsUntilNextLowOxygenBeep = 0;
      return;
    }
    this.secondsUntilNextLowOxygenBeep -= elapsedSeconds;
    if (this.secondsUntilNextLowOxygenBeep <= 0) {
      this.synthesizer.playTone({ waveType: "square", startFrequencyInHertz: 880, endFrequencyInHertz: 860, durationInSeconds: 0.08, peakVolume: 0.05 });
      this.secondsUntilNextLowOxygenBeep = secondsBetweenLowOxygenBeeps;
    }
  }

  playSonarPing() {
    this.synthesizer.playTone({ waveType: "sine", startFrequencyInHertz: 1500, endFrequencyInHertz: 980, durationInSeconds: 0.5, peakVolume: 0.32, sendToEcho: true });
  }

  playCreatureGrowl() {
    this.synthesizer.playTone({ waveType: "sawtooth", startFrequencyInHertz: 95, endFrequencyInHertz: 48, durationInSeconds: 0.9, peakVolume: 0.16, startDelayInSeconds: 0.25, sendToEcho: true });
    this.synthesizer.playTone({ waveType: "square", startFrequencyInHertz: 63, endFrequencyInHertz: 41, durationInSeconds: 0.9, peakVolume: 0.06, startDelayInSeconds: 0.27 });
  }

  playBubbleGulp() {
    this.synthesizer.playTone({ waveType: "sine", startFrequencyInHertz: 300, endFrequencyInHertz: 900, durationInSeconds: 0.15, peakVolume: 0.25 });
    this.synthesizer.playTone({ waveType: "sine", startFrequencyInHertz: 420, endFrequencyInHertz: 1100, durationInSeconds: 0.12, peakVolume: 0.18, startDelayInSeconds: 0.09 });
  }

  playPearlChime() {
    this.synthesizer.playTone({ waveType: "triangle", startFrequencyInHertz: 1318, endFrequencyInHertz: 1310, durationInSeconds: 0.4, peakVolume: 0.2, sendToEcho: true });
    this.synthesizer.playTone({ waveType: "triangle", startFrequencyInHertz: 1975, endFrequencyInHertz: 1970, durationInSeconds: 0.5, peakVolume: 0.16, startDelayInSeconds: 0.1, sendToEcho: true });
  }

  playCaughtSting() {
    this.synthesizer.playFilteredNoise({ durationInSeconds: 0.8, peakVolume: 0.5, filterFrequencyInHertz: 900 });
    this.synthesizer.playTone({ waveType: "sawtooth", startFrequencyInHertz: 220, endFrequencyInHertz: 40, durationInSeconds: 1.1, peakVolume: 0.25 });
  }

  playOutOfAirFade() {
    this.synthesizer.playTone({ waveType: "sine", startFrequencyInHertz: 440, endFrequencyInHertz: 110, durationInSeconds: 1.6, peakVolume: 0.25, sendToEcho: true });
  }

  playSurfaceArpeggio() {
    [523, 659, 784, 1046].forEach((frequencyInHertz, noteIndex) => {
      this.synthesizer.playTone({
        waveType: "triangle",
        startFrequencyInHertz: frequencyInHertz,
        endFrequencyInHertz: frequencyInHertz,
        durationInSeconds: 0.5,
        peakVolume: 0.18,
        startDelayInSeconds: noteIndex * 0.12,
        sendToEcho: true,
      });
    });
  }
}
