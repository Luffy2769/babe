import { haversineKm } from './lib/geo'

/**
 * Resolves a file in `public/` against the site's base path.
 *
 * A plain '/audio/blood-pop.mp3' only works when the site is served from the
 * domain root. On GitHub Pages a project site lives under /<repo>/, so the
 * bare path would 404 and the music and photos would silently vanish.
 * import.meta.env.BASE_URL is '/' locally and '/<repo>/' in that build.
 */
const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  EVERYTHING PERSONAL LIVES HERE.
 *  Edit this one file to make the app yours — no component changes needed.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Sept 16 2026, 00:00:00 in WIB (UTC+7) === Sept 15 2026, 17:00:00 UTC. */
export const UNLOCK_UTC_ISO = '2026-09-15T17:00:00.000Z'
export const UNLOCK_TS = Date.parse(UNLOCK_UTC_ISO)

export const PEOPLE = {
  /** You. */
  sender: {
    name: 'Me',
    label: 'YOUR TIME',
    zoneLabel: 'IST / UTC+5:30',
    timeZone: 'Asia/Kolkata',
    city: 'ANDHERI',
    region: 'MUMBAI, IN',
    /** lat/lon — drives the distance readout and the map node position */
    coords: { lat: 19.1197, lon: 72.8464 },
  },
  /** Her. */
  recipient: {
    name: 'Nana', // ← her name
    nickname: 'Sayang',
    label: 'HER TIME',
    // Central Kalimantan runs on WIB (UTC+7), same as Jakarta. Asia/Pontianak
    // is the IANA zone that actually covers it.
    zoneLabel: 'WIB / UTC+7:00',
    timeZone: 'Asia/Pontianak',
    city: 'SAMPIT',
    region: 'KALIMANTAN, ID',
    coords: { lat: -2.5333, lon: 112.95 },
  },
} as const

/**
 * Andheri → Sampit, great-circle: 5,000.2 km. Computed from the coordinates
 * above rather than typed in, so it can never disagree with the map.
 */
export const DISTANCE_KM = Math.round(
  haversineKm(PEOPLE.sender.coords, PEOPLE.recipient.coords),
)

/**
 * Your way in before the 16th.
 *
 * Long-press the "CHANNEL LOCKED" chip on the lock screen for ~1.2s, then type
 * this. CHANGE IT to something she would not guess — not her birthday, not her
 * name. Comparison is case-insensitive and ignores surrounding spaces.
 */
export const PREVIEW_KEY = 'andheri'

export const AUDIO = {
  /** Drop your track here: public/audio/blood-pop.mp3 */
  track: asset('/audio/blood-pop.mp3'),
  title: 'Blood Pop',
  artist: 'for her',
  /** Drop your recording here: public/audio/voice-note.mp3 */
  voiceNote: asset('/audio/voice-note.mp3'),
  voiceNoteTitle: 'your voice notes, on repeat',
}

/**
 * Kinetic lyrics for the hero. `t` is the second in the track at which the
 * line appears. Retime these to your own copy of the song — play it once with
 * the console open and the visualiser prints `t` on tap if you need it.
 */
export const LYRICS: { t: number; text: string; accent?: boolean }[] = [
  { t: 0, text: 'signal acquired' },
  { t: 6, text: 'across five thousand kilometres of ocean' },
  { t: 14, text: 'the clock finally agreed with me' },
  { t: 22, text: 'happy birthday nana', accent: true },
  { t: 30, text: 'you are the loudest quiet thing in my life' },
  { t: 40, text: 'every timezone bends for you' },
  { t: 50, text: 'me blue, you blue, always matching', accent: true },
]

/** Card 1 — the letter. Each string is a paragraph. */
export const LETTER = {
  greeting: 'Hey Nana,',
  paragraphs: [
    "It's past midnight where you are, which means I've been watching a countdown for weeks just to be the first thing that reaches you today. I built this instead of sleeping. That feels about right.",
    "There's an hour and a half between our clocks and a whole ocean under the flight path. We've never met in person yet, never had long calls — just a few precious voice notes of yours that I secretly play on repeat, matching pfps on every app we talk on, and texts that make my entire day. And somehow, none of it has ever felt like distance. You text me good morning while I'm still in yesterday. I've gotten used to living slightly behind you, always catching up to something wonderful.",
    "I want you to know what you actually are: you're the person who makes ordinary days feel like they're worth reporting. You make me want to be less careless with myself. You laugh at the parts of me I was planning to apologise for.",
    "So here is the whole year, wished at once — I hope it is soft where you need it to be, bright where you want it to be, and that you never once have to be brave alone.",
  ],
  signoff: 'All of it, always,',
  signature: '— yours',
}

/**
 * Card 2 — memory carousel.
 * Matching PFP screenshots & moments.
 */
export const MEMORIES: { src: string; caption: string; date?: string }[] = [
  {
    src: asset('/images/memories/01.jpg'),
    caption: 'The drawing of you threatening me with a knife while I tremble. Accurate representation of our dynamic.',
    date: 'our daily dynamic',
  },
  {
    src: asset('/images/memories/02.jpg'),
    caption: 'Minecraft cherry blossom date with LuciaNana2609 standing by my side in front of our giant heart.',
    date: 'minecraft world',
  },
  {
    src: asset('/images/memories/03.jpg'),
    caption: '"I LOVE MY PRINCESS (NURUL) ❤️" — written down and meant with every single piece of my heart.',
    date: 'for my princess',
  },
  {
    src: asset('/images/memories/04.jpg'),
    caption: 'Our official Roblox wedding: Luffy paired with the prettiest bride in the game.',
    date: 'roblox wedding',
  },
]

/** Card 4 — the treat. */
export const TREAT = {
  code: 'BLOODPOP-16',
  headline: 'One (1) unreasonably good day, prepaid.',
  description:
    'Redeemable against: dessert of your choosing, delivered to your door in Sampit, plus a movie night where you pick and I do not complain once.',
  /** Fake-but-fun tracker steps shown as a delivery timeline. */
  steps: [
    { label: 'Order placed', detail: 'from 5,000 km away in Mumbai', done: true },
    { label: 'Wrapped', detail: 'badly, with love', done: true },
    { label: 'In transit', detail: 'crossing the Java Sea to Sampit', done: true },
    { label: 'Out for delivery', detail: 'arriving on your birthday', done: false },
  ],
  fineprint: 'No expiry. Non-transferable. Infinitely re-redeemable in practice.',
}

export const COPY = {
  teaser: `It opens at midnight on the 16th, your time. I'm ${DISTANCE_KM.toLocaleString()} km away and counting every second of it.`,
  bootEyebrow: 'something for you',
  bootTitle: 'FOR NANA',
  bootSub: 'Every bit of it. In your favorite blue.',
  bootCta: 'Open it',
  lockedChip: 'not yet',
  clockChecked: 'clock checked',
  clockLocal: 'your clock',
}

/** The first thing she reads after the hero — so the scroll opens on words. */
export const OPENING_NOTE = {
  eyebrow: 'before anything else',
  lines: [
    "It's your birthday, Nana.",
    "I could not be there to say it out loud,",
    'so I built somewhere in sky blue to say it properly.',
  ],
  body: "Take your time with this. There's no rush, nothing to answer, and every part of it is yours to open whenever you feel like it.",
}

/**
 * The long warm list. This is the heart of the page — add as many as you want,
 * they render as a numbered run of lines. Keep each one short and specific;
 * specifics are what make someone believe you.
 */
export const REASONS = [
  "How we have matching pfps on literally every single app we talk on.",
  'The few voice notes of yours that I secretly save and replay with headphones.',
  'You saying "me blue" when we pick our matching icons.',
  "Spending an entire hour on Discord just to agree on our first matching pfp.",
  'You send me stickers and memes with no context and I always understand.',
  'How your "good morning" text makes 5,000 km feel like next door.',
  'You remember what I said weeks ago and bring it back like it mattered.',
  'Even though we haven’t met in person yet, you are my home.',
  'You are the first person I want to tell everything to.',
]

/** Big lines that break up the scroll between sections. */
export const PULL_QUOTES = [
  'There are 5,000 km and one and a half hours between us, and none of it has ever felt like distance.',
  'You are the loudest quiet thing in my life.',
]
