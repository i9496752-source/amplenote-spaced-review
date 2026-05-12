import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

test("compiled plugin evaluates to an Amplenote plugin object", async () => {
  const code = await readFile(new URL("../build/compiled.js", import.meta.url), "utf8");
  const plugin = vm.runInNewContext(code, {}, { timeout: 1000 });

  assert.equal(typeof plugin, "object");
  assert.equal(typeof plugin.appOption["Create review deck"].run, "function");
  assert.equal(typeof plugin.appOption["Build review deck from tag"].run, "function");
  assert.equal(typeof plugin.appOption["Review due cards"].run, "function");
  assert.equal(typeof plugin.noteOption["Add review cards from this note"].run, "function");
});
