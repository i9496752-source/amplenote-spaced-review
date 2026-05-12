import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sourcePath = resolve(root, "plugin.js");
const outputPath = resolve(root, "build", "compiled.js");
const source = await readFile(sourcePath, "utf8");

const body = source
  .replace(/\nexport \{ core \};\nexport default plugin;\s*$/m, "\nreturn plugin;")
  .trimEnd();
const compiled = `(() => {\n${body}\n})();\n`;

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, compiled, "utf8");
