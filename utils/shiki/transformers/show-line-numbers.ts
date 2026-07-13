import type { ShikiTransformer } from "shiki"

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

/** Programmatic toggle for React code-block components. */
const showLineNumbersWhen = (enabled: boolean): ShikiTransformer => ({
  name: "AddLineNumbers",
  pre(node) {
    if (!enabled) return
    applyLineNumbersClass(node)
  },
})

export { showLineNumbersWhen }
