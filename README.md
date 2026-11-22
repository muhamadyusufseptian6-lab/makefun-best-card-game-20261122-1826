# Starfall Pact

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/muhamadyusufseptian6-lab/makefun-best-card-game-20261122-1826/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/muhamadyusufseptian6-lab/makefun-best-card-game-20261122-1826/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

An original turn-based card duel beneath the Hollow Moon. You face the **Warden of the Hollow Moon** with a 24-card deck of falling-star cards. Each side has 20 life; bring the Warden's life to 0 to win the pact.

## How to play

- **Mana** starts at 1 and grows by 1 each turn (max 6). Every card costs mana.
- **Draw** 1 card each turn; your hand holds at most 7 cards.
- **Four elements**, told apart by colour and shape: Ember (red flame), Tide (blue wave), Thorn (green leaf), Stone (grey mountain).
- **Advantage cycle:** Ember beats Thorn, Thorn beats Stone, Stone beats Tide, Tide beats Ember. Attacking with the advantaged element deals **+2 power** against the rival's guard element (the element of the last card they played).
- **Resonance:** playing 2 or more cards of the same element in one turn gives each of them **+1 power**.
- **Effects:** Mend heals 3 life, Draw draws 1 card, Ward blocks the next 3 damage.
- **Score:** damage dealt + 5 per card played + 2 per life left when you win.
- The Warden plays by a readable heuristic — it strikes hardest when it can, and mends or wards when its life runs low — and explains every move in the battle log, so you can read its plan and counter it.

## Controls

- **Mouse:** click a hand card to select it, click again to play it. Click **END TURN** to pass.
- **Keys 1–7:** select a hand card. **Enter / Space:** play the selected card, or end the turn. **R:** restart. **M:** mute.
- Sound is tiny synthesized WebAudio bleeps only — no audio files.

## Run it

Serve `game/` with `node serve.ts` and open http://localhost:8080, or open `game/index.html` directly in a desktop browser. Everything is local static files; the game makes no network request.

`?shot=start|play|win|lose&seed=1` renders that exact scene immediately on load (used for the screenshots).

## Layout

- `game/src/config.js` — rules, elements and the 12 card types
- `game/src/deck.js` — seeded RNG, deck building and drawing
- `game/src/ai.js` — the Warden's heuristic and its log lines
- `game/src/render.js` — all canvas drawing: table, cards, HUD, screens
- `game/src/input.js` — mouse, keyboard and synthesized sound
- `game/src/shots.js` — the four screenshot scenes
- `game/src/main.js` — state machine, turns and scoring
- `main.ts` — hands the entry in (copies `game/` + `screenshots/`, writes `dossier.json`)

---

Built for the make.fun bounty "Make the best card game". Play more bounties with referral code **515temp1** — https://make.fun/r/515temp1
