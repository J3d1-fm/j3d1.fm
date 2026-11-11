import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("exports the branded home page", async () => {
  const html = await readFile(new URL("out/index.html", root), "utf8");

  assert.match(html, /J3D1\.FM — Signal Over Noise/);
  assert.match(html, /Signal/);
  assert.match(html, /over noise/);
  assert.doesNotMatch(html, /Filipp|Mishchenko/i);
});

// Everything the portfolio versions (0.2.0 - 0.3.3) used to name. The public
// site must not mention projects: not on the home page, and not in the shared
// description that /dzo-gtr/ link previews inherit.
const projectMentions =
  /Learn[ -]Piano|Idle Cruise|cruise-liner|MenuSage|Crush Check|GetDesign|UniversalMMP|PurchaseKit|Marketworthy|Knowledge Vault|Playable Forge|Night Run|Personal[ -]Task[ -]Assistant|MMPredictions|Getaway|Timber|Genhood|Bloghouse|Eponymical|apps\.apple\.com|play\.google\.com/i;

test("keeps project mentions out of every exported page", async () => {
  const files = await readdir(new URL("out/", root), {
    recursive: true,
    withFileTypes: true,
  });
  const pages = files.filter((f) => f.isFile() && /\.(html|txt)$/.test(f.name));

  assert.ok(pages.some((f) => f.name === "index.html"));
  for (const page of pages) {
    const body = await readFile(`${page.parentPath}/${page.name}`, "utf8");
    assert.doesNotMatch(body, projectMentions, `${page.parentPath}/${page.name}`);
  }
});

test("links the home page only to Telegram and LinkedIn", async () => {
  const html = await readFile(new URL("out/index.html", root), "utf8");
  const external = [...html.matchAll(/<a\b[^>]*\bhref="(https?:[^"]+)"/g)]
    .map((match) => match[1])
    .sort();

  assert.deepEqual(external, [
    "https://t.me/j3d1_fm",
    "https://www.linkedin.com/in/fmj3d1/",
  ]);
  assert.doesNotMatch(html, /id="(on-air|rack|short-waves)"/);
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

test('exports the Google login section without a report or financial rows', async () => {
  const html = await readFile(new URL('out/dzo-gtr/index.html', root), 'utf8');
  assert.match(html, /Войти через Google/);
  assert.match(html, /noindex/);
  assert.doesNotMatch(html, /<iframe|srcDoc|srcdoc/);
  const files = await readdir(new URL('out/', root), {recursive: true, withFileTypes: true});
  for (const file of files.filter(f => f.isFile())) {
    assert.doesNotMatch(file.name, /\.pdf$|\.gz$|snapshot\..*\.json$/);
    if (/\.(html|js|json|txt)$/.test(file.name)) {
      const body = await readFile(`${file.parentPath}/${file.name}`, 'utf8');
      assert.doesNotMatch(body, /data-app-snapshot-sha256|purchaseGross|suppressedOverlappingAfCost/);
    }
  }
});
