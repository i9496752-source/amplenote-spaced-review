(() => {
const DECK_MARKER_START = "<!-- spaced-review-cards:start -->";
const DECK_MARKER_END = "<!-- spaced-review-cards:end -->";
const DEFAULT_DECK_TITLE = "Spaced Review Deck";
const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

function todayISO(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

function addDays(dateISO, days) {
  const date = new Date(`${dateISO}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return todayISO(date);
}

function normalizeText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeCell(value) {
  return normalizeText(value)
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/\n/g, "<br>");
}

function unescapeCell(value) {
  return String(value || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/\\\|/g, "|")
    .replace(/\\\\/g, "\\")
    .trim();
}

function stableId(parts) {
  const input = parts.map(normalizeText).join("\u001f");
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `sr-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function splitMarkdownRow(line) {
  const cells = [];
  let cell = "";
  let escaped = false;
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");

  for (const char of trimmed) {
    if (escaped) {
      cell += char;
      escaped = false;
    } else if (char === "\\") {
      cell += char;
      escaped = true;
    } else if (char === "|") {
      cells.push(unescapeCell(cell));
      cell = "";
    } else {
      cell += char;
    }
  }
  cells.push(unescapeCell(cell));
  return cells;
}

function isSeparatorRow(cells) {
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell.trim()));
}

function parseMarkdownTables(markdown, sourceName = "") {
  const lines = String(markdown || "").split(/\r?\n/);
  const cards = [];

  for (let i = 0; i < lines.length - 1; i++) {
    if (!lines[i].trim().startsWith("|") || !lines[i + 1].trim().startsWith("|")) continue;

    const headers = splitMarkdownRow(lines[i]).map((header) => header.toLowerCase());
    const separator = splitMarkdownRow(lines[i + 1]);
    if (!isSeparatorRow(separator)) continue;

    const questionIndex = headers.findIndex((header) => ["question", "q", "front", "prompt"].includes(header));
    const answerIndex = headers.findIndex((header) => ["answer", "a", "back", "response"].includes(header));
    if (questionIndex === -1 || answerIndex === -1) continue;

    const deckIndex = headers.findIndex((header) => ["deck", "topic", "tag"].includes(header));
    for (let j = i + 2; j < lines.length && lines[j].trim().startsWith("|"); j++) {
      const cells = splitMarkdownRow(lines[j]);
      const question = normalizeText(cells[questionIndex]);
      const answer = normalizeText(cells[answerIndex]);
      if (!question || !answer) continue;
      const deck = deckIndex >= 0 ? normalizeText(cells[deckIndex]) : "";
      cards.push(makeCard({ question, answer, deck, source: sourceName }));
      i = j;
    }
  }

  return cards;
}

function parseQaBlocks(markdown, sourceName = "") {
  const lines = String(markdown || "").split(/\r?\n/);
  const cards = [];
  let question = null;
  let answer = null;

  function flush() {
    if (question && answer) {
      cards.push(makeCard({ question, answer, source: sourceName }));
    }
    question = null;
    answer = null;
  }

  for (const line of lines) {
    const qMatch = line.match(/^\s*(?:[-*]\s*)?(?:Q|Question)::?\s*(.+)$/i);
    const aMatch = line.match(/^\s*(?:[-*]\s*)?(?:A|Answer)::?\s*(.+)$/i);
    if (qMatch) {
      flush();
      question = normalizeText(qMatch[1]);
    } else if (aMatch) {
      answer = normalizeText(aMatch[1]);
      flush();
    }
  }
  flush();

  return cards;
}

function makeCard({ id, question, answer, deck = "", source = "", due, interval = 0, ease = 2.5, reps = 0, lapses = 0 }) {
  const normalizedQuestion = normalizeText(question);
  const normalizedAnswer = normalizeText(answer);
  return {
    id: id || stableId([source, deck, normalizedQuestion, normalizedAnswer]),
    deck: normalizeText(deck),
    question: normalizedQuestion,
    answer: normalizedAnswer,
    source: normalizeText(source),
    due: DATE_ONLY_RE.test(due || "") ? due : todayISO(),
    interval: Number.isFinite(Number(interval)) ? Number(interval) : 0,
    ease: Number.isFinite(Number(ease)) ? Number(ease) : 2.5,
    reps: Number.isFinite(Number(reps)) ? Number(reps) : 0,
    lapses: Number.isFinite(Number(lapses)) ? Number(lapses) : 0
  };
}

function parseCardsFromMarkdown(markdown, sourceName = "") {
  const byId = new Map();
  for (const card of [...parseMarkdownTables(markdown, sourceName), ...parseQaBlocks(markdown, sourceName)]) {
    byId.set(card.id, card);
  }
  return [...byId.values()];
}

function parseDeck(markdown) {
  const lines = String(markdown || "").split(/\r?\n/);
  const cards = [];
  const start = lines.findIndex((line) => line.includes(DECK_MARKER_START));
  const end = lines.findIndex((line) => line.includes(DECK_MARKER_END));
  const tableLines = start >= 0 && end > start ? lines.slice(start + 1, end) : lines;

  for (let i = 0; i < tableLines.length - 1; i++) {
    if (!tableLines[i].trim().startsWith("|") || !tableLines[i + 1].trim().startsWith("|")) continue;
    const headers = splitMarkdownRow(tableLines[i]).map((header) => header.toLowerCase());
    if (!isSeparatorRow(splitMarkdownRow(tableLines[i + 1]))) continue;

    const indices = Object.fromEntries(headers.map((header, index) => [header, index]));
    if (indices.id == null || indices.question == null || indices.answer == null) continue;

    for (let j = i + 2; j < tableLines.length && tableLines[j].trim().startsWith("|"); j++) {
      const cells = splitMarkdownRow(tableLines[j]);
      cards.push(makeCard({
        id: cells[indices.id],
        deck: cells[indices.deck],
        question: cells[indices.question],
        answer: cells[indices.answer],
        source: cells[indices.source],
        due: cells[indices.due],
        interval: cells[indices.interval],
        ease: cells[indices.ease],
        reps: cells[indices.reps],
        lapses: cells[indices.lapses]
      }));
      i = j;
    }
  }

  return cards;
}

function renderDeck(cards) {
  const sorted = [...cards].sort((a, b) => {
    if (a.due !== b.due) return a.due.localeCompare(b.due);
    return a.question.localeCompare(b.question);
  });
  const rows = [
    "| ID | Deck | Question | Answer | Source | Due | Interval | Ease | Reps | Lapses |",
    "| --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: |"
  ];

  for (const card of sorted) {
    rows.push([
      card.id,
      card.deck,
      card.question,
      card.answer,
      card.source,
      card.due,
      Math.round(card.interval),
      Number(card.ease).toFixed(2),
      Math.round(card.reps),
      Math.round(card.lapses)
    ].map(escapeCell).join(" | ").replace(/^/, "| ").replace(/$/, " |"));
  }

  return [
    "# Spaced Review Deck",
    "",
    "This note is maintained by the Spaced Review plugin.",
    "",
    DECK_MARKER_START,
    ...rows,
    DECK_MARKER_END,
    ""
  ].join("\n");
}

function mergeCards(existingCards, incomingCards) {
  const merged = new Map(existingCards.map((card) => [card.id, { ...card }]));
  for (const card of incomingCards) {
    const current = merged.get(card.id);
    if (current) {
      merged.set(card.id, {
        ...current,
        deck: card.deck || current.deck,
        question: card.question,
        answer: card.answer,
        source: card.source || current.source
      });
    } else {
      merged.set(card.id, { ...card });
    }
  }
  return [...merged.values()];
}

function dueCards(cards, now = new Date()) {
  const today = todayISO(now);
  return cards
    .filter((card) => !card.due || card.due <= today)
    .sort((a, b) => a.due.localeCompare(b.due));
}

function scheduleCard(card, rating, now = new Date()) {
  const today = todayISO(now);
  const next = { ...card };
  const normalizedRating = String(rating || "").toLowerCase();

  if (normalizedRating === "again") {
    next.reps = 0;
    next.lapses = Number(next.lapses || 0) + 1;
    next.interval = 1;
    next.ease = Math.max(1.3, Number(next.ease || 2.5) - 0.2);
  } else if (normalizedRating === "hard") {
    next.reps = Number(next.reps || 0) + 1;
    next.interval = Math.max(1, Math.round(Number(next.interval || 1) * 1.2));
    next.ease = Math.max(1.3, Number(next.ease || 2.5) - 0.15);
  } else if (normalizedRating === "easy") {
    next.reps = Number(next.reps || 0) + 1;
    next.interval = Math.max(4, Math.round((Number(next.interval || 1) + 1) * (Number(next.ease || 2.5) + 0.25)));
    next.ease = Number(next.ease || 2.5) + 0.15;
  } else {
    next.reps = Number(next.reps || 0) + 1;
    if (next.reps === 1) next.interval = 1;
    else if (next.reps === 2) next.interval = 3;
    else next.interval = Math.max(4, Math.round(Number(next.interval || 1) * Number(next.ease || 2.5)));
  }

  next.due = addDays(today, Math.round(next.interval));
  return next;
}

function replaceCard(cards, updatedCard) {
  return cards.map((card) => card.id === updatedCard.id ? updatedCard : card);
}

function extractNoteUUID(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return extractNoteUUID(value[0]);
  return value.uuid || value.noteUUID || null;
}

function promptValues(response, keys = []) {
  if (!response) return null;
  if (Array.isArray(response)) {
    return Object.fromEntries(keys.map((key, index) => [key, response[index]]));
  }
  return response;
}

async function getNoteContent(app, noteUUID) {
  return app.getNoteContent({ uuid: noteUUID });
}

async function writeNoteContent(app, noteUUID, content) {
  let replaced = false;
  if (typeof app.replaceNoteContent === "function") {
    replaced = await app.replaceNoteContent({ uuid: noteUUID }, content);
  } else if (typeof app.replaceContent === "function") {
    replaced = await app.replaceContent({ uuid: noteUUID }, content);
  } else {
    throw new Error("This Amplenote client does not expose replaceNoteContent.");
  }
  if (!replaced) throw new Error("Could not update the deck note.");
  return replaced;
}

async function promptForDeckNote(app) {
  const result = await app.prompt("Choose the note that should store review state.", {
    inputs: [{
      label: "Deck note",
      type: "note",
      key: "deckNote"
    }]
  });
  if (Array.isArray(result)) return extractNoteUUID(result[0]);
  return extractNoteUUID(result?.deckNote || result);
}

async function readDeck(app, deckNoteUUID) {
  return parseDeck(await getNoteContent(app, deckNoteUUID));
}

async function saveDeck(app, deckNoteUUID, cards) {
  return writeNoteContent(app, deckNoteUUID, renderDeck(cards));
}

async function createDeck(app) {
  const deckNoteUUID = await app.createNote(DEFAULT_DECK_TITLE, ["spaced-review"]);
  await saveDeck(app, deckNoteUUID, []);
  return deckNoteUUID;
}

async function scanCurrentNote(app, noteUUID, deckNoteUUID) {
  const noteContent = await getNoteContent(app, noteUUID);
  const noteUrl = typeof app.getNoteURL === "function" ? await app.getNoteURL({ uuid: noteUUID }) : "";
  const sourceName = noteUrl || noteUUID;
  const incoming = parseCardsFromMarkdown(noteContent, sourceName);
  const existing = await readDeck(app, deckNoteUUID);
  const merged = mergeCards(existing, incoming);
  await saveDeck(app, deckNoteUUID, merged);
  return { imported: incoming.length, total: merged.length };
}

async function scanTag(app, tagName, deckNoteUUID) {
  const handles = await app.filterNotes({ tag: tagName });
  const existing = await readDeck(app, deckNoteUUID);
  let merged = existing;
  let imported = 0;

  for (const handle of handles || []) {
    const uuid = handle.uuid || handle.noteUUID;
    if (!uuid || uuid === deckNoteUUID) continue;
    const content = await getNoteContent(app, uuid);
    const source = handle.name || handle.title || uuid;
    const cards = parseCardsFromMarkdown(content, source);
    imported += cards.length;
    merged = mergeCards(merged, cards);
  }

  await saveDeck(app, deckNoteUUID, merged);
  return { imported, total: merged.length };
}

async function reviewDue(app, deckNoteUUID) {
  let cards = await readDeck(app, deckNoteUUID);
  const due = dueCards(cards);
  if (due.length === 0) {
    await app.alert("No cards are due.");
    return { reviewed: 0, remaining: 0 };
  }

  let reviewed = 0;
  for (const card of due) {
    const reveal = await app.alert(`Question\n\n${card.question}`, {
      actions: [{ value: "show", label: "Show answer" }, { value: "stop", label: "Stop" }]
    });
    if (reveal === "stop") break;

    const rating = await app.alert(`Answer\n\n${card.answer}`, {
      actions: [
        { value: "again", label: "Again" },
        { value: "hard", label: "Hard" },
        { value: "good", label: "Good" },
        { value: "easy", label: "Easy" }
      ]
    });
    if (!rating) break;
    cards = replaceCard(cards, scheduleCard(card, rating));
    reviewed += 1;
  }

  await saveDeck(app, deckNoteUUID, cards);
  return { reviewed, remaining: due.length - reviewed };
}

const core = {
  DECK_MARKER_START,
  DECK_MARKER_END,
  DEFAULT_DECK_TITLE,
  todayISO,
  addDays,
  stableId,
  parseCardsFromMarkdown,
  parseDeck,
  renderDeck,
  mergeCards,
  dueCards,
  scheduleCard,
  replaceCard,
  extractNoteUUID,
  promptValues,
  promptForDeckNote,
  createDeck,
  scanCurrentNote,
  scanTag,
  reviewDue
};

const plugin = {
  constants: {
    core
  },

  noteOption: {
    "Add review cards from this note": {
      check: async function(app, noteUUID) {
        const content = await getNoteContent(app, noteUUID);
        return parseCardsFromMarkdown(content, noteUUID).length > 0;
      },
      run: async function(app, noteUUID) {
        const deckNoteUUID = await promptForDeckNote(app);
        if (!deckNoteUUID) return;
        const result = await scanCurrentNote(app, noteUUID, deckNoteUUID);
        await app.alert(`Imported ${result.imported} cards. Deck now has ${result.total} cards.`);
      }
    }
  },

  appOption: {
    "Create review deck": {
      run: async function(app) {
        const deckNoteUUID = await createDeck(app);
        await app.alert(`Created review deck note: ${deckNoteUUID}`);
      }
    },

    "Build review deck from tag": {
      run: async function(app) {
        const response = await app.prompt("Build a spaced review deck from notes with a tag.", {
          inputs: [
            { label: "Tag name", type: "text", key: "tagName", value: "review" },
            { label: "Deck note", type: "note", key: "deckNote" }
          ]
        });
        const values = promptValues(response, ["tagName", "deckNote"]);
        const tagName = normalizeText(values?.tagName);
        const deckNoteUUID = extractNoteUUID(values?.deckNote);
        if (!tagName || !deckNoteUUID) return;
        const result = await scanTag(app, tagName, deckNoteUUID);
        await app.alert(`Imported ${result.imported} cards from #${tagName}. Deck now has ${result.total} cards.`);
      }
    },

    "Review due cards": {
      run: async function(app) {
        const deckNoteUUID = await promptForDeckNote(app);
        if (!deckNoteUUID) return;
        const result = await reviewDue(app, deckNoteUUID);
        if (result.reviewed > 0) {
          await app.alert(`Reviewed ${result.reviewed} cards. ${result.remaining} due cards left from this session.`);
        }
      }
    }
  }
};

return plugin;
})();
