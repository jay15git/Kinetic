import { ScrubInstallSection } from "@/components/scrub-install-section"
import { getScrubInstallHighlighted } from "@/lib/scrub-install-highlighted"
import { getScrubInstallContent } from "@/lib/scrub-install-content"

const REGISTRY_URL =
  process.env.NEXT_PUBLIC_KINETIC_REGISTRY_URL ?? "https://kinetic.itsjay.in"

export async function ScrubInstallAsync() {
  const installContent = getScrubInstallContent(REGISTRY_URL)
  const highlighted = await getScrubInstallHighlighted(installContent)

  return (
    <ScrubInstallSection content={installContent} highlighted={highlighted} />
  )
}
