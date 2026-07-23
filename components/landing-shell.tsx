import { LandingHeader } from "@/components/landing-header"
import { LandingEnter, LandingEnterItem } from "@/components/landing-enter"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export { LandingEnterItem }

async function getKineticStars(): Promise<number | null> {
  try {
    const res = await fetch("https://api.github.com/repos/jay15git/kinetic", {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const data = (await res.json()) as { stargazers_count?: number }
    return typeof data.stargazers_count === "number"
      ? data.stargazers_count
      : null
  } catch {
    return null
  }
}

export async function LandingShell({
  children,
  fill = true,
}: {
  children: React.ReactNode
  /** Viewport-sized page ScrollArea; content can grow and scroll as a whole. */
  fill?: boolean
}) {
  const stars = await getKineticStars()

  const main = (
    <main className="landing-main">
      <LandingEnter>
        <LandingEnterItem>
          <LandingHeader stars={stars} />
        </LandingEnterItem>
        {children}
      </LandingEnter>
    </main>
  )

  return (
    <div className={cn("landing-page font-sans", fill && "landing-page-fill")}>
      {fill ? (
        <ScrollArea className="landing-page-scroll" scrollbarReveal="scroll">
          {main}
        </ScrollArea>
      ) : (
        main
      )}
    </div>
  )
}
