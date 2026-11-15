import { clampNumber } from "../domain/geometry.js";

/** Câmera centrada no mergulhador, sem mostrar nada além das bordas da caverna. */
export class FollowingCamera {
  constructor(viewportWidthInPixels, viewportHeightInPixels) {
    this.viewportWidthInPixels = viewportWidthInPixels;
    this.viewportHeightInPixels = viewportHeightInPixels;
    this.topLeftPosition = { x: 0, y: 0 };
  }

  follow(targetPosition, caveWidthInPixels, caveHeightInPixels) {
    this.topLeftPosition = {
      x: this.calculateAxisOffset(targetPosition.x, this.viewportWidthInPixels, caveWidthInPixels),
      y: this.calculateAxisOffset(targetPosition.y, this.viewportHeightInPixels, caveHeightInPixels),
    };
  }

  /** Se a caverna for menor que a tela nesse eixo, centraliza a caverna. */
  calculateAxisOffset(targetCoordinate, viewportSize, caveSize) {
    if (caveSize <= viewportSize) {
      return (caveSize - viewportSize) / 2;
    }
    return clampNumber(targetCoordinate - viewportSize / 2, 0, caveSize - viewportSize);
  }

  convertCavePositionToScreenPosition(cavePosition) {
    return {
      x: Math.round(cavePosition.x - this.topLeftPosition.x),
      y: Math.round(cavePosition.y - this.topLeftPosition.y),
    };
  }
}
