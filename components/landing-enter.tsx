"use client"

import { motion, useReducedMotion, type Variants } from "motion/react"

import { cn } from "@/lib/utils"

/** Matches install tab panels. Emil-style ease-out */
const ENTER_EASE = [0.23, 1, 0.32, 1] as const
const ENTER_DURATION = 0.32
const STAGGER_CHILDREN = 0.07
const ENTER_OFFSET_Y = 8

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: STAGGER_CHILDREN,
      delayChildren: 0.03,
    },
  },
}

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: ENTER_OFFSET_Y,
    filter: "blur(2px)",
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: ENTER_DURATION,
      ease: ENTER_EASE,
    },
  },
}

const reducedItemVariants: Variants = {
  hidden: { opacity: 1, y: 0, filter: "blur(0px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
}

export function LandingEnter({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      variants={reduceMotion ? { hidden: {}, show: {} } : containerVariants}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  )
}

export function LandingEnterItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={cn(className)}
      variants={reduceMotion ? reducedItemVariants : itemVariants}
    >
      {children}
    </motion.div>
  )
}

export function LandingPageTransition({
  children,
}: {
  children: React.ReactNode
}) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className="landing-template">{children}</div>
  }

  return (
    <motion.div
      className="landing-template"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.26,
        ease: ENTER_EASE,
      }}
    >
      {children}
    </motion.div>
  )
}
