# SubLingo

**Learn languages by watching YouTube with dual subtitles.**

SubLingo is a browser extension that overlays two synchronized subtitle tracks on top of any YouTube video — your native language and the language you're learning — so you can follow along and pick up vocabulary in context, without leaving the video.

**[Install SubLingo from the Chrome Web Store](CHROME_WEB_STORE_LINK_HERE)**

---

## Features

- **Dual subtitles, always synced** — a primary line and a "learning" line displayed together, pulled directly from YouTube's own caption data.
- **Works with auto-generated and auto-translated captions** — if a video doesn't have your chosen language natively, SubLingo asks YouTube to auto-translate from whatever caption track *is* available.
- **Click any word for an instant translation** — tap a word in either subtitle line to see a quick translation, with your last 20 lookups saved under **History**.
- **Fully customizable appearance** — font, text size, primary/secondary colors, outline color and thickness, and background opacity, all live-editable from the popup.
- **Built-in style presets** — Netflix, Prime Video, YouTube Classic, and Clean Minimal, plus the ability to save your own custom presets.
- **Draggable, on-video positioning** — move the subtitle box anywhere within the video's own bounds, correctly across normal, theater, and fullscreen modes.
- **100+ supported languages** — pick any primary/learning language pair from a full, searchable language list.
- **Free and open source.**

---

## How it works

YouTube doesn't expose a simple "give me two caption tracks at once" API, so SubLingo works by:

1. Reading the video's available caption tracks directly from the YouTube player.
2. Requesting your **primary** language track — natively if the video has it, or via YouTube's own auto-translate feature if it doesn't.
3. Doing the same for your **secondary (learning)** language track, a moment later so the two requests don't collide.
4. Intercepting both responses, parsing YouTube's timed-text format, and rendering them as a single synchronized overlay drawn inside the video's own boundaries — positioned, styled, and interactive independently of YouTube's native caption UI (which is hidden while SubLingo is active).

For the click-to-translate feature, the clicked word (and the language of the line it came from) is sent to a lightweight translation lookup, and the result is cached in your local translation history.

Because SubLingo relies entirely on captions YouTube itself provides:
- If a video has **no captions at all**, SubLingo can't show anything either.
- Translation quality depends on the underlying caption track — manually-written captions are more accurate than auto-generated (ASR) ones — and on YouTube's own translation engine when auto-translate is used.

---

## Installation

The easiest way to get SubLingo is straight from the Chrome Web Store:

**[Install SubLingo](CHROME_WEB_STORE_LINK_HERE)**

Once installed, open any YouTube video and the SubLingo overlay will appear automatically once captions are available.

### Running from source (for development)

```bash
git clone https://github.com/RaphaelCovan/sublingo.git
cd sublingo
npm install
npm run dev
```

Then load it into Chrome:

1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `dist` folder produced by the dev/build command

---

## Tech stack

- **React + TypeScript**, bundled with **Vite**
- **CRXJS Vite plugin** for Manifest V3 extension tooling
- **Manifest V3** — content scripts, a background service worker, and a `MAIN`-world hook script for player interception
- No external UI frameworks — all styling is hand-rolled CSS, rendered inside a Shadow DOM to stay isolated from YouTube's own styles

### Project structure

```
src/
  background/       Service worker — handles word-translation lookups
  content/           Injected into YouTube pages
    hook.ts          MAIN-world script — talks to YouTube's player directly
    index.tsx         Isolated-world content script — orchestration, state, rendering
    SubtitleOverlay.tsx   The draggable, clickable subtitle UI itself
  core/
    engine/          Subtitle timing/sync logic
    types/           Shared type definitions
  platforms/youtube/ YouTube-specific caption parsing and track discovery
  shared/            Settings storage, language list, presets, links
  App.tsx            The extension's popup UI
  manifest.config.ts Extension manifest (CRXJS format)
```

---

## Known limitations

- **YouTube only**, for now — see [Roadmap](#roadmap).
- Requires the video to have *some* caption track (manual or auto-generated) in a language SubLingo can translate from.
- Click-to-translate uses word-level lookups rather than full sentence context, so results can occasionally miss nuance that a native speaker would catch from surrounding context.
- Chrome-only (Manifest V3, CRXJS-based build).

---

## Roadmap

- Support for additional streaming platforms beyond YouTube.
- More context-aware word translations.

---

## Feedback & bug reports

SubLingo is developed solo, and isn't currently open to outside code contributions. If you run into a bug, have a feature request, or just want to share feedback, reach out at **sublingosupport@gmail.com** — if it's a bug, including the video URL, your primary/learning language settings, and any relevant console output (`F12` → Console) helps a lot.

---

## Support

SubLingo is free and developed independently. If it's helped you learn a language, consider [supporting the project](https://ko-fi.com/sublingo) — it goes directly toward keeping development going.

---

## License

MIT — see [LICENSE](LICENSE) for details. You're free to use, modify, and redistribute this code, provided the original copyright notice is retained.

---

Developed by [@RaphaelCovan](https://github.com/RaphaelCovan)
