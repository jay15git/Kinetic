import type { Languages } from "@/utils/shiki/highlight"

export function resolveCodeLanguage(
  labelOrPath: string,
  language?: string,
): Languages {
  const value = (language ?? labelOrPath).toLowerCase()

  if (value.endsWith(".tsx") || value === "tsx") return "tsx"
  if (value.endsWith(".ts") || value === "ts") return "ts"
  if (value.endsWith(".jsx") || value === "jsx") return "tsx"
  if (value.endsWith(".js") || value === "js") return "js"
  if (value.endsWith(".css") || value === "css") return "css"
  if (value.endsWith(".json") || value.includes("json")) return "json"
  if (value.endsWith(".mdx") || value === "mdx") return "mdx"
  if (
    value.includes("terminal") ||
    value.startsWith("pnpm ") ||
    value.startsWith("npx ") ||
    value.startsWith("npm ") ||
    value.startsWith("yarn ") ||
    value.startsWith("bun ")
  ) {
    return "bash"
  }

  return "tsx"
}
