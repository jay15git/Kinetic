import { LandingHeader } from "@/components/landing-header"
import { LandingEnter, LandingEnterItem } from "@/components/landing-enter"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export { LandingEnterItem }

export function LandingShell({
  children,
  fill = true,
}: {
  children: React.ReactNode
  /** Viewport-sized page ScrollArea; content can grow and scroll as a whole. */
  fill?: boolean
}) {
  const main = (
    <main className="landing-main">
      <LandingEnter>
        <LandingEnterItem>
          <LandingHeader />
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
