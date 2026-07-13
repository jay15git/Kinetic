export type PackageManager = "pnpm" | "npm" | "bun" | "yarn"

export const PACKAGE_MANAGERS: PackageManager[] = [
  "pnpm",
  "npm",
  "bun",
  "yarn",
]

/** Map a canonical install command to pnpm / npm / bun / yarn variants */
export function convertPackageManagerCommand(
  command: string,
  manager: PackageManager,
): string {
  const trimmed = command.trim()

  if (trimmed.startsWith("npx ")) {
    if (manager === "pnpm") return trimmed.replace(/^npx /, "pnpm dlx ")
    if (manager === "bun") return trimmed.replace(/^npx /, "bunx --bun ")
    if (manager === "yarn") return trimmed.replace(/^npx /, "yarn dlx ")
    return trimmed
  }

  if (trimmed.startsWith("pnpm add ")) {
    if (manager === "npm") return trimmed.replace(/^pnpm add /, "npm install ")
    if (manager === "bun") return trimmed.replace(/^pnpm add /, "bun add ")
    if (manager === "yarn") return trimmed.replace(/^pnpm add /, "yarn add ")
    return trimmed
  }

  if (trimmed.startsWith("pnpm dlx ")) {
    if (manager === "npm") return trimmed.replace(/^pnpm dlx /, "npx ")
    if (manager === "bun") return trimmed.replace(/^pnpm dlx /, "bunx --bun ")
    if (manager === "yarn") return trimmed.replace(/^pnpm dlx /, "yarn dlx ")
    return trimmed
  }

  if (trimmed.startsWith("npm install ")) {
    if (manager === "pnpm") return trimmed.replace(/^npm install /, "pnpm add ")
    if (manager === "bun") return trimmed.replace(/^npm install /, "bun add ")
    if (manager === "yarn") return trimmed.replace(/^npm install /, "yarn add ")
    return trimmed
  }

  return trimmed
}
