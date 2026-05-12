import assert from "node:assert/strict";
import test from "node:test";
import { core } from "../plugin.js";

test("parses question tables and Q/A blocks", () => {
  const markdown = [
    "| Question | Answer | Deck |",
    "| --- | --- | --- |",
    "| What is spaced repetition? | Reviewing right before forgetting. | Learning |",
    "",
    "Q:: What does SM-2 track?",
    "A:: Ease, interval, repetitions, and due date."
  ].join("\n");

  const cards = core.parseCardsFromMarkdown(markdown, "Study note");
  assert.equal(cards.length, 2);
  assert.equal(cards[0].deck, "Learning");
  assert.equal(cards[0].source, "Study note");
  assert.match(cards[1].id, /^sr-/);
});

test("renders and parses the deck table without losing state", () => {
  const cards = core.parseCardsFromMarkdown("Q:: Capital of France?\nA:: Paris", "Geo");
  const reviewed = core.scheduleCard(cards[0], "easy", new Date("2026-05-12T00:00:00Z"));
  const rendered = core.renderDeck([reviewed]);
  const parsed = core.parseDeck(rendered);

  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].question, "Capital of France?");
  assert.equal(parsed[0].answer, "Paris");
  assert.equal(parsed[0].reps, 1);
  assert.ok(parsed[0].due > "2026-05-12");
});

test("merges existing cards by stable id while preserving scheduling state", () => {
  const original = core.parseCardsFromMarkdown("Q:: One?\nA:: 1", "Numbers")[0];
  const scheduled = core.scheduleCard(original, "good", new Date("2026-05-12T00:00:00Z"));
  const updatedSource = core.parseCardsFromMarkdown("Q:: One?\nA:: 1", "Numbers")[0];
  const merged = core.mergeCards([scheduled], [updatedSource]);

  assert.equal(merged.length, 1);
  assert.equal(merged[0].reps, 1);
  assert.equal(merged[0].due, scheduled.due);
});

test("filters due cards by date", () => {
  const cards = [
    { id: "a", due: "2026-05-11", question: "A" },
    { id: "b", due: "2026-05-12", question: "B" },
    { id: "c", due: "2026-05-13", question: "C" }
  ];
  const due = core.dueCards(cards, new Date("2026-05-12T12:00:00Z"));
  assert.deepEqual(due.map((card) => card.id), ["a", "b"]);
});

test("scanTag merges cards from mocked Amplenote notes", async () => {
  const content = new Map([
    ["deck", core.renderDeck([])],
    ["note-1", "Q:: HTTP status for success?\nA:: 200"],
    ["note-2", "| Question | Answer |\n| --- | --- |\n| Git branch command? | git switch -c |"]
  ]);
  const app = {
    filterNotes: async () => [{ uuid: "note-1", name: "HTTP" }, { uuid: "note-2", name: "Git" }],
    getNoteContent: async ({ uuid }) => content.get(uuid),
    replaceNoteContent: async ({ uuid }, nextContent) => content.set(uuid, nextContent)
  };

  const result = await core.scanTag(app, "review", "deck");
  assert.equal(result.imported, 2);
  assert.equal(result.total, 2);
  assert.equal(core.parseDeck(content.get("deck")).length, 2);
});

test("prompt helpers support Amplenote array-style input responses", () => {
  const values = core.promptValues(["review", { uuid: "deck-note" }], ["tagName", "deckNote"]);

  assert.equal(values.tagName, "review");
  assert.equal(core.extractNoteUUID(values.deckNote), "deck-note");
});

test("promptForDeckNote accepts a single note prompt response", async () => {
  const app = {
    prompt: async () => ({ uuid: "deck" })
  };

  assert.equal(await core.promptForDeckNote(app), "deck");
});

test("reviewDue updates the deck note after a Good rating", async () => {
  const original = core.parseCardsFromMarkdown("Q:: One?\nA:: 1", "Numbers")[0];
  original.due = "2026-05-12";
  const content = new Map([["deck", core.renderDeck([original])]]);
  const app = {
    prompt: async () => ({ uuid: "deck" }),
    getNoteContent: async ({ uuid }) => content.get(uuid),
    replaceNoteContent: async ({ uuid }, nextContent) => {
      content.set(uuid, nextContent);
      return true;
    },
    alert: async (message) => message.startsWith("Question") ? "show" : "good"
  };

  const result = await core.reviewDue(app, "deck");
  assert.equal(result.reviewed, 1);
  assert.equal(core.parseDeck(content.get("deck"))[0].reps, 1);
});

test("createDeck initializes an empty deck note", async () => {
  const content = new Map();
  const app = {
    createNote: async (name, tags) => {
      assert.equal(name, "Spaced Review Deck");
      assert.deepEqual(tags, ["spaced-review"]);
      return "deck-created";
    },
    replaceNoteContent: async ({ uuid }, nextContent) => {
      content.set(uuid, nextContent);
      return true;
    }
  };

  const deckNoteUUID = await core.createDeck(app);
  assert.equal(deckNoteUUID, "deck-created");
  assert.deepEqual(core.parseDeck(content.get("deck-created")), []);
});
