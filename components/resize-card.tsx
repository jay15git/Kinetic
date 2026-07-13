"use client"

import { useLayoutEffect, useRef, useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"

function measureHeight(outer: HTMLElement, inner: HTMLElement) {
  const style = getComputedStyle(outer)
  const verticalPadding =
    (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0)

  return inner.offsetHeight + verticalPadding
}

export function ResizeCard({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [canAnimate, setCanAnimate] = useState(false)

  useLayoutEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return

    const sync = () => {
      outer.style.height = `${measureHeight(outer, inner)}px`
    }

    sync()

    const frame = requestAnimationFrame(() => {
      sync()
      setCanAnimate(true)
    })

    if (typeof ResizeObserver === "undefined") {
      return () => cancelAnimationFrame(frame)
    }

    const observer = new ResizeObserver(sync)
    observer.observe(inner)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])

  return (
    <div ref={outerRef} className={cn(canAnimate && "t-resize", className)}>
      <div ref={innerRef}>{children}</div>
    </div>
  )
}
