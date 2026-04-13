/**
 * Heuristic scan: which app/api route URLs appear unused outside app/api?
 *
 * IMPORTANT:
 * - adminApi("/foo") in lib/admin-api.ts becomes `/api/admin/foo` but that
 *   full string never appears in source → many admin routes look "unused".
 * - Template calls adminApi(`/x/${id}`) are not resolved.
 * - External clients, Postman, cron, and mis-typed paths are invisible here.
 *
 * Do NOT bulk-delete from this output alone. Use it as a review shortlist.
 *
 * Run: node scripts/analyze-api-routes.mjs
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")

const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "dist", "build"])

function walkApiRoutes(dir, files = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walkApiRoutes(p, files)
    else if (e.name === "route.ts") files.push(p)
  }
  return files
}

function walkSourceFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walkSourceFiles(p, out)
    else if (/\.(tsx?|jsx?|mjs|cjs)$/.test(e.name)) out.push(p)
  }
  return out
}

const apiRoot = path.join(root, "app", "api")
const routeFiles = walkApiRoutes(apiRoot)

const sourceFiles = []
const appDir = path.join(root, "app")
for (const e of fs.readdirSync(appDir, { withFileTypes: true })) {
  if (e.name === "api") continue
  const p = path.join(appDir, e.name)
  if (e.isDirectory()) walkSourceFiles(p, sourceFiles)
  else if (/\.(tsx?|jsx?)$/.test(e.name)) sourceFiles.push(p)
}
for (const dir of ["components", "lib", "hooks", "scripts"]) {
  walkSourceFiles(path.join(root, dir), sourceFiles)
}

let corpus = ""
for (const f of sourceFiles) {
  try {
    corpus += "\n" + fs.readFileSync(f, "utf8")
  } catch {
    /* skip */
  }
}

/** Resolve adminApi("/path"), adminApi('/path'), adminApi(`/path`) (no ${}) → /api/admin/path */
function expandAdminApiCalls(text) {
  const out = new Set()
  const quoted = /adminApi\(\s*["'](\/[^"']*)["']/g
  let m
  while ((m = quoted.exec(text)) !== null) {
    const p = m[1]
    if (p.startsWith("/")) out.add("/api/admin" + p)
  }
  const backtick = /adminApi\(\s*`(\/[^`${}]*)`/g
  while ((m = backtick.exec(text)) !== null) {
    const p = m[1]
    if (p.startsWith("/")) out.add("/api/admin" + p)
  }
  return out
}

const adminResolved = expandAdminApiCalls(corpus)

function referencedStatic(urlPath) {
  if (corpus.includes(urlPath)) return true
  if (corpus.includes(urlPath + "?")) return true
  if (adminResolved.has(urlPath)) return true
  return false
}

function lastSegment(urlPath) {
  const parts = urlPath.split("/").filter(Boolean)
  return parts[parts.length - 1] || ""
}

function referencedDynamic(urlPath) {
  const staticParts = urlPath.split("/").filter((s) => s && !/^\[[^\]]+\]$/.test(s))
  const staticPath = "/" + staticParts.join("/")
  if (corpus.includes(staticPath + "/") || corpus.includes(staticPath + '"') || corpus.includes(staticPath + "'"))
    return true
  if ([...adminResolved].some((a) => a.startsWith(staticPath + "/") || a === staticPath)) return true
  const tail = lastSegment(urlPath)
  if (!tail || tail.startsWith("[")) {
    const prefix = urlPath.replace(/\/\[[^\]]+\](\/|$)/g, "/").replace(/\/$/, "")
    return corpus.includes(prefix)
  }
  return corpus.includes("/" + tail)
}

const staticUnused = []
const dynamicMaybeUnused = []

for (const f of routeFiles) {
  const rel = path.relative(apiRoot, f).replace(/\\/g, "/")
  const urlPath = "/api/" + rel.replace(/\/route\.ts$/, "")
  const isDyn = urlPath.includes("[")

  if (!isDyn) {
    if (!referencedStatic(urlPath)) staticUnused.push(urlPath)
  } else {
    if (!referencedDynamic(urlPath)) dynamicMaybeUnused.push(urlPath)
  }
}

console.log("SOURCE_FILES_SCANNED", sourceFiles.length)
console.log("adminApi static paths resolved:", adminResolved.size)
console.log("--- STATIC routes: no /api/... literal AND no adminApi('/…') match ---")
console.log("COUNT", staticUnused.length)
staticUnused.sort().forEach((u) => console.log(u))
console.log("")
console.log("--- DYNAMIC routes: weak heuristic (manual review) ---")
console.log("COUNT", dynamicMaybeUnused.length)
dynamicMaybeUnused.sort().forEach((u) => console.log(u))
