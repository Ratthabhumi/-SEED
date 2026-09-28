# itch.io Release

## Build

```powershell
npm run check
npm run build
npm run zip
npm run release:verify   # must print release:verify OK (17 checks)
```

`release/seed-web-v0.1.0.zip` contains `index.html` at root with relative asset
paths (`base: "./"`). No backend required. Limits (HTML5): ≤1000 files, ≤500 MB
extracted, single file ≤200 MB — this build is ~2 MB / dozens of files.

## Upload (itch.io → New project → Kind: HTML)

1. Upload the ZIP, tick **"This file will be played in the browser"**.
2. Embed options: 1280×720, enable mobile-friendly if stable, fullscreen button on.
3. Publish + set version `v0.1.0`.

## Draft metadata

- **Title:** -SEED
- **Short:** Every seed is a different history. Take a civilization from stone tools
  to the stars — in a single survivor run.
- **Tags:** roguelite, survivors-like, procedural, singleplayer, browser, thai
- **Controls:** WASD/arrows move · Space dash · 1/2/3 or click draft · Esc pause · F3 debug
- **Requirements:** Modern browser with WebGL, keyboard recommended.
- **AI disclosure:** Code/text created with LLM assistance (OpenCode + Muse Spark),
  reviewed by maintainer. Runtime procedural generation is the game's own
  deterministic algorithm, not generative AI (per itch guidelines). No third-party
  copyrighted assets.
- **Version/credits:** v0.1.0, see CREDITS.md in repo.
