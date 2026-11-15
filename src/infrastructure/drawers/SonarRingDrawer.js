import { colorPalette } from "../colorPalette.js";

/** Os anéis do sonar, desenhados por cima da escuridão. */
export class SonarRingDrawer {
  draw(context, activeSonarPulses, followingCamera) {
    context.save();
    context.globalCompositeOperation = "lighter";
    activeSonarPulses.forEach((sonarPulse) => {
      const screenPosition = followingCamera.convertCavePositionToScreenPosition(sonarPulse.originPosition);
      const ringStrength = sonarPulse.remainingStrengthRatio;
      context.strokeStyle = `rgba(${colorPalette.sonarCyanRgb}, ${0.75 * ringStrength})`;
      context.lineWidth = 3;
      context.beginPath();
      context.arc(screenPosition.x, screenPosition.y, sonarPulse.currentRadiusInPixels, 0, Math.PI * 2);
      context.stroke();

      context.strokeStyle = `rgba(${colorPalette.sonarCyanRgb}, ${0.25 * ringStrength})`;
      context.lineWidth = 10;
      context.beginPath();
      context.arc(screenPosition.x, screenPosition.y, Math.max(0, sonarPulse.currentRadiusInPixels - 8), 0, Math.PI * 2);
      context.stroke();
    });
    context.restore();
  }
}
