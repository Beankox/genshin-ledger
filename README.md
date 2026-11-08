# Character Ledger – Genshin Impact

A personal account dashboard: track owned characters, levels, ascension, constellations, friendship,
talents, weapons, artifacts and notes. Everything saves in your browser (LocalStorage). Custom characters get ids like `custom-name`.

## First-time setup (once)
1. Install **Node.js 20 or newer** (the "LTS" download from https://nodejs.org).
2. Open a terminal **inside this folder** (the one containing `package.json`).
3. Install the project's packages:
   ```
   npm install
   ```

## Run it
```
npm run dev
```
Open the address it prints (usually http://localhost:5173). Edits to the code appear instantly.
Stop the server with `Ctrl + C`.

## Other commands
- `npm test`        – runs the unit tests for the rules in `src/lib/ledger.ts`
- `npm run build`   – checks the TypeScript and creates a production version in `dist/`
- `npm run preview` – serves that production version locally

## Where things live
```
src/
  data/characters.ts   The roster. Add a character by adding one line.
  data/constants.ts    Elements, colours, artifact sets, weapon names, stat lists
  types.ts             The shapes of all data
  lib/ledger.ts        Rules (level/ascension), validation, defaults
  lib/storage.ts       LocalStorage, JSON export, image resizing
  hooks/useLedger.ts   All app state + actions (the single source of truth)
  components/          Reusable UI pieces (cards, modal, steppers, portrait…)
  pages/               Dashboard, Collection, CharacterDetail, Data
  styles.css           The whole design system (colours at the top in :root)
```

## Materials
Each character has a **Materials** panel. Pick the talent book (grouped by nation, with farming days) and type the boss drop, local specialty, enemy drops and weekly boss drop they use. The ascension gem is chosen from the element automatically. Below that, the app totals what is still needed to reach ascension phase 6 and talent level 10, based on the character's current ascension and talent levels. Character EXP, and the enemy drops that talents use, are not counted. Item names come from Game8's Character Ascension Materials page, and each character has a **Game8 guide** link (`src/data/guides.ts`) that lists which materials they use.

## Portraits
Images are optional. Three ways to add them:
- Put `hu-tao.png` (the character's id) into `public/portraits/`. It is picked up when you start `npm run dev` or build (restart the dev server after adding files).
- Use **Edit info** on a character and paste an image URL.
- Use **Edit info → Upload image** (it is shrunk and saved in your browser).

Characters without an image get a generated placeholder.

## Backups
**Data → Export JSON** downloads everything. **Import JSON** restores it. Before an import or reset, the previous data is kept once so **Restore previous data** can undo it. Clearing your browser's
site data deletes the LocalStorage copy, so export occasionally.

## Put it online (GitHub Pages)
1. Upload this project to a GitHub repository (branch `main`).
2. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Open the **Actions** tab and wait for "Deploy to GitHub Pages" to turn green (about 1 minute).
4. Your link is `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`. Share it with friends.
Each visitor's data is saved in their own browser, so friends never see or change yours.
