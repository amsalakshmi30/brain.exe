import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Clock, Building, Users, CheckCircle, XCircle, RotateCcw, MessageSquare, Upload, FileCheck, Award, Bell, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { MOCK_OD_REQUESTS } from '@/lib/mockData'
import { ODRequest, ApprovalEntry } from '@/types'
import ApprovalStepper from '@/components/ui/ApprovalStepper'
import { StageBadge, CategoryBadge, TypeBadge, UrgentBadge } from '@/components/ui/Badges'
import toast from 'react-hot-toast'

// Light-theme timeline action icons
const ACTION_ICON: Record<string, React.ReactNode> = {
  submitted:          <MessageSquare style={{ width: 15, height: 15, color: '#D66A3D' }} />,
  approved:           <CheckCircle   style={{ width: 15, height: 15, color: '#3F8F68' }} />,
  rejected:           <XCircle       style={{ width: 15, height: 15, color: '#dc2626' }} />,
  changes_requested:  <RotateCcw     style={{ width: 15, height: 15, color: '#d97706' }} />,
  proof_submitted:    <Upload        style={{ width: 15, height: 15, color: '#D66A3D' }} />,
  verified:           <Award         style={{ width: 15, height: 15, color: '#3F8F68' }} />,
  reminder_sent:      <Bell          style={{ width: 15, height: 15, color: '#7c3aed' }} />,
}

// Light-theme action badge styles
const ACTION_BADGE: Record<string, React.CSSProperties> = {
  approved:           { background: '#f0fdf4', color: '#3F8F68', border: '1px solid #bbf7d0' },
  rejected:           { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
  verified:           { background: '#ecfdf5', color: '#3F8F68', border: '1px solid #a7f3d0' },
  submitted:          { background: '#eff6ff', color: '#D66A3D', border: '1px solid #bfdbfe' },
  proof_submitted:    { background: '#eff6ff', color: '#D66A3D', border: '1px solid #bfdbfe' },
  changes_requested:  { background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' },
  reminder_sent:      { background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe' },
}

const fmtDate = (ts: any) => {
  if (!ts) return ''
  try { return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
  catch { return String(ts) }
}

const CARD: React.CSSProperties = {
  background: 'white', borderRadius: 18, border: '1px solid #e2e8f0',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: 24,
}

// ── Deadline helpers ─────────────────────────────────────────────
function getDaysUntil(dateStr: string | undefined): number | null {
  if (!dateStr) return null
  try {
    const diff = new Date(dateStr).getTime() - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  } catch { return null }
}

const PENDING_STAGES = ['submitted', 'advisor_review', 'hod_review']
const REMINDER_COOLDOWN_KEY = (odId: string) => `reminder_sent_${odId}`

export default function ODDetailPage() {
  const { id }      = useParams<{ id: string }>()
  const navigate    = useNavigate()
  const { isMockMode, userProfile } = useAuth()
  const [od,        setOd]        = useState<ODRequest | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const [sending,   setSending]   = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isMockMode) { setOd(MOCK_OD_REQUESTS.find(r => r.id === id) ?? null); setLoading(false); return }
    // Firebase mode — load OD
    ;(async () => {
      try {
        const { doc, getDoc } = await import('firebase/firestore')
        const { db }          = await import('@/lib/firebase')
        const snap = await getDoc(doc(db, 'odRequests', id!))
        if (snap.exists()) setOd({ id: snap.id, ...snap.data() } as ODRequest)
      } catch {}
      setLoading(false)
    })()
  }, [id, isMockMode])

  const handleProofUpload = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) { toast.error('Please select a file first'); return }
    if (isMockMode) {
      setUploading(true)
      await new Promise(r => setTimeout(r, 1200))
      toast.success('[Demo] Certificate uploaded! Advisor will verify it.')
      setUploading(false); return
    }
    if (!od) return
    setUploading(true)
    try {
      const { submitODProof } = await import('@/services/firebase.service')
      await submitODProof(od.id, file)
      toast.success('Certificate uploaded! Your advisor will verify it. ✅')
      // Refresh OD data
      const { doc, getDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      const snap = await getDoc(doc(db, 'odRequests', od.id))
      if (snap.exists()) setOd({ id: snap.id, ...snap.data() } as ODRequest)
    } catch (err: any) {
      console.error('Proof upload error:', err)
      toast.error(err.message ?? 'Upload failed')
    } finally { setUploading(false) }
  }

  // ── Send Deadline Reminder ─────────────────────────────────────
  const handleSendReminder = async () => {
    if (!od) return

    // Cooldown: only allow one reminder per OD per session
    const lastSent = localStorage.getItem(REMINDER_COOLDOWN_KEY(od.id))
    if (lastSent) {
      const hoursAgo = (Date.now() - Number(lastSent)) / (1000 * 60 * 60)
      if (hoursAgo < 24) {
        toast.error(`Reminder already sent. You can send another in ${Math.ceil(24 - hoursAgo)} hour(s).`)
        return
      }
    }

    setSending(true)
    const daysLeft = getDaysUntil(od.registrationDeadline ?? od.startDate)
    const deadlineStr = od.registrationDeadline
      ? new Date(od.registrationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      : od.startDate

    try {
      if (isMockMode) {
        // Mock mode: simulate reminder
        await new Promise(r => setTimeout(r, 800))
      } else {
        const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')

        // Notify the advisor (or HOD if already past advisor stage)
        const targetRole = od.currentStage === 'hod_review' ? 'hod' : 'advisor'

        await addDoc(collection(db, 'notifications'), {
          targetRole,
          targetUid:   od.advisorId ?? null,
          type:        'deadline_reminder',
          title:       '⏰ Deadline Reminder from Student',
          message:     `${od.creatorName} (${od.rollNo}) is reminding you that the registration deadline for "${od.title}" is on ${deadlineStr} — only ${daysLeft} day(s) left. Their OD request is still pending your review.`,
          relatedOdId: od.id,
          studentName: od.creatorName,
          studentRoll: od.rollNo,
          eventTitle:  od.title,
          deadline:    deadlineStr,
          daysLeft,
          read:        false,
          createdAt:   serverTimestamp(),
        })

        // Log in OD approval history
        const { doc, updateDoc, arrayUnion } = await import('firebase/firestore')
        const { db: db2 } = await import('@/lib/firebase')
        await updateDoc(doc(db2, 'odRequests', od.id), {
          approvalHistory: arrayUnion({
            stage:        od.currentStage,
            action:       'reminder_sent',
            approverId:   userProfile?.uid ?? 'student',
            approverName: userProfile?.name ?? od.creatorName,
            comment:      `Deadline reminder sent — registration closes on ${deadlineStr} (${daysLeft} day(s) left).`,
            timestamp:    new Date().toISOString(),
          }),
        })
      }

      localStorage.setItem(REMINDER_COOLDOWN_KEY(od.id), String(Date.now()))
      toast.success('✅ Reminder sent to your advisor!')

      // Refresh OD in mock mode to show the timeline entry
      if (isMockMode) {
        setOd(prev => prev ? {
          ...prev,
          approvalHistory: [
            ...(prev.approvalHistory ?? []),
            {
              stage:        prev.currentStage,
              action:       'reminder_sent',
              approverId:   'student',
              approverName: userProfile?.name ?? prev.creatorName,
              comment:      `Deadline reminder sent — registration closes on ${deadlineStr} (${daysLeft} day(s) left).`,
              timestamp:    new Date().toISOString(),
            },
          ],
        } : prev)
      }
    } catch (err) {
      toast.error('Failed to send reminder. Try again.')
    } finally {
      setSending(false)
    }
  }

  if (loading) return (
    <div style={{ padding: 24, maxWidth: 760, margin: '0 auto' }}>
      <div className="shimmer-line" style={{ height: 256, borderRadius: 18 }} />
    </div>
  )
  if (!od) return (
    <div style={{ padding: 24, textAlign: 'center', paddingTop: 80, color: '#94a3b8', fontSize: 15, fontWeight: 600 }}>
      OD request not found.
    </div>
  )

  // ── Reminder banner conditions ─────────────────────────────────
  const isPending    = PENDING_STAGES.includes(od.currentStage)
  const daysLeft     = getDaysUntil(od.registrationDeadline ?? od.startDate)
  const deadlineNear = daysLeft !== null && daysLeft <= 3 && daysLeft >= 0
  const showReminder = isPending && deadlineNear
  const alreadySent  = !!localStorage.getItem(REMINDER_COOLDOWN_KEY(od.id))

  return (
    <div>

      <button onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 14, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20, padding: 0 }}>
        <ArrowLeft style={{ width: 16, height: 16 }} /> Back
      </button>

      {/* Header card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ ...CARD, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{od.title}</h1>
              {od.isUrgent && <UrgentBadge />}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              <CategoryBadge category={od.category} />
              <TypeBadge type={od.eventType} />
            </div>
            <p style={{ color: '#94a3b8', fontSize: 12, fontWeight: 500 }}>Submitted by {od.creatorName} · {od.rollNo}</p>
          </div>
          <StageBadge stage={od.currentStage} />
        </div>
        <ApprovalStepper stage={od.currentStage} />
      </motion.div>

      {/* ── Deadline Reminder Banner ── */}
      {showReminder && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ ...CARD, marginBottom: 14, borderLeft: '3px solid #7c3aed', background: '#faf5ff' }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle style={{ width: 20, height: 20, color: '#7c3aed' }} />
              </div>
              <div>
                <div style={{ color: '#5b21b6', fontWeight: 800, fontSize: 14, marginBottom: 3 }}>
                  {daysLeft === 0 ? '🚨 Deadline is TODAY!' : `⏰ Deadline in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`}
                </div>
                <div style={{ color: '#6d28d9', fontSize: 12, fontWeight: 500, lineHeight: 1.5 }}>
                  {alreadySent
                    ? 'You already sent a reminder for this OD. Your advisor has been notified.'
                    : 'Your OD is still pending approval. Send a reminder to your advisor about the approaching deadline.'}
                </div>
              </div>
            </div>
            {!alreadySent && (
              <button
                onClick={handleSendReminder}
                disabled={sending}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700,
                  background: sending ? 'rgba(124,58,237,0.1)' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  color: sending ? '#7c3aed' : 'white',
                  border: sending ? '1.5px solid #ddd6fe' : 'none',
                  cursor: sending ? 'not-allowed' : 'pointer',
                  boxShadow: sending ? 'none' : '0 4px 12px rgba(124,58,237,0.3)',
                  transition: 'all 0.2s', flexShrink: 0,
                }}
              >
                {sending
                  ? <><span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #ddd6fe', borderTopColor: '#7c3aed', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Sending…</>
                  : <><Bell style={{ width: 15, height: 15 }} /> Send Reminder</>
                }
              </button>
            )}
            {alreadySent && (
              <span style={{ fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 20, background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', flexShrink: 0 }}>
                ✓ Reminder Sent
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* Proof upload banner */}
      {od.currentStage === 'proof_pending' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{ ...CARD, marginBottom: 14, borderLeft: '3px solid #ea580c', background: '#fff7ed' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <FileCheck style={{ width: 20, height: 20, color: '#ea580c', flexShrink: 0 }} />
            <div>
              <div style={{ color: '#c2410c', fontWeight: 700, fontSize: 14 }}>Certificate Upload Required</div>
              <div style={{ color: '#9a3412', fontSize: 12, marginTop: 2 }}>Upload your participation certificate to complete the OD verification process.</div>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleProofUpload} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '9px 20px' }}>
            <Upload style={{ width: 15, height: 15 }} />{uploading ? 'Uploading…' : 'Upload Certificate / Proof'}
          </button>
        </motion.div>
      )}

      {/* OD Details */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        style={{ ...CARD, marginBottom: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>OD Details</h2>
        {od.description && (
          <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.65, marginBottom: 16, padding: '12px 16px', background: '#f8faff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            {od.description}
          </p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 10 }}>
          {[
            { icon: <Calendar style={{ width: 14, height: 14 }} />,     label: 'Start Date',  value: od.startDate },
            { icon: <Calendar style={{ width: 14, height: 14 }} />,     label: 'End Date',    value: od.endDate },
            { icon: <Building style={{ width: 14, height: 14 }} />,     label: 'Institution', value: od.institution },
            { icon: <Clock    style={{ width: 14, height: 14 }} />,     label: 'Periods',     value: od.periods.join(', ') },
            { icon: <Users    style={{ width: 14, height: 14 }} />,     label: 'Type',        value: od.isTeam ? `Team OD (${od.teamMembers.length + 1})` : 'Individual' },
            { icon: <MessageSquare style={{ width: 14, height: 14 }} />,label: 'Class',       value: `${od.className} · ${od.department}` },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{ background: '#f8faff', borderRadius: 12, padding: '12px 14px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>{icon} {label}</div>
              <div style={{ color: '#0f172a', fontSize: 13, fontWeight: 700 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Team members */}
        {od.isTeam && od.teamMembers.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
              <Users style={{ width: 13, height: 13 }} /> Team Members
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {od.teamMembers.map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f8faff', borderRadius: 12, padding: '10px 14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#D66A3D,#c0552e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 800 }}>{i + 2}</div>
                  <div>
                    <span style={{ color: '#0f172a', fontSize: 13, fontWeight: 700 }}>{m.name}</span>
                    <span style={{ color: '#94a3b8', fontSize: 12, marginLeft: 8 }}>{m.rollNo} · {m.department}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Approval Timeline */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
        style={{ ...CARD }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>Approval Timeline</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {(od.approvalHistory ?? []).map((entry: ApprovalEntry, i: number) => (
            <div key={i} style={{ display: 'flex', gap: 16, paddingBottom: i < od.approvalHistory.length - 1 ? 20 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: entry.action === 'reminder_sent' ? '#f5f3ff' : '#f8faff', border: `2px solid ${entry.action === 'reminder_sent' ? '#ddd6fe' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {ACTION_ICON[entry.action] ?? <MessageSquare style={{ width: 14, height: 14, color: '#94a3b8' }} />}
                </div>
                {i < od.approvalHistory.length - 1 && (
                  <div style={{ flex: 1, width: 2, background: '#f1f5f9', margin: '4px 0', minHeight: 16 }} />
                )}
              </div>
              <div style={{ flex: 1, paddingBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ color: '#0f172a', fontSize: 14, fontWeight: 700 }}>{entry.approverName}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20, ...(ACTION_BADGE[entry.action] ?? ACTION_BADGE.submitted) }}>
                    {entry.action.replace(/_/g, ' ')}
                  </span>
                </div>
                {entry.comment && <p style={{ color: '#475569', fontSize: 13, lineHeight: 1.55, marginBottom: 4 }}>{entry.comment}</p>}
                <p style={{ color: '#94a3b8', fontSize: 11 }}>{fmtDate(entry.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
