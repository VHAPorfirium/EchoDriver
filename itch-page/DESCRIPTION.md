# Texto da página no itch.io (Echo Diver)

Tudo entre "COPIE DAQUI" e "ATÉ AQUI" vai no campo **Description** da página do jogo, em inglês.
Depois da descrição está o passo a passo de cada campo do formulário do itch.io (em português).

---------------------------------------- COPIE DAQUI ----------------------------------------

**Your sonar shows the way. It also tells them where you are.**

You are a diver lost in pitch-black underwater caves. You cannot see the walls. You can only send out a sonar ping and watch the echo trace the rock for a few seconds before the dark swallows it again.

But you are not alone down here. The creatures in these caves are blind, and they hunt by sound.

## How to play

- **Ping** to reveal the cave around you for a few seconds.
- Every creature that hears the ping swims to **where you pinged**. Ping, then move.
- Bumping into a drifting creature wakes it up. It needs a moment to turn around: swim away.
- Your **oxygen** runs out. Glowing bubbles refill it.
- **Pearls** are a bonus for your final score.
- Reach the golden **surface light** to clear the cave. There are 3 caves: The Shallows, The Narrows and The Abyss.

## Controls

| Key | Action |
|---|---|
| WASD or Arrow keys | Swim |
| Space or Click | Sonar ping / continue |
| M | Sound on / off |

## Play with sound

Headphones are recommended. The ping echoes through the cave, and you will hear the creatures growl when they start hunting you.

## Features

- A single tense decision, again and again: information or silence?
- 3 hand-made caves with rising difficulty
- Blind creatures that path-find their way to every sound you make
- All graphics are drawn in code and all sounds are synthesized live in the browser
- Short: a full run takes about 5 to 10 minutes

## Credits

- Design and direction: Victor Hugo
- Font: **Share Tech Mono** by Carrois Apostrophe, licensed under the SIL Open Font License (via Google Fonts)
- No image or audio files are used: all visuals are drawn on the canvas and all sounds are generated with the Web Audio API.

## AI disclosure

This game was made for the Super Free AI Game Jam #2, where AI use is fully allowed.

- **AI tool used:** Claude (Anthropic), as a coding and design assistant.
- **What AI made:** the JavaScript code (rules, rendering, procedural audio, automated tests), the cave layouts and the in-game texts. The caves were balanced with an automated bot that dove each cave 30 times. In the first version of The Narrows, a creature sat right on the starting path and the bot died 30 out of 30 times, so that creature was moved.
- **What I made by hand:** choosing the jam and the concept, setting the scope, playtesting, and all final decisions.
- **Made before the jam:** some infrastructure (release script, iframe focus fix, keyboard reader, camera, darkness layer) was adapted from my earlier jam games. All game content is new.

Made for **Super Free AI Game Jam #2**. Built with plain JavaScript and HTML5 Canvas, no engine.

Source code: https://github.com/VHAPorfirium/EchoDriver

---------------------------------------- ATÉ AQUI ----------------------------------------

## Passo a passo no itch.io

0. **Antes de tudo:** faça o commit e o push. No PowerShell, dentro da pasta EchoDriver:
   - `git add .`
   - `git commit -m "Echo Diver 1.0.0"`
   - `git push`

   Se o repositório for privado, apague a linha "Source code" da descrição ou deixe o repositório público.
1. **Criar o projeto:** no seu painel do itch.io, clique em *Create new project*.
2. **Title:** `Echo Diver`
3. **Project URL:** `echo-diver`
4. **Short description or tagline:** `Your sonar shows the way. It also tells them where you are.`
5. **Classification:** Games
6. **Kind of project:** HTML
7. **Release status:** Released
8. **Pricing:** No payments
9. **Uploads:**
   - suba o `echo-diver-1.0.0.zip` (fica na raiz da pasta EchoDriver);
   - marque **This file will be played in the browser**.
10. **Embed options:**
    - Viewport dimensions: **960 x 540**;
    - marque **Fullscreen button**;
    - deixe **Click to launch** (o clique já dá foco ao teclado e libera o som);
    - **não** marque *Mobile friendly* (o jogo precisa de teclado).
11. **Details > Description:** cole o texto acima.
12. **Genre:** Action (ou Adventure)
13. **Tags** (até 10): `atmospheric`, `dark`, `underwater`, `sonar`, `stealth`, `exploration`, `2d`, `short`, `horror`, `ai-generated`
14. **Uso de IA:** se o formulário tiver o campo de declaração de IA generativa (*AI generation disclosure*), marque que o projeto usou IA e escolha as opções de código e texto. Arte e áudio não são gerados por IA, são desenhados e sintetizados em código. A descrição já explica isso na seção "AI disclosure".
15. **Cover image:** `cover-630x500.png`
16. **Screenshots:** suba nesta ordem:
    - `gameplay.gif`
    - `screenshot-3-creature-revealed.png`
    - `screenshot-5-the-abyss.png`
    - `screenshot-2-first-ping.png`
    - `screenshot-4-the-narrows.png`
    - `screenshot-6-low-oxygen.png`
    - `screenshot-1-title.png`
17. **Inputs:** Keyboard, Mouse
18. **Languages:** English
19. **Average session:** A few minutes
20. **Visibility:** salve primeiro como **Draft**.
    - Abra a página e jogue pelo navegador: clique para começar, nade, pingue, ouça o som, teste a tecla M e passe pelo menos da primeira caverna.
    - Se estiver tudo certo, mude para **Public** e salve.
21. **Enviar para a jam:**
    - abra https://itch.io/jam/super-free-ai-game-jam-2;
    - clique em **Submit your project** e escolha o Echo Diver;
    - confira se ele aparece na aba **Submissions**;
    - tire print da página do jogo e da tela de envio para o relatório da AED.
22. **Depois do envio:** avalie de 5 a 10 jogos de outros participantes (é regra da jam).

Prazo: **14/11/2026 às 23:10 (horário de Brasília)**. Envie com folga.
