import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import plugin, { core } from "../plugin.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputPath = resolve(root, "build", "smoke-output.md");
const notes = new Map([
  ["source-note", [
    "| Question | Answer | Deck |",
    "| --- | --- | --- |",
    "| What does spaced repetition optimize? | Review timing. | Learning |",
    "",
    "Q:: What does Again do?",
    "A:: It lowers ease and schedules a short retry."
  ].join("\n")],
  ["tagged-note", "Q:: What rating schedules normal progress?\nA:: Good"]
]);

const alerts = [];
const app = {
  async createNote(name, tags) {
    notes.set("deck", "");
    alerts.push(`created:${name}:${tags.join(",")}`);
    return "deck";
  },
  async getNoteContent({ uuid }) {
    return notes.get(uuid);
  },
  async replaceNoteContent({ uuid }, content) {
    notes.set(uuid, content);
    return true;
  },
  async filterNotes({ tag }) {
    alerts.push(`filter:${tag}`);
    return [{ uuid: "tagged-note", name: "Tagged note" }];
  },
  async prompt(message) {
    if (message.startsWith("Build")) return ["review", { uuid: "deck" }];
    return { uuid: "deck" };
  },
  async alert(message) {
    alerts.push(message.split("\n")[0]);
    if (message.startsWith("Question")) return "show";
    if (message.startsWith("Answer")) return "good";
    return -1;
  }
};

await plugin.appOption["Create review deck"].run(app);
await plugin.noteOption["Add review cards from this note"].run(app, "source-note");
await plugin.appOption["Build review deck from tag"].run(app);
await plugin.appOption["Review due cards"].run(app);

const deck = notes.get("deck");
const cards = core.parseDeck(deck);
const report = [
  "# Smoke Demo Output",
  "",
  `Cards in deck: ${cards.length}`,
  `Reviewed cards: ${cards.filter((card) => card.reps > 0).length}`,
  "",
  "## Alerts",
  "",
  ...alerts.map((line) => `- ${line}`),
  "",
  "## Deck Note",
  "",
  deck
].join("\n");

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, report, "utf8");
console.log(`Wrote ${outputPath}`);
