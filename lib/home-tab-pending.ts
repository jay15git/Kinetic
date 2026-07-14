export type HomeTab = "features" | "installation"

let pendingHomeTab: HomeTab | null = null

declare global {
  interface Window {
    __scrubHomeTabCapture?: boolean
  }
}

function isHomeTab(value: string | null | undefined): value is HomeTab {
  return value === "features" || value === "installation"
}

function isInstallDeepLinkTab(value: string | null): boolean {
  return value === "cli" || value === "manual"
}

function isApiDeepLink(value: string | null, hash: string): boolean {
  return value === "api" || hash === "api"
}

if (typeof window !== "undefined" && !window.__scrubHomeTabCapture) {
  window.__scrubHomeTabCapture = true
  document.addEventListener(
    "pointerdown",
    (event) => {
      const trigger = (event.target as Element | null)?.closest(
        "[data-home-tab-trigger]",
      )
      if (!trigger) return
      const value = trigger.getAttribute("data-home-tab-trigger")
      if (isHomeTab(value)) {
        pendingHomeTab = value
      }
    },
    { capture: true },
  )
}

export function readInitialHomeTab(): HomeTab {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get("tab")
    const hash = window.location.hash.slice(1)

    if (isHomeTab(tab)) return tab
    if (isApiDeepLink(tab, hash)) return "features"
    if (isInstallDeepLinkTab(tab)) return "installation"
  }

  return pendingHomeTab ?? "features"
}
