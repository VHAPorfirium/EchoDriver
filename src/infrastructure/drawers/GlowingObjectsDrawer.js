import { colorPalette } from "../colorPalette.js";
import { CollectibleKind } from "../../domain/Collectible.js";

/**
 * Coisas que brilham sozinhas e por isso aparecem mesmo no escuro:
 * bolhas de oxigênio, pérolas e a luz da superfície na saída.
 */
export class GlowingObjectsDrawer {
  draw(context, gameSession, followingCamera, elapsedTimeInSeconds) {
    context.save();
    context.globalCompositeOperation = "lighter";
    this.drawExitLight(context, gameSession.caveLayout.exitPosition, followingCamera, elapsedTimeInSeconds);
    gameSession.collectibles
      .filter((collectible) => !collectible.isCollected)
      .forEach((collectible, collectibleIndex) => {
        const screenPosition = followingCamera.convertCavePositionToScreenPosition(collectible.position);
        const bobbingOffset = Math.sin(elapsedTimeInSeconds * 2.5 + collectibleIndex) * 3;
        if (collectible.collectibleKind === CollectibleKind.oxygenBubble) {
          this.drawOxygenBubble(context, { x: screenPosition.x, y: screenPosition.y + bobbingOffset }, elapsedTimeInSeconds);
        } else {
          this.drawPearl(context, { x: screenPosition.x, y: screenPosition.y + bobbingOffset }, elapsedTimeInSeconds + collectibleIndex);
        }
      });
    context.restore();
  }

  drawSoftGlow(context, screenPosition, radiusInPixels, colorRgb, alpha) {
    const glowGradient = context.createRadialGradient(screenPosition.x, screenPosition.y, 0, screenPosition.x, screenPosition.y, radiusInPixels);
    glowGradient.addColorStop(0, `rgba(${colorRgb}, ${alpha})`);
    glowGradient.addColorStop(1, `rgba(${colorRgb}, 0)`);
    context.fillStyle = glowGradient;
    context.fillRect(screenPosition.x - radiusInPixels, screenPosition.y - radiusInPixels, radiusInPixels * 2, radiusInPixels * 2);
  }

  drawExitLight(context, exitCavePosition, followingCamera, elapsedTimeInSeconds) {
    const screenPosition = followingCamera.convertCavePositionToScreenPosition(exitCavePosition);
    const pulse = 0.85 + 0.15 * Math.sin(elapsedTimeInSeconds * 1.6);
    this.drawSoftGlow(context, screenPosition, 90 * pulse, colorPalette.surfaceLightRgb, 0.45);
    for (let rayIndex = 0; rayIndex < 4; rayIndex += 1) {
      const rayOffset = Math.sin(elapsedTimeInSeconds * 0.8 + rayIndex * 1.7) * 10;
      context.fillStyle = `rgba(${colorPalette.surfaceLightRgb}, 0.07)`;
      context.beginPath();
      context.moveTo(screenPosition.x - 6 + rayOffset, screenPosition.y - 60);
      context.lineTo(screenPosition.x + 6 + rayOffset, screenPosition.y - 60);
      context.lineTo(screenPosition.x + 18 + rayOffset * 1.5, screenPosition.y + 16);
      context.lineTo(screenPosition.x - 18 + rayOffset * 1.5, screenPosition.y + 16);
      context.fill();
    }
    this.drawSoftGlow(context, screenPosition, 14, "255, 250, 230", 0.9);
  }

  drawOxygenBubble(context, screenPosition, elapsedTimeInSeconds) {
    this.drawSoftGlow(context, screenPosition, 26, colorPalette.oxygenBubbleRgb, 0.35);
    context.strokeStyle = `rgba(${colorPalette.oxygenBubbleRgb}, 0.95)`;
    context.lineWidth = 2;
    context.beginPath();
    context.arc(screenPosition.x, screenPosition.y, 8 + Math.sin(elapsedTimeInSeconds * 4) * 0.8, 0, Math.PI * 2);
    context.stroke();
    context.fillStyle = "rgba(255, 255, 255, 0.8)";
    context.beginPath();
    context.arc(screenPosition.x - 3, screenPosition.y - 3, 2, 0, Math.PI * 2);
    context.fill();
  }

  drawPearl(context, screenPosition, shimmerTimeInSeconds) {
    this.drawSoftGlow(context, screenPosition, 20, colorPalette.pearlRgb, 0.3 + 0.15 * Math.sin(shimmerTimeInSeconds * 3));
    context.fillStyle = `rgba(${colorPalette.pearlRgb}, 0.95)`;
    context.beginPath();
    context.arc(screenPosition.x, screenPosition.y, 5, 0, Math.PI * 2);
    context.fill();
  }
}
