# Project Mayflower — Web Client (Frontend Skeleton)

An interactive, client-side web application for Settlers of Catan strategy analysis, deterministic board playback (UI-03), and post-game decision diagnostics (UI-04 / UI-05).

---

## Prerequisites

Ensure you have the following installed on your machine:
* **Node.js**: v18.0.0 or later (LTS recommended)
* **npm**: v9.0.0 or later (bundled with Node.js)
* **Web Browser**: Desktop Chromium-based browser (Chrome, Edge, Brave)

---

## Getting Started Locally

### 1. Clone & Navigate to the Web Workspace
If you haven't already cloned the repository, clone it and change directory into `web/`:
```bash
git clone [https://github.com/](https://github.com/)<your-org>/<your-repo>.git
cd "Project Mayflower CS Capstone/web"
```

### 2. Install Dependencies
Install the required packages, including Tailwind CSS, Lucide React, and TypeScript tooling:
```bash
npm install
```
*(Note: If npm reports moderate vulnerabilities related to AST parsers in `typescript-eslint`, do **not** run `npm audit fix --force`, as it will downgrade configuration packages and break flat ESLint configs.)*

### 3. Run the Development Server
Start the local Vite development server with Hot Module Replacement (HMR):
```bash
npm run dev
```

Once the terminal outputs:
```text
  VITE v...  ready in ... ms

  ➜  Local:   http://localhost:5173/
```
Open **`http://localhost:5173/`** in your browser.

---

## Features & Interactive Controls

The frontend currently runs on static match fixtures (`src/fixtures/`) allowing end-to-end evaluation without active backend or database dependencies.

* **Demo Hub:** Switch between the Board Viewer and Game Review diagnostics.
* **Board Viewer (UI-03):** 
  * Displays the standard 19-hex board via pointy-topped axial coordinates.
  * Dynamically renders settlements, cities, roads, dice chits, probability pips, and robber movements across turns.
* **Turn-Zero Candidate Overlays (UI-04):**
  * On **Turn 0**, interactive candidate rings appear at key opening vertices.
  * Click numbered nodes (`#1`, `#2`, `#3`) to inspect win-probability deltas ($\Delta\text{EV}$) and statistical confidence tags (`≈ About Equal`).
* **Game Review Dashboard (UI-04 / UI-05):**
  * Interactive win-probability trendline for Player 1 (Red).
  * Decision review cards categorizing moves into standardized classifications (*Best*, *Good*, *Inaccuracy*, *Mistake*, *Blunder*).
  * Direct synchronization: click **"Inspect Board →"** on any turn to jump directly into the 2D board viewer at that exact turn index.

### Keyboard Shortcuts (Board View)
| Key | Action |
| --- | --- |
| `◀` (Left Arrow) | Step backward one turn |
| `▶` (Right Arrow) | Step forward one turn |
| `Space` | Toggle replay autoplay |

---

## 🔍 Verification & Linting

Before pushing changes or submitting Pull Requests, run the type checker and linter:
```bash
# Type check and lint
npm run lint

# Build production bundle
npm run build
```

---

## ⚠️ Troubleshooting

* **`ERR_CONNECTION_REFUSED` on port 5173:**  
  Make sure `npm run dev` is running in your terminal. If port 5173 is already in use by another service, Vite will automatically increment the port (e.g., to `http://localhost:5174/`); check the terminal output for the active URL.
* **TypeScript cannot find module or type declarations:**  
  If moving or adding components results in `ts(2307)` or `ts(2322)` caching errors in VS Code, open the Command Palette (`Ctrl + Shift + P`) and execute **`TypeScript: Restart TS Server`**.




# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
