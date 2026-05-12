# Video Scripts

## Usage Video

Target length: 2-4 minutes.

### Screen Prep

- Open the installed `Spaced Review` plugin in Amplenote.
- Open a sample note that contains the Q/A blocks and Markdown table from `sample-cards.md`.
- Open the deck note in a second tab or split view if convenient.

### Shot List And Narration

1. Start on the sample cards note.
   Narration: "This plugin turns ordinary Amplenote notes into spaced review cards. It accepts either Q/A blocks or a Markdown table with Question and Answer columns."
2. Run `Create review deck`.
   Narration: "First I create a deck note. The deck is just a normal Amplenote note, so review state stays inside my notebook."
3. Run `Add review cards from this note`.
   Narration: "Now I import cards from this note. The plugin reads the questions, answers, and optional deck names."
4. Open the generated deck note.
   Narration: "Each card tracks due date, interval, ease, repetitions, and lapses."
5. Run `Review due cards`.
   Narration: "When cards are due, the plugin shows the question first, then reveals the answer, then asks how the review went."
6. Rate three cards: Again, Good, and Easy.
   Narration: "Again keeps a card due soon. Good and Easy push it farther out using an SM-2 style interval calculation."
7. Reopen or refresh the deck note.
   Narration: "The updated schedule is written back to the deck note, so it can be inspected and backed up like any other note."
8. Optional: run `Build review deck from tag`.
   Narration: "The plugin can also scan every note with a chosen tag, which is useful when a topic already lives across multiple notes."

## Code Overview Video

Target length: 2-4 minutes.

### Screen Prep

- Open `plugin.js`.
- Open `test/core.test.js`, `test/actions.test.js`, and `test/compiled.test.js`.
- Open `scripts/build.mjs` and `scripts/render-plugin-note.mjs`.
- Keep a terminal with `npm test` output available.

### Shot List And Narration

1. Show `plugin.js`.
   Narration: "The plugin is intentionally one source file. It has pure helpers for parsing cards, rendering the deck note, merging state, filtering due cards, and scheduling the next review."
2. Show `parseCardsFromMarkdown` and table/Q/A parsing.
   Narration: "Card input is Markdown-first. Users can use a table or consistent Q/A blocks without a separate database."
3. Show merge and scheduling helpers.
   Narration: "Existing review state is preserved when cards are rescanned, so importing from a note or tag does not reset progress."
4. Show Amplenote action registration.
   Narration: "The actions expose the user workflow: create a deck, import from the current note, import by tag, and review due cards."
5. Show tests.
   Narration: "The tests cover parsing, deck creation, note updates, prompt handling, tag scanning, compiled output, and review scheduling."
6. Show build scripts and release bundle.
   Narration: "The build creates a paste-ready plugin note and a release bundle with sample cards, audit output, videos scripts, and claim materials."
7. Show terminal output.
   Narration: "Before publishing, the release command rebuilds the plugin note, runs the smoke demo, audits bounty requirements, and packages the release files."

## Upload Notes

- Make both videos public or unlisted but accessible.
- Put both video URLs into the plugin note before final Plugin Directory submission.
- Put both video URLs into `claim-email-template.md` before sending the bounty claim.
