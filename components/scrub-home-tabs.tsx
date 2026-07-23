"use client"

import { useState, type ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"

import { ScrubHowItWorks } from "@/components/scrub-how-it-works"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { readInitialHomeTab, type HomeTab } from "@/lib/home-tab-pending"

/** Strong ease-out. Emil / animation audit standard for UI entrances */
const PANEL_EASE = [0.23, 1, 0.32, 1] as const
const PANEL_DURATION = 0.2

function HomeTabPanel({
  active,
  id,
  labelledBy,
  reduceMotion,
  children,
}: {
  active: boolean
  id: string
  labelledBy: string
  reduceMotion: boolean | null
  children: ReactNode
}) {
  return (
    <motion.div
      role="tabpanel"
      id={id}
      aria-labelledby={labelledBy}
      aria-hidden={!active}
      inert={!active ? true : undefined}
      className="landing-install-panel"
      data-active={active ? "true" : "false"}
      initial={false}
      animate={{
        opacity: active ? 1 : 0,
        filter: reduceMotion || active ? "blur(0px)" : "blur(2px)",
      }}
      transition={{
        duration: reduceMotion ? 0 : PANEL_DURATION,
        ease: PANEL_EASE,
      }}
    >
      {children}
    </motion.div>
  )
}

export function ScrubHomeTabs({
  installation,
}: {
  installation: ReactNode
}) {
  const [tab, setTab] = useState<HomeTab>(readInitialHomeTab)
  const reduceMotion = useReducedMotion()

  return (
    <section className="landing-section" aria-label="Product details">
      <Tabs
        value={tab}
        onValueChange={(value) => {
          if (value === "features" || value === "installation") setTab(value)
        }}
        className="landing-home-tabs"
      >
        <TabsList variant="line" className="landing-home-tab-list">
          <TabsTrigger
            value="features"
            data-home-tab-trigger="features"
            id="home-tab-features"
          >
            <span className="landing-tab-label">Features</span>
          </TabsTrigger>
          <TabsTrigger
            value="installation"
            data-home-tab-trigger="installation"
            id="home-tab-installation"
          >
            <span className="landing-tab-label">Installation</span>
          </TabsTrigger>
        </TabsList>

        <div className="landing-install-panel-shell">
          <HomeTabPanel
            active={tab === "features"}
            id="home-panel-features"
            labelledBy="home-tab-features"
            reduceMotion={reduceMotion}
          >
            <ScrubHowItWorks />
          </HomeTabPanel>
          <HomeTabPanel
            active={tab === "installation"}
            id="home-panel-installation"
            labelledBy="home-tab-installation"
            reduceMotion={reduceMotion}
          >
            {installation}
          </HomeTabPanel>
        </div>
      </Tabs>
    </section>
  )
}
