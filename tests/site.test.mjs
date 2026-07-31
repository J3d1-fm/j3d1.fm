import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("exports the branded home page", async () => {
  const html = await readFile(new URL("out/index.html", root), "utf8");

  assert.match(html, /J3D1\.FM — Signal Over Noise/);
  assert.match(html, /Signal/);
  assert.match(html, /over noise/);
  assert.doesNotMatch(html, /Filipp|Mishchenko/i);
});

test("broadcasts real products instead of filler", async () => {
  const html = await readFile(new URL("out/index.html", root), "utf8");

  assert.match(html, /Learn Piano: Play Songs/);
  assert.match(
    html,
    /apps\.apple\.com\/app\/learn-piano-play-songs\/id6784630194/,
  );
  assert.match(html, /MenuSage/);
  assert.match(html, /Crush Check/);
  assert.match(html, /GetDesign/);
  assert.match(html, /UniversalMMP/);
  assert.match(html, /PurchaseKit/);
  assert.match(html, /Marketworthy/);
  assert.match(html, /Playable Forge/);
  assert.match(html, /github\.com\/J3d1-fm\/Personal-Task-Assistant/);
});

test("keeps self-hosted fonts out of third-party origins", async () => {
  const html = await readFile(new URL("out/index.html", root), "utf8");

  assert.doesNotMatch(html, /fonts\.googleapis\.com|fonts\.gstatic\.com/);
});

test("ships the custom domain and social card", async () => {
  const [cname, og] = await Promise.all([
    readFile(new URL("out/CNAME", root), "utf8"),
    readFile(new URL("out/og.png", root)),
  ]);

  assert.equal(cname.trim(), "j3d1.fm");
  assert.ok(og.byteLength > 20_000);
});
