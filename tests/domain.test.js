import { test } from "node:test";
import assert from "node:assert/strict";
import { OxygenTank } from "../src/domain/OxygenTank.js";
import { SonarEmitter } from "../src/domain/SonarEmitter.js";
import { CaveLayout } from "../src/domain/CaveLayout.js";
import { CavePathFinder } from "../src/domain/CavePathFinder.js";
import { WallRevealMemory } from "../src/domain/WallRevealMemory.js";
import { Creature, CreatureBehavior } from "../src/domain/Creature.js";
import { Diver } from "../src/domain/Diver.js";

const tileSizeInPixels = 32;
const smallCaveBlueprint = {
  caveName: "Test Cave",
  rows: [
    "##########",
    "#P.......#",
    "#.######.#",
    "#..C...X.#",
    "##########",
  ],
};
const creatureSettings = {
  collisionRadiusInPixels: 8,
  driftingSpeedInPixelsPerSecond: 20,
  huntingSpeedInPixelsPerSecond: 100,
  secondsBetweenDriftTurns: 2,
  givesUpHuntingDistanceInPixels: 10,
};
const alwaysHalf = () => 0.5;

test("oxygen tank empties, never goes below zero and refills up to the maximum", () => {
  const oxygenTank = new OxygenTank(10);
  oxygenTank.consume(4);
  assert.equal(oxygenTank.remainingOxygenInSeconds, 6);
  oxygenTank.refill(100);
  assert.equal(oxygenTank.remainingOxygenInSeconds, 10);
  oxygenTank.consume(50);
  assert.equal(oxygenTank.remainingOxygenInSeconds, 0);
  assert.equal(oxygenTank.isEmpty, true);
});

test("sonar emitter respects the cooldown and the pulse grows until it finishes", () => {
  const sonarEmitter = new SonarEmitter({ ringSpeedInPixelsPerSecond: 100, maximumRadiusInPixels: 200, cooldownInSeconds: 1 });
  const firstPulse = sonarEmitter.tryEmitPulse({ x: 0, y: 0 });
  assert.ok(firstPulse);
  assert.equal(sonarEmitter.tryEmitPulse({ x: 0, y: 0 }), null);

  sonarEmitter.advance(1);
  assert.ok(sonarEmitter.tryEmitPulse({ x: 0, y: 0 }));

  firstPulse.advance(1);
  assert.equal(firstPulse.currentRadiusInPixels, 100);
  assert.equal(firstPulse.isFinished, false);
  firstPulse.advance(1.5);
  assert.equal(firstPulse.currentRadiusInPixels, 200);
  assert.equal(firstPulse.isFinished, true);
});

test("path finder goes around the rock", () => {
  const caveLayout = new CaveLayout(smallCaveBlueprint, tileSizeInPixels);
  const pathToExit = new CavePathFinder(caveLayout).findPathOfTileCenters(caveLayout.diverStartPosition, caveLayout.exitPosition);
  assert.ok(pathToExit.length > 0);
  pathToExit.forEach((tileCenter) => assert.equal(caveLayout.isWallAtPixelPosition(tileCenter.x, tileCenter.y), false));
  assert.deepEqual(pathToExit.at(-1), caveLayout.exitPosition);
});

test("the sonar ring reveals rock it touches and the reveal fades out", () => {
  const caveLayout = new CaveLayout(smallCaveBlueprint, tileSizeInPixels);
  const wallRevealMemory = new WallRevealMemory(caveLayout);
  const sonarEmitter = new SonarEmitter({ ringSpeedInPixelsPerSecond: 100, maximumRadiusInPixels: 300, cooldownInSeconds: 1 });
  const sonarPulse = sonarEmitter.tryEmitPulse(caveLayout.diverStartPosition);
  sonarPulse.advance(0.2);
  wallRevealMemory.markWallsTouchedByRing(sonarPulse, 20, 5);

  assert.equal(wallRevealMemory.calculateRevealStrength(0, 1, 5, 2), 1, "rock next to the diver is revealed");
  assert.equal(wallRevealMemory.calculateRevealStrength(9, 4, 5, 2), 0, "far rock is not revealed yet");
  assert.equal(wallRevealMemory.calculateRevealStrength(0, 1, 6, 2), 0.5);
  assert.equal(wallRevealMemory.calculateRevealStrength(0, 1, 8, 2), 0);
});

test("a creature hears the sonar, hunts the sound and goes back to drifting when it gets there", () => {
  const caveLayout = new CaveLayout(smallCaveBlueprint, tileSizeInPixels);
  const cavePathFinder = new CavePathFinder(caveLayout);
  const creature = new Creature(caveLayout.creatureStartPositions[0], creatureSettings, alwaysHalf);

  const startedHuntingNow = creature.hearSonarPulse(caveLayout.diverStartPosition, 1000, cavePathFinder);
  assert.equal(startedHuntingNow, true);
  assert.equal(creature.currentBehavior, CreatureBehavior.hunting);
  assert.equal(creature.hearSonarPulse(caveLayout.diverStartPosition, 1000, cavePathFinder), false, "already hunting");

  for (let frame = 0; frame < 600 && creature.isHunting; frame += 1) {
    creature.update(1 / 60, caveLayout);
  }
  assert.equal(creature.isHunting, false);
  const distanceToSound = Math.hypot(creature.position.x - caveLayout.diverStartPosition.x, creature.position.y - caveLayout.diverStartPosition.y);
  assert.ok(distanceToSound < tileSizeInPixels, `ended ${distanceToSound}px away`);
});

test("a creature does not hear a pulse outside its hearing radius", () => {
  const caveLayout = new CaveLayout(smallCaveBlueprint, tileSizeInPixels);
  const creature = new Creature(caveLayout.creatureStartPositions[0], creatureSettings, alwaysHalf);
  assert.equal(creature.hearSonarPulse(caveLayout.diverStartPosition, 10, new CavePathFinder(caveLayout)), false);
  assert.equal(creature.isHunting, false);
});

test("the diver slides along a wall instead of stopping", () => {
  const caveLayout = new CaveLayout(smallCaveBlueprint, tileSizeInPixels);
  const diver = new Diver(caveLayout.diverStartPosition, 9);
  const startPosition = { ...diver.position };
  diver.swim({ x: 1, y: -1 }, 100, 0.2, caveLayout);
  assert.ok(diver.position.x > startPosition.x, "moved right");
  assert.equal(diver.position.y, startPosition.y, "rock above blocked the vertical move");
});
