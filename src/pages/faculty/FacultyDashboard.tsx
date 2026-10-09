import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Calendar, Users, Clock, CheckCircle, Bell, ChevronRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { MOCK_OD_REQUESTS, MOCK_TIMETABLE } from '@/lib/mockData'
import { ODRequest, TimetableEntry } from '@/types'
import { RichStatCard } from '@/components/ui/AnimatedStats'

interface FacultyODAlert {
  student: { name: string; rollNo: string; className: string }
  od: ODRequest
  affectedPeriods: string[]
  subject: string
}

function computeAlerts(facultyId: string, ods: ODRequest[], timetable: TimetableEntry[]): FacultyODAlert[] {
  const alerts: FacultyODAlert[] = []
  const mySlots = timetable.filter(t => t.facultyId === facultyId)
  for (const od of ods) {
    if (!['approved','proof_pending','verified'].includes(od.currentStage)) continue
    const affectedPeriods: string[] = []
    const affectedSubjects = new Set<string>()
    for (const slot of mySlots) {
      if (od.periods.includes(slot.period)) {
        affectedPeriods.push(`${slot.day} · ${slot.period}`)
        affectedSubjects.add(slot.subject)
      }
    }
    if (affectedPeriods.length > 0) {
      alerts.push({ student: { name: od.creatorName, rollNo: od.rollNo, className: od.className }, od, affectedPeriods, subject: Array.from(affectedSubjects).join(', ') })
    }
  }
  return alerts
}

function isToday(dateStr: string) { return dateStr === new Date().toISOString().split('T')[0] }
function isThisWeek(dateStr: string) {
  const d = new Date(dateStr), now = new Date(), end = new Date()
  end.setDate(now.getDate() + 7)
  return d >= now && d <= end
}

export default function FacultyDashboard() {
  const { userProfile, isMockMode } = useAuth()
  const [alerts,  setAlerts]  = useState<FacultyODAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState<'today' | 'week' | 'all'>('today')

  useEffect(() => {
    if (isMockMode) { setAlerts(computeAlerts('fac-001', MOCK_OD_REQUESTS, MOCK_TIMETABLE)); setLoading(false); return }
    if (!userProfile) { setLoading(false); return }
    // Real Firebase — load all approved ODs, then filter by this faculty's timetable
    import('@/services/firebase.service').then(({ subscribeToAllODs }) => {
      subscribeToAllODs((allODs) => {
        import('@/lib/mockData').then(({ MOCK_TIMETABLE: tt }) => {
          setAlerts(computeAlerts(userProfile.uid, allODs, tt))
          setLoading(false)
        })
      })
    })
  }, [isMockMode, userProfile])

  const filtered   = alerts.filter(a => {
    if (filter === 'today') return isToday(a.od.startDate) || isToday(a.od.endDate)
    if (filter === 'week')  return isThisWeek(a.od.startDate)
    return true
  })
  const todayCount = alerts.filter(a => isToday(a.od.startDate) || isToday(a.od.endDate)).length
  const weekCount  = alerts.filter(a => isThisWeek(a.od.startDate)).length

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#3F8F68,#2e6e50)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(63,143,104,0.25)' }}>
            <BookOpen style={{ width: 20, height: 20, color: 'white' }} />
          </div>
          <h1 className="text-gradient" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>Students on OD</h1>
        </div>
        <p style={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>Real-time view of approved ODs affecting your classes. Students listed here should not be marked absent.</p>
      </div>

      {/* Notification banner */}
      <div style={{ padding: '14px 18px', borderRadius: 14, marginBottom: 20, background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <Bell style={{ width: 18, height: 18, color: '#D66A3D', flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ color: '#1e40af', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Auto-Notifications Active</div>
          <div style={{ color: '#3b82f6', fontSize: 12, lineHeight: 1.6, fontWeight: 500 }}>
            You are automatically notified when a student in your class gets an approved OD covering your periods. This list updates in real-time.
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 20, marginBottom: 28 }}>
        <RichStatCard label="On OD Today"    value={todayCount}    pct={alerts.length ? (todayCount/alerts.length)*100 : 0}  icon={<Calendar style={{ width: 18, height: 18 }} />} color="#B94A48" delay={0}    />
        <RichStatCard label="This Week"      value={weekCount}     pct={alerts.length ? (weekCount/alerts.length)*100 : 0}   icon={<Clock    style={{ width: 18, height: 18 }} />} color="#D39A28" delay={0.07} />
        <RichStatCard label="Total All Time" value={alerts.length} pct={100}                                                  icon={<Users    style={{ width: 18, height: 18 }} />} color="#3F8F68" delay={0.14} />
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {([['today', `Today (${todayCount})`], ['week', `This Week (${weekCount})`], ['all', `All (${alerts.length})`]] as const).map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700, borderRadius: 20, cursor: 'pointer', transition: 'all 0.15s',
              background: filter === val ? '#D66A3D' : 'white',
              color:      filter === val ? 'white'   : '#64748b',
              boxShadow:  filter === val ? '0 4px 12px rgba(214,106,61,0.25)' : '0 1px 3px rgba(0,0,0,0.06)',
              border:     filter === val ? 'none'    : '1px solid #e2e8f0',
            } as React.CSSProperties}>
            {label}
          </button>
        ))}
      </div>

      {/* Alert list */}
      {loading ? [1,2].map(i => <div key={i} className="shimmer-line" style={{ height: 100, borderRadius: 16, marginBottom: 10 }} />) :
       filtered.length === 0 ? (
        <div className="card" style={{ padding: 64, textAlign: 'center' }}>
          <CheckCircle style={{ width: 40, height: 40, color: '#cbd5e1', margin: '0 auto 12px' }} />
          <p style={{ color: '#94a3b8', fontSize: 14 }}>
            {filter === 'today' ? 'No students on OD today in your periods.' :
             filter === 'week'  ? 'No approved ODs this week for your periods.' :
             'No approved ODs match your periods yet.'}
          </p>
        </div>
       ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((alert, i) => (
            <motion.div key={`${alert.od.id}-${i}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="card" style={{ padding: 20, borderLeft: isToday(alert.od.startDate) ? '3px solid #ef4444' : '3px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#D66A3D,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
                    {alert.student.name[0]}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ color: '#0f172a', fontWeight: 700, fontSize: 14 }}>{alert.student.name}</span>
                      <span style={{ color: '#94a3b8', fontSize: 12 }}>{alert.student.rollNo} · {alert.student.className}</span>
                      {isToday(alert.od.startDate) && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>Today</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, color: '#64748b', fontSize: 12 }}>
                      <BookOpen style={{ width: 12, height: 12 }} /> {alert.subject}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ color: '#64748b', fontSize: 12, fontWeight: 600 }}>{alert.od.startDate === alert.od.endDate ? alert.od.startDate : `${alert.od.startDate} → ${alert.od.endDate}`}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#16a34a', fontSize: 11, fontWeight: 700, marginTop: 4, justifyContent: 'flex-end' }}>
                    <CheckCircle style={{ width: 12, height: 12 }} /> HOD Approved
                  </div>
                </div>
              </div>

              {/* Affected periods */}
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Affected Periods (mark present)</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {alert.affectedPeriods.map((p, j) => (
                    <span key={j} style={{ padding: '4px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#D66A3D', fontSize: 11, fontWeight: 700, borderRadius: 20 }}>{p}</span>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: 12 }}>
                <ChevronRight style={{ width: 12, height: 12 }} />
                <span style={{ fontStyle: 'italic' }}>{alert.od.category}: {alert.od.title}</span>
              </div>
            </motion.div>
          ))}
        </div>
       )}

      {isMockMode && (
        <p style={{ color: '#cbd5e1', fontSize: 11, textAlign: 'center', marginTop: 20 }}>
          Demo: showing ODs for Mr. Suresh Pillai (fac-001) · Data Structures & Computer Networks · CSE-A
        </p>
      )}
    </div>
  )
}

