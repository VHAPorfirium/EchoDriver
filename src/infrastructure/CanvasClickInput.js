/**
 * Dentro do iframe do itch.io o teclado só funciona depois que o jogo recebe foco.
 * O clique dá esse foco e também vale como a tecla de ação (sonar ou avançar tela).
 */
export class CanvasClickInput {
  constructor(canvasElement) {
    this.wasCanvasClickedSinceLastRead = false;

    canvasElement.addEventListener("pointerdown", () => {
      window.focus();
      canvasElement.focus();
      this.wasCanvasClickedSinceLastRead = true;
    });
  }

  combineWithKeyboardInput(playerInputState) {
    const combinedPlayerInputState = {
      ...playerInputState,
      wasActionKeyJustPressed: playerInputState.wasActionKeyJustPressed || this.wasCanvasClickedSinceLastRead,
    };
    this.wasCanvasClickedSinceLastRead = false;
    return combinedPlayerInputState;
  }
}
