import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("exports the branded home page", async () => {
  const html = await readFile(new URL("out/index.html", root), "utf8");

  assert.match(html, /J3D1\.FM — Signal Over Noise/);
  assert.match(html, /Signal/);
  assert.match(html, /over noise/);
  assert.match(html, /Products, games and AI systems/);
  assert.match(html, /See clearly/);
  assert.match(html, /Make decisively/);
  assert.match(html, /Ship honestly/);
  assert.doesNotMatch(html, /Filipp|Mishchenko/i);
});

test("ships the custom domain and social card", async () => {
  const [cname, og] = await Promise.all([
    readFile(new URL("out/CNAME", root), "utf8"),
    readFile(new URL("out/og.png", root)),
  ]);

  assert.equal(cname.trim(), "j3d1.fm");
  assert.ok(og.byteLength > 100_000);
});
