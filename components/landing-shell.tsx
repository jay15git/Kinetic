import { LandingHeader } from "@/components/landing-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export function LandingShell({
  children,
  fill = false,
}: {
  children: React.ReactNode
  /** Viewport-sized page ScrollArea; content can grow and scroll as a whole. */
  fill?: boolean
}) {
  const main = (
    <main className="landing-main">
      <LandingHeader />
      {children}
    </main>
  )

  return (
    <div className={cn("landing-page font-sans", fill && "landing-page-fill")}>
      {fill ? (
        <ScrollArea className="landing-page-scroll">
          {main}
        </ScrollArea>
      ) : (
        main
      )}
    </div>
  )
}
