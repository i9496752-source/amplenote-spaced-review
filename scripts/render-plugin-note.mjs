import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const metadataPath = resolve(root, "plugin-note.md");
const compiledPath = resolve(root, "build", "compiled.js");
const outputPath = resolve(root, "build", "plugin-note.md");

const metadata = await readFile(metadataPath, "utf8");
const compiled = await readFile(compiledPath, "utf8");
const rendered = metadata.replace(
  /```javascript\n\/\/ Built plugin code goes here\.\n```/,
  `\`\`\`javascript\n${compiled.trimEnd()}\n\`\`\``
);

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, rendered, "utf8");
