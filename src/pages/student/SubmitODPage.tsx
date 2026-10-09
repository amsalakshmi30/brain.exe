import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, FileText, Users, X, Plus, AlertTriangle, Building } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

const CATEGORIES = ['Hackathon','Symposium','Workshop','Sports','Paper Presentation','Cultural','Other'] as const
const PERIODS    = ['Period 1','Period 2','Period 3','Period 4','Period 5','Period 6','Full Day']

interface TeamMemberInput { rollNo: string; name: string; department: string }

const SECTION_STYLE: React.CSSProperties = {
  background: 'white', borderRadius: 16, padding: 24,
  border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  marginBottom: 16,
}

export default function SubmitODPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { userProfile, isMockMode } = useAuth()

  const [form, setForm] = useState({
    title:       params.get('title') || '',
    eventType:   'External' as 'Internal' | 'External',
    category:    (params.get('category') || 'Hackathon') as typeof CATEGORIES[number],
    institution: '',
    startDate:   '',
    endDate:     '',
    description: '',
  })
  const [periods,      setPeriods]      = useState<string[]>(JSON.parse(params.get('periods') || '[]'))
  const [isTeam,       setIsTeam]       = useState(params.get('isTeam') === '1')
  const [teamMembers,  setTeamMembers]  = useState<TeamMemberInput[]>(
    JSON.parse(params.get('teammates') || '[]').map((t: any) => ({ rollNo: t.rollNo || '', name: t.name || '', department: t.department || 'CSE' }))
  )
  const [newMember,  setNewMember]  = useState<TeamMemberInput>({ rollNo: '', name: '', department: 'CSE' })
  const [isUrgent,   setIsUrgent]   = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    if (!form.startDate) { setIsUrgent(false); return }
    const days = Math.ceil((new Date(form.startDate).getTime() - Date.now()) / 86400000)
    setIsUrgent(days >= 0 && days <= 3)
  }, [form.startDate])

  const togglePeriod = (p: string) => setPeriods(prev =>
    prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
  )

  const addTeamMember = () => {
    if (!newMember.rollNo || !newMember.name) { toast.error('Enter roll number and name'); return }
    setTeamMembers(prev => [...prev, { ...newMember }])
    setNewMember({ rollNo: '', name: '', department: 'CSE' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.institution || !form.startDate || !form.endDate) {
      toast.error('Please fill all required fields'); return
    }
    if (periods.length === 0) { toast.error('Select at least one period'); return }
    if (!userProfile) { toast.error('Not logged in'); return }
    setSubmitting(true)
    try {
      if (isMockMode) {
        await new Promise(r => setTimeout(r, 800))
        toast.success('OD request submitted successfully! 🎉')
        navigate('/student'); return
      }

      // ── Real Firebase submission ──────────────────────────────
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')

      const odData = {
        title:       form.title.trim(),
        eventType:   form.eventType,
        category:    form.category,
        institution: form.institution.trim(),
        startDate:   form.startDate,
        endDate:     form.endDate,
        description: form.description.trim(),
        periods,
        isTeam,
        teamMembers: isTeam ? teamMembers : [],
        isUrgent,
        currentStage: 'submitted',
        createdBy:    userProfile.uid,
        creatorName:  userProfile.name,
        creatorEmail: userProfile.email,
        department:   userProfile.department ?? '',
        className:    userProfile.className  ?? '',
        rollNo:       userProfile.rollNo     ?? '',
        advisorId:    userProfile.advisorId  ?? '',
        proofStatus:  'not_required',
        approvalHistory: [{
          stage: 'submitted', action: 'submitted',
          approverId: userProfile.uid, approverName: userProfile.name,
          comment: 'OD request submitted.',
          timestamp: new Date().toISOString(),
        }],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      await addDoc(collection(db, 'odRequests'), odData)
      toast.success('OD request submitted successfully! 🎉')
      navigate('/student')
    } catch (err: any) {
      console.error('OD submit error:', err)
      toast.error(err.message ?? 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>

      <button onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 14, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20, padding: 0 }}>
        <ArrowLeft style={{ width: 16, height: 16 }} /> Back
      </button>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: 4 }}>Apply for On-Duty (OD)</h1>
        <p style={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>Submit your OD request for approval by your Class Advisor and HOD.</p>
      </div>

      {isUrgent && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px', borderRadius: 14, background: '#fef2f2', border: '1px solid #fecaca', marginBottom: 20 }}>
          <AlertTriangle style={{ width: 18, height: 18, color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 13 }}>
            <span style={{ color: '#dc2626', fontWeight: 700 }}>Urgent — </span>
            <span style={{ color: '#64748b' }}>Event starts in 3 days or less. This OD will be flagged urgent and moved to the top of the approval queue.</span>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Event Details */}
        <div style={SECTION_STYLE}>
          <h2 style={{ color: '#0f172a', fontWeight: 800, fontSize: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText style={{ width: 15, height: 15, color: '#D66A3D' }} /> Event Details
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="label">Event / Activity Name *</label>
              <input type="text" required value={form.title} onChange={e => set('title', e.target.value)}
                className="input-field" placeholder="e.g. Smart India Hackathon 2026" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="label">Event Type *</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['Internal','External'] as const).map(t => (
                    <button key={t} type="button" onClick={() => set('eventType', t)}
                      style={{ flex: 1, padding: '9px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                        background: form.eventType === t ? '#D66A3D' : '#f8faff',
                        color:      form.eventType === t ? 'white' : '#64748b',
                        boxShadow:  form.eventType === t ? '0 4px 12px rgba(37,99,235,0.25)' : 'none',
                        border:     form.eventType === t ? 'none' : '1px solid #e2e8f0',
                      } as React.CSSProperties}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Category *</label>
                <select value={form.category} onChange={e => set('category', e.target.value)} className="input-field">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Organizing Institution / Body *</label>
              <div style={{ position: 'relative' }}>
                <Building style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#94a3b8', pointerEvents: 'none' }} />
                <input type="text" required value={form.institution} onChange={e => set('institution', e.target.value)}
                  className="input-field" style={{ paddingLeft: 42 }} placeholder="e.g. IIT Madras, AICTE, SRM University" />
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
                className="input-field" style={{ resize: 'none' }} placeholder="Brief description of the event and your participation role…" />
            </div>
          </div>
        </div>

        {/* Dates & Periods */}
        <div style={SECTION_STYLE}>
          <h2 style={{ color: '#0f172a', fontWeight: 800, fontSize: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar style={{ width: 15, height: 15, color: '#D66A3D' }} /> Dates & Missed Periods
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label className="label">Start Date *</label>
              <input type="date" required value={form.startDate} onChange={e => set('startDate', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label">End Date *</label>
              <input type="date" required value={form.endDate} onChange={e => set('endDate', e.target.value)} min={form.startDate} className="input-field" />
            </div>
          </div>
          <div>
            <label className="label">Periods / Sessions Missed *</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
              {PERIODS.map(p => (
                <button key={p} type="button" onClick={() => togglePeriod(p)}
                  style={{ padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                    background: periods.includes(p) ? '#D66A3D' : 'white',
                    color:      periods.includes(p) ? 'white'   : '#64748b',
                    border:     periods.includes(p) ? 'none' : '1px solid #e2e8f0',
                    boxShadow:  periods.includes(p) ? '0 4px 10px rgba(37,99,235,0.2)' : 'none',
                  } as React.CSSProperties}>
                  {p}
                </button>
              ))}
            </div>
            {periods.length > 0 && (
              <p style={{ color: '#D66A3D', fontSize: 12, marginTop: 8, fontWeight: 600 }}>Selected: {periods.join(', ')}</p>
            )}
          </div>
        </div>

        {/* Team OD */}
        <div style={SECTION_STYLE}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isTeam ? 16 : 0 }}>
            <h2 style={{ color: '#0f172a', fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users style={{ width: 15, height: 15, color: '#D66A3D' }} /> Team OD
            </h2>
            <button type="button" onClick={() => setIsTeam(v => !v)}
              style={{ position: 'relative', width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: isTeam ? '#D66A3D' : '#e2e8f0',
              }}>
              <span style={{ position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'all 0.2s',
                left: isTeam ? 23 : 3,
              }} />
            </button>
          </div>
          {isTeam && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ color: '#64748b', fontSize: 12, fontWeight: 500 }}>Add teammates. The system will create linked OD entries for each member.</p>
              {teamMembers.map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8faff', borderRadius: 12, padding: '10px 14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ color: '#0f172a', fontSize: 13, fontWeight: 700 }}>{m.name}</span>
                    <span style={{ color: '#94a3b8', fontSize: 12, marginLeft: 8 }}>{m.rollNo} · {m.department}</span>
                  </div>
                  <button type="button" onClick={() => setTeamMembers(prev => prev.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: 4 }}>
                    <X style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="text" placeholder="Roll No" value={newMember.rollNo} onChange={e => setNewMember(m => ({ ...m, rollNo: e.target.value }))} className="input-field" style={{ flex: 1, fontSize: 13 }} />
                <input type="text" placeholder="Full Name" value={newMember.name} onChange={e => setNewMember(m => ({ ...m, name: e.target.value }))} className="input-field" style={{ flex: 1, fontSize: 13 }} />
                <input type="text" placeholder="Dept" value={newMember.department} onChange={e => setNewMember(m => ({ ...m, department: e.target.value }))} className="input-field" style={{ width: 72, fontSize: 13 }} />
                <button type="button" onClick={addTeamMember} className="btn-primary" style={{ padding: '10px 14px', flexShrink: 0 }}>
                  <Plus style={{ width: 16, height: 16 }} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <button type="submit" disabled={submitting} className="btn-primary"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 15, padding: '14px',
            background: isUrgent ? 'linear-gradient(135deg,#ef4444,#dc2626)' : undefined,
            boxShadow: isUrgent ? '0 8px 24px rgba(239,68,68,0.3)' : undefined,
          }}>
          {submitting ? 'Submitting…' : isUrgent ? '⚡ Submit Urgent OD Request' : 'Submit OD Request'}
        </button>
      </form>
    </div>
  )
}

