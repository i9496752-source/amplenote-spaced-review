# Release Checklist

## Functional

- [x] Parse Q/A blocks from note Markdown.
- [x] Parse Markdown tables with Question and Answer columns.
- [x] Merge scanned cards without losing review state.
- [x] Create a deck note from the plugin.
- [x] Scan the current note into a deck note.
- [x] Scan notes by tag into a deck note.
- [x] Review due cards and reschedule with Again, Hard, Good, and Easy ratings.
- [x] Store state inside a normal Amplenote note.
- [x] Avoid external services for note content.

## Verification

- [x] `npm test`
- [x] `npm run build`
- [x] `node --check plugin.js`
- [x] `node --check build/compiled.js`
- [x] `npm run bundle`
- [x] `graphify update .`

## External Steps

- [x] Publish the code to a public GitHub repository.
- [ ] Create an Amplenote plugin note from `plugin-note.md`.
- [ ] Paste `build/compiled.js` into the first JavaScript code block.
- [ ] Install the plugin in Amplenote Settings.
- [ ] Run through `docs/sample-cards.md` in a real Amplenote account.
- [ ] Publish the plugin to the Amplenote Plugin Directory.
- [ ] Record a short usage video.
- [ ] Record a short code overview video.
- [ ] Submit the bounty claim with the plugin link and PayPal invoice details.
