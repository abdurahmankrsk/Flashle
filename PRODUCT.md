# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
CW's *The Flash* (2014–2023) fans, Arrowverse enthusiasts, and daily puzzle gamers (Wordle/LoLdle fans) looking for a fast, daily deductive trivia challenge on desktop or mobile.

## Product Purpose
Flashle challenges players to identify a secret daily character from *The Flash* using attribute clues (gender, species, powers, alignment, debut season, origin Earth, and affiliations), feedback colors (green/yellow/red), and direction stems. It provides a quick, satisfying daily lore challenge and unlimited practice play.

## Positioning
An authentic, laser-focused daily deductive guessing game dedicated strictly to CW's *The Flash* TV series (Seasons 1–9), featuring deeply researched canonical attributes, alias search, actor hints, and spoiler-free emoji share grids.

## Operating Context
- Played in short daily sessions (1–3 minutes), often on mobile browsers or shared via chat apps (Discord, WhatsApp, Twitter/X).
- Client-side static single page app with instant response, local persistence via `localStorage`, and zero account/login barrier.
- Synced to midnight daily for the global daily character, alongside an unconstrained practice mode and past game archive.

## Capabilities and Constraints
- **Platform & Stack**: React 19, TypeScript, Tailwind CSS v4, Vite 8; 100% client-side SPA deployed on Vercel.
- **Roster Scope**: Strictly canonical characters from *The Flash* (Seasons 1–9), covering heroes, Rogues, speedsters, Harrison Wells variants, CCPD officers, and multiversal allies.
- **Game Modes**: Daily puzzle (shared daily seed), Practice Mode (randomized from roster), and Archive Mode (past dates).
- **Comparison Engine**: 7 comparative attributes: Gender, Species, Canonical Powers, Alignment, Debut Season (with relative arrow clues), Origin Earth, and Affiliations.
- **Data Persistence**: Local storage tracks daily completion, streak, win percentage, and guess distribution without server dependencies.
- **Legal Constraint**: Unofficial non-commercial fan tribute; strictly respects DC Comics / Warner Bros. / The CW intellectual property boundaries with appropriate disclaimers.

## Brand Commitments
- Name: **Flashle**
- Identity & Vibe: The Flash Speed Force motif (crimson and gold / yellow lightning, dark mode S.T.A.R. Labs aesthetic, iconic lightning emblem).
- Author: Abdurahman Karišik (@abdurahmankrsk).

## Evidence on Hand
- Complete 62-character database with high-resolution portraits, aliases, actor names, and verified canon attributes in [`src/data/characters.ts`](file:///c:/Users/abdur/OneDrive/Desktop/Abdurahman/Flashle/src/data/characters.ts).
- Working comparison engine, daily seed generation, and test suite with 19 passing tests in [`src/game/`](file:///c:/Users/abdur/OneDrive/Desktop/Abdurahman/Flashle/src/game/).
- Production deployment on Vercel at [flashle-game.vercel.app](https://flashle-game.vercel.app/).

## Product Principles
1. **Frictionless Daily Loop**: Instant load, zero sign-in barrier, snappy autocomplete search, and immediate attribute feedback.
2. **Lore Authenticity**: Accurate show-accurate data across all 9 seasons; no invented powers or contradictory lore.
3. **Mobile-First Clarity**: Attribute grid and tiles must remain effortlessly readable, legible, and scannable on small handheld screens.
4. **Spoiler-Free Social Sharing**: Result sharing must preserve mystery and spark friendly competition via emoji score grids.

## Accessibility & Inclusion
- High contrast color coding with redundant directional arrows for season comparison.
- Clear visual indicators alongside color codes (green/yellow/red) to support color-blind players.
- Keyboard navigation and accessible ARIA labels for search inputs, buttons, and modal dialogs.
