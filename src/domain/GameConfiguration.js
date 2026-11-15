/** Todos os números de balanceamento num lugar só. Ajuste aqui depois do playtest. */
export const GameConfiguration = Object.freeze({
  canvasWidthInPixels: 960,
  canvasHeightInPixels: 540,
  tileSizeInPixels: 32,

  diverCollisionRadiusInPixels: 9,
  diverSwimmingSpeedInPixelsPerSecond: 120,
  diverPersonalLightRadiusInPixels: 56,

  sonarRingSpeedInPixelsPerSecond: 420,
  sonarMaximumRadiusInPixels: 380,
  sonarRingThicknessInPixels: 26,
  sonarCooldownInSeconds: 1.1,
  sonarRevealFadeOutInSeconds: 2.6,
  sonarCreatureHearingRadiusInPixels: 270,

  oxygenMaximumInSeconds: 70,
  oxygenBubbleRefillInSeconds: 25,
  pickupReachDistanceInPixels: 20,
  exitReachDistanceInPixels: 22,

  creatureCollisionRadiusInPixels: 11,
  creatureCatchDistanceInPixels: 18,
  creatureStartleDistanceInPixels: 26,
  creatureStartledDurationInSeconds: 0.8,
  creatureDriftingSpeedInPixelsPerSecond: 28,
  creatureHuntingSpeedInPixelsPerSecond: 84,
  creatureSecondsBetweenDriftTurns: 2.2,
  creatureGivesUpHuntingDistanceInPixels: 14,
});
