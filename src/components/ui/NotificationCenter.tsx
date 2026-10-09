import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check, CheckCheck, Zap, Calendar, Users, Clock, FileCheck, AlertTriangle } from 'lucide-react'
import { UserRole } from '@/types'
import {
  AppNotification, getNotificationsForRole,
  getUnreadCount, formatRelativeTime,
} from '@/lib/notifications'

// ── Icon per notification type ────────────────────────────────
function NotifIcon({ type, urgent }: { type: AppNotification['type']; urgent?: boolean }) {
  const map: Record<string, React.ReactNode> = {
    new_event:   <Calendar   style={{ width: 14, height: 14 }} />,
    od_deadline: <AlertTriangle style={{ width: 14, height: 14 }} />,
    od_approved: <Check       style={{ width: 14, height: 14 }} />,
    od_rejected: <X           style={{ width: 14, height: 14 }} />,
    proof_due:   <FileCheck   style={{ width: 14, height: 14 }} />,
    team_listing:<Users       style={{ width: 14, height: 14 }} />,
  }
  const colorMap: Record<string, string> = {
    new_event:   '#3F8F68',
    od_deadline: '#B94A48',
    od_approved: '#3F8F68',
    od_rejected: '#B94A48',
    proof_due:   '#D39A28',
    team_listing:'#D66A3D',
  }
  const color = urgent ? '#B94A48' : (colorMap[type] ?? '#718096')
  return (
    <div style={{
      width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
      background: `${color}18`, color, border: `1.5px solid ${color}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {map[type] ?? <Bell style={{ width: 14, height: 14 }} />}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────
interface NotificationCenterProps { role: UserRole }

export default function NotificationCenter({ role }: NotificationCenterProps) {
  const [open,   setOpen]   = useState(false)
  const [notifs, setNotifs] = useState<AppNotification[]>(() => getNotificationsForRole(role))
  const panelRef = useRef<HTMLDivElement>(null)
  const unread   = notifs.filter(n => !n.read).length

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function markRead(id: string) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      {/* Bell button */}
      <motion.button
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
        onClick={() => setOpen(v => !v)}
        style={{
          position: 'relative', width: 36, height: 36, borderRadius: 10,
          background: open ? 'rgba(214,106,61,0.1)' : 'rgba(23,32,51,0.05)',
          border: open ? '1px solid rgba(214,106,61,0.3)' : '1px solid rgba(23,32,51,0.1)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: open ? '#D66A3D' : '#718096',
          transition: 'all 0.2s',
        }}
      >
        <Bell style={{ width: 16, height: 16 }} />
        {/* Unread badge */}
        <AnimatePresence>
          {unread > 0 && (
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              style={{
                position: 'absolute', top: -4, right: -4,
                width: 18, height: 18, borderRadius: '50%',
                background: '#B94A48', border: '2px solid #FFFFFF',
                fontSize: 9, fontWeight: 800, color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {unread > 9 ? '9+' : unread}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Notification panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{   opacity: 0, y: -8,  scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              width: 360, maxHeight: 520,
              background: '#FFFFFF',
              borderRadius: 20,
              border: '1px solid rgba(23,32,51,0.1)',
              boxShadow: '0 20px 60px rgba(23,32,51,0.18), 0 4px 16px rgba(23,32,51,0.08)',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden', zIndex: 200,
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px 14px',
              borderBottom: '1px solid rgba(23,32,51,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#172033',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bell style={{ width: 15, height: 15, color: '#D66A3D' }} />
                <span style={{ fontWeight: 700, fontSize: 14, color: 'white',
                  fontFamily: "'DM Sans', sans-serif" }}>Notifications</span>
                {unread > 0 && (
                  <span style={{
                    padding: '2px 8px', borderRadius: 20,
                    background: 'rgba(214,106,61,0.2)', border: '1px solid rgba(214,106,61,0.3)',
                    fontSize: 11, fontWeight: 700, color: '#f4b896',
                  }}>
                    {unread} new
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {unread > 0 && (
                  <button onClick={markAllRead}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11,
                      fontWeight: 600, color: 'rgba(255,255,255,0.5)', background: 'none',
                      border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 8,
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#D66A3D')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                  >
                    <CheckCheck style={{ width: 12, height: 12 }} /> Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)}
                  style={{ background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.5)', borderRadius: 8, padding: 4,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                >
                  <X style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </div>

            {/* List */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {notifs.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center' }}>
                  <Bell style={{ width: 28, height: 28, color: '#cbd5e1', margin: '0 auto 10px' }} />
                  <p style={{ color: '#718096', fontSize: 13 }}>You're all caught up!</p>
                </div>
              ) : (
                notifs.map((n, i) => (
                  <motion.div key={n.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.2 }}
                    onClick={() => markRead(n.id)}
                    style={{
                      display: 'flex', gap: 12, padding: '14px 18px',
                      borderBottom: '1px solid rgba(23,32,51,0.05)',
                      cursor: 'pointer',
                      background: n.read ? 'transparent' : (n.urgent ? 'rgba(185,74,72,0.04)' : 'rgba(214,106,61,0.04)'),
                      transition: 'background 0.15s',
                      position: 'relative',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(23,32,51,0.04)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = n.read ? 'transparent' : (n.urgent ? 'rgba(185,74,72,0.04)' : 'rgba(214,106,61,0.04)') }}
                  >
                    {/* Unread dot */}
                    {!n.read && (
                      <div style={{
                        position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)',
                        width: 5, height: 5, borderRadius: '50%',
                        background: n.urgent ? '#B94A48' : '#D66A3D',
                      }} />
                    )}
                    <NotifIcon type={n.type} urgent={n.urgent} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: n.read ? 500 : 700,
                        color: '#172033', marginBottom: 3, lineHeight: 1.35 }}>
                        {n.title}
                      </p>
                      <p style={{ fontSize: 12, color: '#718096', lineHeight: 1.5,
                        overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                        {n.message}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <Clock style={{ width: 10, height: 10, color: '#cbd5e1' }} />
                        <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                          {formatRelativeTime(n.timestamp)}
                        </span>
                        {n.urgent && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 20,
                            background: 'rgba(185,74,72,0.1)', color: '#7a1f1f',
                            border: '1px solid rgba(185,74,72,0.25)',
                          }}>Urgent</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '12px 18px',
              borderTop: '1px solid rgba(23,32,51,0.07)',
              textAlign: 'center',
            }}>
              <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
                Showing notifications for the last 7 days
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
