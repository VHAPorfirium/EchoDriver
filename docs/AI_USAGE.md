# AI usage

This game was made for the Super Free AI Game Jam #2, where AI use is fully allowed.

**AI tool used:** Claude (Anthropic), as a coding and design assistant.

**What the AI did**

- Wrote the JavaScript code (game rules, rendering, procedural audio, tests) following the architecture I asked for: Clean Architecture, SOLID, descriptive names.
- Designed the 3 caves as text blueprints and balanced them with an automated bot that dove each cave 30 times. The first version of The Narrows had a creature right on the starting path that killed the bot 30 out of 30 times, so that creature was moved.
- Suggested the "startled" rule: bumping into a drifting creature wakes it, but it needs 0.8 s to turn, so the player gets a chance to swim away.
- Wrote the in-game texts and this page's description.

**What I did by hand**

- Chose the jam and the concept, set the scope and the deadline plan.
- Reviewed, played and tested the game, and made the final decisions.
- Set up the itch.io page and submitted the game.

**No AI-generated images or audio files:** all graphics are drawn in code and all sounds are synthesized in real time with the Web Audio API.

**Made during the jam:** the repository was created on Nov 14, 2026, inside the submission window (Nov 7, 23:10 to Nov 14, 23:10, Brasília time). Some infrastructure (release script, letter-case import test, iframe focus fix, keyboard reader, camera, darkness layer) was adapted from my earlier jam projects (Spore Floor and Last Ember). The game content (caves, sonar, creatures, oxygen, art, audio) is new.
