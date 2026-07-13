"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export function LandingNavLink({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  const pathname = usePathname()
  const active =
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      className={cn("landing-link", active && "landing-link-active", className)}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  )
}
