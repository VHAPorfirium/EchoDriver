import { moveCircleSlidingAlongWalls } from "./geometry.js";

/** O mergulhador. Nada em 8 direções e desliza pelas paredes. */
export class Diver {
  constructor(startPosition, collisionRadiusInPixels) {
    this.position = { ...startPosition };
    this.collisionRadiusInPixels = collisionRadiusInPixels;
    this.facingDirection = { x: 1, y: 0 };
    this.isSwimming = false;
  }

  swim(movementDirection, speedInPixelsPerSecond, elapsedSeconds, caveLayout) {
    const directionLength = Math.hypot(movementDirection.x, movementDirection.y);
    this.isSwimming = directionLength > 0;
    if (!this.isSwimming) {
      return;
    }
    const normalizedDirection = { x: movementDirection.x / directionLength, y: movementDirection.y / directionLength };
    this.facingDirection = normalizedDirection;
    const movementResult = moveCircleSlidingAlongWalls(
      this.position,
      normalizedDirection,
      speedInPixelsPerSecond * elapsedSeconds,
      this.collisionRadiusInPixels,
      caveLayout,
    );
    this.position = movementResult.position;
  }
}
