import { colorPalette } from "../colorPalette.js";

/**
 * Cobre a tela de escuridão e "fura" buracos onde há luz (a lanterna do mergulhador e a saída).
 * Os buracos são feitos numa camada separada com destination-out.
 */
export class DarknessDrawer {
  constructor(viewportWidthInPixels, viewportHeightInPixels) {
    this.darknessCanvas = document.createElement("canvas");
    this.darknessCanvas.width = viewportWidthInPixels;
    this.darknessCanvas.height = viewportHeightInPixels;
    this.darknessContext = this.darknessCanvas.getContext("2d");
  }

  /** lightSources: lista de { screenPosition, radiusInPixels }. */
  draw(context, lightSources) {
    const { darknessContext, darknessCanvas } = this;
    darknessContext.globalCompositeOperation = "source-over";
    darknessContext.clearRect(0, 0, darknessCanvas.width, darknessCanvas.height);
    darknessContext.fillStyle = colorPalette.darkness;
    darknessContext.fillRect(0, 0, darknessCanvas.width, darknessCanvas.height);

    darknessContext.globalCompositeOperation = "destination-out";
    lightSources
      .filter((lightSource) => lightSource.radiusInPixels > 0)
      .forEach(({ screenPosition, radiusInPixels }) => {
        const lightGradient = darknessContext.createRadialGradient(screenPosition.x, screenPosition.y, 0, screenPosition.x, screenPosition.y, radiusInPixels);
        lightGradient.addColorStop(0, "rgba(0, 0, 0, 1)");
        lightGradient.addColorStop(0.5, "rgba(0, 0, 0, 0.8)");
        lightGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        darknessContext.fillStyle = lightGradient;
        darknessContext.fillRect(screenPosition.x - radiusInPixels, screenPosition.y - radiusInPixels, radiusInPixels * 2, radiusInPixels * 2);
      });
    darknessContext.globalCompositeOperation = "source-over";
    context.drawImage(darknessCanvas, 0, 0);
  }
}
