# Amplenote Spaced Review

Spaced Review is an Amplenote plugin for turning notes into review cards and scheduling them with a small SM-2 style interval algorithm.

It targets the open Amplenote bounty for a spaced repetition plugin. The implementation is intentionally plain: it reads Markdown cards from notes, keeps review state in a deck note, and avoids sending note content to any external service.

## Card Formats

Use either a Markdown table:

```markdown
| Question | Answer | Deck |
| --- | --- | --- |
| What is spaced repetition? | Reviewing right before forgetting. | Learning |
```

Or short Q/A blocks:

```markdown
Q:: What does SM-2 track?
A:: Ease, interval, repetitions, and due date.
```

## Plugin Commands

- `Create review deck`: creates an empty deck note tagged `spaced-review`.
- `Add review cards from this note`: available from a note when card content is detected.
- `Build review deck from tag`: scans every note with the chosen tag and merges cards into a deck note.
- `Review due cards`: presents due cards, reveals answers, and reschedules each card as Again, Hard, Good, or Easy.

## Amplenote Setup

1. Create a new note named `Spaced Review`.
2. Paste the metadata table from `plugin-note.md`.
3. Paste `build/compiled.js` into the first JavaScript code block.
4. Add the note as a plugin from Amplenote Settings -> Plugins.
5. Run `Create review deck`, then scan individual notes or a tag.

## Development

```bash
npm test
npm run build
npm run build:note
npm run smoke
npm run audit
npm run bundle
```

`build/compiled.js` is the single-file code block that can be pasted into an Amplenote plugin note or synced through the GitHub Plugin Builder.
`build/plugin-note.md` is a complete plugin note with metadata and the compiled code block already filled in.
`build/smoke-output.md` is a local end-to-end run report using a mocked Amplenote app.
`build/release-audit.md` maps bounty requirements to repository evidence and remaining account steps.
`build/release-bundle/` contains the files needed for manual Amplenote installation, video recording, and claim handoff.

## Publishing Notes

Amplenote bounty terms require a public GitHub repository, a published plugin, and short usage/code overview videos. The PayPal address and invoice should only be supplied during the official bounty claim flow.
