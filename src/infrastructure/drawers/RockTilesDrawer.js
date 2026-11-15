import { colorPalette } from "../colorPalette.js";

/**
 * Desenha a rocha de duas formas:
 * - drawLitRock: rocha "de verdade", que só aparece dentro das luzes (fica embaixo da escuridão);
 * - drawSonarRevealedRock: contorno ciano que aparece por cima da escuridão quando o anel do sonar passa.
 */
export class RockTilesDrawer {
  forEachVisibleTile(caveLayout, followingCamera, viewportWidthInPixels, viewportHeightInPixels, drawTile) {
    const tileSize = caveLayout.tileSizeInPixels;
    const firstColumn = Math.max(0, Math.floor(followingCamera.topLeftPosition.x / tileSize));
    const firstRow = Math.max(0, Math.floor(followingCamera.topLeftPosition.y / tileSize));
    const lastColumn = Math.min(caveLayout.widthInTiles - 1, firstColumn + Math.ceil(viewportWidthInPixels / tileSize) + 1);
    const lastRow = Math.min(caveLayout.heightInTiles - 1, firstRow + Math.ceil(viewportHeightInPixels / tileSize) + 1);
    for (let tileRow = firstRow; tileRow <= lastRow; tileRow += 1) {
      for (let tileColumn = firstColumn; tileColumn <= lastColumn; tileColumn += 1) {
        if (caveLayout.isWallTile(tileColumn, tileRow)) {
          const screenPosition = followingCamera.convertCavePositionToScreenPosition({ x: tileColumn * tileSize, y: tileRow * tileSize });
          drawTile(tileColumn, tileRow, screenPosition, tileSize);
        }
      }
    }
  }

  drawLitRock(context, caveLayout, followingCamera, viewportWidthInPixels, viewportHeightInPixels) {
    this.forEachVisibleTile(caveLayout, followingCamera, viewportWidthInPixels, viewportHeightInPixels, (tileColumn, tileRow, screenPosition, tileSize) => {
      const shadeVariation = ((tileColumn * 7 + tileRow * 13) % 5) * 3;
      context.fillStyle = `rgb(${18 + shadeVariation}, ${30 + shadeVariation}, ${40 + shadeVariation})`;
      context.fillRect(screenPosition.x, screenPosition.y, tileSize, tileSize);
    });
  }

  drawSonarRevealedRock(context, gameSession, followingCamera, viewportWidthInPixels, viewportHeightInPixels) {
    const { caveLayout, wallRevealMemory, elapsedDivingTimeInSeconds, gameConfiguration } = gameSession;
    context.save();
    context.globalCompositeOperation = "lighter";
    this.forEachVisibleTile(caveLayout, followingCamera, viewportWidthInPixels, viewportHeightInPixels, (tileColumn, tileRow, screenPosition, tileSize) => {
      const revealStrength = wallRevealMemory.calculateRevealStrength(
        tileColumn,
        tileRow,
        elapsedDivingTimeInSeconds,
        gameConfiguration.sonarRevealFadeOutInSeconds,
      );
      if (revealStrength <= 0) {
        return;
      }
      context.fillStyle = `rgba(${colorPalette.rockRevealedRgb}, ${revealStrength * 0.16})`;
      context.fillRect(screenPosition.x, screenPosition.y, tileSize, tileSize);
      this.drawEdgesFacingWater(context, caveLayout, tileColumn, tileRow, screenPosition, tileSize, revealStrength);
    });
    context.restore();
  }

  /** Só as bordas viradas para a água ganham linha: assim aparece o desenho do túnel, não uma grade. */
  drawEdgesFacingWater(context, caveLayout, tileColumn, tileRow, screenPosition, tileSize, revealStrength) {
    context.strokeStyle = `rgba(${colorPalette.rockEdgeRgb}, ${revealStrength * 0.9})`;
    context.lineWidth = 2;
    context.beginPath();
    if (!caveLayout.isWallTile(tileColumn, tileRow - 1)) {
      context.moveTo(screenPosition.x, screenPosition.y + 1);
      context.lineTo(screenPosition.x + tileSize, screenPosition.y + 1);
    }
    if (!caveLayout.isWallTile(tileColumn, tileRow + 1)) {
      context.moveTo(screenPosition.x, screenPosition.y + tileSize - 1);
      context.lineTo(screenPosition.x + tileSize, screenPosition.y + tileSize - 1);
    }
    if (!caveLayout.isWallTile(tileColumn - 1, tileRow)) {
      context.moveTo(screenPosition.x + 1, screenPosition.y);
      context.lineTo(screenPosition.x + 1, screenPosition.y + tileSize);
    }
    if (!caveLayout.isWallTile(tileColumn + 1, tileRow)) {
      context.moveTo(screenPosition.x + tileSize - 1, screenPosition.y);
      context.lineTo(screenPosition.x + tileSize - 1, screenPosition.y + tileSize);
    }
    context.stroke();
  }
}
