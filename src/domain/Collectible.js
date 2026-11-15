export const CollectibleKind = Object.freeze({
  oxygenBubble: "OXYGEN_BUBBLE",
  pearl: "PEARL",
});

/** Algo para pegar na caverna: bolha de oxigênio ou pérola. Brilha sozinho, então dá para ver no escuro. */
export class Collectible {
  constructor(collectibleKind, position) {
    this.collectibleKind = collectibleKind;
    this.position = { ...position };
    this.isCollected = false;
  }

  collect() {
    this.isCollected = true;
  }
}
