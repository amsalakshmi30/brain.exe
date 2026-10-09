import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, CheckCircle, XCircle, RotateCcw, Calendar, Clock, Users, AlertTriangle } from 'lucide-react'
import { ODRequest } from '@/types'
import { StageBadge, CategoryBadge, TypeBadge, UrgentBadge } from '@/components/ui/Badges'
import ApprovalStepper from '@/components/ui/ApprovalStepper'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

interface Props {
  od:       ODRequest
  isMock?:  boolean
  onAction?: (odId: string, action: string, comment: string) => Promise<void>
}

export default function ApproverODCard({ od, isMock = false, onAction }: Props) {
  const { userProfile } = useAuth()
  const [expanded, setExpanded] = useState(od.isUrgent)
  const [comment,  setComment]  = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleAction = async (action: 'approved' | 'rejected' | 'changes_requested') => {
    if (!comment.trim()) { toast.error('A comment is required'); return }
    if (!userProfile) return
    if (isMock) {
      const labels = { approved: 'Approved ✓', rejected: 'Rejected', changes_requested: 'Changes Requested' }
      toast.success(`[Demo] ${labels[action]} — connect Firebase for real approvals.`)
      setComment(''); setExpanded(false); return
    }
    setLoading(true)
    try {
      const { advanceODApproval } = await import('@/services/firebase.service')
      await advanceODApproval(
        od.id, action,
        userProfile.uid, userProfile.name,
        comment, od.currentStage
      )
      const labels = { approved: 'OD approved! ✅', rejected: 'OD rejected.', changes_requested: 'Changes requested.' }
      toast.success(labels[action])
      setComment(''); setExpanded(false)
    } catch (err: any) {
      console.error('Approval error:', err)
      toast.error(err.message ?? 'Action failed')
    } finally { setLoading(false) }
  }

  const daysTillEvent = Math.ceil((new Date(od.startDate).getTime() - Date.now()) / 86400000)

  return (
    <motion.div layout style={{
      background: 'rgba(255,255,255,0.9)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderRadius: 18,
      overflow: 'hidden',
      border: od.isUrgent ? '1.5px solid rgba(185,74,72,0.4)' : '1px solid rgba(23,32,51,0.08)',
      boxShadow: od.isUrgent
        ? '0 4px 20px rgba(185,74,72,0.1), 0 1px 4px rgba(23,32,51,0.04)'
        : '0 4px 24px rgba(23,32,51,0.06), 0 1px 4px rgba(23,32,51,0.04)',
      transition: 'box-shadow 0.2s, transform 0.2s',
    }}>

      {/* Card header */}
      <button onClick={() => setExpanded(v => !v)} style={{ width: '100%', padding: '18px 20px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>
        {od.isUrgent && (
          <div style={{ height: 3, margin: '-18px -20px 14px', background: 'linear-gradient(90deg,#ef4444,#f97316)' }} />
        )}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
              <h3 style={{ color: '#0f172a', fontWeight: 700, fontSize: 15 }}>{od.title}</h3>
              {od.isUrgent && <UrgentBadge />}
              <CategoryBadge category={od.category} />
              <TypeBadge type={od.eventType} />
              {od.isTeam && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#f5f3ff', color: '#172033', border: '1px solid #ddd6fe', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Users style={{ width: 10, height: 10 }} /> Team OD ({od.teamMembers.length + 1})
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#94a3b8', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, color: '#64748b' }}>{od.creatorName} · {od.rollNo} · {od.className}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar style={{ width: 12, height: 12 }} />{od.startDate} → {od.endDate}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock style={{ width: 12, height: 12 }} />{od.periods.join(', ')}</span>
              {od.isUrgent && daysTillEvent >= 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#ef4444', fontWeight: 700 }}>
                  <AlertTriangle style={{ width: 12, height: 12 }} />{daysTillEvent === 0 ? 'Today!' : `${daysTillEvent}d left`}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <StageBadge stage={od.currentStage} />
            {expanded ? <ChevronUp style={{ width: 16, height: 16, color: '#94a3b8' }} /> : <ChevronDown style={{ width: 16, height: 16, color: '#94a3b8' }} />}
          </div>
        </div>
        <div style={{ marginTop: 14 }}><ApprovalStepper stage={od.currentStage} /></div>
      </button>

      {/* Expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <div style={{ borderTop: '1px solid #f1f5f9', padding: '18px 20px' }}>

              {/* Details grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 8, marginBottom: 16 }}>
                {[
                  { label: 'Institution', value: od.institution },
                  { label: 'Department',  value: `${od.department} · ${od.className}` },
                  { label: 'Category',    value: od.category },
                  { label: 'Event Type',  value: od.eventType },
                  { label: 'Periods',     value: od.periods.join(', ') },
                  { label: 'Duration',    value: od.startDate === od.endDate ? '1 day' : `${od.startDate} – ${od.endDate}` },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: '#f8faff', borderRadius: 10, padding: '10px 14px', border: '1px solid #e2e8f0' }}>
                    <div style={{ color: '#94a3b8', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>{label}</div>
                    <div style={{ color: '#334155', fontSize: 12, fontWeight: 600 }}>{value}</div>
                  </div>
                ))}
              </div>

              {od.description && (
                <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.65, background: '#f8faff', borderRadius: 10, padding: 14, marginBottom: 14, border: '1px solid #e2e8f0' }}>{od.description}</p>
              )}

              {/* Team members */}
              {od.isTeam && od.teamMembers.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Users style={{ width: 12, height: 12 }} /> Team Members
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {[{ rollNo: od.rollNo, name: od.creatorName, department: od.department }, ...od.teamMembers].map((m, i) => (
                      <span key={i} style={{ padding: '6px 14px', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 20, fontSize: 12, color: '#172033', fontWeight: 600 }}>
                        {m.name} <span style={{ color: '#a78bfa' }}>· {m.rollNo}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Previous comments */}
              {od.approvalHistory.length > 1 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, marginBottom: 8 }}>Previous Remarks</div>
                  {od.approvalHistory.slice(1).map((h, i) => (
                    <div key={i} style={{ background: '#f8faff', borderRadius: 10, padding: '10px 14px', fontSize: 12, marginBottom: 6, border: '1px solid #e2e8f0' }}>
                      <span style={{ color: '#D66A3D', fontWeight: 700 }}>{h.approverName}: </span>
                      <span style={{ color: '#64748b' }}>{h.comment}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action section */}
              <div style={{ paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                <textarea rows={2} value={comment} onChange={e => setComment(e.target.value)}
                  className="input-field" style={{ resize: 'none', fontSize: 13, marginBottom: 12 }}
                  placeholder="Add a remark or reason (required before approving or rejecting)…" />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => handleAction('approved')} disabled={loading}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#3F8F68', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    <CheckCircle style={{ width: 15, height: 15 }} /> Approve
                  </button>
                  <button onClick={() => handleAction('changes_requested')} disabled={loading}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: '#fffbeb', border: '1px solid #fde68a', color: '#d97706', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    <RotateCcw style={{ width: 15, height: 15 }} /> Request Changes
                  </button>
                  <button onClick={() => handleAction('rejected')} disabled={loading}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#B94A48', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    <XCircle style={{ width: 15, height: 15 }} /> Reject
                  </button>
                </div>
                {isMock && (
                  <p style={{ color: '#94a3b8', fontSize: 11, marginTop: 10 }}>Demo mode — actions show toast but don't persist. Connect Firebase to enable real approvals.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

