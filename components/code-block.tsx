"use client"

import { useCallback, useMemo, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { CodeblockShiki } from "@/components/code-block/client/shiki"
import { ScrollArea } from "@/components/ui/scroll-area"
import { resolveCodeLanguage } from "@/lib/resolve-code-language"
import type { Languages } from "@/utils/shiki/highlight"
import { copyToClipboard } from "@/utils/copy"
import {
  convertPackageManagerCommand,
  PACKAGE_MANAGERS,
  type PackageManager,
} from "@/lib/convert-package-manager-command"
import { cn } from "@/lib/utils"

function resolveLanguage(labelOrPath: string, language?: string): Languages {
  return resolveCodeLanguage(labelOrPath, language)
}

const shellClassName =
  "landing-code-block flex min-w-0 max-w-full flex-col overflow-clip rounded-2xl border border-[var(--landing-border)] bg-white shadow-[var(--landing-shadow-card)] text-[var(--landing-ink)] transition-transform duration-[120ms] ease-[var(--landing-ease)]"

const headerRowClassName =
  "flex min-h-9 w-full shrink-0 items-center justify-between gap-2 border-b border-[var(--landing-border)] bg-white px-4 py-0"

const headerCopyClassName =
  "landing-code-header flex min-w-0 flex-1 items-center justify-between gap-2 py-2.5 text-left"

const codeScrollClassName =
  "landing-code-scroll min-w-0 max-w-full bg-white font-mono text-[12.5px] leading-[1.7] tracking-[-0.01em]"

function CodeBlockScroll({
  children,
  className,
  orientation = "vertical",
}: {
  children: React.ReactNode
  className?: string
  orientation?: "vertical" | "horizontal" | "both"
}) {
  return (
    <ScrollArea
      className={cn(codeScrollClassName, className)}
      orientation={orientation}
      scrollbarReveal="scroll"
    >
      {children}
    </ScrollArea>
  )
}

const PM_EASE = [0.23, 1, 0.32, 1] as const
const PM_DURATION = 0.18

function AnimatedTerminalCode({
  manager,
  defaultManager,
  code,
  initialHighlightedHtml,
}: {
  manager: PackageManager
  defaultManager: PackageManager
  code: string
  initialHighlightedHtml?: string
}) {
  const reduceMotion = useReducedMotion()

  return (
    <div className="landing-pm-code-shell">
      <AnimatePresence initial={false}>
        <motion.div
          key={manager}
          className="landing-pm-code-panel min-w-0"
          initial={
            reduceMotion ? false : { opacity: 0, filter: "blur(2px)" }
          }
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={reduceMotion ? undefined : { opacity: 0, filter: "blur(2px)" }}
          transition={{
            duration: reduceMotion ? 0 : PM_DURATION,
            ease: PM_EASE,
          }}
        >
          <CodeblockShiki
            code={code}
            language="bash"
            lineNumbers={false}
            initialHtml={
              manager === defaultManager ? initialHighlightedHtml : undefined
            }
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function useCopyCode(code: string) {
  const [copied, setCopied] = useState(false)

  const onCopy = useCallback(async () => {
    await copyToClipboard(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }, [code])

  return { copied, onCopy }
}

function CopyStatusIcon({ copied }: { copied: boolean }) {
  return (
    <span
      className="landing-icon-swap size-4 shrink-0"
      data-state={copied ? "b" : "a"}
      aria-hidden
    >
      <span className="landing-icon-swap-icon" data-icon="a">
        <CopyIcon className="size-4 text-[var(--landing-ink-3)]" />
      </span>
      <span className="landing-icon-swap-icon" data-icon="b">
        <CheckIcon className="size-4 text-[var(--landing-green)]" />
      </span>
    </span>
  )
}

function CodeBlockHeader({
  label,
  copied,
  onCopy,
}: {
  label: string
  copied: boolean
  onCopy: () => void
}) {
  return (
    <button
      type="button"
      className={cn(headerRowClassName, headerCopyClassName, "w-full")}
      onClick={() => void onCopy()}
    >
      <span className="sr-only">{copied ? "Copied" : `Copy ${label}`}</span>
      <span className="landing-code-label truncate">{label}</span>
      <CopyStatusIcon copied={copied} />
    </button>
  )
}

function PackageManagerHeader({
  manager,
  onManagerChange,
  copied,
  onCopy,
}: {
  manager: PackageManager
  onManagerChange: (manager: PackageManager) => void
  copied: boolean
  onCopy: () => void
}) {
  return (
    <div className={headerRowClassName}>
      <div
        className="landing-pm-tabs shrink-0"
        role="tablist"
        aria-label="Package manager"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        {PACKAGE_MANAGERS.map((pm) => (
          <button
            key={pm}
            type="button"
            role="tab"
            aria-selected={manager === pm}
            className={cn(
              "landing-pm-tab",
              manager === pm && "landing-pm-tab-active",
            )}
            onClick={() => onManagerChange(pm)}
          >
            <span className="landing-tab-label">{pm}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        className={cn(headerCopyClassName, "justify-end")}
        onClick={() => void onCopy()}
      >
        <span className="sr-only">{copied ? "Copied" : "Copy command"}</span>
        <CopyStatusIcon copied={copied} />
      </button>
    </div>
  )
}

export function TerminalCodeBlock({
  code,
  className,
  defaultManager = "pnpm",
  initialHighlightedHtml,
}: {
  code: string
  className?: string
  defaultManager?: PackageManager
  initialHighlightedHtml?: string
}) {
  const [manager, setManager] = useState<PackageManager>(defaultManager)
  const resolvedCode = useMemo(
    () => convertPackageManagerCommand(code, manager),
    [code, manager],
  )
  const { copied, onCopy } = useCopyCode(resolvedCode)

  return (
    <div className={cn(shellClassName, className)}>
      <PackageManagerHeader
        manager={manager}
        onManagerChange={setManager}
        copied={copied}
        onCopy={onCopy}
      />
      <CodeBlockScroll className="max-h-96">
        <AnimatedTerminalCode
          manager={manager}
          defaultManager={defaultManager}
          code={resolvedCode}
          initialHighlightedHtml={initialHighlightedHtml}
        />
      </CodeBlockScroll>
    </div>
  )
}

export function CodeBlock({
  label,
  code,
  language,
  className,
  initialHighlightedHtml,
}: {
  label: string
  code: string
  language?: string
  className?: string
  initialHighlightedHtml?: string
}) {
  const resolvedLanguage = resolveLanguage(label, language)
  const { copied, onCopy } = useCopyCode(code)

  return (
    <div className={cn(shellClassName, className)}>
      <CodeBlockHeader label={label} copied={copied} onCopy={onCopy} />
      <CodeBlockScroll className="max-h-96">
        <CodeblockShiki
          code={code}
          language={resolvedLanguage}
          lineNumbers={false}
          wordWrap
          initialHtml={initialHighlightedHtml}
        />
      </CodeBlockScroll>
    </div>
  )
}

export function FileCodeBlock({
  title,
  code,
  language,
  className,
  initialHighlightedHtml,
}: {
  title: string
  code: string
  language?: string
  className?: string
  initialHighlightedHtml?: string
}) {
  const resolvedLanguage = resolveLanguage(title, language)
  const { copied, onCopy } = useCopyCode(code)

  return (
    <div className={cn(shellClassName, className)}>
      <CodeBlockHeader label={title} copied={copied} onCopy={onCopy} />
      <CodeBlockScroll className="max-h-72">
        <CodeblockShiki
          code={code}
          language={resolvedLanguage}
          lineNumbers={false}
          wordWrap
          initialHtml={initialHighlightedHtml}
        />
      </CodeBlockScroll>
    </div>
  )
}
