import { colorPalette } from "../colorPalette.js";

/** O mergulhador visto de cima: corpo amarelo, visor e pés de pato batendo. Solta bolhas ao nadar. */
export class DiverDrawer {
  draw(context, diver, followingCamera, elapsedTimeInSeconds) {
    const screenPosition = followingCamera.convertCavePositionToScreenPosition(diver.position);
    const facingAngle = Math.atan2(diver.facingDirection.y, diver.facingDirection.x);
    const finKickAngle = diver.isSwimming ? Math.sin(elapsedTimeInSeconds * 14) * 0.45 : Math.sin(elapsedTimeInSeconds * 2) * 0.1;

    this.drawRisingBubbles(context, screenPosition, elapsedTimeInSeconds);

    context.save();
    context.translate(screenPosition.x, screenPosition.y);
    context.rotate(facingAngle);

    context.fillStyle = "#1d3b4a";
    [-1, 1].forEach((sideSign) => {
      context.save();
      context.translate(-10, sideSign * 4);
      context.rotate(sideSign * finKickAngle);
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(-12, sideSign * 2 - 3);
      context.lineTo(-12, sideSign * 2 + 3);
      context.closePath();
      context.fill();
      context.restore();
    });

    context.fillStyle = colorPalette.diverSuit;
    context.beginPath();
    context.ellipse(0, 0, 11, 7, 0, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#8a6a1f";
    context.fillRect(-7, -9, 9, 4);

    context.fillStyle = colorPalette.diverVisor;
    context.beginPath();
    context.arc(7, 0, 4, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  /** Bolhas calculadas a partir do tempo: não precisa guardar estado. */
  drawRisingBubbles(context, screenPosition, elapsedTimeInSeconds) {
    const numberOfBubbles = 4;
    const bubbleLifetimeInSeconds = 1.6;
    for (let bubbleIndex = 0; bubbleIndex < numberOfBubbles; bubbleIndex += 1) {
      const bubbleAge = (elapsedTimeInSeconds + bubbleIndex * (bubbleLifetimeInSeconds / numberOfBubbles)) % bubbleLifetimeInSeconds;
      const lifeRatio = bubbleAge / bubbleLifetimeInSeconds;
      const bubbleX = screenPosition.x + Math.sin(bubbleAge * 6 + bubbleIndex) * 3;
      const bubbleY = screenPosition.y - 6 - lifeRatio * 26;
      context.strokeStyle = `rgba(${colorPalette.oxygenBubbleRgb}, ${0.5 * (1 - lifeRatio)})`;
      context.lineWidth = 1;
      context.beginPath();
      context.arc(bubbleX, bubbleY, 1.5 + lifeRatio * 1.5, 0, Math.PI * 2);
      context.stroke();
    }
  }
}
