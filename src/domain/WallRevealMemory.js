import { calculateDistanceBetweenPositions, clampNumber } from "./geometry.js";

/**
 * Lembra quando cada tile de rocha foi tocado pelo anel do sonar pela última vez.
 * A rocha aparece forte quando o anel passa e vai sumindo até voltar ao escuro.
 */
export class WallRevealMemory {
  constructor(caveLayout) {
    this.caveLayout = caveLayout;
    this.lastRevealedAtSecondsByTileIndex = new Float64Array(caveLayout.widthInTiles * caveLayout.heightInTiles).fill(Number.NEGATIVE_INFINITY);
  }

  calculateTileIndex(tileColumn, tileRow) {
    return tileRow * this.caveLayout.widthInTiles + tileColumn;
  }

  /** Marca as rochas que estão na faixa do anel neste instante. */
  markWallsTouchedByRing(sonarPulse, ringThicknessInPixels, currentTimeInSeconds) {
    const { caveLayout } = this;
    const outerRadius = sonarPulse.currentRadiusInPixels;
    const innerRadius = Math.max(0, outerRadius - ringThicknessInPixels);
    const tileSize = caveLayout.tileSizeInPixels;

    const firstColumn = Math.max(0, Math.floor((sonarPulse.originPosition.x - outerRadius) / tileSize));
    const lastColumn = Math.min(caveLayout.widthInTiles - 1, Math.floor((sonarPulse.originPosition.x + outerRadius) / tileSize));
    const firstRow = Math.max(0, Math.floor((sonarPulse.originPosition.y - outerRadius) / tileSize));
    const lastRow = Math.min(caveLayout.heightInTiles - 1, Math.floor((sonarPulse.originPosition.y + outerRadius) / tileSize));

    for (let tileRow = firstRow; tileRow <= lastRow; tileRow += 1) {
      for (let tileColumn = firstColumn; tileColumn <= lastColumn; tileColumn += 1) {
        if (!caveLayout.isWallTile(tileColumn, tileRow)) {
          continue;
        }
        const distanceFromOrigin = calculateDistanceBetweenPositions(sonarPulse.originPosition, caveLayout.calculateTileCenter(tileColumn, tileRow));
        const isInsideRing = distanceFromOrigin >= innerRadius - tileSize / 2 && distanceFromOrigin <= outerRadius + tileSize / 2;
        if (isInsideRing) {
          this.lastRevealedAtSecondsByTileIndex[this.calculateTileIndex(tileColumn, tileRow)] = currentTimeInSeconds;
        }
      }
    }
  }

  /** 1 logo depois do anel passar, 0 quando já sumiu de novo. */
  calculateRevealStrength(tileColumn, tileRow, currentTimeInSeconds, fadeOutInSeconds) {
    const lastRevealedAtSeconds = this.lastRevealedAtSecondsByTileIndex[this.calculateTileIndex(tileColumn, tileRow)];
    return clampNumber(1 - (currentTimeInSeconds - lastRevealedAtSeconds) / fadeOutInSeconds, 0, 1);
  }
}
