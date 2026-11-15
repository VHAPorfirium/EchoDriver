import { GamePhase } from "./GamePhase.js";
import { GameEventType } from "./GameEventType.js";
import { CaveLayout } from "../domain/CaveLayout.js";
import { Diver } from "../domain/Diver.js";
import { OxygenTank } from "../domain/OxygenTank.js";
import { SonarEmitter } from "../domain/SonarEmitter.js";
import { WallRevealMemory } from "../domain/WallRevealMemory.js";
import { CavePathFinder } from "../domain/CavePathFinder.js";
import { Creature } from "../domain/Creature.js";
import { Collectible, CollectibleKind } from "../domain/Collectible.js";
import { calculateDistanceBetweenPositions } from "../domain/geometry.js";

const phasesThatRetryTheSameCave = new Set([GamePhase.caughtByCreature, GamePhase.outOfOxygen]);

/**
 * Orquestra a partida: título → mergulhando → (pego | sem ar | caverna concluída) → próxima caverna → fim.
 * Recebe as plantas e o gerador de números aleatórios de fora, para dar para testar sem sorte.
 */
export class GameSession {
  constructor(gameConfiguration, caveBlueprints, randomNumberGenerator = Math.random) {
    this.gameConfiguration = gameConfiguration;
    this.caveBlueprints = caveBlueprints;
    this.randomNumberGenerator = randomNumberGenerator;
    this.currentGamePhase = GamePhase.showingTitleScreen;
    this.pendingGameEvents = [];
    this.currentCaveIndex = 0;
    this.elapsedDivingTimeInSeconds = 0;
    this.resetRunStatistics();
    this.prepareCave(0);
  }

  resetRunStatistics() {
    this.pearlsCollectedInPreviousCaves = 0;
    this.numberOfFailedDives = 0;
    this.totalSecondsUnderwater = 0;
  }

  get totalPearlsInAllCaves() {
    return this.caveBlueprints.reduce((pearlCount, blueprint) => pearlCount + blueprint.rows.join("").split("*").length - 1, 0);
  }

  get pearlsCollectedInCurrentCave() {
    if (this.wereCurrentCavePearlsAddedToTotal) {
      return 0;
    }
    return this.collectibles.filter((collectible) => collectible.collectibleKind === CollectibleKind.pearl && collectible.isCollected).length;
  }

  get totalPearlsCollected() {
    return this.pearlsCollectedInPreviousCaves + this.pearlsCollectedInCurrentCave;
  }

  get isLastCave() {
    return this.currentCaveIndex === this.caveBlueprints.length - 1;
  }

  prepareCave(caveIndex) {
    const configuration = this.gameConfiguration;
    this.currentCaveIndex = caveIndex;
    this.wereCurrentCavePearlsAddedToTotal = false;
    this.caveLayout = new CaveLayout(this.caveBlueprints[caveIndex], configuration.tileSizeInPixels);
    this.diver = new Diver(this.caveLayout.diverStartPosition, configuration.diverCollisionRadiusInPixels);
    this.oxygenTank = new OxygenTank(configuration.oxygenMaximumInSeconds);
    this.sonarEmitter = new SonarEmitter({
      ringSpeedInPixelsPerSecond: configuration.sonarRingSpeedInPixelsPerSecond,
      maximumRadiusInPixels: configuration.sonarMaximumRadiusInPixels,
      cooldownInSeconds: configuration.sonarCooldownInSeconds,
    });
    this.activeSonarPulses = [];
    this.wallRevealMemory = new WallRevealMemory(this.caveLayout);
    this.cavePathFinder = new CavePathFinder(this.caveLayout);
    const creatureSettings = {
      collisionRadiusInPixels: configuration.creatureCollisionRadiusInPixels,
      driftingSpeedInPixelsPerSecond: configuration.creatureDriftingSpeedInPixelsPerSecond,
      huntingSpeedInPixelsPerSecond: configuration.creatureHuntingSpeedInPixelsPerSecond,
      secondsBetweenDriftTurns: configuration.creatureSecondsBetweenDriftTurns,
      givesUpHuntingDistanceInPixels: configuration.creatureGivesUpHuntingDistanceInPixels,
    };
    this.creatures = this.caveLayout.creatureStartPositions.map(
      (startPosition) => new Creature(startPosition, creatureSettings, this.randomNumberGenerator),
    );
    this.collectibles = [
      ...this.caveLayout.oxygenBubblePositions.map((position) => new Collectible(CollectibleKind.oxygenBubble, position)),
      ...this.caveLayout.pearlPositions.map((position) => new Collectible(CollectibleKind.pearl, position)),
    ];
  }

  /** Entrega os eventos do quadro e esvazia a fila. */
  drainGameEvents() {
    const gameEvents = this.pendingGameEvents;
    this.pendingGameEvents = [];
    return gameEvents;
  }

  update(playerInputState, elapsedSeconds) {
    if (this.currentGamePhase === GamePhase.diving) {
      this.updateDiving(playerInputState, elapsedSeconds);
      return;
    }
    if (playerInputState.wasActionKeyJustPressed) {
      this.advanceFromScreen();
    }
  }

  advanceFromScreen() {
    if (this.currentGamePhase === GamePhase.caveCleared) {
      this.prepareCave(this.currentCaveIndex + 1);
    } else if (phasesThatRetryTheSameCave.has(this.currentGamePhase)) {
      this.prepareCave(this.currentCaveIndex);
    } else if (this.currentGamePhase === GamePhase.allCavesCleared) {
      this.resetRunStatistics();
      this.prepareCave(0);
    }
    this.currentGamePhase = GamePhase.diving;
    this.pendingGameEvents.push({ gameEventType: GameEventType.divingStarted });
  }

  updateDiving(playerInputState, elapsedSeconds) {
    const configuration = this.gameConfiguration;
    this.elapsedDivingTimeInSeconds += elapsedSeconds;
    this.totalSecondsUnderwater += elapsedSeconds;

    this.diver.swim(playerInputState.movementDirection, configuration.diverSwimmingSpeedInPixelsPerSecond, elapsedSeconds, this.caveLayout);
    this.oxygenTank.consume(elapsedSeconds);
    this.sonarEmitter.advance(elapsedSeconds);

    if (playerInputState.wasActionKeyJustPressed) {
      this.emitSonarPulse();
    }
    this.advanceSonarPulses(elapsedSeconds);
    this.creatures.forEach((creature) => creature.update(elapsedSeconds, this.caveLayout));
    this.startleDriftingCreaturesThatTouchTheDiver();
    this.collectCollectiblesWithinReach();
    this.checkEndOfDive();
  }

  emitSonarPulse() {
    const newSonarPulse = this.sonarEmitter.tryEmitPulse(this.diver.position);
    if (!newSonarPulse) {
      return;
    }
    this.activeSonarPulses.push(newSonarPulse);
    this.pendingGameEvents.push({ gameEventType: GameEventType.sonarEmitted });

    this.creatures.forEach((creature) => {
      const startedHuntingNow = creature.hearSonarPulse(
        this.diver.position,
        this.gameConfiguration.sonarCreatureHearingRadiusInPixels,
        this.cavePathFinder,
      );
      if (startedHuntingNow) {
        this.pendingGameEvents.push({ gameEventType: GameEventType.creatureStartedHunting, position: { ...creature.position } });
      }
    });
  }

  advanceSonarPulses(elapsedSeconds) {
    const { sonarRingThicknessInPixels } = this.gameConfiguration;
    this.activeSonarPulses.forEach((sonarPulse) => {
      sonarPulse.advance(elapsedSeconds);
      this.wallRevealMemory.markWallsTouchedByRing(sonarPulse, sonarRingThicknessInPixels, this.elapsedDivingTimeInSeconds);
      this.creatures.forEach((creature) =>
        creature.markRevealedIfTouchedByRing(sonarPulse, sonarRingThicknessInPixels, this.elapsedDivingTimeInSeconds),
      );
    });
    this.activeSonarPulses = this.activeSonarPulses.filter((sonarPulse) => !sonarPulse.isFinished);
  }

  startleDriftingCreaturesThatTouchTheDiver() {
    const { creatureStartleDistanceInPixels, creatureStartledDurationInSeconds } = this.gameConfiguration;
    this.creatures
      .filter((creature) => !creature.isHunting)
      .filter((creature) => calculateDistanceBetweenPositions(creature.position, this.diver.position) <= creatureStartleDistanceInPixels)
      .forEach((creature) => {
        creature.startleBy(this.diver.position, creatureStartledDurationInSeconds, this.cavePathFinder);
        this.pendingGameEvents.push({ gameEventType: GameEventType.creatureStartedHunting, position: { ...creature.position } });
      });
  }

  collectCollectiblesWithinReach() {
    this.collectibles
      .filter((collectible) => !collectible.isCollected)
      .filter((collectible) => calculateDistanceBetweenPositions(collectible.position, this.diver.position) <= this.gameConfiguration.pickupReachDistanceInPixels)
      .forEach((collectible) => {
        collectible.collect();
        if (collectible.collectibleKind === CollectibleKind.oxygenBubble) {
          this.oxygenTank.refill(this.gameConfiguration.oxygenBubbleRefillInSeconds);
          this.pendingGameEvents.push({ gameEventType: GameEventType.oxygenBubbleCollected });
        } else {
          this.pendingGameEvents.push({ gameEventType: GameEventType.pearlCollected });
        }
      });
  }

  checkEndOfDive() {
    const configuration = this.gameConfiguration;
    const wasCaught = this.creatures.some(
      (creature) => creature.isDangerous && calculateDistanceBetweenPositions(creature.position, this.diver.position) <= configuration.creatureCatchDistanceInPixels,
    );
    if (wasCaught) {
      this.finishDive(GamePhase.caughtByCreature, GameEventType.diverCaught);
    } else if (this.oxygenTank.isEmpty) {
      this.finishDive(GamePhase.outOfOxygen, GameEventType.oxygenRanOut);
    } else if (calculateDistanceBetweenPositions(this.diver.position, this.caveLayout.exitPosition) <= configuration.exitReachDistanceInPixels) {
      this.currentGamePhase = this.isLastCave ? GamePhase.allCavesCleared : GamePhase.caveCleared;
      this.pearlsCollectedInPreviousCaves += this.pearlsCollectedInCurrentCave;
      this.wereCurrentCavePearlsAddedToTotal = true;
      this.pendingGameEvents.push({ gameEventType: GameEventType.caveCleared });
    }
  }

  finishDive(failedGamePhase, failedGameEventType) {
    this.currentGamePhase = failedGamePhase;
    this.numberOfFailedDives += 1;
    this.pendingGameEvents.push({ gameEventType: failedGameEventType });
  }

  /** Raio da luz própria do mergulhador: diminui um pouco quando o ar está acabando. */
  get diverPersonalLightRadiusInPixels() {
    const fullRadius = this.gameConfiguration.diverPersonalLightRadiusInPixels;
    return fullRadius * (0.6 + 0.4 * this.oxygenTank.remainingOxygenRatio);
  }
}
