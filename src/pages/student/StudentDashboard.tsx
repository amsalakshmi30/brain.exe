import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Plus, Clock, CheckCircle, XCircle, Zap, FileText, Users, ChevronRight, TrendingUp } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { MOCK_OD_REQUESTS } from '@/lib/mockData'
import { ODRequest, ODStage } from '@/types'
import { StageBadge, CategoryBadge } from '@/components/ui/Badges'
import ApprovalStepper from '@/components/ui/ApprovalStepper'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// ── Ring progress (dark track for light bg) ───────────────────
function Ring({ pct, color }: { pct: number; color: string }) {
  const r = 18; const c = 2 * Math.PI * r
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <circle cx="24" cy="24" r={r} fill="none" stroke="#e2e8f0" strokeWidth="4" />
      <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)}
        strokeLinecap="round" transform="rotate(-90 24 24)" />
    </svg>
  )
}

// ── OD mini-card (light theme) ────────────────────────────────
function ODMiniCard({ od }: { od: ODRequest }) {
  const stageColor: Partial<Record<ODStage, string>> = {
    approved:      '#3F8F68',
    rejected:      '#B94A48',
    hod_review:    '#172033',
    advisor_review:'#D39A28',
    submitted:     '#718096',
    proof_pending: '#D39A28',
    verified:      '#3F8F68',
  }
  const color = stageColor[od.currentStage] ?? '#64748b'
  return (
    <Link to={`/student/od/${od.id}`} style={{ textDecoration: 'none' }}>
      <div className="card-hover" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}>
        <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 4, background: color, minHeight: 40, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ color: '#0f172a', fontSize: 14, fontWeight: 700 }}>{od.title}</span>
            {od.isUrgent && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>Urgent</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#718096' }}>
            <CategoryBadge category={od.category} />
            <span>·</span>
            <span>{od.startDate}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <StageBadge stage={od.currentStage} />
          <ChevronRight style={{ width: 14, height: 14, color: '#cbd5e1' }} />
        </div>
      </div>
    </Link>
  )
}

export default function StudentDashboard() {
  const { userProfile, isMockMode } = useAuth()
  const [ods,     setOds]     = useState<ODRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isMockMode) {
      const myODs = MOCK_OD_REQUESTS.filter(r => r.createdBy === userProfile?.uid || r.createdBy === 'stu-001')
      setOds(myODs); setLoading(false); return
    }
    if (!userProfile) { setLoading(false); return }
    // Safety: never hang longer than 8 seconds
    const timeout = setTimeout(() => setLoading(false), 8000)
    import('@/services/firebase.service').then(({ subscribeToUserODs }) => {
      subscribeToUserODs(userProfile.uid, (data) => {
        clearTimeout(timeout)
        setOds(data)
        setLoading(false)
      })
    }).catch(() => { clearTimeout(timeout); setLoading(false) })
    return () => clearTimeout(timeout)
  }, [isMockMode, userProfile])

  const total    = ods.length
  const approved = ods.filter(r => ['approved','proof_pending','verified'].includes(r.currentStage)).length
  const pending  = ods.filter(r => ['submitted','advisor_review','hod_review'].includes(r.currentStage)).length
  const rejected = ods.filter(r => r.currentStage === 'rejected').length
  const proofDue = ods.filter(r => r.currentStage === 'proof_pending').length
  const recent   = ods.slice(0, 5)
  const latest   = ods[0]

  return (
    <div>

      {/* ── GREETING BANNER ── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        style={{ borderRadius: 20, marginBottom: 32, position: 'relative', overflow: 'hidden', padding: '32px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        background: '#172033',
          boxShadow: '0 8px 32px rgba(23,32,51,0.3)',
        }}>

        {/* ── Decorations ── */}
        {/* Single uniform dot grid — same dot, same gap, everywhere */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="banner-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="2" fill="rgba(255,255,255,0.13)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#banner-dots)" />
        </svg>

        {/* Dashed bubble rings — top right */}
        <svg style={{ position: 'absolute', right: -30, top: -40, pointerEvents: 'none', opacity: 0.18 }} width="260" height="260">
          <circle cx="180" cy="80" r="110" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeDasharray="6 5" />
          <circle cx="180" cy="80" r="75"  fill="none" stroke="rgba(214,106,61,0.8)"  strokeWidth="1.5" strokeDasharray="4 6" />
          <circle cx="180" cy="80" r="42"  fill="rgba(214,106,61,0.1)" stroke="rgba(214,106,61,0.4)" strokeWidth="1" strokeDasharray="3 5" />
        </svg>

        {/* Dashed bubble rings — bottom left */}
        <svg style={{ position: 'absolute', left: -20, bottom: -30, pointerEvents: 'none', opacity: 0.12 }} width="160" height="160">
          <circle cx="40" cy="120" r="80" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeDasharray="5 6" />
          <circle cx="40" cy="120" r="50" fill="none" stroke="rgba(211,154,40,0.8)"  strokeWidth="1"   strokeDasharray="3 5" />
        </svg>

        {/* Soft orange glow */}
        <div style={{ position: 'absolute', right: 80, top: -40, width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,106,61,0.15) 0%, transparent 70%)',
          pointerEvents: 'none', filter: 'blur(24px)' }} />

        {/* Content */}
        <div style={{ position: 'relative' }}>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: 4, fontWeight: 500 }}>{greeting()}, 👋</p>
          <h1 style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: 800, color: 'white', marginBottom: 4, letterSpacing: '-0.5px' }}>
            {userProfile?.name?.split(' ')[0] ?? 'Student'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 500 }}>
            {userProfile?.rollNo && <span>{userProfile.rollNo} · </span>}
            {userProfile?.className ?? 'CSE-A'} · {userProfile?.department ?? 'CSE'}
          </p>
          {proofDue > 0 && (
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#fde68a' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fbbf24', animation: 'pulse 2s infinite', display: 'inline-block' }} />
              {proofDue} OD{proofDue > 1 ? 's' : ''} need certificate upload
            </div>
          )}
        </div>
        <Link to="/student/submit" className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, padding: '11px 20px', flexShrink: 0, position: 'relative' }}>
          <Plus style={{ width: 16, height: 16 }} /> New OD
        </Link>
      </motion.div>

      {/* ── STAT CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: 20, marginBottom: 28 }}>
        {[
          { label: 'Total ODs', value: total,    pct: 100,                            color: '#172033' },
          { label: 'Approved',  value: approved, pct: total ? (approved/total)*100:0, color: '#3F8F68' },
          { label: 'Pending',   value: pending,  pct: total ? (pending/total)*100:0,  color: '#D39A28' },
          { label: 'Rejected',  value: rejected, pct: total ? (rejected/total)*100:0, color: '#B94A48' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'default' }}>
            {/* Accent stripe */}
            <div style={{ height: 3, background: `linear-gradient(90deg, ${s.color}, ${s.color}88)` }} />
            <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: `${s.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Ring pct={s.pct} color={s.color} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── MAIN GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }} className="md:grid-cols-5-custom">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,3fr) minmax(0,2fr)', gap: 16 }}>

          {/* OD List */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 className="text-gradient" style={{ fontWeight: 800, fontSize: 16 }}>Recent ODs</h2>
              <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600 }}>{total} total</span>
            </div>

            {loading ? (
              [1,2,3].map(i => <div key={i} className="shimmer-line" style={{ height: 64, borderRadius: 16, marginBottom: 8 }} />)
            ) : ods.length === 0 ? (
              <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                <FileText style={{ width: 32, height: 32, color: '#cbd5e1', margin: '0 auto 12px' }} />
                <p style={{ color: '#94a3b8', fontSize: 14 }}>No ODs yet.</p>
                <Link to="/student/submit" style={{ color: '#D66A3D', fontSize: 14, fontWeight: 700, marginTop: 8, display: 'inline-block', textDecoration: 'none' }}>
                  Submit your first OD →
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recent.map((od, i) => (
                  <motion.div key={od.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, ease: [0.22, 1, 0.36, 1], duration: 0.4 }}>
                    <ODMiniCard od={od} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Quick actions */}
            <div className="card" style={{ padding: 20 }}>
              <h2 style={{ color: '#0f172a', fontWeight: 800, fontSize: 15, marginBottom: 14 }}>Quick Actions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { icon: <Plus style={{ width: 15, height: 15 }} />,        label: 'New OD Request',  to: '/student/submit', color: '#D66A3D' },
                  { icon: <Users style={{ width: 15, height: 15 }} />,       label: 'Team Finder',     to: '/team-finder',    color: '#3F8F68' },
                  { icon: <Zap style={{ width: 15, height: 15 }} />,         label: 'Team OD (quick)', to: '/team-finder',    color: '#172033' },
                  { icon: <TrendingUp style={{ width: 15, height: 15 }} />,  label: 'View All ODs',   to: '/student/submit', color: '#D39A28' },
                ].map((a, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.07, ease: [0.22, 1, 0.36, 1], duration: 0.35 }}>
                   <Link to={a.to} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 12, textDecoration: 'none', background: 'rgba(23,32,51,0.03)', border: '1px solid rgba(23,32,51,0.08)', transition: 'all 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${a.color}0d`; (e.currentTarget as HTMLElement).style.borderColor = `${a.color}35` }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(23,32,51,0.03)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(23,32,51,0.08)' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${a.color}15`, color: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {a.icon}
                    </div>
                    <span style={{ color: '#334155', fontSize: 13, fontWeight: 600 }}>{a.label}</span>
                    <ArrowRight style={{ width: 13, height: 13, color: '#cbd5e1', marginLeft: 'auto' }} />
                  </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Latest OD stepper */}
            {latest && (
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h2 style={{ color: '#0f172a', fontWeight: 800, fontSize: 15 }}>Latest OD</h2>
                  <Link to={`/student/od/${latest.id}`} style={{ color: '#D66A3D', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>View →</Link>
                </div>
                <p style={{ color: '#64748b', fontSize: 13, fontWeight: 600, marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{latest.title}</p>
                <ApprovalStepper stage={latest.currentStage} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── TEAM FINDER PROMO ── */}
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        style={{ marginTop: 20, borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, background: 'linear-gradient(135deg,#eff6ff,#eef2ff)', border: '1px solid #bfdbfe', position: 'relative', overflow: 'hidden' }}>
        <div className="dot-grid" style={{ position: 'absolute', right: 0, top: 0, width: 120, height: '100%', opacity: 0.3, pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1e40af', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
            <Users style={{ width: 16, height: 16 }} /> Find Teammates
          </div>
          <p style={{ color: '#64748b', fontSize: 12 }}>12 students looking for teammates for SIH, HackWithInfy & more.</p>
        </div>
        <Link to="/team-finder" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 16px', flexShrink: 0, whiteSpace: 'nowrap' }}>
          Browse <ArrowRight style={{ width: 13, height: 13 }} />
        </Link>
      </motion.div>
    </div>
  )
}
