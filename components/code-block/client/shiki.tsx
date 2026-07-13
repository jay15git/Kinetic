"use client"

import { useEffect, useRef, useState, type ComponentProps } from "react"

import { cn } from "@/lib/utils"
import { getShikiTransformers } from "@/utils/shiki/get-transformers"
import { highlight, Themes, type Languages } from "@/utils/shiki/highlight"

interface CodeblockClientShikiProps extends ComponentProps<"div"> {
  code: string
  language?: Languages
  lineNumbers?: boolean
  /** Break long lines inside the container instead of horizontal scroll */
  wordWrap?: boolean
  /** Server-rendered highlighted HTML to avoid client flash */
  initialHtml?: string
}

const CodeblockShiki = ({
  code,
  language = "tsx",
  lineNumbers = false,
  wordWrap = true,
  className,
  initialHtml,
  ...props
}: CodeblockClientShikiProps) => {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(
    initialHtml ?? null,
  )
  const skipInitialHighlightRef = useRef(Boolean(initialHtml))
  const shouldWordWrap = wordWrap && !lineNumbers

  useEffect(() => {
    if (skipInitialHighlightRef.current) {
      skipInitialHighlightRef.current = false
      return
    }

    async function clientHighlight() {
      if (!code) {
        setHighlightedHtml("<pre><code></code></pre>")
        return
      }
      const highlighter = await highlight()
      const html = highlighter.codeToHtml(code, {
        lang: language,
        themes: {
          light: Themes.light,
          dark: Themes.dark,
        },
        transformers: getShikiTransformers({ lineNumbers, wordWrap }),
      })
      setHighlightedHtml(html)
    }
    void clientHighlight()
  }, [code, language, lineNumbers, wordWrap])

  const classNames = cn(
    "w-full min-w-0",
    !shouldWordWrap && "overflow-x-auto overscroll-x-contain",
    className,
  )

  return highlightedHtml ? (
    <div
      className={classNames}
      dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      {...props}
    />
  ) : (
    <div className={classNames} {...props}>
      <pre
        className={cn(
          "px-4 py-3",
          shouldWordWrap && "whitespace-pre-wrap break-words",
        )}
      >
        <code>{code}</code>
      </pre>
    </div>
  )
}

export { CodeblockShiki }
