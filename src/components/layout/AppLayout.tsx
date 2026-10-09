import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, LayoutDashboard, PlusCircle, Users, BookOpen, LogOut, Menu, X, CheckSquare, Shield, BarChart3, Search } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { signOut } from '@/services/firebase.service'
import { UserRole } from '@/types'
import toast from 'react-hot-toast'
import ChatBot from '@/components/ui/ChatBot'
import NotificationCenter from '@/components/ui/NotificationCenter'
import { getRoleTheme } from '@/lib/roleTheme'
import PageTransition from '@/components/ui/PageTransition'

interface NavItem { label: string; to: string; icon: React.ReactNode }

const navByRole: Record<UserRole, NavItem[]> = {
  student: [
    { label: 'My ODs',        to: '/student',       icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Apply for OD',  to: '/student/submit', icon: <PlusCircle      className="w-4 h-4" /> },
    { label: 'Team Finder',   to: '/team-finder',   icon: <Users           className="w-4 h-4" /> },
    { label: 'Events Board',  to: '/events',        icon: <BookOpen        className="w-4 h-4" /> },
  ],
  advisor: [
    { label: 'Review Queue',  to: '/advisor',       icon: <CheckSquare     className="w-4 h-4" /> },
    { label: 'Team Finder',   to: '/team-finder',   icon: <Users           className="w-4 h-4" /> },
    { label: 'Events Board',  to: '/events',        icon: <BookOpen        className="w-4 h-4" /> },
  ],
  hod: [
    { label: 'Review Queue',  to: '/hod',           icon: <Shield          className="w-4 h-4" /> },
    { label: 'Team Finder',   to: '/team-finder',   icon: <Users           className="w-4 h-4" /> },
    { label: 'Events Board',  to: '/events',        icon: <BookOpen        className="w-4 h-4" /> },
  ],
  faculty: [
    { label: 'Students on OD', to: '/faculty',      icon: <BookOpen        className="w-4 h-4" /> },
    { label: 'Team Finder',    to: '/team-finder',  icon: <Users           className="w-4 h-4" /> },
    { label: 'Events Board',   to: '/events',       icon: <BarChart3       className="w-4 h-4" /> },
  ],
  admin: [
    { label: 'Analytics',     to: '/admin',          icon: <BarChart3       className="w-4 h-4" /> },
    { label: 'Team Finder',   to: '/team-finder',   icon: <Users           className="w-4 h-4" /> },
    { label: 'Events Board',  to: '/events',        icon: <BookOpen        className="w-4 h-4" /> },
  ],
}

const roleLabel: Record<UserRole, string> = {
  student: 'Student', advisor: 'Class Advisor',
  hod: 'Head of Dept.', faculty: 'Subject Faculty', admin: 'Admin',
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { userProfile, isMockMode, mockSignOut } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [progress,    setProgress]    = useState(false)
  const navItems = userProfile ? navByRole[userProfile.role] : []

  // Top progress bar on route change
  useEffect(() => {
    setProgress(true)
    const t = setTimeout(() => setProgress(false), 600)
    return () => clearTimeout(t)
  }, [location.pathname])

  const handleSignOut = async () => {
    if (isMockMode) { mockSignOut() } else { await signOut() }
    toast.success('Signed out')
    navigate('/login')
  }

  const theme   = getRoleTheme(userProfile?.role)
  const roleC   = theme.primary
  const initial = userProfile?.name?.[0]?.toUpperCase() ?? '?'

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* Brand + top aurora glow */}
      <div style={{ padding: '24px 20px 16px' }}>
        <div style={{ position: 'relative', marginBottom: 4 }}>
          {/* Aurora glow behind logo */}
          <div style={{ position: 'absolute', top: -8, left: -8, width: 56, height: 56, borderRadius: '50%', background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`, pointerEvents: 'none', filter: 'blur(12px)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
            <div style={{ width: 34, height: 34, borderRadius: 11, background: theme.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${theme.glow}`, flexShrink: 0 }}>
              <GraduationCap style={{ width: 18, height: 18, color: 'white' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'white', fontSize: 13, letterSpacing: '0.12em',
                fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                textTransform: 'uppercase' }}>Campus-Sync</div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 500,
                letterSpacing: '0.06em', fontFamily: "'DM Sans', sans-serif" }}>OD Management</div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 16px 16px' }} />

      {/* User card */}
      {userProfile && (
        <div style={{ margin: '0 12px 16px', padding: '12px', borderRadius: 14,
          background: `${theme.primary}18`, border: `1px solid ${theme.primary}30` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: theme.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
              fontWeight: 900, fontSize: 15, flexShrink: 0, boxShadow: `0 4px 14px ${theme.glow}` }}>
              {initial}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 13, letterSpacing: '-0.2px' }}>{userProfile.name}</div>
              <div style={{ color: theme.secondary, fontSize: 11, fontWeight: 600 }}>{theme.label}</div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.12em', padding: '0 12px', marginBottom: 6 }}>Menu</p>
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} end onClick={() => setSidebarOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10,
              textDecoration: 'none', fontSize: 13, fontWeight: 600, transition: 'color 0.18s',
              color: isActive ? theme.secondary : 'rgba(255,255,255,0.45)',
              position: 'relative',
            })}>
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div layoutId="nav-pill"
                    style={{ position: 'absolute', inset: 0, borderRadius: 10,
                      background: `${theme.primary}25`,
                      border: `1px solid ${theme.primary}40`,
                      boxShadow: `0 0 16px ${theme.primary}20`,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  />
                )}
                <span style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
                  {item.icon}{item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Demo badge */}
      {isMockMode && (
        <div style={{ margin: '0 12px 8px', padding: '8px 12px', borderRadius: 10,
          background: 'rgba(214,106,61,0.15)', border: '1px solid rgba(214,106,61,0.28)',
          display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#f4b896' }}>
          <GraduationCap style={{ width: 12, height: 12 }} /> Demo Mode
        </div>
      )}

      {/* Sign out */}
      <div style={{ padding: '8px 8px 20px' }}>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 4px 10px' }} />
        <button onClick={handleSignOut}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: 13, fontWeight: 600, transition: 'all 0.15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; (e.currentTarget as HTMLElement).style.color = '#f87171' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)' }}>
          <LogOut style={{ width: 15, height: 15 }} /> Sign Out
        </button>
      </div>
    </div>
  )

  const SIDEBAR_STYLE = {
    background: '#172033',
    borderRight: '1px solid rgba(255,255,255,0.06)',
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F7F5F2', maxWidth: '100vw' }}>

      {/* Desktop sidebar */}
      <aside style={{ ...SIDEBAR_STYLE, width: 220, flexShrink: 0, display: 'none' }} className="lg:flex flex-col">
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <SidebarContent />
        </div>
      </aside>
      {/* Force desktop sidebar visible */}
      <aside className="hidden lg:flex flex-col" style={{ ...SIDEBAR_STYLE, width: 220, flexShrink: 0 }}>
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40, backdropFilter: 'blur(4px)' }}
              className="lg:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: -220 }} animate={{ x: 0 }} exit={{ x: -220 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              style={{ ...SIDEBAR_STYLE, position: 'fixed', left: 0, top: 0, bottom: 0, width: 220, zIndex: 50 }}
              className="lg:hidden">
              <button onClick={() => setSidebarOpen(false)}
                style={{ position: 'absolute', top: 16, right: 14, background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
                <X style={{ width: 15, height: 15 }} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* ── Desktop topbar ── */}
        <div className="hidden lg:flex" style={{
          height: 60, background: '#FFFFFF',
          borderBottom: '1px solid rgba(23,32,51,0.08)',
          padding: '0 32px', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, flexShrink: 0,
          boxShadow: '0 1px 8px rgba(23,32,51,0.05)',
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}>
          {/* Left — page context */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#718096', fontSize: 13, fontWeight: 500 }}>CAMPUS-SYNC</span>
              <span style={{ color: '#cbd5e1', fontSize: 13 }}>/</span>
              <span style={{ color: '#172033', fontSize: 13, fontWeight: 700 }}>
                {navItems.find(n => location.pathname.startsWith(n.to))?.label ?? 'Dashboard'}
              </span>
            </div>
          </div>

          {/* Right — notification + user */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Notification bell */}
            {userProfile && (
              <NotificationCenter role={userProfile.role} />
            )}

            {/* User chip */}
            {userProfile && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '6px 12px 6px 6px',
                borderRadius: 40, background: '#F7F5F2',
                border: '1px solid rgba(23,32,51,0.09)',
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: theme.gradient, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 800, fontSize: 13,
                  boxShadow: `0 2px 8px ${theme.glow}`,
                }}>{initial}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#172033', lineHeight: 1.2 }}>{userProfile.name?.split(' ')[0]}</div>
                  <div style={{ fontSize: 10, color: '#718096', fontWeight: 500 }}>{theme.label}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile topbar */}
        <div className="lg:hidden" style={{ background: '#172033', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: 7, cursor: 'pointer', color: 'rgba(255,255,255,0.7)', display: 'flex' }}>
              <Menu style={{ width: 18, height: 18 }} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg,#172033,#D66A3D)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap style={{ width: 14, height: 14, color: 'white' }} />
              </div>
              <span style={{ fontWeight: 700, color: 'white', fontSize: 13, letterSpacing: '0.08em',
                fontFamily: "'Cinzel', serif", textTransform: 'uppercase' }}>Campus-Sync</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', background: '#F7F5F2', position: 'relative' }}>
          {/* Top progress bar */}
          <AnimatePresence>
            {progress && (
              <motion.div
                initial={{ scaleX: 0, opacity: 1 }}
                animate={{ scaleX: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                style={{ position: 'fixed', top: 0, left: 220, right: 0, height: 3, zIndex: 999,
                  background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
                  transformOrigin: 'left center',
                  boxShadow: `0 0 12px ${theme.glow}`,
                }}
              />
            )}
          </AnimatePresence>

          {/* Animated mesh blobs — role-colored */}
          <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-10%', left: '15%', width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, ${theme.blob1} 0%, transparent 70%)`, animation: 'blob1 18s ease-in-out infinite', filter: 'blur(40px)' }} />
            <div style={{ position: 'absolute', bottom: '-5%', right: '10%', width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${theme.blob2} 0%, transparent 70%)`, animation: 'blob2 22s ease-in-out infinite', filter: 'blur(50px)' }} />
            <div style={{ position: 'absolute', top: '40%', right: '30%', width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${theme.blob3} 0%, transparent 70%)`, animation: 'blob3 28s ease-in-out infinite', filter: 'blur(60px)' }} />
          </div>

          <div style={{ minHeight: '100%', padding: 'clamp(20px, 4vw, 48px) clamp(16px, 4vw, 48px) 80px',
            maxWidth: 1160, margin: '0 auto', boxSizing: 'border-box', position: 'relative', zIndex: 1 }}>
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </main>
      </div>
      <ChatBot />
    </div>
  )
}

