import { copyFileSync, mkdirSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const cssSource = resolve(root, "../../components/ui/scrub-number-input.css")
const cssTarget = resolve(root, "dist/scrub-number-input.css")

mkdirSync(dirname(cssTarget), { recursive: true })
copyFileSync(cssSource, cssTarget)
