import { resolveCodeLanguage } from "@/lib/resolve-code-language"
import type { ScrubInstallContent } from "@/lib/scrub-install-content"
import { codeToHighlightedHtml } from "@/utils/shiki/code-to-html"

export type ScrubInstallHighlighted = {
  command: string
  registrySnippet: string
  dependenciesCommand: string
  shadcnComponentsCommand: string
  files: Record<string, string>
  importPathsNote: string
}

export async function getScrubInstallHighlighted(
  content: ScrubInstallContent,
): Promise<ScrubInstallHighlighted> {
  const [
    command,
    registrySnippet,
    dependenciesCommand,
    shadcnComponentsCommand,
    importPathsNote,
  ] = await Promise.all([
    codeToHighlightedHtml(content.command, "bash"),
    codeToHighlightedHtml(content.registrySnippet, "json", { lineNumbers: true }),
    codeToHighlightedHtml(content.dependenciesCommand, "bash"),
    codeToHighlightedHtml(content.shadcnComponentsCommand, "bash"),
    codeToHighlightedHtml(content.importPathsNote, "ts"),
  ])

  const fileEntries = await Promise.all(
    content.files.map(async (file) => [
      file.path,
      await codeToHighlightedHtml(file.content, resolveCodeLanguage(file.target), {
        lineNumbers: true,
      }),
    ]),
  )

  return {
    command,
    registrySnippet,
    dependenciesCommand,
    shadcnComponentsCommand,
    files: Object.fromEntries(fileEntries),
    importPathsNote,
  }
}
