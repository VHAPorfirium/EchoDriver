import { colorPalette } from "../colorPalette.js";
import { clampNumber } from "../../domain/geometry.js";

/**
 * Criaturas:
 * - drawBodies: corpo escuro com tentáculos, visível só dentro da luz do mergulhador;
 * - drawSonarSilhouettes: silhueta vermelha quando o anel passa por elas (por cima da escuridão);
 * - drawHuntingEyes: olhos fracos de quem está caçando, para o jogador sentir que algo vem.
 */
export class CreatureDrawer {
  drawBodies(context, creatures, followingCamera, elapsedTimeInSeconds) {
    creatures.forEach((creature, creatureIndex) => {
      const screenPosition = followingCamera.convertCavePositionToScreenPosition(creature.position);
      this.drawCreatureShape(context, screenPosition, elapsedTimeInSeconds + creatureIndex, "rgb(28, 8, 14)", "rgba(255, 60, 80, 0.9)");
    });
  }

  drawSonarSilhouettes(context, creatures, followingCamera, currentTimeInSeconds, fadeOutInSeconds, elapsedTimeInSeconds) {
    context.save();
    context.globalCompositeOperation = "lighter";
    creatures.forEach((creature, creatureIndex) => {
      const revealStrength = clampNumber(1 - (currentTimeInSeconds - creature.lastRevealedAtSeconds) / (fadeOutInSeconds * 0.7), 0, 1);
      if (revealStrength <= 0) {
        return;
      }
      const screenPosition = followingCamera.convertCavePositionToScreenPosition(creature.position);
      const silhouetteColor = `rgba(${colorPalette.creatureRedRgb}, ${0.55 * revealStrength})`;
      this.drawCreatureShape(context, screenPosition, elapsedTimeInSeconds + creatureIndex, silhouetteColor, `rgba(255, 220, 220, ${revealStrength})`);
    });
    context.restore();
  }

  drawHuntingEyes(context, creatures, followingCamera, elapsedTimeInSeconds) {
    creatures
      .filter((creature) => creature.isHunting)
      .forEach((creature) => {
        const screenPosition = followingCamera.convertCavePositionToScreenPosition(creature.position);
        const blinkAlpha = 0.25 + 0.2 * Math.sin(elapsedTimeInSeconds * 9);
        context.fillStyle = `rgba(${colorPalette.creatureRedRgb}, ${blinkAlpha})`;
        context.beginPath();
        context.arc(screenPosition.x - 4, screenPosition.y - 2, 2, 0, Math.PI * 2);
        context.arc(screenPosition.x + 4, screenPosition.y - 2, 2, 0, Math.PI * 2);
        context.fill();
      });
  }

  drawCreatureShape(context, screenPosition, animationTimeInSeconds, bodyColor, eyeColor) {
    const numberOfTentacles = 6;
    context.strokeStyle = bodyColor;
    context.lineWidth = 3;
    for (let tentacleIndex = 0; tentacleIndex < numberOfTentacles; tentacleIndex += 1) {
      const baseAngle = Math.PI * 0.15 + (tentacleIndex / (numberOfTentacles - 1)) * Math.PI * 0.7;
      const waveOffset = Math.sin(animationTimeInSeconds * 5 + tentacleIndex) * 4;
      context.beginPath();
      context.moveTo(screenPosition.x + Math.cos(baseAngle) * 8, screenPosition.y + Math.sin(baseAngle) * 6);
      context.quadraticCurveTo(
        screenPosition.x + Math.cos(baseAngle) * 14 + waveOffset,
        screenPosition.y + Math.sin(baseAngle) * 14,
        screenPosition.x + Math.cos(baseAngle) * 20 - waveOffset,
        screenPosition.y + Math.sin(baseAngle) * 22,
      );
      context.stroke();
    }
    context.fillStyle = bodyColor;
    context.beginPath();
    context.ellipse(screenPosition.x, screenPosition.y, 12, 10, 0, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = eyeColor;
    context.beginPath();
    context.arc(screenPosition.x - 4, screenPosition.y - 2, 2, 0, Math.PI * 2);
    context.arc(screenPosition.x + 4, screenPosition.y - 2, 2, 0, Math.PI * 2);
    context.fill();
  }
}
