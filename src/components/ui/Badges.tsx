import React from 'react'
import { ODStage, ODCategory, ODEventType } from '@/types'

// ── Deep Navy + Warm Orange palette ──────────────────────────
// Success  = #3F8F68 | Warning = #D39A28 | Error = #B94A48
// Navy     = #172033 | Muted   = #718096 | Accent = #D66A3D

export function StageBadge({ stage }: { stage: ODStage }) {
  const map: Record<ODStage, { label: string; bg: string; color: string; border: string }> = {
    submitted:      { label: 'Submitted',      bg: 'rgba(211,154,40,0.1)',  color: '#7a5800', border: 'rgba(211,154,40,0.3)' },
    advisor_review: { label: 'Advisor Review', bg: 'rgba(23,32,51,0.08)',   color: '#172033', border: 'rgba(23,32,51,0.18)' },
    hod_review:     { label: 'HOD Review',     bg: 'rgba(23,32,51,0.08)',   color: '#172033', border: 'rgba(23,32,51,0.18)' },
    approved:       { label: 'Approved ✓',     bg: 'rgba(63,143,104,0.1)', color: '#1f5e40', border: 'rgba(63,143,104,0.3)' },
    proof_pending:  { label: 'Proof Pending',  bg: 'rgba(211,154,40,0.1)', color: '#7a5800', border: 'rgba(211,154,40,0.3)' },
    verified:       { label: 'Verified ✓✓',   bg: 'rgba(63,143,104,0.15)',color: '#1f5e40', border: 'rgba(63,143,104,0.35)' },
    rejected:       { label: 'Rejected',       bg: 'rgba(185,74,72,0.1)',  color: '#7a1f1f', border: 'rgba(185,74,72,0.3)' },
    proof_overdue:  { label: 'Proof Overdue',  bg: 'rgba(185,74,72,0.12)', color: '#7a1f1f', border: 'rgba(185,74,72,0.35)' },
  }
  const s = map[stage] ?? { label: stage, bg: 'rgba(113,128,150,0.1)', color: '#718096', border: 'rgba(113,128,150,0.25)' }
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  )
}

export function CategoryBadge({ category }: { category: ODCategory | string }) {
  // All categories use palette-aligned colors — no blues/purples
  const map: Record<string, { bg: string; color: string; border: string }> = {
    Hackathon:            { bg: 'rgba(214,106,61,0.1)', color: '#7a2e0d', border: 'rgba(214,106,61,0.28)' },
    Symposium:            { bg: 'rgba(23,32,51,0.08)',  color: '#172033', border: 'rgba(23,32,51,0.18)' },
    Workshop:             { bg: 'rgba(63,143,104,0.1)', color: '#1f5e40', border: 'rgba(63,143,104,0.28)' },
    Sports:               { bg: 'rgba(211,154,40,0.1)', color: '#7a5800', border: 'rgba(211,154,40,0.28)' },
    'Paper Presentation': { bg: 'rgba(185,74,72,0.08)', color: '#7a1f1f', border: 'rgba(185,74,72,0.25)' },
    Cultural:             { bg: 'rgba(214,106,61,0.12)',color: '#7a2e0d', border: 'rgba(214,106,61,0.32)' },
    Competition:          { bg: 'rgba(23,32,51,0.06)',  color: '#172033', border: 'rgba(23,32,51,0.15)' },
    Other:                { bg: 'rgba(113,128,150,0.08)',color: '#718096', border: 'rgba(113,128,150,0.2)' },
  }
  const s = map[category] ?? map['Other']
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
      background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {category}
    </span>
  )
}

export function TypeBadge({ type }: { type: ODEventType }) {
  const isExt = type === 'External'
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
      background: isExt ? 'rgba(214,106,61,0.1)' : 'rgba(113,128,150,0.08)',
      color:      isExt ? '#7a2e0d'               : '#718096',
      border:     isExt ? '1px solid rgba(214,106,61,0.28)' : '1px solid rgba(113,128,150,0.2)' }}>
      {type}
    </span>
  )
}

export function UrgentBadge() {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
      background: 'rgba(185,74,72,0.12)', color: '#7a1f1f',
      border: '1px solid rgba(185,74,72,0.32)', animation: 'pulse 2s infinite' }}>
      🔴 Urgent
    </span>
  )
}
