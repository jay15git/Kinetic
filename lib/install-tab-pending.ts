export type InstallTab = "cli" | "manual"

let pendingInstallTab: InstallTab | null = null

declare global {
  interface Window {
    __scrubInstallTabCapture?: boolean
  }
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
      if (value === "cli" || value === "manual") {
        pendingInstallTab = value
      }
    },
    { capture: true },
  )
}

export function readInitialInstallTab(): InstallTab {
  return pendingInstallTab ?? "cli"
}
