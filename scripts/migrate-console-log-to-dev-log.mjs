/**
 * One-shot: replace console.log( with devLog( and add @/lib/dev-log import where needed.
 * Run from repo root: node scripts/migrate-console-log-to-dev-log.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "dist", "coverage"]);
const SKIP_FILES = new Set(["dev-log.ts", "migrate-console-log-to-dev-log.mjs"]);

const IMPORT_LINE = `import { devLog } from "@/lib/dev-log"`;

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(name) && !SKIP_FILES.has(name)) out.push(full);
  }
  return out;
}

function hasDevLogImport(src) {
  return /from\s+["']@\/lib\/dev-log["']/.test(src);
}

function isUseClientLine(line) {
  const t = line.trim();
  return (
    t === '"use client"' ||
    t === "'use client'" ||
    t === '"use client";' ||
    t === "'use client';"
  );
}

/** Insert devLog import after `"use client"` when present (even after leading comments). */
function insertImport(src) {
  if (hasDevLogImport(src)) return src;
  const lines = src.split(/\r?\n/);

  let useClientIdx = -1;
  for (let k = 0; k < Math.min(lines.length, 50); k++) {
    if (isUseClientLine(lines[k])) {
      useClientIdx = k;
      break;
    }
  }

  if (useClientIdx >= 0) {
    let i = useClientIdx + 1;
    while (i < lines.length && lines[i].trim() === "") i++;
    lines.splice(i, 0, "", IMPORT_LINE, "");
    return lines.join("\n");
  }

  let j = 0;
  while (j < lines.length && /^\s*(\/\/|\/\*|\*)/.test(lines[j])) j++;
  lines.splice(j, 0, IMPORT_LINE, "");
  return lines.join("\n");
}

let changedFiles = 0;
let totalReplacements = 0;

for (const file of walk(root)) {
  let src = fs.readFileSync(file, "utf8");
  if (!src.includes("console.log(")) continue;

  const next = src.replace(/console\.log\(/g, "devLog(");
  const n = (src.match(/console\.log\(/g) || []).length;
  if (next === src) continue;

  let out = next;
  if (!hasDevLogImport(out)) out = insertImport(out);

  fs.writeFileSync(file, out, "utf8");
  changedFiles += 1;
  totalReplacements += n;
}

console.log(`migrate-console-log: ${changedFiles} files, ${totalReplacements} replacements`);
