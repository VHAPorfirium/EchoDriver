import { colorPalette, fontFamily } from "../colorPalette.js";
import { GamePhase } from "../../application/GamePhase.js";

const lowOxygenWarningRatio = 0.25;
const secondsToShowTheFirstCaveHint = 7;

/** Painel do mergulho: caverna, oxigênio, sonar, pérolas, dica inicial e indicador de som. */
export class HudDrawer {
  constructor(viewportWidthInPixels, viewportHeightInPixels) {
    this.viewportWidthInPixels = viewportWidthInPixels;
    this.viewportHeightInPixels = viewportHeightInPixels;
  }

  draw(context, gameSession, isSoundEnabled, elapsedTimeInSeconds) {
    this.drawSoundIndicator(context, isSoundEnabled);
    if (gameSession.currentGamePhase !== GamePhase.diving) {
      return;
    }
    const panelTopY = this.viewportHeightInPixels - 104;
    context.fillStyle = colorPalette.hudPanel;
    context.fillRect(12, panelTopY, 260, 92);

    context.textAlign = "left";
    context.textBaseline = "top";
    context.font = `15px ${fontFamily}`;
    context.fillStyle = colorPalette.hudText;
    context.fillText(`CAVE ${gameSession.currentCaveIndex + 1}/${gameSession.caveBlueprints.length}  ${gameSession.caveLayout.caveName.toUpperCase()}`, 22, panelTopY + 8);

    const oxygenRatio = gameSession.oxygenTank.remainingOxygenRatio;
    const isOxygenLow = oxygenRatio <= lowOxygenWarningRatio;
    const isWarningBlinkOn = Math.floor(elapsedTimeInSeconds * 4) % 2 === 0;
    const oxygenBarColor = isOxygenLow && isWarningBlinkOn ? colorPalette.hudDanger : colorPalette.sonarCyan;
    this.drawLabeledBar(context, "O2", 22, panelTopY + 32, oxygenRatio, oxygenBarColor);
    this.drawLabeledBar(context, "SONAR", 22, panelTopY + 52, gameSession.sonarEmitter.readinessRatio, gameSession.sonarEmitter.isReady ? colorPalette.hudText : colorPalette.hudDim);

    context.font = `14px ${fontFamily}`;
    context.fillStyle = `rgb(${colorPalette.pearlRgb})`;
    context.fillText(`PEARLS ${gameSession.totalPearlsCollected}/${gameSession.totalPearlsInAllCaves}`, 22, panelTopY + 72);

    if (gameSession.currentCaveIndex === 0 && gameSession.elapsedDivingTimeInSeconds < secondsToShowTheFirstCaveHint) {
      this.drawFirstCaveHint(context, gameSession.elapsedDivingTimeInSeconds);
    }
    if (isOxygenLow) {
      context.textAlign = "center";
      context.font = `16px ${fontFamily}`;
      context.fillStyle = isWarningBlinkOn ? colorPalette.hudDanger : "rgba(255, 90, 110, 0.4)";
      context.fillText("LOW OXYGEN", this.viewportWidthInPixels / 2, 24);
    }
  }

  drawLabeledBar(context, label, leftX, topY, fillRatio, barColor) {
    const barLeftX = leftX + 58;
    const barWidth = 170;
    context.font = `13px ${fontFamily}`;
    context.fillStyle = colorPalette.hudDim;
    context.fillText(label, leftX, topY);
    context.strokeStyle = colorPalette.hudDim;
    context.lineWidth = 1;
    context.strokeRect(barLeftX + 0.5, topY + 2.5, barWidth, 9);
    context.fillStyle = barColor;
    context.fillRect(barLeftX + 2, topY + 4, Math.max(0, (barWidth - 3) * fillRatio), 6);
  }

  drawFirstCaveHint(context, secondsSinceDiveStarted) {
    const fadeAlpha = Math.min(1, (secondsToShowTheFirstCaveHint - secondsSinceDiveStarted) / 1.5);
    context.textAlign = "center";
    context.font = `17px ${fontFamily}`;
    context.fillStyle = `rgba(216, 246, 255, ${fadeAlpha})`;
    context.fillText("[SPACE] sonar ping: it shows you the cave...", this.viewportWidthInPixels / 2, 24);
    context.fillStyle = `rgba(255, 90, 110, ${fadeAlpha})`;
    context.fillText("...and tells them where you are.", this.viewportWidthInPixels / 2, 48);
  }

  drawSoundIndicator(context, isSoundEnabled) {
    context.textAlign = "right";
    context.textBaseline = "bottom";
    context.font = `13px ${fontFamily}`;
    context.fillStyle = colorPalette.hudDim;
    context.fillText(isSoundEnabled ? "Sound on [M]" : "Sound off [M]", this.viewportWidthInPixels - 12, this.viewportHeightInPixels - 10);
  }
}
