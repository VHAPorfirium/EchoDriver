# Echo Diver

> Your sonar shows the way. It also tells them where you are.

Entry for the **Super Free AI Game Jam #2** (itch.io, Nov 7–14, 2026, no theme, AI allowed).
Short 2D browser game: you dive into pitch-black underwater caves, map them with sonar pings, and avoid the blind creatures that hunt by sound.

## How to play

| Key | Action |
|---|---|
| WASD / Arrows | Swim |
| Space / click | Sonar ping (also starts and continues screens) |
| M | Sound on/off |

- Every ping lights up the rock around you for a few seconds.
- Creatures within earshot swim to **where you pinged**. Ping, then move.
- Bumping into a drifting creature wakes it. You get a moment to swim away.
- Oxygen runs out. Glowing bubbles refill it. Pearls are a bonus for the final score.
- Reach the golden surface light. There are 3 caves: The Shallows, The Narrows and The Abyss.

## Running locally

ES modules need an HTTP server (opening `index.html` directly will not work):

```bash
npm start          # http-server on http://localhost:8080
npm test           # 30 automated tests (node --test)
npm run release    # creates release/ with only index.html and src/
```

To create the itch.io zip (PowerShell):

```powershell
npm run release
Compress-Archive -Path release\* -DestinationPath echo-diver-1.0.0.zip -Force
```

On itch.io: Kind of project = HTML, viewport 960×540, check "This file will be played in the browser".

## Architecture

Plain JavaScript + HTML5 Canvas, no engine, no build step. Clean Architecture in three layers:

```
src/
  domain/          pure game rules, no browser APIs
    GameConfiguration.js   all balance numbers in one place
    CaveLayout.js          cave grid built from text blueprints
    caveBlueprints.js      the 3 hand-made caves
    Diver.js               movement with wall sliding
    OxygenTank.js          oxygen in seconds
    SonarEmitter.js        cooldown, creates pulses
    SonarPulse.js          growing ring
    WallRevealMemory.js    when each rock tile was last touched by a ring
    CavePathFinder.js      breadth-first search on the tile grid
    Creature.js            drifting / startled / hunting behavior
    Collectible.js         oxygen bubbles and pearls
  application/
    GameSession.js         orchestrates phases, emits game events
    GamePhase.js, GameEventType.js
  infrastructure/
    CanvasGameRenderer.js  draws layers in order using one drawer per element
    drawers/               rock, sonar ring, creatures, diver, darkness, glow, HUD, screens
    audio/                 procedural Web Audio synthesizer + event-to-sound director
    KeyboardInputReader.js, CanvasClickInput.js, FollowingCamera.js
  main.js                  game loop wiring
```

- The game rules never know about drawing or sound. `GameSession` only records events (`SONAR_EMITTED`, `CREATURE_STARTED_HUNTING`...) and `GameAudioDirector` decides which sound to play.
- All balance numbers live in `GameConfiguration.js`.
- Tests cover the rules, the caves (equal row widths, solid border, exit and every item reachable), the full session flow and the release build (including an exact letter-case import check, because Windows ignores case and the itch.io server does not).

## AI usage

Developed with an AI assistant (Claude). See [docs/AI_USAGE.md](docs/AI_USAGE.md).

## Credits

- Font: [Share Tech Mono](https://fonts.google.com/specimen/Share+Tech+Mono) by Carrois Apostrophe, SIL Open Font License, via Google Fonts.
- All graphics are drawn in code on the canvas and all sounds are generated in real time with the Web Audio API. No image or audio files are used.
