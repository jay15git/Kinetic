export type InstallTab = "cli" | "manual"

let pendingInstallTab: InstallTab | null = null

declare global {
  interface Window {
    __scrubInstallTabCapture?: boolean
  }
}

function isInstallTab(value: string | null | undefined): value is InstallTab {
  return value === "cli" || value === "manual"
}

if (typeof window !== "undefined" && !window.__scrubInstallTabCapture) {
  window.__scrubInstallTabCapture = true
  document.addEventListener(
    "pointerdown",
    (event) => {
      const trigger = (event.target as Element | null)?.closest(
        "[data-install-tab-trigger]",
      )
      if (!trigger) return
      const value = trigger.getAttribute("data-install-tab-trigger")
      if (isInstallTab(value)) {
        pendingInstallTab = value
      }
    },
    { capture: true },
  )
}

export function readInitialInstallTab(): InstallTab {
  if (typeof window !== "undefined") {
    const tab = new URLSearchParams(window.location.search).get("tab")
    if (isInstallTab(tab)) return tab
  }

  return pendingInstallTab ?? "cli"
}
