import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react'
import { signIn } from '@/services/firebase.service'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

const DEMO_ROLES = [
  { role: 'Student',        email: 'student@demo.com', password: 'demo1234', color: '#D66A3D' },
  { role: 'Class Advisor',  email: 'advisor@demo.com', password: 'demo1234', color: '#3F8F68' },
  { role: 'HOD',            email: 'hod@demo.com',     password: 'demo1234', color: '#172033' },
  { role: 'Subject Faculty',email: 'faculty@demo.com', password: 'demo1234', color: '#D39A28' },
  { role: 'Admin',          email: 'admin@demo.com',   password: 'demo1234', color: '#B94A48' },
]

const PERKS = [
  'Submit OD in under 2 minutes',
  'Advisor & HOD approve digitally',
  'Faculty auto-notified from timetable',
  'Track status in real time',
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { isMockMode, mockSignIn } = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [activeRole, setActiveRole] = useState<string | null>(null)

  const doLogin = async (em: string, pw: string, role?: string) => {
    setLoading(true); setActiveRole(role ?? null)
    try {
      if (isMockMode) { await mockSignIn(em, pw) } else { await signIn(em, pw) }
      navigate('/dashboard')
    } catch (err: any) { toast.error(err.message ?? 'Login failed') }
    finally { setLoading(false); setActiveRole(null) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans', system-ui, sans-serif", background: '#F7F5F2', overflowX: 'hidden' }}>

      {/* ── Left — navy hero panel ── */}
      <div className="hidden lg:flex" style={{ width: '44%', flexShrink: 0, background: '#172033', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 52px', position: 'relative', overflow: 'hidden' }}>
        {/* Blob decoration */}
        <div style={{ position: 'absolute', top: '-20%', right: '-20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(214,106,61,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(211,154,40,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        {/* Dot grid */}
        <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.15 }} />

        {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
            <div style={{ width: 34, height: 34, borderRadius: 11, background: 'linear-gradient(135deg,#D66A3D,#c0552e)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(214,106,61,0.4)', flexShrink: 0 }}>
              <GraduationCap style={{ width: 17, height: 17, color: 'white' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'white', fontSize: 16, letterSpacing: '0.02em', fontFamily: "'DM Sans', sans-serif" }}>CAMPUS-SYNC</div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>OD Management</div>
            </div>
          </div>

        {/* Middle copy */}
        <div style={{ position: 'relative' }}>
          <h2 style={{ fontSize: 44, fontWeight: 700, color: 'white', lineHeight: 1.08, letterSpacing: '-1px', marginBottom: 18,
            fontFamily: "'Playfair Display', Georgia, serif" }}>
            Paperless ODs.<br /><em style={{ fontStyle: 'italic', fontWeight: 400, color: '#f4b896' }}>Starting now.</em>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.75, marginBottom: 36,
            fontWeight: 300, fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.01em' }}>
            No forms. No chasing. No missed classes due to attendance errors.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {PERKS.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10,
                color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: 400,
                fontFamily: "'DM Sans', sans-serif" }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(214,106,61,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle style={{ width: 13, height: 13, color: '#f4b896' }} />
                </div>
                {p}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tag */}
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, position: 'relative', fontWeight: 400, fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.03em' }}>
          CAMPUS-SYNC © {new Date().getFullYear()} · Built for Indian Engineering Campuses
        </p>
      </div>

          {/* Right panel — form side */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{ width: '100%', maxWidth: 400, fontFamily: "'DM Sans', sans-serif" }}>

          {/* Mobile brand */}
          <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: 32 }}>
            <Link to="/" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,#D66A3D,#c0552e)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(214,106,61,0.35)' }}>
                <GraduationCap style={{ width: 20, height: 20, color: 'white' }} />
              </div>
              <span style={{ fontWeight: 800, color: '#0f172a', fontSize: 18 }}>CAMPUS-SYNC</span>
            </Link>
          </div>

            {/* Welcome heading — Playfair Display */}
          <h1 style={{ fontSize: 30, fontWeight: 700, color: '#172033', letterSpacing: '-0.3px', marginBottom: 4,
            fontFamily: "'Playfair Display', Georgia, serif" }}>Welcome back</h1>
          <p style={{ color: '#718096', fontSize: 14, marginBottom: 28, fontWeight: 400 }}>Sign in to continue to CAMPUS-SYNC</p>

          {/* Demo role buttons */}
          {isMockMode && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 10 }}>
                Quick Demo — tap any role
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {DEMO_ROLES.map(r => (
                  <button key={r.role} onClick={() => doLogin(r.email, r.password, r.role)}
                    disabled={loading}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, border: `1.5px solid ${loading && activeRole === r.role ? r.color + '60' : '#e2e8f0'}`, background: loading && activeRole === r.role ? r.color + '08' : 'white', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = r.color + '60'; (e.currentTarget as HTMLElement).style.background = r.color + '06' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLElement).style.background = 'white' }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${r.color}, ${r.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                      {r.role[0]}
                    </div>
                    <span style={{ color: '#334155', fontSize: 13, fontWeight: 700 }}>{r.role}</span>
                    {loading && activeRole === r.role && (
                      <div style={{ marginLeft: 'auto', width: 14, height: 14, borderRadius: '50%', border: '2px solid #e2e8f0', borderTopColor: r.color, animation: 'spin 0.7s linear infinite' }} />
                    )}
                    <ArrowRight style={{ width: 13, height: 13, color: '#cbd5e1', marginLeft: 'auto' }} />
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600 }}>or sign in manually</span>
                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={e => { e.preventDefault(); doLogin(email, password) }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="label">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#94a3b8', pointerEvents: 'none' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="input-field" style={{ paddingLeft: 42 }} placeholder="you@college.edu" autoComplete="email" />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#94a3b8', pointerEvents: 'none' }} />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="input-field" style={{ paddingLeft: 42, paddingRight: 44 }} placeholder="••••••••" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                  {showPw ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, padding: '13px' }}>
              {loading && !activeRole
                ? <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                : <><span>Sign In</span><ArrowRight style={{ width: 15, height: 15 }} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: '#64748b', fontSize: 13, marginTop: 20, fontWeight: 500 }}>
            New to CAMPUS-SYNC?{' '}
            <Link to="/signup" style={{ color: '#D66A3D', fontWeight: 700, textDecoration: 'none' }}>Create account →</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}


