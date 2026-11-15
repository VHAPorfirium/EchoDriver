import { colorPalette, fontFamily } from "../colorPalette.js";
import { GamePhase } from "../../application/GamePhase.js";

function formatSecondsAsMinutesAndSeconds(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** Telas por cima do jogo: título, pego, sem ar, caverna concluída e final. */
export class ScreenOverlayDrawer {
  constructor(viewportWidthInPixels, viewportHeightInPixels) {
    this.viewportWidthInPixels = viewportWidthInPixels;
    this.viewportHeightInPixels = viewportHeightInPixels;
    this.screenDrawersByGamePhase = {
      [GamePhase.showingTitleScreen]: (context, gameSession, elapsedTimeInSeconds) => this.drawTitleScreen(context, elapsedTimeInSeconds),
      [GamePhase.caughtByCreature]: (context, gameSession, elapsedTimeInSeconds) =>
        this.drawMessageScreen(context, elapsedTimeInSeconds, "SOMETHING FOUND YOU", ["It followed the echo back to you.", "Ping less. Move after you ping."], colorPalette.hudDanger, "retry"),
      [GamePhase.outOfOxygen]: (context, gameSession, elapsedTimeInSeconds) =>
        this.drawMessageScreen(context, elapsedTimeInSeconds, "OUT OF AIR", ["The dark kept you.", "Glowing bubbles refill your oxygen."], colorPalette.hudDanger, "retry"),
      [GamePhase.caveCleared]: (context, gameSession, elapsedTimeInSeconds) =>
        this.drawMessageScreen(
          context,
          elapsedTimeInSeconds,
          `${gameSession.caveLayout.caveName.toUpperCase()} CLEARED`,
          [`Pearls so far: ${gameSession.totalPearlsCollected}/${gameSession.totalPearlsInAllCaves}`, "The next cave goes deeper."],
          colorPalette.sonarCyan,
          "dive deeper",
        ),
      [GamePhase.allCavesCleared]: (context, gameSession, elapsedTimeInSeconds) => this.drawFinalScreen(context, gameSession, elapsedTimeInSeconds),
    };
  }

  draw(context, gameSession, elapsedTimeInSeconds) {
    const drawScreen = this.screenDrawersByGamePhase[gameSession.currentGamePhase];
    if (!drawScreen) {
      return;
    }
    context.fillStyle = "rgba(1, 4, 9, 0.82)";
    context.fillRect(0, 0, this.viewportWidthInPixels, this.viewportHeightInPixels);
    drawScreen(context, gameSession, elapsedTimeInSeconds);
  }

  drawCenteredText(context, text, centerY, fontSizeInPixels, color) {
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = `${fontSizeInPixels}px ${fontFamily}`;
    context.fillStyle = color;
    context.fillText(text, this.viewportWidthInPixels / 2, centerY);
  }

  drawPressToContinue(context, elapsedTimeInSeconds, actionDescription) {
    const blinkAlpha = 0.45 + 0.45 * Math.sin(elapsedTimeInSeconds * 3);
    this.drawCenteredText(context, `Press SPACE or click to ${actionDescription}`, this.viewportHeightInPixels - 70, 16, `rgba(216, 246, 255, ${blinkAlpha})`);
  }

  drawDecorativeSonarRings(context, elapsedTimeInSeconds, centerY) {
    context.save();
    context.globalCompositeOperation = "lighter";
    for (let ringIndex = 0; ringIndex < 3; ringIndex += 1) {
      const ringProgress = (elapsedTimeInSeconds * 0.35 + ringIndex / 3) % 1;
      context.strokeStyle = `rgba(${colorPalette.sonarCyanRgb}, ${0.35 * (1 - ringProgress)})`;
      context.lineWidth = 2;
      context.beginPath();
      context.arc(this.viewportWidthInPixels / 2, centerY, 30 + ringProgress * 360, 0, Math.PI * 2);
      context.stroke();
    }
    context.restore();
  }

  drawTitleScreen(context, elapsedTimeInSeconds) {
    this.drawDecorativeSonarRings(context, elapsedTimeInSeconds, 170);
    this.drawCenteredText(context, "ECHO DIVER", 150, 64, colorPalette.sonarCyan);
    this.drawCenteredText(context, "Your sonar shows the way. It also tells them where you are.", 210, 17, colorPalette.hudText);

    const instructionLines = [
      "WASD / Arrows  swim",
      "SPACE / click  sonar ping",
      "Blind creatures hunt by sound. Reach the surface light.",
      "Glowing bubbles refill your oxygen. Pearls are a bonus.",
    ];
    instructionLines.forEach((instructionLine, lineIndex) => {
      this.drawCenteredText(context, instructionLine, 290 + lineIndex * 28, 16, lineIndex < 2 ? colorPalette.hudText : colorPalette.hudDim);
    });
    this.drawPressToContinue(context, elapsedTimeInSeconds, "dive");
  }

  drawMessageScreen(context, elapsedTimeInSeconds, titleText, detailLines, titleColor, actionDescription) {
    this.drawCenteredText(context, titleText, 200, 42, titleColor);
    detailLines.forEach((detailLine, lineIndex) => {
      this.drawCenteredText(context, detailLine, 260 + lineIndex * 28, 17, colorPalette.hudText);
    });
    this.drawPressToContinue(context, elapsedTimeInSeconds, actionDescription);
  }

  drawFinalScreen(context, gameSession, elapsedTimeInSeconds) {
    this.drawDecorativeSonarRings(context, elapsedTimeInSeconds, 160);
    this.drawCenteredText(context, "YOU REACHED THE SURFACE", 150, 40, `rgb(${colorPalette.surfaceLightRgb})`);
    const resultLines = [
      `Pearls: ${gameSession.totalPearlsCollected}/${gameSession.totalPearlsInAllCaves}`,
      `Time underwater: ${formatSecondsAsMinutesAndSeconds(gameSession.totalSecondsUnderwater)}`,
      `Failed dives: ${gameSession.numberOfFailedDives}`,
    ];
    resultLines.forEach((resultLine, lineIndex) => {
      this.drawCenteredText(context, resultLine, 230 + lineIndex * 30, 18, colorPalette.hudText);
    });
    this.drawCenteredText(context, "Thanks for playing!", 345, 16, colorPalette.hudDim);
    this.drawPressToContinue(context, elapsedTimeInSeconds, "dive again");
  }
}
