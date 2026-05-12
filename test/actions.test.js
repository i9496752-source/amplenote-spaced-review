import assert from "node:assert/strict";
import test from "node:test";
import plugin, { core } from "../plugin.js";

function makeApp() {
  const notes = new Map([
    ["source", "Q:: Capital of France?\nA:: Paris"],
    ["tagged", "| Question | Answer |\n| --- | --- |\n| HTTP success? | 200 |"]
  ]);
  const alerts = [];
  let createCounter = 0;

  return {
    notes,
    alerts,
    async createNote(name, tags) {
      const uuid = `created-${++createCounter}`;
      notes.set(uuid, "");
      this.lastCreated = { uuid, name, tags };
      return uuid;
    },
    async getNoteContent({ uuid }) {
      return notes.get(uuid);
    },
    async replaceNoteContent({ uuid }, content) {
      notes.set(uuid, content);
      return true;
    },
    async filterNotes({ tag }) {
      assert.equal(tag, "review");
      return [{ uuid: "tagged", name: "Tagged note" }];
    },
    async prompt(message) {
      if (message.startsWith("Build")) return ["review", { uuid: "deck" }, -1];
      return { uuid: "deck" };
    },
    async alert(message) {
      alerts.push(message);
      if (message.startsWith("Question")) return "show";
      if (message.startsWith("Answer")) return "good";
      return -1;
    }
  };
}

test("plugin actions cover create, import, tag scan, and review flow", async () => {
  const app = makeApp();

  await plugin.appOption["Create review deck"].run(app);
  assert.equal(app.lastCreated.name, "Spaced Review Deck");
  assert.deepEqual(app.lastCreated.tags, ["spaced-review"]);

  app.notes.set("deck", core.renderDeck([]));
  const canImport = await plugin.noteOption["Add review cards from this note"].check(app, "source");
  assert.equal(canImport, true);

  await plugin.noteOption["Add review cards from this note"].run(app, "source");
  assert.equal(core.parseDeck(app.notes.get("deck")).length, 1);

  await plugin.appOption["Build review deck from tag"].run(app);
  assert.equal(core.parseDeck(app.notes.get("deck")).length, 2);

  await plugin.appOption["Review due cards"].run(app);
  const reviewedCards = core.parseDeck(app.notes.get("deck"));
  assert.equal(reviewedCards.filter((card) => card.reps === 1).length, 2);
});
