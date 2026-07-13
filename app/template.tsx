import { LandingPageTransition } from "@/components/landing-enter"

export default function LandingTemplate({
  children,
}: {
  children: React.ReactNode
}) {
  return <LandingPageTransition>{children}</LandingPageTransition>
}
