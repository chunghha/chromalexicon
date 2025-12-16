# Chroma Lexicon — Bun-only

A small React + TypeScript app (Vite) that uses the Google GenAI client to generate color-related text and images. This README documents how to run and build the project using Bun only and references the environment variable `GENMINI_API_KEY` used by the code.

---

## Requirements

- Bun (latest stable recommended). Confirm by running:
  - `bun --version`
- A Google GenAI API key with access to the models used in `services/geminiService.ts`.

This README intentionally covers Bun workflows only. It does not include npm, pnpm, or Node-specific instructions.

---

## Install dependencies (Bun)

From the project root (`chroma-lexicon`):

- Install all dependencies:
  - `bun install`

This will create (or use) `bun.lockb` and install the packages declared in `package.json`.

---

## Environment / API key

The service wrapper `services/geminiService.ts` reads the API key from `process.env.GENMINI_API_KEY`. For development with Vite + Bun, create a `.env.local` (or set the env var in your shell) next to `package.json`.

Example `.env.local` (DO NOT commit this file):

```
GENMINI_API_KEY=your_google_genai_api_key_here
```

If you intentionally want the key available in the client bundle (not recommended for secrets), change the code to read `import.meta.env.VITE_GENMINI_API_KEY` and instead set:

```
VITE_GENMINI_API_KEY=your_google_genai_api_key_here
```

Important notes:
- Do not commit `.env.local` to source control. Add `.env.local` to `.gitignore`.
- Vite exposes only variables that start with `VITE_` to client-side code via `import.meta.env`. `process.env` values are available to the dev server process but are not automatically embedded into client bundles.
- Prefer a server-side proxy (serverless function, small Bun server, or backend) that stores the API key and forwards requests to Google GenAI. This keeps secrets off the client.
- If you must run the GenAI client from the browser (not recommended), and you accept embedding the key, change the code to use `import.meta.env.VITE_GENMINI_API_KEY` and set `VITE_GENMINI_API_KEY` in `.env.local`. Be aware this will include the key in the client bundle — anyone can inspect it.

---

## Dev server (Bun)

Start the Vite dev server using Bun:

- `bun run dev`

If you need to pass the env var inline for the process:

- macOS / Linux (one-liner):
  - `GENMINI_API_KEY="sk_..." bun run dev`

- macOS / Linux (persistent in the shell session):
  - `export GENMINI_API_KEY="sk_..."`
  - `bun run dev`

- PowerShell (Windows):
  - `$env:GENMINI_API_KEY = "sk_..."`
  - `bun run dev`

Open the URL printed by Vite (typically `http://localhost:5173`).

---

## Build & Preview (Bun)

Build production assets:

- `bun run build`

Preview the production build:

- `bun run preview`

Vite will print a local URL for previewing the built app.

---

## Available scripts (from package.json)

Run them with `bun run <script>`:

- `dev` — start Vite dev server (`bun run dev`)
- `build` — build production bundle (`bun run build`)
- `preview` — preview the production bundle (`bun run preview`)
- `format` — run Biome formatter (`bun run format`)
- `lint` — run Biome linter (`bun run lint`)
- `check` — run Biome checks (`bun run check`)
- `check:all` — runs `bun check` (if you want Bun's integrated checks)

Example:
- Start dev: `GENMINI_API_KEY="sk_..." bun run dev`
- Build: `bun run build`

---

## Project layout (high level)

- `App.tsx`, `index.tsx` — application bootstrap and entry.
- `components/` — React UI components.
- `services/geminiService.ts` — wrapper around `@google/genai` used to produce text/images. This currently reads `process.env.GENMINI_API_KEY`.
- `constants.ts`, `types.ts` — constants and TypeScript types.
- `index.html`, `vite.config.ts` — Vite entry and configuration.

---

## Security & deployment recommendations

- Never commit API keys. Use `.env.local` and ensure it's in `.gitignore`.
- Prefer a server-side proxy (serverless function, small Bun server, or backend) that stores the API key and forwards requests to Google GenAI. This keeps secrets off the client.
- If you must expose a variable to the client bundle for testing (again not recommended), use the `VITE_` prefix (for example `VITE_GENMINI_API_KEY`) and read it with `import.meta.env.VITE_GENMINI_API_KEY`. Understand that any key embedded into the client bundle can be inspected by end users.

---

## Troubleshooting

- "GENMINI_API_KEY not found in environment variables" appears in console:
  - Ensure `.env.local` exists and contains `GENMINI_API_KEY=...`, or export `GENMINI_API_KEY` in your shell before `bun run dev`.
  - If the code runs client-side and you set `GENMINI_API_KEY`, it will not automatically be embedded — see the `VITE_` notes above.

- If image generation fails:
  - Confirm your API key has permission for the models used (`gemini-2.5-flash`, `gemini-2.5-flash-image`, etc.).
  - Check network and console logs for the exact error message returned by the GenAI client.

---

## Example .env.local (do not commit)

If you are running the GenAI calls from the Vite dev server or a server-side environment, use:

```
GENMINI_API_KEY=sk_...
```

If you intentionally want to expose the key to the client bundle (not recommended):

```
VITE_GENMINI_API_KEY=sk_...
```

---

## Next actions I can take for you

Tell me which of the following you want and I will implement it:
- Add an example `.env.local.example` to the repo.
- Update `services/geminiService.ts` to read `import.meta.env.VITE_GENMINI_API_KEY` (and update README accordingly).
- Add a minimal Bun-based serverless proxy or server route so GenAI calls run server-side and keep the API key secret.

---

Enjoy using Chroma Lexicon with Bun. If you want me to make any of the code/config changes above, tell me which one and I will update the project files accordingly.