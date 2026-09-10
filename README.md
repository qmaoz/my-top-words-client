# My Top Words — client

React (Vite) UI for learning vocabulary in example sentences.

## Run locally

```bash
npm install
```

Copy `.env.example` to `.env`. Point `VITE_APP_API_URL` at the API (`http://localhost:3001` locally).

```bash
npm run dev
```

The app is at `http://localhost:5173`. The API (`my-top-words-server`) must be running.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm test` — unit tests
- `npm run lint` — ESLint

## Layout

- `src/pages` — routes (`auth/`, `Profile/`, `Admin/`)
- `src/components` — UI
- `src/layout` — header, footer, shells
- `src/hooks` / `src/utils` — hooks and helpers
- `src/i18n` — UI translations
- `src/redux` — client state
- `src/api` — HTTP client
- `src/theme` — MUI theme and CSS variables
