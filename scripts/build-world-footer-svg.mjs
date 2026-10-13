import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public")
const src = path.join(dir, "world.svg")
const out = path.join(dir, "world-footer.svg")

let s = fs.readFileSync(src, "utf8")
s = s
  .replace(/fill="#ececec"|fill="#ffffff"|fill="white"/i, 'fill="#002C71" fill-opacity="0.42"')
  .replace('stroke="black"', 'stroke="#001a48" stroke-opacity="0.5"')
  .replace('stroke-width=".2"', 'stroke-width=".4"')

fs.writeFileSync(out, s)
console.log("Wrote", out)
