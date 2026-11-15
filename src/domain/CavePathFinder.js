const neighborTileOffsets = Object.freeze([
  { columnOffset: 1, rowOffset: 0 },
  { columnOffset: -1, rowOffset: 0 },
  { columnOffset: 0, rowOffset: 1 },
  { columnOffset: 0, rowOffset: -1 },
]);

/**
 * Busca em largura na grade de tiles. As cavernas são pequenas (40x24),
 * então calcular o caminho inteiro cada vez que uma criatura ouve um pulso é barato.
 */
export class CavePathFinder {
  constructor(caveLayout) {
    this.caveLayout = caveLayout;
  }

  convertPositionToTile(position) {
    const tileSize = this.caveLayout.tileSizeInPixels;
    return { tileColumn: Math.floor(position.x / tileSize), tileRow: Math.floor(position.y / tileSize) };
  }

  /** Lista de centros de tile do início até o destino (sem o tile inicial). Vazia se não há caminho. */
  findPathOfTileCenters(startPosition, destinationPosition) {
    const { caveLayout } = this;
    const startTile = this.convertPositionToTile(startPosition);
    const destinationTile = this.convertPositionToTile(destinationPosition);
    if (caveLayout.isWallTile(destinationTile.tileColumn, destinationTile.tileRow)) {
      return [];
    }

    const tileKey = (tileColumn, tileRow) => tileRow * caveLayout.widthInTiles + tileColumn;
    const previousTileKeyByTileKey = new Map([[tileKey(startTile.tileColumn, startTile.tileRow), null]]);
    const tilesToVisit = [startTile];

    while (tilesToVisit.length > 0) {
      const currentTile = tilesToVisit.shift();
      if (currentTile.tileColumn === destinationTile.tileColumn && currentTile.tileRow === destinationTile.tileRow) {
        return this.rebuildPath(previousTileKeyByTileKey, tileKey(currentTile.tileColumn, currentTile.tileRow));
      }
      neighborTileOffsets.forEach(({ columnOffset, rowOffset }) => {
        const neighborColumn = currentTile.tileColumn + columnOffset;
        const neighborRow = currentTile.tileRow + rowOffset;
        const neighborKey = tileKey(neighborColumn, neighborRow);
        if (caveLayout.isWallTile(neighborColumn, neighborRow) || previousTileKeyByTileKey.has(neighborKey)) {
          return;
        }
        previousTileKeyByTileKey.set(neighborKey, tileKey(currentTile.tileColumn, currentTile.tileRow));
        tilesToVisit.push({ tileColumn: neighborColumn, tileRow: neighborRow });
      });
    }
    return [];
  }

  rebuildPath(previousTileKeyByTileKey, destinationTileKey) {
    const { caveLayout } = this;
    const pathOfTileCenters = [];
    let currentTileKey = destinationTileKey;
    while (previousTileKeyByTileKey.get(currentTileKey) !== null) {
      const tileColumn = currentTileKey % caveLayout.widthInTiles;
      const tileRow = Math.floor(currentTileKey / caveLayout.widthInTiles);
      pathOfTileCenters.unshift(caveLayout.calculateTileCenter(tileColumn, tileRow));
      currentTileKey = previousTileKeyByTileKey.get(currentTileKey);
    }
    return pathOfTileCenters;
  }
}
