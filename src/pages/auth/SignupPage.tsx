// ✅ 20. Mobile optimized signup — full responsive layout
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, User, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

const ROLES = [
  { value: 'student',  label: 'Student',        desc: 'Submit & track OD requests',  color: '#b5702e' },
  { value: 'advisor',  label: 'Class Advisor',   desc: 'First-stage OD approver',     color: '#3F8F68' },
  { value: 'hod',      label: 'HOD',             desc: 'Final OD approver',           color: '#db2777' },
  { value: 'faculty',  label: 'Subject Faculty', desc: 'View students on OD',         color: '#c0552e' },
  { value: 'admin',    label: 'Admin',            desc: 'Analytics & oversight',       color: '#d97706' },
]

export default function SignupPage() {
  const navigate  = useNavigate()
  const { isMockMode } = useAuth()
  const [form, setForm]   = useState({ name: '', email: '', password: '', role: 'student', department: '', className: '', rollNo: '' })
  const [loading, setLoading] = useState(false)
  const [showPw,  setShowPw]  = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // ✅ 13. Error messages — validate before submit
    if (!form.name.trim())     { toast.error('Please enter your full name.');            return }
    if (!form.email.trim())    { toast.error('Please enter your college email.');        return }
    if (!form.department.trim()){ toast.error('Please enter your department.');          return }
    if (form.password.length < 6){ toast.error('Password must be at least 6 characters.'); return }

    setLoading(true)
    try {
      if (isMockMode) {
        const profile = {
          uid: `user-${Date.now()}`, name: form.name, email: form.email,
          role: form.role as any, department: form.department,
          className: form.className, rollNo: form.rollNo,
          createdAt: new Date().toISOString(),
        }
        localStorage.setItem('CAMPUS-SYNC_mock_user', JSON.stringify(profile))
        // ✅ 12. Success message
        toast.success(`Welcome to CAMPUS-SYNC, ${form.name.split(' ')[0]}! 🎉`)
        await new Promise(r => setTimeout(r, 500))
        window.location.href = '/dashboard'
        return
      }
      const { signUp } = await import('@/services/firebase.service')
      await signUp(form.email, form.password, {
        name: form.name, email: form.email, role: form.role as any,
        department: form.department, className: form.className,
        rollNo: form.rollNo, createdAt: '',
      })
      // ✅ 12. Success message
      toast.success('Account created! Welcome aboard.')
      navigate('/dashboard')
    } catch (err: any) {
      // ✅ 13. Error message
      toast.error(err.message ?? 'Signup failed. Please try again.')
    } finally { setLoading(false) }
  }

  const selectedRole = ROLES.find(r => r.value === form.role)

  return (
    <div style={{
      minHeight: '100vh', background: '#1a1410', fontFamily: 'Sora, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', overflowX: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{ position: 'fixed', top: '20%', right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(181,112,46,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}>

        {/* ✅ 17. Logo clickable */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: 'linear-gradient(135deg,#c9621e,#9a5820)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(181,112,46,0.4)' }}>
              <GraduationCap style={{ width: 22, height: 22, color: 'white' }} />
            </div>
            <span style={{ fontWeight: 900, color: 'white', fontSize: 18 }}>CAMPUS-SYNC</span>
          </Link>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 6 }}>Create your account — it's free</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '28px 24px', color: '#172033' }}>
          <form onSubmit={handleSubmit} noValidate>

            {/* Role selector — horizontal pills on mobile */}
            <div style={{ marginBottom: 20 }}>
              <label className="label">I am a…</label>
              {/* ✅ 20. Mobile: wrap pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {ROLES.map(r => {
                  const active = form.role === r.value
                  return (
                    <button key={r.value} type="button" onClick={() => set('role', r.value)}
                      style={{
                        padding: '8px 14px', borderRadius: 12, fontSize: 12, fontWeight: 700,
                        cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
                        background: active ? `${r.color}22` : 'rgba(23,32,51,0.04)',
                        border: `1px solid ${active ? r.color + '55' : 'rgba(23,32,51,0.15)'}`,
                        color: active ? r.color : '#64748b',
                      }}>
                      {r.label}
                    </button>
                  )
                })}
              </div>
              {selectedRole && (
                <p style={{ color: '#94a3b8', fontSize: 11, marginTop: 8 }}>
                  {selectedRole.desc}
                </p>
              )}
            </div>

            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Full Name */}
              <div>
                <label className="label">Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }} />
                  <input type="text" required value={form.name} onChange={e => set('name', e.target.value)}
                    className="input-field" style={{ paddingLeft: 40 }} placeholder="Your full name" autoComplete="name" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="label">College Email *</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }} />
                  <input type="email" required value={form.email} onChange={e => set('email', e.target.value)}
                    className="input-field" style={{ paddingLeft: 40 }} placeholder="you@college.edu" autoComplete="email" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="label">Password *</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }} />
                  <input type={showPw ? 'text' : 'password'} required value={form.password} onChange={e => set('password', e.target.value)}
                    className="input-field" style={{ paddingLeft: 40, paddingRight: 44 }} placeholder="Min 6 characters" autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                    {showPw ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                  </button>
                </div>
              </div>

              {/* Department + class/roll (grid on wider, stack on mobile) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                <div>
                  <label className="label">Department *</label>
                  <input type="text" required value={form.department} onChange={e => set('department', e.target.value)}
                    className="input-field" placeholder="e.g. CSE" autoComplete="off" />
                </div>
                {form.role === 'student' && (
                  <>
                    <div>
                      <label className="label">Class Section</label>
                      <input type="text" value={form.className} onChange={e => set('className', e.target.value)}
                        className="input-field" placeholder="e.g. CSE-A" />
                    </div>
                    <div>
                      <label className="label">Roll Number</label>
                      <input type="text" value={form.rollNo} onChange={e => set('rollNo', e.target.value)}
                        className="input-field" placeholder="e.g. 21CS101" />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', fontSize: 14, marginTop: 20 }}>
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Creating account…</>
                : <><span>Create Account</span><ArrowRight style={{ width: 15, height: 15 }} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 18 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#e8a84a', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}



