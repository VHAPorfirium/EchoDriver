import { calculateDistanceBetweenPositions, calculateNormalizedDirection, moveCircleSlidingAlongWalls } from "./geometry.js";

export const CreatureBehavior = Object.freeze({
  drifting: "DRIFTING",
  hunting: "HUNTING",
});

/**
 * Criatura cega que caça pelo som. Vaga devagar e é inofensiva até ouvir um pulso de sonar
 * (ou ser tocada); aí nada rápido até o lugar de onde o som veio e, chegando lá, volta a vagar.
 * Quando é tocada, leva um instante para se virar: é a chance de o mergulhador fugir.
 */
export class Creature {
  constructor(startPosition, creatureSettings, randomNumberGenerator = Math.random) {
    this.position = { ...startPosition };
    this.creatureSettings = creatureSettings;
    this.randomNumberGenerator = randomNumberGenerator;
    this.currentBehavior = CreatureBehavior.drifting;
    this.driftDirection = this.pickRandomDriftDirection();
    this.secondsUntilNextDriftTurn = creatureSettings.secondsBetweenDriftTurns;
    this.huntingPathOfTileCenters = [];
    this.remainingStartledSeconds = 0;
    this.lastRevealedAtSeconds = Number.NEGATIVE_INFINITY;
  }

  pickRandomDriftDirection() {
    const angleInRadians = this.randomNumberGenerator() * Math.PI * 2;
    return { x: Math.cos(angleInRadians), y: Math.sin(angleInRadians) };
  }

  get isHunting() {
    return this.currentBehavior === CreatureBehavior.hunting;
  }

  /** Só machuca quem está caçando e já terminou de se virar. */
  get isDangerous() {
    return this.isHunting && this.remainingStartledSeconds <= 0;
  }

  /** O mergulhador encostou numa criatura que vagava: ela acorda, se vira e vai atrás de onde ele estava. */
  startleBy(diverPosition, startledDurationInSeconds, cavePathFinder) {
    if (this.isHunting) {
      return false;
    }
    this.huntingPathOfTileCenters = cavePathFinder.findPathOfTileCenters(this.position, diverPosition);
    this.currentBehavior = CreatureBehavior.hunting;
    this.remainingStartledSeconds = startledDurationInSeconds;
    return true;
  }

  /** Devolve true se a criatura começou a caçar agora (para tocar o rugido só uma vez). */
  hearSonarPulse(pulseOriginPosition, hearingRadiusInPixels, cavePathFinder) {
    if (calculateDistanceBetweenPositions(this.position, pulseOriginPosition) > hearingRadiusInPixels) {
      return false;
    }
    const pathToSound = cavePathFinder.findPathOfTileCenters(this.position, pulseOriginPosition);
    if (pathToSound.length === 0) {
      return false;
    }
    const wasAlreadyHunting = this.isHunting;
    this.huntingPathOfTileCenters = pathToSound;
    this.currentBehavior = CreatureBehavior.hunting;
    return !wasAlreadyHunting;
  }

  update(elapsedSeconds, caveLayout) {
    if (this.remainingStartledSeconds > 0) {
      this.remainingStartledSeconds -= elapsedSeconds;
      return;
    }
    if (this.isHunting) {
      this.followHuntingPath(elapsedSeconds, caveLayout);
    } else {
      this.drift(elapsedSeconds, caveLayout);
    }
  }

  followHuntingPath(elapsedSeconds, caveLayout) {
    const nextWaypoint = this.huntingPathOfTileCenters[0];
    if (!nextWaypoint) {
      this.currentBehavior = CreatureBehavior.drifting;
      return;
    }
    if (calculateDistanceBetweenPositions(this.position, nextWaypoint) <= this.creatureSettings.givesUpHuntingDistanceInPixels) {
      this.huntingPathOfTileCenters.shift();
      return;
    }
    const directionToWaypoint = calculateNormalizedDirection(this.position, nextWaypoint);
    this.position = moveCircleSlidingAlongWalls(
      this.position,
      directionToWaypoint,
      this.creatureSettings.huntingSpeedInPixelsPerSecond * elapsedSeconds,
      this.creatureSettings.collisionRadiusInPixels,
      caveLayout,
    ).position;
  }

  drift(elapsedSeconds, caveLayout) {
    this.secondsUntilNextDriftTurn -= elapsedSeconds;
    if (this.secondsUntilNextDriftTurn <= 0) {
      this.driftDirection = this.pickRandomDriftDirection();
      this.secondsUntilNextDriftTurn = this.creatureSettings.secondsBetweenDriftTurns;
    }
    const movementResult = moveCircleSlidingAlongWalls(
      this.position,
      this.driftDirection,
      this.creatureSettings.driftingSpeedInPixelsPerSecond * elapsedSeconds,
      this.creatureSettings.collisionRadiusInPixels,
      caveLayout,
    );
    this.position = movementResult.position;
    if (movementResult.wasBlockedByWall) {
      this.driftDirection = this.pickRandomDriftDirection();
    }
  }

  markRevealedIfTouchedByRing(sonarPulse, ringThicknessInPixels, currentTimeInSeconds) {
    const distanceFromOrigin = calculateDistanceBetweenPositions(this.position, sonarPulse.originPosition);
    const outerRadius = sonarPulse.currentRadiusInPixels;
    if (distanceFromOrigin <= outerRadius && distanceFromOrigin >= outerRadius - ringThicknessInPixels * 2) {
      this.lastRevealedAtSeconds = currentTimeInSeconds;
    }
  }
}
