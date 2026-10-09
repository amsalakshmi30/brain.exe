import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar, ExternalLink, MapPin, Trophy, Building2,
  Clock, Search, X, Wifi, WifiOff, Filter
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { MOCK_EVENTS } from '@/lib/mockData'
import { EventBoardItem, EventBoardCategory } from '@/types'

// ── Category palette ──────────────────────────────────────────
const CAT: Record<string, { color: string; bg: string; border: string }> = {
  Hackathon:         { color: '#D66A3D', bg: 'rgba(214,106,61,0.1)',  border: 'rgba(214,106,61,0.25)' },
  Symposium:         { color: '#172033', bg: 'rgba(23,32,51,0.08)',   border: 'rgba(23,32,51,0.18)' },
  Workshop:          { color: '#3F8F68', bg: 'rgba(63,143,104,0.1)',  border: 'rgba(63,143,104,0.25)' },
  Sports:            { color: '#D39A28', bg: 'rgba(211,154,40,0.1)',  border: 'rgba(211,154,40,0.25)' },
  'Paper Presentation': { color: '#B94A48', bg: 'rgba(185,74,72,0.1)', border: 'rgba(185,74,72,0.25)' },
  Competition:       { color: '#172033', bg: 'rgba(23,32,51,0.08)',   border: 'rgba(23,32,51,0.18)' },
  Other:             { color: '#718096', bg: 'rgba(113,128,150,0.08)',border: 'rgba(113,128,150,0.2)' },
}
const cat = (c: string) => CAT[c] ?? CAT['Other']

const CATEGORIES: EventBoardCategory[] = [
  'Hackathon', 'Symposium', 'Workshop', 'Sports', 'Paper Presentation', 'Competition', 'Other',
]

// ── Deadline helpers ──────────────────────────────────────────
function daysLeft(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000)
}
function DeadlinePill({ days }: { days: number }) {
  if (days < 0)  return <span style={{ fontSize: 11, fontWeight: 700, color: '#718096' }}>Closed</span>
  if (days === 0) return <span style={{ fontSize: 11, fontWeight: 700, color: '#B94A48', animation: 'pulse 1.5s infinite' }}>⚡ Closes today!</span>
  if (days <= 3)  return <span style={{ fontSize: 11, fontWeight: 700, color: '#B94A48' }}>⚡ {days}d left!</span>
  if (days <= 7)  return <span style={{ fontSize: 11, fontWeight: 600, color: '#D39A28' }}>⏳ {days}d left</span>
  return <span style={{ fontSize: 11, fontWeight: 500, color: '#718096' }}>{days}d left</span>
}

// ── Event card ────────────────────────────────────────────────
function EventCard({ ev, index }: { ev: EventBoardItem; index: number }) {
  const c    = cat(ev.category)
  const days = daysLeft(ev.deadline)
  const expired = days < 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="card"
      style={{ padding: 0, overflow: 'hidden', opacity: expired ? 0.6 : 1 }}
    >
      {/* Category stripe */}
      <div style={{ height: 4, background: c.color }} />

      <div style={{ padding: '20px 22px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Category pill */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px',
              borderRadius: 20, fontSize: 11, fontWeight: 700,
              background: c.bg, color: c.color, border: `1px solid ${c.border}`,
              marginBottom: 8,
            }}>{ev.category}</span>

            <h2 style={{
              fontSize: 16, fontWeight: 700, color: '#172033', lineHeight: 1.3,
              fontFamily: "'Playfair Display', Georgia, serif",
            }}>{ev.title}</h2>
          </div>

          {/* Mode badge */}
          {ev.mode && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
              borderRadius: 20, fontSize: 11, fontWeight: 700, flexShrink: 0,
              background: ev.mode === 'Online' ? 'rgba(63,143,104,0.1)' : 'rgba(23,32,51,0.07)',
              color: ev.mode === 'Online' ? '#3F8F68' : '#172033',
              border: ev.mode === 'Online' ? '1px solid rgba(63,143,104,0.25)' : '1px solid rgba(23,32,51,0.15)',
            }}>
              {ev.mode === 'Online' ? <Wifi style={{ width: 11, height: 11 }} /> : <WifiOff style={{ width: 11, height: 11 }} />}
              {ev.mode}
            </span>
          )}
        </div>

        {/* Description */}
        <p style={{
          color: '#718096', fontSize: 13, lineHeight: 1.65, marginBottom: 16,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        } as React.CSSProperties}>{ev.description}</p>

        {/* Meta grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginBottom: 16 }}>
          {/* Reg deadline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(185,74,72,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Clock style={{ width: 13, height: 13, color: '#B94A48' }} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Reg Deadline</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#172033' }}>
                {ev.deadline} &nbsp;<DeadlinePill days={days} />
              </div>
            </div>
          </div>

          {/* Event date */}
          {ev.eventDate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(63,143,104,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Calendar style={{ width: 13, height: 13, color: '#3F8F68' }} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Event Date</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#172033' }}>{ev.eventDate}</div>
              </div>
            </div>
          )}

          {/* Organizer */}
          {ev.organizer && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(23,32,51,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Building2 style={{ width: 13, height: 13, color: '#718096' }} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Organizer</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#172033' }}>{ev.organizer}</div>
              </div>
            </div>
          )}

          {/* Location */}
          {ev.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(214,106,61,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin style={{ width: 13, height: 13, color: '#D66A3D' }} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Location</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#172033' }}>{ev.location}</div>
              </div>
            </div>
          )}
        </div>

        {/* Prize */}
        {ev.prize && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
            borderRadius: 12, background: 'rgba(211,154,40,0.08)',
            border: '1px solid rgba(211,154,40,0.2)', marginBottom: 16,
          }}>
            <Trophy style={{ width: 14, height: 14, color: '#D39A28', flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#7a5800' }}>{ev.prize}</span>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid rgba(23,32,51,0.06)' }}>
          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
            Posted by {ev.postedByName}
          </span>
          {ev.link && !expired && (
            <a href={ev.link} target="_blank" rel="noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '9px 18px', borderRadius: 10,
                background: 'linear-gradient(135deg,#172033,#D66A3D)',
                color: 'white', textDecoration: 'none',
                fontSize: 13, fontWeight: 700,
                boxShadow: '0 4px 14px rgba(214,106,61,0.3)',
                transition: 'box-shadow 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(214,106,61,0.5)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(214,106,61,0.3)' }}
            >
              <ExternalLink style={{ width: 13, height: 13 }} /> Register Now
            </a>
          )}
          {expired && (
            <span style={{ fontSize: 12, fontWeight: 700, color: '#B94A48',
              padding: '7px 14px', borderRadius: 10, background: 'rgba(185,74,72,0.08)',
              border: '1px solid rgba(185,74,72,0.2)' }}>Registration Closed</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function EventsPage() {
  const { isMockMode } = useAuth()
  const [events, setEvents]   = useState<EventBoardItem[]>([])
  const [search, setSearch]   = useState('')
  const [catFilter, setCat]   = useState<EventBoardCategory | 'All'>('All')
  const [modeFilter, setMode] = useState<'All' | 'Online' | 'Offline'>('All')
  const [showPast, setShowPast] = useState(false)

  useEffect(() => {
    if (isMockMode) { setEvents(MOCK_EVENTS); return }
    // Real Firebase — subscribe to events collection
    import('@/services/firebase.service').then(({ subscribeToEvents }) => {
      subscribeToEvents((data) => setEvents(data))
    }).catch(() => {})
  }, [isMockMode])

  // ── Filter logic ───────────────────────────────────────────
  const filtered = events
    .filter(e => catFilter === 'All'  || e.category === catFilter)
    .filter(e => modeFilter === 'All' || e.mode === modeFilter)
    .filter(e => showPast ? true : daysLeft(e.deadline) >= 0)
    .filter(e =>
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.organizer?.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => daysLeft(a.deadline) - daysLeft(b.deadline))

  const urgentCount = events.filter(e => { const d = daysLeft(e.deadline); return d >= 0 && d <= 3 }).length

  return (
    <div>
      {/* ── Hero Banner ── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        style={{ borderRadius: 20, marginBottom: 28, position: 'relative', overflow: 'hidden',
          padding: '32px 36px', background: '#172033', boxShadow: '0 8px 32px rgba(23,32,51,0.25)' }}>

        {/* Dot grid */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="ev-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="2" fill="rgba(255,255,255,0.1)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ev-dots)" />
        </svg>
        {/* Bubble rings */}
        <svg style={{ position: 'absolute', right: -30, top: -40, pointerEvents: 'none', opacity: 0.15 }} width="220" height="220">
          <circle cx="160" cy="60" r="100" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeDasharray="6 5" />
          <circle cx="160" cy="60" r="65"  fill="none" stroke="rgba(214,106,61,0.9)"  strokeWidth="1.5" strokeDasharray="4 6" />
        </svg>
        {/* Glow */}
        <div style={{ position: 'absolute', right: 80, top: -40, width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,106,61,0.18) 0%, transparent 70%)',
          pointerEvents: 'none', filter: 'blur(24px)' }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Calendar style={{ width: 20, height: 20, color: '#D66A3D' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)',
              letterSpacing: '0.1em', textTransform: 'uppercase' }}>Events Board</span>
          </div>
          <h1 style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: 700, color: 'white',
            letterSpacing: '-0.5px', marginBottom: 8,
            fontFamily: "'Playfair Display', Georgia, serif" }}>
            Upcoming Events
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.6, fontWeight: 300, maxWidth: 480 }}>
            Explore hackathons, workshops, symposiums, and more. Register before the deadline!
          </p>
          {urgentCount > 0 && (
            <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '7px 14px', borderRadius: 20,
              background: 'rgba(185,74,72,0.2)', border: '1px solid rgba(185,74,72,0.4)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f87171',
                animation: 'pulse 1.5s infinite', display: 'inline-block' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fca5a5' }}>
                {urgentCount} event{urgentCount > 1 ? 's' : ''} closing within 3 days!
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24, alignItems: 'center' }}>
        {/* Search */}
        <div style={{ flex: '1 1 220px', position: 'relative', minWidth: 180 }}>
          <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            width: 15, height: 15, color: '#94a3b8' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search events, organizers…"
            className="input-field" style={{ paddingLeft: 36, fontSize: 13 }} />
          {search && (
            <button onClick={() => setSearch('')}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2 }}>
              <X style={{ width: 14, height: 14 }} />
            </button>
          )}
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(['All', ...CATEGORIES] as const).map(c => {
            const active = catFilter === c
            const style = c !== 'All' ? cat(c as string) : null
            return (
              <button key={c} onClick={() => setCat(c as any)}
                style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.15s', border: '1.5px solid',
                  background: active ? (style?.bg ?? 'rgba(23,32,51,0.08)') : 'white',
                  color: active ? (style?.color ?? '#172033') : '#718096',
                  borderColor: active ? (style?.border ?? 'rgba(23,32,51,0.18)') : 'rgba(23,32,51,0.1)',
                  boxShadow: active ? `0 2px 8px ${style?.border ?? 'rgba(23,32,51,0.15)'}` : 'none',
                }}>
                {c}
              </button>
            )
          })}
        </div>

        {/* Mode + past toggle */}
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          {(['All', 'Online', 'Offline'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                cursor: 'pointer', border: '1.5px solid',
                background: modeFilter === m ? '#172033' : 'white',
                color: modeFilter === m ? 'white' : '#718096',
                borderColor: modeFilter === m ? '#172033' : 'rgba(23,32,51,0.1)',
              }}>{m}</button>
          ))}
          <button onClick={() => setShowPast(v => !v)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              cursor: 'pointer', border: '1.5px solid',
              background: showPast ? 'rgba(185,74,72,0.1)' : 'white',
              color: showPast ? '#B94A48' : '#718096',
              borderColor: showPast ? 'rgba(185,74,72,0.3)' : 'rgba(23,32,51,0.1)',
            }}>Show Closed</button>
        </div>
      </div>

      {/* ── Count ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <p style={{ fontSize: 13, color: '#718096', fontWeight: 500 }}>
          {filtered.length === 0 ? 'No events found' : `${filtered.length} event${filtered.length !== 1 ? 's' : ''} found`}
        </p>
        <p style={{ fontSize: 12, color: '#94a3b8' }}>Sorted by deadline</p>
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <Calendar style={{ width: 36, height: 36, color: '#cbd5e1', margin: '0 auto 12px' }} />
          <p style={{ color: '#718096', fontSize: 15, fontWeight: 600 }}>No events match your filters</p>
          <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>Try adjusting the category or search term</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {filtered.map((ev, i) => <EventCard key={ev.id} ev={ev} index={i} />)}
        </div>
      )}
    </div>
  )
}
