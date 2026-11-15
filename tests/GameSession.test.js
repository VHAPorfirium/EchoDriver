import { test } from "node:test";
import assert from "node:assert/strict";
import { GameSession } from "../src/application/GameSession.js";
import { GamePhase } from "../src/application/GamePhase.js";
import { GameEventType } from "../src/application/GameEventType.js";
import { GameConfiguration } from "../src/domain/GameConfiguration.js";

const firstTestCave = {
  caveName: "First",
  rows: [
    "############",
    "#P.*.O...X.#",
    "############",
  ],
};
const secondTestCave = {
  caveName: "Second",
  rows: [
    "############",
    "#P......C..#",
    "#.........X#",
    "############",
  ],
};
const noInput = { movementDirection: { x: 0, y: 0 }, wasActionKeyJustPressed: false };
const pressAction = { movementDirection: { x: 0, y: 0 }, wasActionKeyJustPressed: true };
const swimRight = { movementDirection: { x: 1, y: 0 }, wasActionKeyJustPressed: false };
const frameInSeconds = 1 / 60;

function createSession() {
  return new GameSession(GameConfiguration, [firstTestCave, secondTestCave], () => 0.5);
}

function swimRightUntilPhaseChanges(gameSession, maximumFrames = 1000) {
  for (let frame = 0; frame < maximumFrames && gameSession.currentGamePhase === GamePhase.diving; frame += 1) {
    gameSession.update(swimRight, frameInSeconds);
  }
}

test("starts on the title screen and the action key starts the dive", () => {
  const gameSession = createSession();
  assert.equal(gameSession.currentGamePhase, GamePhase.showingTitleScreen);
  gameSession.update(pressAction, frameInSeconds);
  assert.equal(gameSession.currentGamePhase, GamePhase.diving);
  assert.deepEqual(gameSession.drainGameEvents().map((gameEvent) => gameEvent.gameEventType), [GameEventType.divingStarted]);
});

test("swimming to the exit collects pearl and oxygen on the way and clears the cave", () => {
  const gameSession = createSession();
  gameSession.update(pressAction, frameInSeconds);
  gameSession.drainGameEvents();
  swimRightUntilPhaseChanges(gameSession);

  assert.equal(gameSession.currentGamePhase, GamePhase.caveCleared);
  assert.equal(gameSession.totalPearlsCollected, 1);
  const gameEventTypes = gameSession.drainGameEvents().map((gameEvent) => gameEvent.gameEventType);
  assert.deepEqual(gameEventTypes, [GameEventType.pearlCollected, GameEventType.oxygenBubbleCollected, GameEventType.caveCleared]);

  gameSession.update(pressAction, frameInSeconds);
  assert.equal(gameSession.currentCaveIndex, 1);
  assert.equal(gameSession.currentGamePhase, GamePhase.diving);
  assert.equal(gameSession.totalPearlsCollected, 1, "pearls from the first cave are kept");
});

test("the sonar has a cooldown and wakes up creatures that hear it", () => {
  const gameSession = createSession();
  gameSession.update(pressAction, frameInSeconds);
  gameSession.drainGameEvents();
  gameSession.update(pressAction, frameInSeconds);
  gameSession.update(pressAction, frameInSeconds);
  assert.equal(gameSession.activeSonarPulses.length, 1, "second press was still on cooldown");
});

test("a creature that hears the sonar catches a diver who stays still, and the cave is retried", () => {
  const gameSession = createSession();
  gameSession.update(pressAction, frameInSeconds);
  swimRightUntilPhaseChanges(gameSession);
  gameSession.update(pressAction, frameInSeconds);
  gameSession.drainGameEvents();

  gameSession.update(pressAction, frameInSeconds);
  const eventsAfterPing = gameSession.drainGameEvents().map((gameEvent) => gameEvent.gameEventType);
  assert.ok(eventsAfterPing.includes(GameEventType.creatureStartedHunting));

  for (let frame = 0; frame < 600 && gameSession.currentGamePhase === GamePhase.diving; frame += 1) {
    gameSession.update(noInput, frameInSeconds);
  }
  assert.equal(gameSession.currentGamePhase, GamePhase.caughtByCreature);
  assert.equal(gameSession.numberOfFailedDives, 1);

  gameSession.update(pressAction, frameInSeconds);
  assert.equal(gameSession.currentCaveIndex, 1, "retries the same cave");
  assert.equal(gameSession.currentGamePhase, GamePhase.diving);
});

test("running out of oxygen ends the dive", () => {
  const gameSession = createSession();
  gameSession.update(pressAction, frameInSeconds);
  gameSession.update(noInput, GameConfiguration.oxygenMaximumInSeconds + 1);
  assert.equal(gameSession.currentGamePhase, GamePhase.outOfOxygen);
});

test("clearing the last cave shows the final screen and the action key starts a new run", () => {
  const gameSession = createSession();
  gameSession.update(pressAction, frameInSeconds);
  swimRightUntilPhaseChanges(gameSession);
  gameSession.update(pressAction, frameInSeconds);
  gameSession.diver.position = { ...gameSession.caveLayout.exitPosition };
  gameSession.update(noInput, frameInSeconds);

  assert.equal(gameSession.currentGamePhase, GamePhase.allCavesCleared);
  assert.equal(gameSession.totalPearlsCollected, 1);

  gameSession.update(pressAction, frameInSeconds);
  assert.equal(gameSession.currentCaveIndex, 0);
  assert.equal(gameSession.totalPearlsCollected, 0);
});
