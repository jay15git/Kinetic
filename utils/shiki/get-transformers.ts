import { showLineNumbersWhen } from "@/utils/shiki/transformers/show-line-numbers"
import { wordWrapContent } from "@/utils/shiki/transformers/word-wrap"

export function getShikiTransformers({
  lineNumbers = false,
  wordWrap = true,
}: {
  lineNumbers?: boolean
  wordWrap?: boolean
} = {}) {
  // pheralb/code-blocks: line numbers and word wrap are separate features;
  // wrapping breaks the counter gutter, so prefer horizontal scroll instead.
  const shouldWordWrap = wordWrap && !lineNumbers

  return [
    ...(shouldWordWrap ? [wordWrapContent()] : []),
    showLineNumbersWhen(lineNumbers),
  ]
}
