import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, CheckCircle, XCircle, Clock, Award, Users, Tag } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { MOCK_OD_REQUESTS } from '@/lib/mockData'
import { ODRequest, ODCategory, ODStage } from '@/types'
import { StageBadge, CategoryBadge } from '@/components/ui/Badges'
import { RichStatCard, AnimatedBar, AnimatedCounter } from '@/components/ui/AnimatedStats'

const CATEGORIES: ODCategory[] = ['Hackathon','Symposium','Workshop','Sports','Paper Presentation','Cultural','Other']

const STAT_COLORS: Record<number, string> = {
  0: '#2563eb', 1: '#16a34a', 2: '#dc2626',
  3: '#f59e0b', 4: '#059669', 5: '#ef4444', 6: '#7c3aed', 7: '#0891b2',
}

export default function AdminDashboard() {
  const { isMockMode } = useAuth()
  const [allODs,  setAllODs]  = useState<ODRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState<'overview' | 'all'>('overview')

  useEffect(() => {
    if (isMockMode) { setAllODs(MOCK_OD_REQUESTS); setLoading(false); return }
    // Real Firebase — subscribe to all ODs
    import('@/services/firebase.service').then(({ subscribeToAllODs }) => {
      subscribeToAllODs((data) => { setAllODs(data); setLoading(false) })
    })
  }, [isMockMode])

  const total        = allODs.length
  const approved     = allODs.filter(r => ['approved','proof_pending','verified'].includes(r.currentStage)).length
  const rejected     = allODs.filter(r => r.currentStage === 'rejected').length
  const pending      = allODs.filter(r => ['submitted','advisor_review','hod_review'].includes(r.currentStage)).length
  const verified     = allODs.filter(r => r.currentStage === 'verified').length
  const urgent       = allODs.filter(r => r.isUrgent).length
  const teamODs      = allODs.filter(r => r.isTeam).length
  const approvalRate = total ? Math.round((approved / total) * 100) : 0

  const byCategory = CATEGORIES.map(cat => ({ cat, count: allODs.filter(r => r.category === cat).length })).filter(x => x.count > 0)
  const maxCat     = Math.max(...byCategory.map(x => x.count), 1)

  const byStage: { stage: ODStage; label: string; count: number }[] = [
    { stage: 'submitted',     label: 'Submitted',    count: allODs.filter(r => r.currentStage === 'submitted').length },
    { stage: 'advisor_review',label: 'Advisor',      count: allODs.filter(r => r.currentStage === 'advisor_review').length },
    { stage: 'hod_review',    label: 'HOD',          count: allODs.filter(r => r.currentStage === 'hod_review').length },
    { stage: 'approved',      label: 'Approved',     count: approved },
    { stage: 'proof_pending', label: 'Proof Pending',count: allODs.filter(r => r.currentStage === 'proof_pending').length },
    { stage: 'verified',      label: 'Verified',     count: verified },
    { stage: 'rejected',      label: 'Rejected',     count: rejected },
  ]

  const STATS = [
    { label: 'Total ODs',     value: total,            icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Approved',      value: approved,         icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'Rejected',      value: rejected,         icon: <XCircle    className="w-5 h-5" /> },
    { label: 'Pending',       value: pending,          icon: <Clock      className="w-5 h-5" /> },
    { label: 'Verified',      value: verified,         icon: <Award      className="w-5 h-5" /> },
    { label: 'Urgent',        value: urgent,           icon: <Clock      className="w-5 h-5" /> },
    { label: 'Team ODs',      value: teamODs,          icon: <Users      className="w-5 h-5" /> },
    { label: 'Approval Rate', value: `${approvalRate}%`, icon: <BarChart3 className="w-5 h-5" /> },
  ]

  return (
    <div>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#D66A3D,#c0552e)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(214,106,61,0.3)' }}>
            <BarChart3 style={{ width: 20, height: 20, color: 'white' }} />
          </div>
          <h1 className="text-gradient" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>Admin Analytics</h1>
        </div>
        <p style={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>Platform-wide OD request analytics and oversight. Admin views — Advisor and HOD handle approvals.</p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 20, marginBottom: 28 }}>
        <RichStatCard label="Total ODs"     value={total}    pct={100}                                    icon={<TrendingUp style={{ width: 18, height: 18 }} />} color="#172033" delay={0}    />
        <RichStatCard label="Approved"      value={approved} pct={total ? (approved/total)*100 : 0}      icon={<CheckCircle style={{ width: 18, height: 18 }} />} color="#3F8F68" delay={0.06} />
        <RichStatCard label="Rejected"      value={rejected} pct={total ? (rejected/total)*100 : 0}      icon={<XCircle style={{ width: 18, height: 18 }} />}    color="#B94A48" delay={0.12} />
        <RichStatCard label="Pending"       value={pending}  pct={total ? (pending/total)*100 : 0}       icon={<Clock style={{ width: 18, height: 18 }} />}      color="#D39A28" delay={0.18} />
        <RichStatCard label="Verified"      value={verified} pct={total ? (verified/total)*100 : 0}      icon={<Award style={{ width: 18, height: 18 }} />}      color="#3F8F68" delay={0.24} />
        <RichStatCard label="Urgent"        value={urgent}   pct={total ? (urgent/total)*100 : 0}        icon={<Clock style={{ width: 18, height: 18 }} />}      color="#B94A48" delay={0.30} />
        <RichStatCard label="Team ODs"      value={teamODs}  pct={total ? (teamODs/total)*100 : 0}       icon={<Users style={{ width: 18, height: 18 }} />}      color="#172033" delay={0.36} />
        <RichStatCard label="Approval Rate" value={approvalRate} suffix="%" pct={approvalRate}           icon={<BarChart3 style={{ width: 18, height: 18 }} />}  color="#D66A3D" delay={0.42} />
      </div>

      {/* Approval rate bar */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ color: '#334155', fontWeight: 700, fontSize: 14 }}>Overall Approval Rate</span>
          <AnimatedCounter value={approvalRate} suffix="%"
            style={{ color: '#D66A3D', fontWeight: 800, fontSize: 22 }} />
        </div>
        <AnimatedBar value={approvalRate} color="#D66A3D" height={10} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid #f1f5f9', marginBottom: 20 }}>
        {([['overview','Analytics'], ['all',`All Requests (${total})`]] as const).map(([val, label]) => (
          <button key={val} onClick={() => setTab(val)}
            style={{ padding: '10px 18px', fontSize: 14, fontWeight: 700, borderRadius: '10px 10px 0 0', border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              background:   tab === val ? 'white' : 'transparent',
              color:        tab === val ? '#0f172a' : '#94a3b8',
              borderBottom: tab === val ? '2px solid #2563eb' : '2px solid transparent',
            }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
          {/* By category */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ color: '#0f172a', fontWeight: 800, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tag style={{ width: 16, height: 16, color: '#2563eb' }} /> By Category
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {byCategory.map(({ cat, count }) => (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 120, flexShrink: 0 }}><CategoryBadge category={cat} /></div>
                  <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 20, overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(count / maxCat) * 100}%` }} transition={{ duration: 0.8 }}
                      style={{ height: '100%', background: 'linear-gradient(90deg,#2563eb,#4f46e5)', borderRadius: 20 }} />
                  </div>
                  <div style={{ color: '#0f172a', fontWeight: 800, fontSize: 13, width: 20, textAlign: 'right' }}>{count}</div>
                </div>
              ))}
              {byCategory.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>No data yet</p>}
            </div>
          </div>

          {/* Pipeline */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ color: '#0f172a', fontWeight: 800, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 style={{ width: 16, height: 16, color: '#2563eb' }} /> Current Pipeline
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {byStage.filter(s => s.count > 0).map(({ stage, count }) => (
                <div key={stage} style={{ background: '#f8faff', borderRadius: 12, padding: '12px 14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ marginBottom: 8 }}><StageBadge stage={stage} /></div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-1px' }}>{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'all' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loading
            ? [1,2,3].map(i => <div key={i} className="shimmer-line" style={{ height: 64, borderRadius: 14 }} />)
            : allODs.map((od, i) => (
              <motion.div key={od.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ color: '#0f172a', fontSize: 14, fontWeight: 700 }}>{od.title}</span>
                    <CategoryBadge category={od.category} />
                    {od.isUrgent && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>Urgent</span>}
                    {od.isTeam   && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe' }}>Team</span>}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: 12 }}>{od.creatorName} · {od.rollNo} · {od.className} · {od.startDate}</div>
                </div>
                <StageBadge stage={od.currentStage} />
              </motion.div>
            ))}
        </div>
      )}
    </div>
  )
}
