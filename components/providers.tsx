"use client"

import "@/lib/home-tab-pending"
import "@/lib/install-tab-pending"

import { ShapeProvider } from "@/lib/shape-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return <ShapeProvider defaultShape="pill">{children}</ShapeProvider>
}
