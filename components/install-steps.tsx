import { cn } from "@/lib/utils"

export function InstallSteps({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <ol className={cn("landing-install-steps", className)}>{children}</ol>
}

export function InstallStep({
  title,
  className,
  children,
}: {
  title: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <li className={cn("landing-install-step", className)}>
      <h3 className="landing-install-step-title">{title}</h3>
      <div className="landing-install-step-body">{children}</div>
    </li>
  )
}
