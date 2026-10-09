# ⚡ Flashle — The Daily CW The Flash Guessing Game

[![CI](https://github.com/abdurahmankrsk/flashle/actions/workflows/ci.yml/badge.svg)](https://github.com/abdurahmankrsk/flashle/actions/workflows/ci.yml)

> An authentic, daily character guessing game based on **The CW's The Flash (2014–2023)**.
>
> ⚡ **Play Live**: [https://flashle-game.vercel.app/](https://flashle-game.vercel.app/)

**Flashle** challenges fans to identify a mystery Arrowverse character every day using deductive reasoning, attribute clues, powers, and show lore.

---

## ⚡ Features

- **Daily Mystery Character**: Everyone receives the same mystery character on any given calendar day (synced to midnight daily).
- **Unlimited Practice Mode**: Practice anytime with random characters from the 62-character roster.
- **62 Canonical CW Characters**: Deeply researched roster covering heroes, Rogues, speedsters, Harrison Wells variants, CCPD officers, and multiversal allies across all 9 seasons.
- **Attribute Comparison Engine**:
  - **Character**: High-resolution face portrait & full character name
  - **Gender**: Male / Female / Other
  - **Species**: Human, Metahuman, Kryptonian, Gorilla, Shark-Human, Cosmic / Entity, Avatar / Entity
  - **Powers**: Canonical powers (Super Speed, Vibrations, Cryokinesis, Pyro-Tech, Cryo-Tech, Telepathy, Hemokinesis, Mirror Manipulation, etc., or None)
  - **Alignment**: Hero, Villain, Anti-Hero, Neutral (with partial color clues for related alignments)
  - **Debut Season**: Seasons 1 to 9 with directional stem arrows (↑ Later season, ↓ Earlier season) and yellow indicator for adjacent season ($\pm 1$)
  - **Origin Earth**: Earth-1 / Prime, Earth-2, Earth-3, Earth-19, Earth-38, Multiverse
  - **Affiliations & Teams**: Team Flash, CCPD, Rogues, STAR Labs, Legends of Tomorrow, A.R.G.U.S., etc. (with shared team detection)
- **Wordle / LoLdle-Style Clue System**:
  - 🟩 **Green**: Exact Match
  - 🟨 **Yellow**: Partial / Close Match
  - 🟥 **Red**: No Match
- **Intelligent Search & Autocomplete**: Search by character name, hero/villain alias (e.g., *Zoom*, *Vibe*, *Killer Frost*, *Godspeed*, *Captain Cold*), or actor name (e.g., *Grant Gustin*, *Carlos Valdes*).
- **Daily Difficulty Cycle**: 40% chance of Easy, 30% Medium, and 30% Hard, with difficulty displayed in-game.
- **Share Results**: Generates spoiler-free emoji grids (`🟩`, `🟨`, `🟥`, `⬆️`, `⬇️`) to share with friends via native share or clipboard.
- **Persistent Player Statistics**: Tracks games played, win percentage, current streak, max streak, and guess distribution (1 to 8 attempts) using `localStorage`.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **FX**: [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Testing**: [Vitest](https://vitest.dev/) (19 unit & integration tests)
- **Linter**: [Oxlint](https://oxc.rs/)

---

## ⚖️ Legal & Disclaimer

*Flashle* is an unofficial fan tribute project created for educational and entertainment purposes. *The Flash*, characters, logos, and related Arrowverse indicia are © DC Comics, Warner Bros. Television, and The CW Network. This project is not affiliated with or endorsed by DC Comics, Warner Bros., or The CW.
