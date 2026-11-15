import { GameConfiguration } from "./domain/GameConfiguration.js";
import { caveBlueprints } from "./domain/caveBlueprints.js";
import { GameSession } from "./application/GameSession.js";
import { KeyboardInputReader } from "./infrastructure/KeyboardInputReader.js";
import { CanvasClickInput } from "./infrastructure/CanvasClickInput.js";
import { CanvasGameRenderer } from "./infrastructure/CanvasGameRenderer.js";
import { ProceduralSoundSynthesizer } from "./infrastructure/audio/ProceduralSoundSynthesizer.js";
import { GameAudioDirector } from "./infrastructure/audio/GameAudioDirector.js";

const maximumElapsedSecondsPerFrame = 0.05;

async function startGame() {
  await document.fonts.ready;

  const canvasElement = document.getElementById("game-canvas");
  const gameSession = new GameSession(GameConfiguration, caveBlueprints);
  const keyboardInputReader = new KeyboardInputReader(window);
  const canvasClickInput = new CanvasClickInput(canvasElement);
  const canvasGameRenderer = new CanvasGameRenderer(canvasElement, GameConfiguration);
  const proceduralSoundSynthesizer = new ProceduralSoundSynthesizer();
  const gameAudioDirector = new GameAudioDirector(proceduralSoundSynthesizer);

  document.addEventListener("visibilitychange", () => proceduralSoundSynthesizer.suspendWhileHidden(document.hidden));

  let previousFrameTimestampInMilliseconds = performance.now();

  function runGameLoopFrame(currentFrameTimestampInMilliseconds) {
    const elapsedSecondsSinceLastFrame = Math.min(
      maximumElapsedSecondsPerFrame,
      (currentFrameTimestampInMilliseconds - previousFrameTimestampInMilliseconds) / 1000,
    );
    previousFrameTimestampInMilliseconds = currentFrameTimestampInMilliseconds;

    const playerInputState = canvasClickInput.combineWithKeyboardInput(keyboardInputReader.readPlayerInputState());
    if (playerInputState.wasActionKeyJustPressed || playerInputState.wasSoundToggleKeyJustPressed) {
      proceduralSoundSynthesizer.startOnFirstUserGesture();
    }
    if (playerInputState.wasSoundToggleKeyJustPressed) {
      proceduralSoundSynthesizer.toggleSound();
    }

    gameSession.update(playerInputState, elapsedSecondsSinceLastFrame);
    gameAudioDirector.handleGameEvents(gameSession.drainGameEvents());
    gameAudioDirector.updateContinuousSounds(gameSession, elapsedSecondsSinceLastFrame);
    canvasGameRenderer.render(gameSession, proceduralSoundSynthesizer.isSoundEnabled, currentFrameTimestampInMilliseconds / 1000);

    requestAnimationFrame(runGameLoopFrame);
  }

  requestAnimationFrame(runGameLoopFrame);
}

startGame();
