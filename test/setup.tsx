import "@testing-library/jest-dom/vitest"

import React from "react"
import { vi } from "vitest"

vi.mock("motion/react", () => ({
  animate: () => ({ stop: () => {} }),
  motion: {
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { layoutRoot: _layoutRoot, ...rest } = props
      return React.createElement("div", rest, children)
    },
  },
  useMotionValue: (initial = 0) => {
    let value = initial
    return {
      get: () => value,
      set: (next: number) => {
        value = next
      },
    }
  },
  useReducedMotion: () => true,
}))

vi.mock("calligraph", () => ({
  Calligraph: ({ children }: { children: React.ReactNode }) =>
    React.createElement("span", null, children),
}))
