#!/usr/bin/env node
// Packs stroke-order data for every character the course uses, one file per
// HSK level (a character belongs to the first level that uses it).
//
// Source: hanzi-writer-data 2.0.1 (derived from Make Me a Hanzi), licensed
// under the Arphic Public License. Unlike the course content, these files are
// NOT encrypted: the license requires modified data to stay freely available.
// Every output file carries a notice describing the modification, and
// assets/strokes/ARPHICPL.TXT ships next to them.
//
// Usage: node Tools/pack_strokes.mjs <path-to-hanzi-writer-data/package>
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const source = process.argv[2];
if (!source || !fs.existsSync(path.join(source, "ARPHICPL.TXT"))) {
  console.error("usage: node Tools/pack_strokes.mjs <hanzi-writer-data/package>");
  process.exit(1);
}
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const contentDir = path.join(root, "assets", "content");
const outDir = path.join(root, "assets", "strokes");
fs.mkdirSync(outDir, { recursive: true });

const han = /\p{Script=Han}/u;
const levelOf = new Map();
for (let level = 1; level <= 7; level += 1) {
  const text = fs.readFileSync(path.join(contentDir, `hsk${level}-lessons.json`), "utf8");
  for (const ch of text) if (han.test(ch) && !levelOf.has(ch)) levelOf.set(ch, level);
}
// Characters that only appear in shared files (dictionary expansion, meanings)
// go with the last level so the writing pad still finds them.
for (const file of fs.readdirSync(contentDir).filter((f) => f.endsWith(".json"))) {
  const text = fs.readFileSync(path.join(contentDir, file), "utf8");
  for (const ch of text) if (han.test(ch) && !levelOf.has(ch)) levelOf.set(ch, 7);
}

const notice = "Stroke data derived from hanzi-writer-data 2.0.1 (Make Me a Hanzi), Arphic Public License, see ARPHICPL.TXT. "
  + "Modified 2026-11-18 by Mandarin Studio: subset to the characters of the course, split by HSK level, "
  + "whitespace removed from the SVG path commands, median points flattened to [x0,y0,x1,y1,...]. "
  + "The modified data is freely available under the same license.";

const levels = new Map();
const missing = [];
for (const [ch, level] of levelOf) {
  const file = path.join(source, `${ch}.json`);
  if (!fs.existsSync(file)) { missing.push(ch); continue; }
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const strokes = data.strokes.map((d) => d.replace(/ ?([MQLCZ]) ?/g, "$1"));
  const medians = data.medians.map((points) => points.flat());
  if (!levels.has(level)) levels.set(level, {});
  levels.get(level)[ch] = [strokes, medians];
}

let total = 0;
for (const [level, chars] of [...levels].sort((a, b) => a[0] - b[0])) {
  const body = JSON.stringify({ notice, level, chars });
  const packed = zlib.gzipSync(body, { level: 9 });
  fs.writeFileSync(path.join(outDir, `S${level}.hzs`), packed);
  total += packed.length;
  console.log(`S${level}.hzs  ${Object.keys(chars).length} characters  ${(packed.length / 1024).toFixed(0)} KB`);
}
fs.copyFileSync(path.join(source, "ARPHICPL.TXT"), path.join(outDir, "ARPHICPL.TXT"));
console.log(`total ${(total / 1024 / 1024).toFixed(2)} MB, without stroke data: ${missing.join("") || "none"}`);
