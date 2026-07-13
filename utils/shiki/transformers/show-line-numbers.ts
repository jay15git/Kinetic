import type { ShikiTransformer } from "shiki"

interface ShowLineNumbersOptions {
  /**
   * Always show line numbers regardless of meta properties
   * @default false
   */
  activateByDefault?: boolean
}

function applyLineNumbersClass(
  node: Parameters<NonNullable<ShikiTransformer["pre"]>>[0],
) {
  const className = "shiki-line-numbers"
  const existingClass = node.properties.class

  if (Array.isArray(existingClass)) {
    if (!existingClass.includes(className)) {
      existingClass.push(className)
    }
    return
  }

  if (typeof existingClass === "string") {
    const classes = existingClass.split(" ")
    if (!classes.includes(className)) {
      node.properties.class = `${existingClass} ${className}`
    }
    return
  }

  node.properties.class = className
}

const showLineNumbers = (
  options: ShowLineNumbersOptions = {},
): ShikiTransformer => {
  const { activateByDefault = false } = options

  return {
    name: "AddLineNumbers",
    pre(node) {
      const rawMeta = this.options.meta?.__raw
      const hasLineNumbersMeta = rawMeta?.includes("lineNumbers") ?? false
      const addLineNumbers = activateByDefault || hasLineNumbersMeta

      if (!addLineNumbers) {
        return
      }

      applyLineNumbersClass(node)
    },
  }
}

/** Programmatic toggle for React code-block components. */
const showLineNumbersWhen = (enabled: boolean): ShikiTransformer => ({
  name: "AddLineNumbers",
  pre(node) {
    if (!enabled) return
    applyLineNumbersClass(node)
  },
})

export { showLineNumbers, showLineNumbersWhen }
