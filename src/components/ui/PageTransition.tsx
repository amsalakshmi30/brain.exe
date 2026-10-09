import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'

// ── Transition variants ───────────────────────────────────────
// Slide in from the right (default page navigation feel)
const slideVariants = {
  initial:  { opacity: 0, x: 32, filter: 'blur(4px)' },
  animate:  { opacity: 1, x: 0,  filter: 'blur(0px)' },
  exit:     { opacity: 0, x: -24, filter: 'blur(2px)' },
}

const transition = {
  duration: 0.3,
  ease: [0.22, 1, 0.36, 1], // custom expo-out
}

// ── Per-route direction ───────────────────────────────────────
// Routes with lower index = "parent", navigating to higher = slide right
const ROUTE_ORDER = [
  '/',
  '/login',
  '/signup',
  '/student',
  '/student/submit',
  '/student/od',
  '/team-finder',
  '/advisor',
  '/hod',
  '/faculty',
  '/admin',
]

function getRouteIndex(path: string) {
  const match = ROUTE_ORDER.findIndex(r => path === r || path.startsWith(r + '/'))
  return match === -1 ? 99 : match
}

// ── Main wrapper ──────────────────────────────────────────────
interface Props { children: React.ReactNode }

export default function PageTransition({ children }: Props) {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={slideVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transition}
        style={{ minHeight: '100%', width: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
