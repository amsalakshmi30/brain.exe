// ============================================================
//  CAMPUS-SYNC LANDING — Agently SaaS Template Style
//  Font: Plus Jakarta Sans (ExtraBold headings)
//  Theme: Light bg, electric blue accents, bold type
// ============================================================
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle, Zap, Star, Shield, Bell, Users, ChevronRight } from 'lucide-react'

// ── Blue SVG blob decoration ──────────────────────────────────
function HeroBlob() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Top center blue glow — exactly like Agently */}
      <div style={{
        position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)',
        width: 900, height: 700, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(214,106,61,0.3) 0%, rgba(79,70,229,0.06) 40%, transparent 70%)',
        filter: 'blur(1px)',
      }} />
      {/* Right violet orb */}
      <div style={{
        position: 'absolute', top: '10%', right: '-10%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)',
      }} />
      {/* Dot grid top-right */}
      <div className="dot-grid absolute top-0 right-0 w-72 h-72 opacity-60" />
      {/* Dot grid bottom-left */}
      <div className="dot-grid absolute bottom-0 left-0 w-48 h-48 opacity-40" />
    </div>
  )
}

// ── Dashboard UI mockup (like Agently's hero screenshot) ──────
function DashboardMockup() {
  return (
    <div style={{
      background: 'white', borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 32px 80px rgba(214,106,61,0.3), 0 8px 24px rgba(0,0,0,0.08)',
      border: '1px solid rgba(226,232,240,0.8)',
    }}>
      {/* Topbar */}
      <div style={{ background: '#0f172a', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['#ef4444','#f59e0b','#22c55e'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
        </div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: 6, padding: '4px 12px', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
          CAMPUS-SYNC.in/student
        </div>
      </div>

      {/* Dashboard body */}
      <div style={{ display: 'flex', minHeight: 280 }}>
        {/* Sidebar */}
        <div style={{ width: 52, background: '#f8faff', borderRight: '1px solid #e2e8f0', padding: 12, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#D66A3D,#c0552e)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
            <Zap style={{ width: 14, height: 14, color: 'white' }} />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ width: 28, height: 6, borderRadius: 4, background: i === 0 ? '#D66A3D' : '#e2e8f0' }} />
          ))}
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: 16 }}>
          {/* Greeting */}
          <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Hi, Arjun 👋</div>
          <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 14 }}>Here's what's happening with your ODs today.</div>

          {/* Stat cards row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
            {[
              { label: 'Total ODs', val: '12', color: '#D66A3D' },
              { label: 'Approved', val: '8',  color: '#22c55e' },
              { label: 'Pending',  val: '3',  color: '#f59e0b' },
              { label: 'Rejected', val: '1',  color: '#ef4444' },
            ].map(s => (
              <div key={s.label} style={{ background: '#f8faff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 10px 8px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>{s.label}</div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: s.color, opacity: 0.3 }} />
              </div>
            ))}
          </div>

          {/* OD list */}
          <div style={{ background: '#f8faff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
            {[
              { title: 'Smart India Hackathon', status: 'Approved', color: '#22c55e', bg: '#f0fdf4' },
              { title: 'IEEE Paper Presentation', status: 'Pending',  color: '#f59e0b', bg: '#fffbeb' },
              { title: 'HackWithInfy 2026',      status: 'Review',   color: '#D66A3D', bg: '#eff6ff' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderBottom: i < 2 ? '1px solid #e2e8f0' : 'none' }}>
                <div style={{ flex: 1, fontSize: 10, fontWeight: 700, color: '#1e293b' }}>{r.title}</div>
                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: r.bg, color: r.color }}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Trusted logos strip ───────────────────────────────────────
const COLLEGES = ['IIT Madras', 'NIT Trichy', 'VIT', 'BITS', 'Anna Univ', 'SRM']

const FEATURES = [
  { icon: <Zap className="w-5 h-5" />, title: 'Submit in 2 minutes', desc: 'Fill once, track forever. No repeated paperwork.', color: '#D66A3D' },
  { icon: <Bell className="w-5 h-5" />, title: 'Auto faculty alerts', desc: 'Faculty are notified from your timetable automatically.', color: '#172033' },
  { icon: <Shield className="w-5 h-5" />, title: 'HOD approval trail', desc: 'Full digital audit trail from advisor to HOD.', color: '#3F8F68' },
  { icon: <Users className="w-5 h-5" />, title: 'Team OD in one go', desc: 'Submit OD for your whole team simultaneously.', color: '#3F8F68' },
]

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#f8faff', color: '#0f172a', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: scrolled ? 'rgba(248,250,255,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid #e2e8f0' : 'none',
        transition: 'all 0.3s',
      }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#D66A3D,#c0552e)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(214,106,61,0.3)' }}>
              <Zap style={{ width: 16, height: 16, color: 'white' }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 17, color: '#0f172a', letterSpacing: '-0.3px' }}>CAMPUS-SYNC</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link to="/login"  style={{ color: '#64748b', fontSize: 14, fontWeight: 600, textDecoration: 'none', padding: '8px 16px' }}>Sign In</Link>
            <Link to="/signup" className="btn-primary" style={{ fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Get Started <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', paddingTop: 140, paddingBottom: 80, paddingLeft: 24, paddingRight: 24, minHeight: '90vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <HeroBlob />

        <div style={{ maxWidth: 1140, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

            {/* Left */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              {/* Badge — like Agently's "New · Advanced AI Model" */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 100, marginBottom: 24, fontSize: 12, fontWeight: 700, background: 'rgba(214,106,61,0.1)', border: '1px solid rgba(214,106,61,0.28)', color: '#D66A3D' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#D66A3D', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                Built for Indian Engineering Campuses
              </div>

              {/* Headline — bold like Agently */}
              <h1 style={{ fontSize: 'clamp(34px, 4.5vw, 56px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1.5px', color: '#0f172a', marginBottom: 20 }}>
                No more chasing<br />
                <span className="text-gradient">HOD signatures.</span>
              </h1>

              <p style={{ fontSize: 17, color: '#64748b', lineHeight: 1.7, marginBottom: 32, maxWidth: 460, fontWeight: 500 }}>
                CAMPUS-SYNC digitizes your college's entire On-Duty workflow — submit, approve, notify.
                Paperless. Instant. Completely digital.
              </p>

              {/* CTA row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 40 }}>
                <Link to="/signup" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, padding: '13px 28px' }}>
                  Get Started Free <ArrowRight style={{ width: 16, height: 16 }} />
                </Link>
                <Link to="/login" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, padding: '13px 28px' }}>
                  Try Demo Login
                </Link>
              </div>

              {/* Trust row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex' }}>
                  {['#D66A3D','#c0552e','#172033','#3F8F68'].map((c, i) => (
                    <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: '2px solid white', marginLeft: i > 0 ? -8 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 800 }}>
                      {['A','S','H','F'][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                    {[...Array(5)].map((_, i) => <Star key={i} style={{ width: 12, height: 12, fill: '#f59e0b', color: '#f59e0b' }} />)}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Loved by 500+ students</div>
                </div>
              </div>
            </motion.div>

            {/* Right — Dashboard mockup like Agently */}
            <motion.div initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              style={{ position: 'relative' }}>
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
                <DashboardMockup />
              </motion.div>
              {/* Floating badge 1 */}
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                style={{ position: 'absolute', top: -16, right: -16, background: 'white', borderRadius: 14, padding: '10px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700 }}>
                <CheckCircle style={{ width: 16, height: 16, color: '#22c55e' }} /> OD Approved!
              </motion.div>
              {/* Floating badge 2 */}
              <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                style={{ position: 'absolute', bottom: -16, left: -20, background: 'linear-gradient(135deg,#D66A3D,#c0552e)', borderRadius: 14, padding: '10px 16px', boxShadow: '0 8px 24px rgba(214,106,61,0.3)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: 'white' }}>
                <Bell style={{ width: 14, height: 14 }} /> Faculty notified ⚡
              </motion.div>
            </motion.div>
          </div>

          {/* Trusted by */}
          <div style={{ marginTop: 72, textAlign: 'center' }}>
            <p style={{ color: '#94a3b8', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 20 }}>
              Already trusted by students across
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', alignItems: 'center' }}>
              {COLLEGES.map(c => (
                <span key={c} style={{ color: '#94a3b8', fontSize: 14, fontWeight: 800, letterSpacing: '-0.3px' }}>{c}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section style={{ padding: '80px 24px', background: 'white' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ color: '#D66A3D', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12 }}>Features</p>
            <h2 style={{ fontSize: 'clamp(26px,3.5vw,40px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-1px' }}>
              Everything your college needs
            </h2>
            <p style={{ color: '#64748b', fontSize: 16, marginTop: 12, maxWidth: 480, margin: '12px auto 0' }}>
              Five roles, one platform. Students to Admin — everyone gets what they need.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {FEATURES.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="card" style={{ padding: 28 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${f.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, marginBottom: 16 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section style={{ padding: '64px 24px', background: '#f8faff' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ borderRadius: 24, background: 'linear-gradient(135deg, #D66A3D 0%, #c0552e 100%)', padding: '48px 40px', boxShadow: '0 20px 60px rgba(214,106,61,0.3)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 32, textAlign: 'center' }}>
              {[['< 2 min','To submit OD'],['5 roles','Student to Admin'],['0 forms','Fully paperless'],['Auto','Faculty notified']].map(([n, l]) => (
                <motion.div key={l} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>{n}</div>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 4, fontWeight: 600 }}>{l}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section style={{ padding: '80px 24px 100px', background: 'white', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-1px', marginBottom: 16 }}>
            Ready to go paperless?
          </motion.h2>
          <p style={{ color: '#64748b', fontSize: 16, marginBottom: 32, fontWeight: 500 }}>
            Takes 30 seconds. No credit card. No paper.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, padding: '14px 32px' }}>
              Create Free Account <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
            <Link to="/login" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', fontSize: 15, padding: '14px 32px' }}>
              Try Demo
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid #e2e8f0', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, background: 'white' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <Zap style={{ width: 14, height: 14, color: '#D66A3D' }} />
          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: 14 }}>CAMPUS-SYNC</span>
          <span style={{ color: '#cbd5e1', fontSize: 13 }}>© {new Date().getFullYear()}</span>
        </Link>
        <div style={{ display: 'flex', gap: 24 }}>
          <a href="mailto:support@CAMPUS-SYNC.in" style={{ color: '#94a3b8', fontSize: 12, textDecoration: 'none', fontWeight: 600 }}>support@CAMPUS-SYNC.in</a>
          <Link to="/login"  style={{ color: '#94a3b8', fontSize: 12, textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
          <Link to="/signup" style={{ color: '#94a3b8', fontSize: 12, textDecoration: 'none', fontWeight: 600 }}>Sign Up</Link>
        </div>
      </footer>
    </div>
  )
}


