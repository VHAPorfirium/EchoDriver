import { FollowingCamera } from "./FollowingCamera.js";
import { colorPalette } from "./colorPalette.js";
import { RockTilesDrawer } from "./drawers/RockTilesDrawer.js";
import { CreatureDrawer } from "./drawers/CreatureDrawer.js";
import { DiverDrawer } from "./drawers/DiverDrawer.js";
import { DarknessDrawer } from "./drawers/DarknessDrawer.js";
import { SonarRingDrawer } from "./drawers/SonarRingDrawer.js";
import { GlowingObjectsDrawer } from "./drawers/GlowingObjectsDrawer.js";
import { HudDrawer } from "./drawers/HudDrawer.js";
import { ScreenOverlayDrawer } from "./drawers/ScreenOverlayDrawer.js";

const exitLightRadiusInPixels = 70;

/**
 * Junta os desenhistas na ordem certa:
 * mundo "de verdade" (só aparece na luz) → escuridão → o que o sonar revela e o que brilha → HUD → telas.
 */
export class CanvasGameRenderer {
  constructor(canvasElement, gameConfiguration) {
    const { canvasWidthInPixels, canvasHeightInPixels } = gameConfiguration;
    canvasElement.width = canvasWidthInPixels;
    canvasElement.height = canvasHeightInPixels;

    this.context = canvasElement.getContext("2d");
    this.gameConfiguration = gameConfiguration;
    this.followingCamera = new FollowingCamera(canvasWidthInPixels, canvasHeightInPixels);
    this.rockTilesDrawer = new RockTilesDrawer();
    this.creatureDrawer = new CreatureDrawer();
    this.diverDrawer = new DiverDrawer();
    this.darknessDrawer = new DarknessDrawer(canvasWidthInPixels, canvasHeightInPixels);
    this.sonarRingDrawer = new SonarRingDrawer();
    this.glowingObjectsDrawer = new GlowingObjectsDrawer();
    this.hudDrawer = new HudDrawer(canvasWidthInPixels, canvasHeightInPixels);
    this.screenOverlayDrawer = new ScreenOverlayDrawer(canvasWidthInPixels, canvasHeightInPixels);
  }

  render(gameSession, isSoundEnabled, elapsedTimeInSeconds) {
    const { context, followingCamera } = this;
    const { canvasWidthInPixels, canvasHeightInPixels, sonarRevealFadeOutInSeconds } = this.gameConfiguration;
    const { caveLayout, diver, creatures } = gameSession;

    followingCamera.follow(diver.position, caveLayout.widthInPixels, caveLayout.heightInPixels);

    context.fillStyle = colorPalette.deepWater;
    context.fillRect(0, 0, canvasWidthInPixels, canvasHeightInPixels);
    this.rockTilesDrawer.drawLitRock(context, caveLayout, followingCamera, canvasWidthInPixels, canvasHeightInPixels);
    this.creatureDrawer.drawBodies(context, creatures, followingCamera, elapsedTimeInSeconds);
    this.diverDrawer.draw(context, diver, followingCamera, elapsedTimeInSeconds);

    this.darknessDrawer.draw(context, [
      { screenPosition: followingCamera.convertCavePositionToScreenPosition(diver.position), radiusInPixels: gameSession.diverPersonalLightRadiusInPixels },
      { screenPosition: followingCamera.convertCavePositionToScreenPosition(caveLayout.exitPosition), radiusInPixels: exitLightRadiusInPixels },
    ]);

    this.rockTilesDrawer.drawSonarRevealedRock(context, gameSession, followingCamera, canvasWidthInPixels, canvasHeightInPixels);
    this.creatureDrawer.drawSonarSilhouettes(
      context,
      creatures,
      followingCamera,
      gameSession.elapsedDivingTimeInSeconds,
      sonarRevealFadeOutInSeconds,
      elapsedTimeInSeconds,
    );
    this.creatureDrawer.drawHuntingEyes(context, creatures, followingCamera, elapsedTimeInSeconds);
    this.sonarRingDrawer.draw(context, gameSession.activeSonarPulses, followingCamera);
    this.glowingObjectsDrawer.draw(context, gameSession, followingCamera, elapsedTimeInSeconds);

    this.hudDrawer.draw(context, gameSession, isSoundEnabled, elapsedTimeInSeconds);
    this.screenOverlayDrawer.draw(context, gameSession, elapsedTimeInSeconds);
  }
}
