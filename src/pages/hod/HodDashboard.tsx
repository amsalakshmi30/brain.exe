import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { MOCK_OD_REQUESTS } from '@/lib/mockData'
import { ODRequest } from '@/types'
import ApproverODCard from '@/components/approver/ApproverODCard'
import { RichStatCard } from '@/components/ui/AnimatedStats'


export default function HodDashboard() {
  const { isMockMode } = useAuth()
  const [queue,   setQueue]   = useState<ODRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isMockMode) {
      const hodQueue = MOCK_OD_REQUESTS
        .filter(od => od.currentStage === 'hod_review')
        .sort((a, b) => {
          if (a.isUrgent && !b.isUrgent) return -1
          if (!a.isUrgent && b.isUrgent) return 1
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        })
      setQueue(hodQueue); setLoading(false); return
    }
    // Real Firebase — subscribe to hod_review stage ODs
    import('@/services/firebase.service').then(({ subscribeToStageODs }) => {
      subscribeToStageODs('hod_review', (data) => { setQueue(data); setLoading(false) })
    })
  }, [isMockMode])

  const urgentCount = queue.filter(od => od.isUrgent).length

  return (
    <div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#172033,#2d3f60)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(23,32,51,0.3)' }}>
            <Shield style={{ width: 20, height: 20, color: 'white' }} />
          </div>
          <h1 className="text-gradient" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>HOD Review Queue</h1>
        </div>
        <p style={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>Final approval stage. Requests here have been cleared by the Class Advisor.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 20, marginBottom: 28 }}>
        <RichStatCard label="Pending Approval" value={queue.length}                          pct={100}                                                      icon={<Clock         style={{ width: 18, height: 18 }} />} color="#D39A28" delay={0}    />
        <RichStatCard label="Urgent"            value={urgentCount}                           pct={queue.length ? (urgentCount/queue.length)*100 : 0}         icon={<AlertTriangle style={{ width: 18, height: 18 }} />} color="#B94A48" delay={0.07} />
        <RichStatCard label="Team ODs"          value={queue.filter(od => od.isTeam).length} pct={queue.length ? (queue.filter(od=>od.isTeam).length/queue.length)*100:0} icon={<CheckCircle   style={{ width: 18, height: 18 }} />} color="#3F8F68" delay={0.14} />
      </div>

      {/* Info banner */}
      <div style={{ padding: '14px 18px', borderRadius: 12, marginBottom: 20, background: 'rgba(214,106,61,0.07)', border: '1px solid rgba(214,106,61,0.2)' }}>
        <p style={{ color: '#172033', fontSize: 13, fontWeight: 600 }}>
          ℹ️ <strong>Auto-Notification:</strong>{' '}
          <span style={{ color: '#718096', fontWeight: 500 }}>When you approve an OD, the system automatically notifies all affected subject faculty from the student's timetable.</span>
        </p>
      </div>

      {loading ? [1,2].map(i => <div key={i} className="shimmer-line" style={{ height: 120, borderRadius: 16, marginBottom: 12 }} />) :
       queue.length === 0 ? (
        <div className="card" style={{ padding: 64, textAlign: 'center' }}>
          <Shield style={{ width: 40, height: 40, color: '#cbd5e1', margin: '0 auto 12px' }} />
          <p style={{ color: '#94a3b8', fontSize: 14 }}>No OD requests pending HOD approval.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {queue.map((od, i) => (
            <motion.div key={od.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, ease: [0.22, 1, 0.36, 1], duration: 0.4 }}>
              <ApproverODCard od={od} isMock={isMockMode} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

