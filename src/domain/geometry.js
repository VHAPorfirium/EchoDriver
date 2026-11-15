export function calculateDistanceBetweenPositions(firstPosition, secondPosition) {
  return Math.hypot(firstPosition.x - secondPosition.x, firstPosition.y - secondPosition.y);
}

export function clampNumber(value, minimumValue, maximumValue) {
  return Math.min(maximumValue, Math.max(minimumValue, value));
}

/** Direção de tamanho 1 (ou zero, se as posições forem iguais). */
export function calculateNormalizedDirection(fromPosition, toPosition) {
  const distance = calculateDistanceBetweenPositions(fromPosition, toPosition);
  if (distance === 0) {
    return { x: 0, y: 0 };
  }
  return { x: (toPosition.x - fromPosition.x) / distance, y: (toPosition.y - fromPosition.y) / distance };
}

/**
 * Move um círculo um eixo por vez: se um eixo bate na parede, o outro ainda anda.
 * É isso que faz quem nada encostado na parede deslizar em vez de travar.
 * Devolve a nova posição e se algum eixo foi bloqueado.
 */
export function moveCircleSlidingAlongWalls(startPosition, direction, distanceToTravel, collisionRadiusInPixels, caveLayout) {
  let currentPosition = { ...startPosition };
  let wasBlockedByWall = false;

  const positionAfterHorizontalMove = { x: currentPosition.x + direction.x * distanceToTravel, y: currentPosition.y };
  if (caveLayout.doesCircleTouchWall(positionAfterHorizontalMove, collisionRadiusInPixels)) {
    wasBlockedByWall = wasBlockedByWall || direction.x !== 0;
  } else {
    currentPosition = positionAfterHorizontalMove;
  }

  const positionAfterVerticalMove = { x: currentPosition.x, y: currentPosition.y + direction.y * distanceToTravel };
  if (caveLayout.doesCircleTouchWall(positionAfterVerticalMove, collisionRadiusInPixels)) {
    wasBlockedByWall = wasBlockedByWall || direction.y !== 0;
  } else {
    currentPosition = positionAfterVerticalMove;
  }

  return { position: currentPosition, wasBlockedByWall };
}
