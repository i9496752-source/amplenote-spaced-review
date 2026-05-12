import { cp, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const bundleDir = resolve(root, "build", "release-bundle");

const files = [
  ["build/plugin-note.md", "plugin-note.md"],
  ["build/compiled.js", "compiled.js"],
  ["build/smoke-output.md", "smoke-output.md"],
  ["build/release-audit.md", "release-audit.md"],
  ["docs/sample-cards.md", "sample-cards.md"],
  ["docs/release-checklist.md", "release-checklist.md"],
  ["docs/video-outline.md", "video-outline.md"],
  ["docs/claim-email-template.md", "claim-email-template.md"],
  ["README.md", "README.md"],
  ["LICENSE", "LICENSE"]
];

await mkdir(bundleDir, { recursive: true });
for (const [from, to] of files) {
  await cp(resolve(root, from), resolve(bundleDir, to));
}

await writeFile(resolve(bundleDir, "NEXT_STEPS.md"), [
  "# Next Steps",
  "",
  "1. Create a new Amplenote note.",
  "2. Paste the contents of `plugin-note.md` into that note.",
  "3. Add the note as an Amplenote plugin from Settings -> Plugins.",
  "4. Run `Create review deck`.",
  "5. Create or paste the sample cards from `sample-cards.md`.",
  "6. Run the import and review commands shown in `README.md`.",
  "7. Publish the plugin to the Amplenote Plugin Directory.",
  "8. Record the usage and code overview videos using `video-outline.md`.",
  "9. Fill `claim-email-template.md` with plugin URL, video URLs, and PayPal invoice details.",
  ""
].join("\n"), "utf8");

console.log(`Wrote ${bundleDir}`);
