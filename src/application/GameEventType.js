/**
 * Coisas que aconteceram durante um quadro. A sessão só anota; quem escuta
 * (o áudio, por exemplo) decide o que fazer. Assim a regra do jogo não conhece o som.
 */
export const GameEventType = Object.freeze({
  sonarEmitted: "SONAR_EMITTED",
  creatureStartedHunting: "CREATURE_STARTED_HUNTING",
  oxygenBubbleCollected: "OXYGEN_BUBBLE_COLLECTED",
  pearlCollected: "PEARL_COLLECTED",
  diverCaught: "DIVER_CAUGHT",
  oxygenRanOut: "OXYGEN_RAN_OUT",
  caveCleared: "CAVE_CLEARED",
  divingStarted: "DIVING_STARTED",
});
