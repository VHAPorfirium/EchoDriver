export const CaveTileSymbol = Object.freeze({
  wall: "#",
  water: ".",
  diverStart: "P",
  exit: "X",
  oxygenBubble: "O",
  pearl: "*",
  creature: "C",
});

/**
 * Planta de uma caverna em grade de tiles, montada a partir de linhas de texto (ver caveBlueprints.js).
 * Só descreve o lugar: quem anda e o que é coletado ficam em outras classes.
 */
export class CaveLayout {
  constructor(blueprint, tileSizeInPixels) {
    this.caveName = blueprint.caveName;
    this.blueprintRows = blueprint.rows;
    this.tileSizeInPixels = tileSizeInPixels;
    this.widthInTiles = this.blueprintRows[0].length;
    this.heightInTiles = this.blueprintRows.length;
    this.diverStartPosition = this.findCenterOfFirstTileWithSymbol(CaveTileSymbol.diverStart);
    this.exitPosition = this.findCenterOfFirstTileWithSymbol(CaveTileSymbol.exit);
    this.oxygenBubblePositions = this.findCentersOfAllTilesWithSymbol(CaveTileSymbol.oxygenBubble);
    this.pearlPositions = this.findCentersOfAllTilesWithSymbol(CaveTileSymbol.pearl);
    this.creatureStartPositions = this.findCentersOfAllTilesWithSymbol(CaveTileSymbol.creature);
  }

  get widthInPixels() {
    return this.widthInTiles * this.tileSizeInPixels;
  }

  get heightInPixels() {
    return this.heightInTiles * this.tileSizeInPixels;
  }

  isWallTile(tileColumn, tileRow) {
    const isOutsideTheCave = tileColumn < 0 || tileRow < 0 || tileColumn >= this.widthInTiles || tileRow >= this.heightInTiles;
    return isOutsideTheCave || this.blueprintRows[tileRow][tileColumn] === CaveTileSymbol.wall;
  }

  isWallAtPixelPosition(pixelX, pixelY) {
    return this.isWallTile(Math.floor(pixelX / this.tileSizeInPixels), Math.floor(pixelY / this.tileSizeInPixels));
  }

  /** Testa um círculo contra as paredes olhando o centro e os quatro pontos extremos. */
  doesCircleTouchWall(centerPosition, radiusInPixels) {
    const pointsToCheck = [
      [centerPosition.x, centerPosition.y],
      [centerPosition.x - radiusInPixels, centerPosition.y],
      [centerPosition.x + radiusInPixels, centerPosition.y],
      [centerPosition.x, centerPosition.y - radiusInPixels],
      [centerPosition.x, centerPosition.y + radiusInPixels],
    ];
    return pointsToCheck.some(([pixelX, pixelY]) => this.isWallAtPixelPosition(pixelX, pixelY));
  }

  findCentersOfAllTilesWithSymbol(tileSymbol) {
    const tileCenters = [];
    this.blueprintRows.forEach((blueprintRow, tileRow) => {
      [...blueprintRow].forEach((symbol, tileColumn) => {
        if (symbol === tileSymbol) {
          tileCenters.push(this.calculateTileCenter(tileColumn, tileRow));
        }
      });
    });
    return tileCenters;
  }

  findCenterOfFirstTileWithSymbol(tileSymbol) {
    return this.findCentersOfAllTilesWithSymbol(tileSymbol)[0] ?? null;
  }

  calculateTileCenter(tileColumn, tileRow) {
    return {
      x: (tileColumn + 0.5) * this.tileSizeInPixels,
      y: (tileRow + 0.5) * this.tileSizeInPixels,
    };
  }
}
