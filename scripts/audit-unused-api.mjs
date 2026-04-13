/**
 * Lists app/api route.ts handlers with no reference outside app/api (heuristic).
 * Dynamic segments become [^/'"`\s]+ in a regex against file contents.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.name === "node_modules" || ent.name === ".next") continue;
    if (ent.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function collectSources() {
  const exts = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);
  const files = walk(root).filter((f) => {
    const rel = path.relative(root, f).replace(/\\/g, "/");
    if (rel.startsWith("app/api/")) return false;
    if (!exts.has(path.extname(f))) return false;
    return true;
  });
  const chunks = [];
  for (const f of files) {
    try {
      chunks.push(fs.readFileSync(f, "utf8"));
    } catch {
      /* skip */
    }
  }
  return chunks.join("\n\n");
}

function routePaths() {
  const apiRoot = path.join(root, "app", "api");
  const routes = [];
  function scan(dir) {
    const routeFile = path.join(dir, "route.ts");
    if (fs.existsSync(routeFile)) {
      const rel = path.relative(apiRoot, dir).replace(/\\/g, "/");
      routes.push(rel);
    }
    for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!name.isDirectory()) continue;
      if (name.name === "node_modules") continue;
      scan(path.join(dir, name.name));
    }
  }
  scan(apiRoot);
  return routes.sort();
}

/** Matches a path segment that is either a template `${...}` or a literal id. */
const DYN = "(?:\\$\\{[^}]+\\}|[^/'\"`\\s]+)";

function relToRegex(rel) {
  const segments = rel.split("/").filter(Boolean);
  const parts = segments.map((s) => {
    if (s.startsWith("[") && s.endsWith("]")) {
      if (s === "[...nextauth]") return "(?:.*)";
      return DYN;
    }
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  });
  const body = parts.join("/");
  return new RegExp(`/api/${body}(?:['"\`?\\s]|$)`);
}

const corpus = collectSources();
/** Deepest paths first (easier to skim); do not `rm -rf` a parent dir if it still contains other `route.ts` files. */
const rels = routePaths().sort((a, b) => b.split("/").length - a.split("/").length);

const alwaysKeep = new Set([
  "auth/[...nextauth]", // NextAuth
]);

const unused = [];
const used = [];

for (const rel of rels) {
  if (alwaysKeep.has(rel)) {
    used.push(rel);
    continue;
  }
  const re = relToRegex(rel);
  if (re.test(corpus)) used.push(rel);
  else unused.push(rel);
}

console.log("=== UNUSED (no match outside app/api) ===\n");
for (const u of unused) console.log(u);
console.log("\n=== counts ===");
console.log("used:", used.length, "unused:", unused.length, "total:", rels.length);
