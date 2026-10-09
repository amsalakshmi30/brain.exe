import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckSquare, Clock, FileCheck, AlertTriangle, Award, Inbox } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { MOCK_OD_REQUESTS } from '@/lib/mockData'
import { ODRequest } from '@/types'
import ApproverODCard from '@/components/approver/ApproverODCard'
import { StageBadge } from '@/components/ui/Badges'
import toast from 'react-hot-toast'
import { RichStatCard } from '@/components/ui/AnimatedStats'

type TabId = 'approval' | 'proof'


export default function AdvisorDashboard() {
  const { isMockMode } = useAuth()
  const [allODs,  setAllODs]  = useState<ODRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState<TabId>('approval')

  useEffect(() => {
    if (isMockMode) { setAllODs(MOCK_OD_REQUESTS); setLoading(false); return }
    // Real Firebase — subscribe to all ODs visible to advisor
    import('@/services/firebase.service').then(({ subscribeToAllODs }) => {
      subscribeToAllODs((data) => { setAllODs(data); setLoading(false) })
    })
  }, [isMockMode])

  const approvalQueue = allODs
    .filter(od => od.currentStage === 'advisor_review' || od.currentStage === 'submitted')
    .sort((a, b) => {
      if (a.isUrgent && !b.isUrgent) return -1
      if (!a.isUrgent && b.isUrgent) return 1
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    })

  const proofQueue  = allODs.filter(od => od.currentStage === 'proof_pending')
  const urgentCount = approvalQueue.filter(od => od.isUrgent).length

  const handleVerify = async (odId: string) => {
    if (isMockMode) { toast.success('[Demo] Certificate verified! OD marked complete.'); return }
    try {
      const { doc, updateDoc, arrayUnion, serverTimestamp } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      await updateDoc(doc(db, 'odRequests', odId), {
        currentStage: 'verified',
        proofStatus: 'verified',
        approvalHistory: arrayUnion({
          stage: 'proof_pending', action: 'verified',
          approverId: 'advisor', approverName: 'Advisor',
          comment: 'Participation certificate verified.',
          timestamp: new Date().toISOString(),
        }),
        updatedAt: serverTimestamp(),
      })
      toast.success('Certificate verified! OD marked complete. ✅')
    } catch (err: any) { toast.error(err.message ?? 'Verification failed') }
  }

  return (
    <div>

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#172033,#D66A3D)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(23,32,51,0.25)' }}>
            <CheckSquare style={{ width: 20, height: 20, color: 'white' }} />
          </div>
          <h1 className="text-gradient" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>Class Advisor Dashboard</h1>
        </div>
        <p style={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>Review OD requests from your class. Urgent requests are auto-sorted to top.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 20, marginBottom: 28 }}>
        <RichStatCard label="Pending Review"  value={approvalQueue.length} pct={allODs.length ? (approvalQueue.length/allODs.length)*100 : 0} icon={<Clock style={{ width: 18, height: 18 }} />}          color="#D39A28" delay={0}    />
        <RichStatCard label="Urgent"          value={urgentCount}          pct={approvalQueue.length ? (urgentCount/approvalQueue.length)*100 : 0} icon={<AlertTriangle style={{ width: 18, height: 18 }} />}   color="#B94A48" delay={0.07} />
        <RichStatCard label="Proof to Verify" value={proofQueue.length}    pct={allODs.length ? (proofQueue.length/allODs.length)*100 : 0} icon={<FileCheck style={{ width: 18, height: 18 }} />}       color="#3F8F68" delay={0.14} />
        <RichStatCard label="Total in Class"  value={allODs.length}        pct={100}                                                      icon={<Inbox style={{ width: 18, height: 18 }} />}           color="#172033" delay={0.21} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(8px)', borderRadius: 14, padding: 4, marginBottom: 20, width: 'fit-content', border: '1px solid rgba(255,255,255,0.8)' }}>
        {([['approval', 'Approval Queue', approvalQueue.length, '#f59e0b'],
           ['proof',    'Proof Verification', proofQueue.length, '#0891b2']] as const).map(([id, label, count, color]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ position: 'relative', padding: '8px 16px', fontSize: 13, fontWeight: 700, borderRadius: 10, border: 'none', cursor: 'pointer', transition: 'color 0.15s',
              background: tab === id ? 'white' : 'transparent',
              color: tab === id ? '#0f172a' : '#94a3b8',
              boxShadow: tab === id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            }}>
            {label}
            <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 800, padding: '2px 7px', borderRadius: 20, background: `${color}18`, color }}>{count}</span>
          </button>
        ))}
      </div>

      {tab === 'approval' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {loading ? [1,2].map(i => <div key={i} className="shimmer-line" style={{ height: 120, borderRadius: 16 }} />) :
           approvalQueue.length === 0 ? (
            <div className="card" style={{ padding: 64, textAlign: 'center' }}>
              <CheckSquare style={{ width: 40, height: 40, color: '#cbd5e1', margin: '0 auto 12px' }} />
              <p style={{ color: '#94a3b8', fontSize: 14 }}>No pending OD requests in your queue. 🎉</p>
            </div>
          ) : approvalQueue.map((od, i) => (
            <motion.div key={od.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, ease: [0.22, 1, 0.36, 1], duration: 0.4 }}>
              <ApproverODCard od={od} isMock={isMockMode} />
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'proof' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {proofQueue.length === 0 ? (
            <div className="card" style={{ padding: 64, textAlign: 'center' }}>
              <Award style={{ width: 40, height: 40, color: '#cbd5e1', margin: '0 auto 12px' }} />
              <p style={{ color: '#94a3b8', fontSize: 14 }}>No certificates pending verification.</p>
            </div>
          ) : proofQueue.map((od, i) => (
            <motion.div key={od.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, ease: [0.22, 1, 0.36, 1], duration: 0.4 }}
              className="card" style={{ padding: 20, borderLeft: '3px solid #ea580c' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                <div>
                  <h3 style={{ color: '#0f172a', fontWeight: 700, fontSize: 15 }}>{od.title}</h3>
                  <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>{od.creatorName} · {od.rollNo} · {od.className} · {od.startDate} → {od.endDate}</p>
                </div>
                <StageBadge stage={od.currentStage} />
              </div>
              {od.certificateUrl ? (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <a href={od.certificateUrl} target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#D66A3D', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                    <FileCheck style={{ width: 15, height: 15 }} /> View Certificate
                  </a>
                  <button onClick={() => handleVerify(od.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    <Award style={{ width: 14, height: 14 }} /> Mark Verified
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: 13 }}>
                  <Clock style={{ width: 14, height: 14 }} /> Waiting for student to upload certificate…
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

