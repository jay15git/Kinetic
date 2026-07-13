#!/usr/bin/env node
/**
 * Smoke test: install scrub-number-field from the local registry into a temp
 * Next.js + shadcn project and verify `next build` succeeds.
 */
import { spawn } from "node:child_process"
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises"
import http from "node:http"
import { createReadStream, existsSync } from "node:fs"
import { dirname, join, extname } from "node:path"
import { fileURLToPath } from "node:url"
import { tmpdir } from "node:os"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const REGISTRY_DIR = join(ROOT, "public", "r")

function run(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
      env: {
        ...process.env,
        ...options.env,
      },
      ...options,
    })
    child.on("error", reject)
    child.on("close", (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${cmd} ${args.join(" ")} exited with ${code}`))
    })
  })
}

function contentType(filePath) {
  switch (extname(filePath)) {
    case ".json":
      return "application/json"
    case ".css":
      return "text/css"
    default:
      return "text/plain"
  }
}

function startRegistryServer(port) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url ?? "/", `http://127.0.0.1:${port}`)
      const filePath = join(REGISTRY_DIR, url.pathname.replace(/^\//, ""))

      if (!filePath.startsWith(REGISTRY_DIR) || !existsSync(filePath)) {
        res.statusCode = 404
        res.end("not found")
        return
      }

      res.setHeader("Content-Type", contentType(filePath))
      createReadStream(filePath).pipe(res)
    })

    server.listen(port, "127.0.0.1", () => resolve(server))
  })
}

async function main() {
  const workDir = await mkdtemp(join(tmpdir(), "kinetic-registry-smoke-"))
  const projectDir = join(workDir, "smoke-app")
  const port = 4173 + Math.floor(Math.random() * 100)
  const server = await startRegistryServer(port)

  try {
    console.log(`\n→ Creating smoke project in ${projectDir}`)
    await mkdir(workDir, { recursive: true })
    await run(
      "pnpm",
      [
        "dlx",
        "create-next-app@latest",
        "smoke-app",
        "--ts",
        "--tailwind",
        "--eslint",
        "--app",
        "--src-dir",
        "--import-alias",
        "@/*",
        "--turbopack",
        "--use-npm",
        "--yes",
        "--skip-install",
      ],
      { cwd: workDir },
    )

    await run("npm", ["install"], { cwd: projectDir })

    await run("npx", ["shadcn@latest", "init", "--defaults", "--yes"], {
      cwd: projectDir,
    })

    const componentsJsonPath = join(projectDir, "components.json")
    const componentsJson = JSON.parse(await readFile(componentsJsonPath, "utf8"))
    componentsJson.registries = {
      "@kinetic": `http://127.0.0.1:${port}/{name}.json`,
    }
    await writeFile(componentsJsonPath, `${JSON.stringify(componentsJson, null, 2)}\n`)

    console.log("\n→ Installing @kinetic/scrub-number-field from local registry")
    await run(
      "npx",
      ["shadcn@latest", "add", "@kinetic/scrub-number-field", "--yes", "--overwrite"],
      { cwd: projectDir },
    )

    const pagePath = join(projectDir, "src", "app", "page.tsx")
    await writeFile(
      pagePath,
      `"use client"

import { useState } from "react"
import { ScrubNumberField } from "@/components/ui/scrub-number-input"

export default function Page() {
  const [value, setValue] = useState(48)
  return (
    <main className="p-8">
      <ScrubNumberField
        aria-label="Value"
        value={value}
        onValueChange={setValue}
        min={0}
        max={100}
      />
    </main>
  )
}
`,
    )

    console.log("\n→ Running next build")
    await run("npm", ["run", "build"], { cwd: projectDir })

    console.log("\n✔ Registry smoke test passed")
  } finally {
    server.close()
    await rm(workDir, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error("\n✖ Registry smoke test failed")
  console.error(error)
  process.exit(1)
})
