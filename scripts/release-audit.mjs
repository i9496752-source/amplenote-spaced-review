import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputPath = resolve(root, "build", "release-audit.md");

async function exists(path) {
  try {
    await access(resolve(root, path), constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

async function contains(path, pattern) {
  const text = await readFile(resolve(root, path), "utf8");
  return pattern.test(text);
}

const checks = [
  ["Public repository", true, "https://github.com/i9496752-source/amplenote-spaced-review"],
  ["MIT license", await contains("LICENSE", /MIT License/), "LICENSE"],
  ["Source plugin file", await exists("plugin.js"), "plugin.js"],
  ["Compiled plugin code", await exists("build/compiled.js"), "build/compiled.js"],
  ["Complete plugin note", await exists("build/plugin-note.md"), "build/plugin-note.md"],
  ["Local smoke output", await contains("build/smoke-output.md", /Cards in deck: 3[\s\S]*Reviewed cards: 3/), "build/smoke-output.md"],
  ["Unit and action tests", await exists("test/actions.test.js") && await exists("test/core.test.js") && await exists("test/compiled.test.js"), "test/"],
  ["Usage video outline", await exists("docs/video-outline.md"), "docs/video-outline.md"],
  ["Claim email template", await exists("docs/claim-email-template.md"), "docs/claim-email-template.md"],
  ["PayPal payout source noted", await contains("docs/bounty-notes.md", /Payments are made via PayPal/), "docs/bounty-notes.md"]
];

const pending = [
  "Install `build/plugin-note.md` in an Amplenote account.",
  "Run the plugin against real Amplenote notes.",
  "Publish the plugin to the Amplenote Plugin Directory.",
  "Record the 1-5 minute usage video.",
  "Record the 1-5 minute code overview video.",
  "Submit the bounty claim with plugin URL, repository URL, video URLs, and PayPal invoice details."
];

const lines = [
  "# Release Audit",
  "",
  "## Repository Evidence",
  "",
  "| Requirement | Status | Evidence |",
  "| --- | --- | --- |",
  ...checks.map(([name, ok, evidence]) => `| ${name} | ${ok ? "Ready" : "Missing"} | ${evidence} |`),
  "",
  "## Pending Account Steps",
  "",
  ...pending.map((item) => `- [ ] ${item}`),
  "",
  "## Verdict",
  "",
  checks.every(([, ok]) => ok)
    ? "Local release materials are ready. The remaining work requires Amplenote account access and PayPal/invoice details."
    : "Local release materials are incomplete."
];

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${lines.join("\n")}\n`, "utf8");
console.log(`Wrote ${outputPath}`);
