# Blood Pop // 16.09

A time-locked, mobile-first birthday page. It stays sealed behind a live
countdown until **16 September 2026, 00:00 WIB**, glitches through the
rollover, and opens into a soundtracked interactive experience.

**Andheri, Mumbai → Sampit, Central Kalimantan — 5,000 km.** (Great-circle:
5,000.2 km. The number is computed from the coordinates in `config.ts`, so it
can never drift out of sync with the map.)

**Live:** <https://for-you-cutieee.pages.dev>

```
npm install
npm run dev      # http://localhost:5173 — also served on your LAN for phone testing
npm run build    # → dist/
npm run preview  # serve the production build locally
npm run deploy   # build + push live to Cloudflare Pages
```

---

## Your way in before the 16th

**Long-press the "CHANNEL LOCKED" chip on the lock screen for about 1.2
seconds.** A key box slides out from under it. Type your key, hit enter, and
you're inside the full experience — no waiting for September.

**Change the key first.** It's `PREVIEW_KEY` in `src/config.ts`, currently
`'andheri'`. Pick something she wouldn't guess — not her birthday, not her
name. Matching ignores case and surrounding spaces.

Three things make this safe to leave in the version you send her:

- **Nothing on screen suggests the chip is pressable.** It reads as a status
  readout, because it is one.
- **A stray long-press reveals only an empty key box**, which does nothing
  without the key and closes on `esc`.
- **Previewing never spends her first visit.** The full-screen midnight burst is
  gated on a `localStorage` flag that preview mode deliberately does not write —
  so the big moment is still untouched and waiting for her.

While you're in, a small **PREVIEW MODE** badge sits at the bottom with an ✕ to
drop you back to the lock screen. The preview lives in `sessionStorage`, so it
survives a refresh while you're working but evaporates when you close the tab.

There are also URL flags, handy on desktop while you're editing. None of them
fire on their own — the plain link you send her behaves normally:

| URL        | Effect                                                    |
| ---------- | --------------------------------------------------------- |
| `?unlock`  | Skip the gate entirely.                                   |
| `?locked`  | Force the lock screen, even after the real unlock moment.  |
| `?soon=10` | Pretend the unlock is 10 seconds away — rehearses the glitch, confetti and hand-off end to end. |

Reset her progress (opened envelopes, signal count, the once-only welcome burst)
by clearing site data, or in the console:

```js
;['bp.opened', 'bp.signals', 'bp.welcomed'].forEach((k) => localStorage.removeItem(k))
```

---

## Writing her content

**Everything she reads lives in one file: [`src/config.ts`](src/config.ts).** You
never need to open a component. Edit it, save, and the page updates instantly in
the dev server — you don't even have to reload.

Here's what maps to what.

### Her name, and where you both are

```ts
recipient: {
  name: 'Sayang',        // ← the big name under HAPPY BIRTHDAY
  city: 'SAMPIT',        // ← the map node + the footer
  region: 'KALIMANTAN, ID',
  coords: { lat: -2.5333, lon: 112.95 },   // moves the map pin; distance recomputes
}
```

### Card 1 — the letter

`LETTER`. Each string in `paragraphs` is one paragraph; add or remove as many as
you like and they animate in one after another.

```ts
export const LETTER = {
  greeting: 'Hey you,',
  paragraphs: [
    'Write like you talk. This is the longest thing on the page and the one she will reread.',
    'Add another paragraph just by adding another line here.',
  ],
  signoff: 'All of it, always,',
  signature: '— yours',
}
```

### Card 2 — the photo carousel

Drop images into `public/images/memories/`, then describe them in `MEMORIES`.
The array length drives everything — add a fifth entry and you get a fifth slide
and a fifth dot, nothing else to change.

```ts
{ src: '/images/memories/01.jpg', caption: 'What was happening here.', date: 'a tuesday' },
```

A photo you haven't added yet shows a labelled placeholder instead of breaking,
so you can write all the captions now and add the pictures later.

### Card 3 — the voice note

Record on your phone, save it as `public/audio/voice-note.mp3`, and set
`AUDIO.voiceNoteTitle` to whatever should sit above the player.

### Card 4 — the treat

`TREAT` — the code, the headline, the description, and the `steps` timeline. Set
`done: true` on the steps that should show as already completed.

### The lyric cards on the hero

`LYRICS`. Each `t` is **the second in the song** when that line should appear;
`accent: true` makes a line glow. Once you have the real track, play it and note
the timings.

```ts
{ t: 22, text: 'happy birthday', accent: true },
```

### The card titles themselves

To rename an envelope ("Open When You Can't Sleep"), that one lives in `CARDS` at
the top of [`src/components/OpenWhenVault.tsx`](src/components/OpenWhenVault.tsx)
— title, hint and icon.

---

## Media

See the READMEs in `public/audio/` and `public/images/memories/`. Both are
optional; the app degrades gracefully if a file is missing, so nothing breaks if
you ship before you've picked the photos.

---

## Deploying

The site is on **Cloudflare Pages**, deployed by direct upload — your source
never leaves your machine, so her letter, photos and voice note are not on
GitHub or anywhere else public. Only the built `dist/` folder is uploaded.

```
npm run deploy
```

That builds and pushes live to <https://for-you-cutieee.pages.dev>. It takes
about ten seconds. Run it again any time you change the letter, swap a photo, or
re-record the voice note.

If your Cloudflare login ever expires, `npx wrangler login` re-authorises it in
the browser.

### One thing to know about the preview key

`PREVIEW_KEY` is checked in the browser, which means it ships inside the
JavaScript bundle — anyone who opens devtools and reads the source can find it.
It reliably stops her from *stumbling* into the surprise, which is all it needs
to do. Don't reuse a password you care about.

### If you ever want GitHub Pages instead

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) is ready to go:
push to a GitHub repo, turn on Pages → "GitHub Actions" in the repo settings, and
every push to `main` redeploys. It works out the `/<repo>/` base path on its own.
Be aware that Pages from a **private** repo needs GitHub Pro — on a free account
the repo (and the letter in it) would have to be public.

### Custom domain

Cloudflare Pages → your project → Custom domains, if you'd rather send her
something that isn't a `.pages.dev` link.

---

## How it's put together

**Vite + React 19 + TypeScript, Tailwind v4, Framer Motion, canvas-confetti,
Lucide.** No backend — it's a static bundle you can drop on Netlify, Vercel,
GitHub Pages or any static host.

```
src/
  config.ts                  ← everything personal
  lib/
    audio.ts                 shared AudioContext graph (singleton)
    time.ts                  countdown maths, timezone clocks, clock-skew check
    geo.ts                   great-circle distance
    celebrate.ts             confetti presets + haptics
  hooks/
    useAudioEngine.tsx       provider; audioContext.ts holds the hook
    useCountdown.ts          drift-free ticking
    useBlowDetector.ts       microphone breath detection
    useLocalStorage.ts       persistence that survives Safari private mode
  components/
    BootGate.tsx             [ Initialize Signal ] splash — the autoplay gesture
    SecretAccess.tsx         the long-press key panel (your early access)
    PreviewBadge.tsx         the PREVIEW MODE chip, only you ever see it
    AudioPlayer.tsx          pinned vinyl / equaliser / transport
    TimeLockGate.tsx         dual clocks, countdown, midnight glitch
    RedWaveCanvas.tsx        ambient sine-wave particle grid
    VisualizerHero.tsx       spectrum ring + kinetic lyrics
    SignalMap.tsx            SVG trajectory + [ Send Signal ] packet
    InteractiveCake.tsx      candles, mic blow-out, smoke
    OpenWhenVault.tsx        the four envelopes
    MemoryCarousel.tsx       swipeable photo carousel
    VoiceNotePlayer.tsx      waveform player
```

### Decisions worth knowing about

**Autoplay.** No browser starts audio without a real gesture, so the splash
turns that requirement into part of the story. The `AudioContext` and the
`MediaElementAudioSourceNode` are built once, inside that click handler —
Safari hands back a permanently suspended context otherwise.

**The clock.** The lock is only as trustworthy as the device clock, so before
trusting `Date.now()` the app does a `HEAD` request against its own origin and
reads the `Date` response header, correcting for round-trip latency. Every HTTP
server sends one, so this needs no third-party API and works on any static
host. If it fails, it falls back to system time silently and the status chip
reads `LOCAL` instead of `SYNCED`. The countdown recomputes from the wall clock
on every tick rather than decrementing, so it stays exact through sleep,
backgrounding and dropped timers.

**Breath detection.** The mic listener requires two conditions at once —
loudness over an RMS threshold *and* energy concentrated in the low band — held
for ~380ms. A blow is turbulent low-frequency noise; speech and music carry far
more mid and high content, so this ignores a noisy room. `echoCancellation`,
`noiseSuppression` and `autoGainControl` are all disabled because each one
would flatten exactly the signal we're looking for. The mic analyser is never
connected to the destination (that would feed the speaker back into itself),
nothing is recorded, and nothing leaves the device. Every failure path — denied
permission, no microphone — still offers a tap to blow the candles out.

**Ducking** is reference-counted, so the mic and the voice-note player can
overlap without leaving the soundtrack stuck at 22%.

**Motion.** Both canvases are DPR-aware (capped at 2×), pause when the tab is
hidden, and settle to a single static frame when the OS asks for reduced
motion.

### Haptics

`navigator.vibrate` fires when the signal packet lands and when the candles go
out. It works on Android Chrome; **iOS Safari has no vibration API**, so the
buzz is silently absent there. Everything else behaves identically.

### A note on HTTPS

The microphone and the clipboard both require a secure origin. Cloudflare Pages
serves everything over HTTPS, so the candles listen correctly on the live site —
but they will not on a plain `http://` link or a raw IP address.
