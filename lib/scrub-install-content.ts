import fs from "fs"
import path from "path"

import registry from "@/registry.json"
import { getScrubRegistryInstallCommands } from "@/lib/scrub-props-code"

export type InstallFile = {
  path: string
  target: string
  content: string
}

export type ScrubInstallContent = {
  command: string
  prerequisite: string
  registrySnippet: string
  dependenciesCommand: string
  shadcnComponentsCommand: string
  files: InstallFile[]
  importPathsNote: string
}

const SCRUB_ITEM = registry.items.find((item) => item.name === "scrub-number-field")

function readRegistryFile(relativePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf-8")
}

export function getScrubInstallContent(registryBaseUrl: string): ScrubInstallContent {
  if (!SCRUB_ITEM) {
    throw new Error("scrub-number-field registry item not found")
  }

  const commands = getScrubRegistryInstallCommands(registryBaseUrl)
  const dependencies = SCRUB_ITEM.dependencies.join(" ")

  const files: InstallFile[] = SCRUB_ITEM.files.map((file) => ({
    path: file.path,
    target: file.target.replace(/^@/, ""),
    content: readRegistryFile(file.path),
  }))

  return {
    command: commands.scoped,
    prerequisite: commands.prerequisite,
    registrySnippet: `{
  "registries": {
    "@kinetic": "${registryBaseUrl.replace(/\/$/, "")}/r/{name}.json"
  }
}`,
    dependenciesCommand: `pnpm add ${dependencies}`,
    shadcnComponentsCommand: `pnpm dlx shadcn@latest add ${SCRUB_ITEM.registryDependencies.join(" ")}`,
    files,
    importPathsNote: `// Update @/ import paths in copied files to match your tsconfig paths aliases.`,
  }
}
