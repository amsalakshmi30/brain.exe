import React, { useEffect, useRef, useState } from 'react'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'

// ── Animated Number Counter ───────────────────────────────────
interface CounterProps {
  value:    number
  duration?: number   // seconds
  prefix?:  string
  suffix?:  string
  style?:   React.CSSProperties
  className?: string
}

export function AnimatedCounter({ value, duration = 1.2, prefix = '', suffix = '', style, className }: CounterProps) {
  const ref        = useRef<HTMLSpanElement>(null)
  const isInView   = useInView(ref, { once: true, margin: '-40px' })
  const motionVal  = useMotionValue(0)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const controls = animate(motionVal, value, {
      duration,
      ease: [0.16, 1, 0.3, 1], // expo out
      onUpdate: v => setDisplay(Math.round(v)),
    })
    return controls.stop
  }, [isInView, value, duration])

  return (
    <span ref={ref} style={style} className={className}>
      {prefix}{display}{suffix}
    </span>
  )
}

// ── Animated Progress Bar ─────────────────────────────────────
interface BarProps {
  value:    number    // 0-100
  color:    string    // hex
  height?:  number    // px
  delay?:   number    // seconds
  rounded?: boolean
}

export function AnimatedBar({ value, color, height = 6, delay = 0, rounded = true }: BarProps) {
  const ref      = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-20px' })

  return (
    <div ref={ref}
      style={{ width: '100%', height, borderRadius: rounded ? 99 : 0, background: `${color}22`, overflow: 'hidden' }}>
      <motion.div
        initial={{ width: '0%' }}
        animate={isInView ? { width: `${Math.min(value, 100)}%` } : { width: '0%' }}
        transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
        style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          boxShadow: `0 0 8px ${color}55` }}
      />
    </div>
  )
}

// ── Animated Ring (SVG donut) ────────────────────────────────
interface RingProps {
  pct:    number
  color:  string
  size?:  number
  stroke?: number
}

export function AnimatedRing({ pct, color, size = 44, stroke = 4 }: RingProps) {
  const ref      = useRef<SVGCircleElement>(null)
  const isInView = useInView({ current: ref.current?.closest('svg') as Element | null }, { once: true })
  const r        = (size - stroke) / 2
  const circ     = 2 * Math.PI * r
  const offset   = circ * (1 - pct / 100)

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      {/* Track */}
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${color}20`} strokeWidth={stroke} />
      {/* Progress */}
      <motion.circle
        ref={ref}
        cx={size/2} cy={size/2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
      />
    </svg>
  )
}

// ── Rich Stat Card ────────────────────────────────────────────
interface StatCardProps {
  label:    string
  value:    number
  color:    string
  icon:     React.ReactNode
  pct?:     number    // 0-100 for the bar
  total?:   number    // optional "of N" text
  delay?:   number
  suffix?:  string
}

export function RichStatCard({ label, value, color, icon, pct, total, delay = 0, suffix = '' }: StatCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, ease: [0.16, 1, 0.3, 1], duration: 0.5 }}
      style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 20, border: '1px solid rgba(255,255,255,0.85)', overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(37,99,235,0.06), 0 1px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)',
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}>
      {/* Color accent top stripe */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${color}, ${color}66)` }} />
      <div style={{ padding: '16px 18px' }}>
        {/* Icon + value row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
            {icon}
          </div>
          <AnimatedCounter value={value} suffix={suffix}
            style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: '-1px', lineHeight: 1 }} />
        </div>
        {/* Label */}
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: pct !== undefined ? 8 : 0 }}>
          {label}{total !== undefined && <span style={{ color: '#cbd5e1', fontWeight: 500 }}> / {total}</span>}
        </div>
        {/* Animated progress bar */}
        {pct !== undefined && <AnimatedBar value={pct} color={color} delay={delay + 0.2} />}
      </div>
    </motion.div>
  )
}
