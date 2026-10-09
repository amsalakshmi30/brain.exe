import React from 'react'
import { ODStage } from '@/types'
import { motion } from 'framer-motion'
import { Check, X, Send, UserCheck, Shield, ThumbsUp, FileCheck, Award } from 'lucide-react'

interface Step { key: ODStage; label: string; icon: React.ReactNode }

const STEPS: Step[] = [
  { key: 'submitted',      label: 'Submitted', icon: <Send      style={{ width: 10, height: 10 }} /> },
  { key: 'advisor_review', label: 'Advisor',   icon: <UserCheck style={{ width: 10, height: 10 }} /> },
  { key: 'hod_review',     label: 'HOD',       icon: <Shield    style={{ width: 10, height: 10 }} /> },
  { key: 'approved',       label: 'Approved',  icon: <ThumbsUp  style={{ width: 10, height: 10 }} /> },
  { key: 'proof_pending',  label: 'Proof',     icon: <FileCheck style={{ width: 10, height: 10 }} /> },
  { key: 'verified',       label: 'Verified',  icon: <Award     style={{ width: 10, height: 10 }} /> },
]

function getState(stepKey: ODStage, current: ODStage): 'done' | 'active' | 'pending' | 'rejected' {
  if (current === 'rejected' || current === 'proof_overdue') {
    const stepIdx  = STEPS.findIndex(s => s.key === stepKey)
    const doneUpTo = STEPS.findIndex(s => s.key === 'submitted')
    return stepIdx <= doneUpTo ? 'done' : 'rejected'
  }
  const order      = STEPS.map(s => s.key)
  const currentIdx = order.indexOf(current)
  const stepIdx    = order.indexOf(stepKey)
  if (currentIdx === -1) return 'pending'
  if (stepIdx <  currentIdx) return 'done'
  if (stepIdx === currentIdx) return 'active'
  return 'pending'
}

// ── Deep Navy + Warm Orange palette ──────────────────────────
const STATE_STYLE = {
  done:     { bg: '#D66A3D',              border: '#D66A3D',              color: 'white',   labelColor: '#D66A3D' },
  active:   { bg: 'rgba(214,106,61,0.1)', border: '#D66A3D',              color: '#D66A3D', labelColor: '#D66A3D' },
  pending:  { bg: 'rgba(23,32,51,0.05)', border: 'rgba(23,32,51,0.15)',  color: '#718096', labelColor: '#718096' },
  rejected: { bg: 'rgba(185,74,72,0.1)', border: 'rgba(185,74,72,0.35)', color: '#B94A48', labelColor: '#B94A48' },
}

export default function ApprovalStepper({ stage }: { stage: ODStage }) {
  const isRejected = stage === 'rejected' || stage === 'proof_overdue'

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {STEPS.map((step, i) => {
          const state  = isRejected && i > 0 ? 'rejected' : getState(step.key, stage)
          const isLast = i === STEPS.length - 1
          const s      = STATE_STYLE[state]

          return (
            <React.Fragment key={step.key}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, position: 'relative', zIndex: 1 }}>
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.06 }}
                  style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${s.border}`,
                    background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: state === 'active' ? '0 0 0 4px rgba(214,106,61,0.14)' : 'none',
                    transition: 'all 0.3s',
                  }}>
                  {state === 'done'                                   && <Check style={{ width: 12, height: 12 }} />}
                  {state === 'rejected'                               && <X     style={{ width: 12, height: 12 }} />}
                  {(state === 'active' || state === 'pending')        && step.icon}
                </motion.div>
                <span style={{ fontSize: 9, fontWeight: 700, whiteSpace: 'nowrap', color: s.labelColor }}>{step.label}</span>
              </div>
              {!isLast && (
                <div style={{ flex: 1, height: 2, margin: '0 2px 14px', borderRadius: 2, transition: 'all 0.5s',
                  background: state === 'done' ? '#D66A3D' : 'rgba(23,32,51,0.1)' }} />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
