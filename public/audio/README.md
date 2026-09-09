# Audio assets

Drop two files here. Both are referenced from `src/config.ts` — rename them
there if you would rather keep your own filenames.

| File            | What it is                          | Notes                                   |
| --------------- | ----------------------------------- | --------------------------------------- |
| `blood-pop.mp3` | The soundtrack. Loops continuously. | Drives the spectrum visualiser.         |
| `voice-note.mp3`| Your recorded voice note.           | Played from the third vault card.       |

## Practical notes

- **MP3 or AAC/M4A.** Both play everywhere. Avoid OGG — iOS Safari won't touch it.
- **Keep it small.** Aim for under ~5 MB; she may open this on mobile data.
  128 kbps mono is plenty for a voice note.
- **Both files are optional.** If either is missing the app detects it and
  degrades gracefully — the visualiser switches to its synthetic wave and the
  voice-note card explains what to drop in. Nothing crashes.
- **Retime the lyrics** in `LYRICS` inside `src/config.ts` once you have the
  real track; each entry's `t` is the second the line should appear.
