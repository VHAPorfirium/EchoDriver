const keysThatMoveUp = ["ArrowUp", "KeyW"];
const keysThatMoveDown = ["ArrowDown", "KeyS"];
const keysThatMoveLeft = ["ArrowLeft", "KeyA"];
const keysThatMoveRight = ["ArrowRight", "KeyD"];
const keysThatTriggerAction = ["Space", "KeyE", "Enter"];
const keysThatToggleSound = ["KeyM"];
const allGameKeys = [...keysThatMoveUp, ...keysThatMoveDown, ...keysThatMoveLeft, ...keysThatMoveRight, ...keysThatTriggerAction, ...keysThatToggleSound];

/** Lê o teclado. A ação (Espaço/E/Enter) dispara o sonar no mergulho e avança nas telas. */
export class KeyboardInputReader {
  constructor(eventTarget) {
    this.currentlyPressedKeyCodes = new Set();
    this.wasActionKeyPressedSinceLastRead = false;
    this.wasSoundToggleKeyPressedSinceLastRead = false;

    eventTarget.addEventListener("keydown", (keyboardEvent) => this.handleKeyDown(keyboardEvent));
    eventTarget.addEventListener("keyup", (keyboardEvent) => this.currentlyPressedKeyCodes.delete(keyboardEvent.code));
    eventTarget.addEventListener("blur", () => this.currentlyPressedKeyCodes.clear());
  }

  handleKeyDown(keyboardEvent) {
    if (allGameKeys.includes(keyboardEvent.code)) {
      keyboardEvent.preventDefault();
    }
    if (!keyboardEvent.repeat && keysThatTriggerAction.includes(keyboardEvent.code)) {
      this.wasActionKeyPressedSinceLastRead = true;
    }
    if (!keyboardEvent.repeat && keysThatToggleSound.includes(keyboardEvent.code)) {
      this.wasSoundToggleKeyPressedSinceLastRead = true;
    }
    this.currentlyPressedKeyCodes.add(keyboardEvent.code);
  }

  isAnyKeyPressed(keyCodes) {
    return keyCodes.some((keyCode) => this.currentlyPressedKeyCodes.has(keyCode));
  }

  readAxis(negativeKeys, positiveKeys) {
    return Number(this.isAnyKeyPressed(positiveKeys)) - Number(this.isAnyKeyPressed(negativeKeys));
  }

  /** Lê o estado atual das teclas. Os "acabou de apertar" são consumidos na leitura. */
  readPlayerInputState() {
    const playerInputState = {
      movementDirection: {
        x: this.readAxis(keysThatMoveLeft, keysThatMoveRight),
        y: this.readAxis(keysThatMoveUp, keysThatMoveDown),
      },
      wasActionKeyJustPressed: this.wasActionKeyPressedSinceLastRead,
      wasSoundToggleKeyJustPressed: this.wasSoundToggleKeyPressedSinceLastRead,
    };
    this.wasActionKeyPressedSinceLastRead = false;
    this.wasSoundToggleKeyPressedSinceLastRead = false;
    return playerInputState;
  }
}
