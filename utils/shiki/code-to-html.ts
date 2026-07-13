import { wordWrapContent } from "@/utils/shiki/transformers/word-wrap"
import { highlight, Themes, type Languages } from "@/utils/shiki/highlight"

export async function codeToHighlightedHtml(
  code: string,
  language: Languages,
  options: { lineNumbers?: boolean; wordWrap?: boolean } = {},
): Promise<string> {
  const { lineNumbers = false, wordWrap = true } = options

  if (!code) {
    return "<pre><code></code></pre>"
  }

  const highlighter = await highlight()
  return highlighter.codeToHtml(code, {
    lang: language,
    themes: {
      light: Themes.light,
      dark: Themes.dark,
    },
    transformers: [
      ...(wordWrap ? [wordWrapContent()] : []),
      {
        name: "AddLineNumbers",
        pre(node) {
          if (lineNumbers) {
            const shikiStyles = node.properties.class
            node.properties.class = `${shikiStyles} shiki-line-numbers`
          }
        },
      },
    ],
  })
}
