import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Plus, Search, X, Mail, ExternalLink, Calendar,
  Zap, ArrowRight, Star, Tag, Clock, MessageCircle, UserCheck
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { MOCK_EVENTS, MOCK_TEAM_LISTINGS } from '@/lib/mockData'
import { EventBoardItem, TeamListing } from '@/types'
import toast from 'react-hot-toast'

type TabId = 'board' | 'teams'

// ── Skill pill colors (light palette) — uses full token set ────
const SKILL_COLORS = [
  { bg: 'rgba(214,106,61,0.1)',  color: '#7a2e0d', border: 'rgba(214,106,61,0.28)' },
  { bg: 'rgba(63,143,104,0.1)', color: '#1f5e40', border: 'rgba(63,143,104,0.28)' },
  { bg: 'rgba(23,32,51,0.08)',  color: '#172033', border: 'rgba(23,32,51,0.18)' },
  { bg: 'rgba(211,154,40,0.1)', color: '#7a5800', border: 'rgba(211,154,40,0.28)' },
  { bg: 'rgba(185,74,72,0.08)', color: '#7a1f1f', border: 'rgba(185,74,72,0.25)' },
  { bg: 'rgba(113,128,150,0.08)',color: '#718096', border: 'rgba(113,128,150,0.2)' },
]
const skillColor = (skill: string) => SKILL_COLORS[skill.length % SKILL_COLORS.length]

const CAT_COLOR: Record<string, string> = {
  Hackathon: '#D66A3D', Symposium: '#172033', Workshop: '#3F8F68',
  Sports: '#D39A28', 'Paper Presentation': '#B94A48',
  Competition: '#172033', Other: '#718096',
}

const AVATAR_BG = 'linear-gradient(135deg,#172033,#D66A3D)'
const avatarBg = (_name: string) => AVATAR_BG

const SKILL_SUGGESTIONS = [
  'React','Node.js','Python','ML/AI','UI/UX','Flutter','Firebase',
  'AWS','Data Science','Blockchain','AR/VR','IoT','Cybersecurity','Figma',
  'Spring Boot','Docker','TensorFlow','OpenCV','LangChain','Web3',
]

// ── Connect Modal (light) ─────────────────────────────────────
function ConnectModal({ listing, onClose }: { listing: TeamListing; onClose: () => void }) {
  const bg = avatarBg(listing.userName)
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        onClick={onClose}>
        <motion.div initial={{ opacity: 0, y: 32, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 32, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          style={{ width: '100%', maxWidth: 420, background: 'white', borderRadius: 24, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.2)', border: '1px solid #e2e8f0' }}
          onClick={e => e.stopPropagation()}>

          {/* Colour stripe */}
          <div style={{ height: 5, background: bg }} />

          <div style={{ padding: '24px 24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', display: 'flex' }}>
                <X style={{ width: 15, height: 15, color: '#64748b' }} />
              </button>
            </div>

            {/* Avatar + name */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 76, height: 76, borderRadius: 22, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 32, fontWeight: 900, marginBottom: 14, boxShadow: '0 8px 24px rgba(214,106,61,0.25)' }}>
                {listing.userName[0]}
              </div>
              <h2 style={{ color: '#0f172a', fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{listing.userName}</h2>
              <p style={{ color: '#D66A3D', fontSize: 13, fontWeight: 700 }}>{listing.roleWanted}</p>
              <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>📌 {listing.eventTitle}</p>
            </div>

            {/* Bio */}
            {listing.bio && (
              <div style={{ background: '#f8faff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
                <p style={{ color: '#475569', fontSize: 13, lineHeight: 1.65 }}>{listing.bio}</p>
              </div>
            )}

            {/* Skills */}
            {listing.skills.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Skills</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {listing.skills.map(s => {
                    const c = skillColor(s)
                    return <span key={s} style={{ padding: '4px 12px', fontSize: 12, fontWeight: 700, borderRadius: 20, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>{s}</span>
                  })}
                </div>
              </div>
            )}

            {/* Availability */}
            {listing.availability && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, color: '#64748b', fontSize: 12 }}>
                <Clock style={{ width: 13, height: 13, color: '#D66A3D' }} />{listing.availability}
              </div>
            )}

            {/* Contact */}
            <p style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Contact</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href={`mailto:${listing.contactEmail}?subject=Team Up for ${listing.eventTitle}&body=Hi ${listing.userName},%0A%0AI saw your listing on CAMPUS-SYNC and I'd like to connect!`}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 16, background: 'linear-gradient(135deg,#D66A3D,#c0552e)', color: 'white', textDecoration: 'none', fontWeight: 700, boxShadow: '0 6px 20px rgba(214,106,61,0.3)' }}>
                <Mail style={{ width: 18, height: 18, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14 }}>Send an Email</div>
                  <div style={{ fontSize: 11, opacity: 0.75, fontWeight: 500 }}>{listing.contactEmail}</div>
                </div>
                <ArrowRight style={{ width: 16, height: 16 }} />
              </a>
              <button onClick={() => { navigator.clipboard.writeText(listing.contactEmail); toast.success('Email copied!') }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 14, background: 'white', border: '1.5px solid #e2e8f0', cursor: 'pointer', color: '#475569', fontSize: 13, fontWeight: 600 }}>
                <UserCheck style={{ width: 15, height: 15, color: '#D66A3D' }} /> Copy Email Address
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Event card (light) ────────────────────────────────────────
function EventCard({ ev, listings, onCreateOD }: { ev: EventBoardItem; listings: TeamListing[]; onCreateOD: (ev: EventBoardItem) => void }) {
  const { userProfile } = useAuth()
  const daysLeft  = Math.ceil((new Date(ev.deadline).getTime() - Date.now()) / 86400000)
  const evCount   = listings.filter(l => l.eventId === ev.id).length
  const catColor  = CAT_COLOR[ev.category] ?? CAT_COLOR['Other']
  const isExpired = daysLeft < 0

  return (
    <motion.div layout className="card-hover" style={{ overflow: 'hidden' }}>
      <div style={{ height: 4, background: catColor }} />
      <div style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${catColor}15`, color: catColor, border: `1px solid ${catColor}30` }}>
            <Tag style={{ width: 10, height: 10 }} />{ev.category}
          </span>
          {isExpired ? (
            <span style={{ color: '#dc2626', fontSize: 11, fontWeight: 700 }}>Closed</span>
          ) : daysLeft <= 3 ? (
            <span style={{ color: '#ef4444', fontSize: 11, fontWeight: 700, animation: 'pulse 2s infinite' }}>⚡ {daysLeft}d left!</span>
          ) : (
            <span style={{ color: '#94a3b8', fontSize: 11 }}>{daysLeft}d left</span>
          )}
        </div>

        <h3 style={{ color: '#0f172a', fontWeight: 800, fontSize: 15, lineHeight: 1.3, marginBottom: 8 }}>{ev.title}</h3>
        {ev.description && <p style={{ color: '#64748b', fontSize: 12, lineHeight: 1.6, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{ev.description}</p>}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#94a3b8', fontSize: 12, marginBottom: 14 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar style={{ width: 11, height: 11 }} />{ev.deadline}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users style={{ width: 11, height: 11 }} />{evCount} listing{evCount !== 1 ? 's' : ''}</span>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ev.link && (
            <a href={ev.link} target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10, background: '#f8faff', border: '1px solid #e2e8f0', color: '#475569', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
              <ExternalLink style={{ width: 11, height: 11 }} /> Register
            </a>
          )}
          {userProfile?.role === 'student' && !isExpired && (
            <button onClick={() => onCreateOD(ev)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#D66A3D', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              <Zap style={{ width: 11, height: 11 }} /> Create Team OD <ArrowRight style={{ width: 11, height: 11 }} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ── Team Listing card (light) ─────────────────────────────────
function TeamCard({ listing, onConnect }: { listing: TeamListing; onConnect: (l: TeamListing) => void }) {
  const bg = avatarBg(listing.userName)
  return (
    <motion.div layout className="card-hover" style={{ overflow: 'hidden' }}>
      <div style={{ height: 3, background: bg }} />
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 18, flexShrink: 0 }}>
            {listing.userName[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ color: '#0f172a', fontWeight: 800, fontSize: 14, marginBottom: 2 }}>{listing.userName}</h3>
            <p style={{ color: '#D66A3D', fontSize: 12, fontWeight: 700 }}>{listing.roleWanted}</p>
            <p style={{ color: '#94a3b8', fontSize: 11, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📌 {listing.eventTitle}</p>
          </div>
        </div>

        {listing.bio && <p style={{ color: '#64748b', fontSize: 12, lineHeight: 1.6, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{listing.bio}</p>}

        {listing.skills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
            {listing.skills.slice(0, 4).map(s => {
              const c = skillColor(s)
              return <span key={s} style={{ padding: '3px 10px', fontSize: 11, fontWeight: 700, borderRadius: 20, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>{s}</span>
            })}
            {listing.skills.length > 4 && (
              <span style={{ padding: '3px 10px', fontSize: 11, fontWeight: 700, borderRadius: 20, background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}>+{listing.skills.length - 4}</span>
            )}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
          {listing.availability && (
            <span style={{ color: '#94a3b8', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock style={{ width: 11, height: 11 }} />{listing.availability.slice(0, 26)}{listing.availability.length > 26 ? '…' : ''}
            </span>
          )}
          <button onClick={() => onConnect(listing)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 10, background: 'linear-gradient(135deg,#D66A3D,#c0552e)', border: 'none', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(214,106,61,0.25)', marginLeft: 'auto' }}>
            <MessageCircle style={{ width: 13, height: 13 }} /> Connect
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function TeamFinderPage() {
  const navigate = useNavigate()
  const { userProfile, isMockMode } = useAuth()
  const [events,         setEvents]         = useState<EventBoardItem[]>([])
  const [listings,       setListings]       = useState<TeamListing[]>([])
  const [search,         setSearch]         = useState('')
  const [tab,            setTab]            = useState<TabId>('teams')
  const [loading,        setLoading]        = useState(true)
  const [connectTarget,  setConnectTarget]  = useState<TeamListing | null>(null)
  const [filterEvent,    setFilterEvent]    = useState('all')
  const [showEventForm,  setShowEventForm]  = useState(false)
  const [showListingForm,setShowListingForm]= useState(false)
  const [eventForm,      setEventForm]      = useState({ title:'',link:'',category:'Hackathon',deadline:'',description:'' })
  const [listingForm,    setListingForm]    = useState({ skills:[] as string[], roleWanted:'', availability:'', bio:'', contactEmail:'', eventId:'' })
  const [skillInput,     setSkillInput]     = useState('')

  useEffect(() => {
    if (isMockMode) { setEvents(MOCK_EVENTS); setListings(MOCK_TEAM_LISTINGS); setLoading(false); return }
    // Real Firebase — subscribe to both collections
    const timeout = setTimeout(() => setLoading(false), 8000)
    import('@/services/firebase.service').then(({ subscribeToEvents, subscribeToTeamListings }) => {
      subscribeToEvents(data => { setEvents(data); clearTimeout(timeout); setLoading(false) })
      subscribeToTeamListings(data => setListings(data))
    }).catch(() => { clearTimeout(timeout); setLoading(false) })
    return () => clearTimeout(timeout)
  }, [isMockMode])

  useEffect(() => {
    if (userProfile) setListingForm(f => ({ ...f, contactEmail: userProfile.email }))
  }, [userProfile])

  const addSkill    = (s: string) => { const t = s.trim(); if (t && !listingForm.skills.includes(t)) setListingForm(f => ({ ...f, skills: [...f.skills, t] })); setSkillInput('') }
  const removeSkill = (s: string) => setListingForm(f => ({ ...f, skills: f.skills.filter(x => x !== s) }))

  const createTeamOD = (ev: EventBoardItem) => {
    if (!userProfile || userProfile.role !== 'student') { toast('Only students can create OD requests.', { icon: '⚠️' }); return }
    navigate(`/student/submit?${new URLSearchParams({ title: ev.title, category: ev.category, isTeam: '1', teammates: '[]' }).toString()}`)
    toast.success('Pre-filling OD form with event details!')
  }

  const submitEvent = async () => {
    if (!eventForm.title || !eventForm.deadline) { toast.error('Title and deadline are required'); return }
    if (isMockMode) {
      setEvents(p => [{ id: `ev-${Date.now()}`, ...eventForm, category: eventForm.category as any, mode: 'Online' as const, startDate: eventForm.deadline, postedBy: userProfile?.uid ?? '', postedById: userProfile?.uid ?? '', postedByName: userProfile?.name ?? '', createdAt: new Date().toISOString() }, ...p])
      setShowEventForm(false); setEventForm({ title: '', link: '', category: 'Hackathon', deadline: '', description: '' })
      toast.success('Event posted! 🎉'); return
    }
    try {
      const { createEvent } = await import('@/services/firebase.service')
      await createEvent({
        title:       eventForm.title,
        category:    eventForm.category as any,
        description: eventForm.description,
        deadline:    eventForm.deadline,
        link:        eventForm.link,
        mode:        'Online',
        startDate:   eventForm.deadline,
        postedById:  userProfile?.uid ?? '',
        postedByName: userProfile?.name ?? '',
      })
      setShowEventForm(false)
      setEventForm({ title: '', link: '', category: 'Hackathon', deadline: '', description: '' })
      toast.success('Event posted to board! 🎉')
    } catch (err: any) { toast.error(err.message ?? 'Failed to post event') }
  }

  const submitListing = async () => {
    if (!listingForm.roleWanted || !listingForm.eventId) { toast.error('Select an event and fill the role'); return }
    const ev = events.find(e => e.id === listingForm.eventId)
    if (isMockMode) {
      setListings(p => [{ id: `tl-${Date.now()}`, eventId: listingForm.eventId, eventTitle: ev?.title ?? '', userId: userProfile?.uid ?? '', userName: userProfile?.name ?? '', skills: listingForm.skills, roleWanted: listingForm.roleWanted, availability: listingForm.availability, bio: listingForm.bio, connectedWith: [], contactEmail: listingForm.contactEmail, createdAt: new Date().toISOString() }, ...p])
      setShowListingForm(false); toast.success('Listing posted! 🎉'); return
    }
    try {
      const { createTeamListing } = await import('@/services/firebase.service')
      await createTeamListing({
        eventId:      listingForm.eventId,
        eventTitle:   ev?.title ?? '',
        userId:       userProfile?.uid ?? '',
        userName:     userProfile?.name ?? '',
        skills:       listingForm.skills,
        roleWanted:   listingForm.roleWanted,
        availability: listingForm.availability,
        bio:          listingForm.bio,
        connectedWith: [],
        contactEmail: listingForm.contactEmail,
        title:        listingForm.roleWanted,
        description:  listingForm.bio,
        teamSize:     4,
        currentCount: 1,
        deadline:     ev?.deadline ?? '',
        postedById:   userProfile?.uid ?? '',
        postedByName: userProfile?.name ?? '',
      })
      setShowListingForm(false)
      toast.success('Team listing posted! 🎉')
    } catch (err: any) { toast.error(err.message ?? 'Failed to post listing') }
  }

  const filteredEvents   = events.filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase()))
  const filteredListings = listings.filter(l => {
    const matchSearch = l.eventTitle.toLowerCase().includes(search.toLowerCase()) || l.skills.some(s => s.toLowerCase().includes(search.toLowerCase())) || l.roleWanted.toLowerCase().includes(search.toLowerCase()) || l.userName.toLowerCase().includes(search.toLowerCase())
    return matchSearch && (filterEvent === 'all' || l.eventId === filterEvent)
  })
  const TABS = [
    { id: 'teams' as TabId, label: 'Team Listings', count: filteredListings.length },
    { id: 'board' as TabId, label: 'Event Board',   count: filteredEvents.length },
  ]

  const CARD_STYLE: React.CSSProperties = { background: 'white', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 0 }

  return (
    <div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: 4 }}>Event Board & Team Finder</h1>
          <p style={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>Find teammates, discover events, create Team OD in one flow.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {userProfile?.role === 'student' && (
            <button onClick={() => setShowListingForm(v => !v)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '9px 18px' }}>
              <Users style={{ width: 15, height: 15 }} /> Post Listing
            </button>
          )}
          <button onClick={() => setShowEventForm(v => !v)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '9px 18px' }}>
            <Plus style={{ width: 15, height: 15 }} /> Add Event
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { icon: <Star style={{ width: 16, height: 16 }} />,  label: 'Active Events',  value: events.length,   color: '#f59e0b' },
          { icon: <Users style={{ width: 16, height: 16 }} />, label: 'Team Listings',  value: listings.length, color: '#D66A3D' },
          { icon: <Zap style={{ width: 16, height: 16 }} />,   label: 'Skills Pooled',  value: [...new Set(listings.flatMap(l => l.skills))].length, color: '#172033' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}15`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-1px', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, fontWeight: 600 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Event form */}
      <AnimatePresence>
        {showEventForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ ...CARD_STYLE, marginBottom: 16, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ color: '#0f172a', fontWeight: 800, fontSize: 15 }}>Post an Event</h2>
              <button onClick={() => setShowEventForm(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex' }}><X style={{ width: 14, height: 14, color: '#64748b' }} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1/-1' }}><label className="label">Event Name *</label><input className="input-field" placeholder="e.g. Smart India Hackathon 2026" value={eventForm.title} onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div><label className="label">Category</label><select className="input-field" value={eventForm.category} onChange={e => setEventForm(f => ({ ...f, category: e.target.value }))}>{['Hackathon','Symposium','Workshop','Sports','Paper Presentation','Competition','Other'].map(c => <option key={c}>{c}</option>)}</select></div>
              <div><label className="label">Deadline *</label><input type="date" className="input-field" value={eventForm.deadline} onChange={e => setEventForm(f => ({ ...f, deadline: e.target.value }))} /></div>
              <div style={{ gridColumn: '1/-1' }}><label className="label">Link</label><input className="input-field" placeholder="https://..." value={eventForm.link} onChange={e => setEventForm(f => ({ ...f, link: e.target.value }))} /></div>
              <div style={{ gridColumn: '1/-1' }}><label className="label">Description</label><textarea rows={2} className="input-field" style={{ resize: 'none' }} value={eventForm.description} onChange={e => setEventForm(f => ({ ...f, description: e.target.value }))} /></div>
            </div>
            <button onClick={submitEvent} className="btn-primary" style={{ marginTop: 14, fontSize: 13, padding: '9px 20px' }}>Post to Board</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post Listing form */}
      <AnimatePresence>
        {showListingForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ ...CARD_STYLE, marginBottom: 16, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ color: '#0f172a', fontWeight: 800, fontSize: 15 }}>Post a Team Listing</h2>
              <button onClick={() => setShowListingForm(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex' }}><X style={{ width: 14, height: 14, color: '#64748b' }} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1/-1' }}><label className="label">Event *</label><select className="input-field" value={listingForm.eventId} onChange={e => setListingForm(f => ({ ...f, eventId: e.target.value }))}><option value="">Select event…</option>{events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}</select></div>
              <div><label className="label">Role Wanted *</label><input className="input-field" placeholder="e.g. ML Engineer" value={listingForm.roleWanted} onChange={e => setListingForm(f => ({ ...f, roleWanted: e.target.value }))} /></div>
              <div><label className="label">Availability</label><input className="input-field" placeholder="e.g. Full weekend" value={listingForm.availability} onChange={e => setListingForm(f => ({ ...f, availability: e.target.value }))} /></div>
              <div style={{ gridColumn: '1/-1' }}><label className="label">Bio</label><textarea rows={2} className="input-field" style={{ resize: 'none' }} value={listingForm.bio} onChange={e => setListingForm(f => ({ ...f, bio: e.target.value }))} /></div>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="label">Skills</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {SKILL_SUGGESTIONS.map(s => {
                    const selected = listingForm.skills.includes(s)
                    return (
                      <button type="button" key={s} onClick={() => addSkill(s)}
                        style={{ padding: '5px 12px', fontSize: 12, fontWeight: 600, borderRadius: 20, cursor: 'pointer', transition: 'all 0.15s',
                          background: selected ? '#D66A3D' : 'white', color: selected ? 'white' : '#64748b',
                          border: selected ? 'none' : '1px solid #e2e8f0', }}>
                        {s}
                      </button>
                    )
                  })}
                </div>
                <input className="input-field" style={{ fontSize: 13 }} placeholder="Custom skill + Enter" value={skillInput}
                  onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput) } }} />
                {listingForm.skills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {listingForm.skills.map(s => (
                      <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#D66A3D', fontSize: 12, fontWeight: 700, borderRadius: 20 }}>
                        {s}<button type="button" onClick={() => removeSkill(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}><X style={{ width: 10, height: 10 }} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button onClick={submitListing} className="btn-primary" style={{ marginTop: 14, fontSize: 13, padding: '9px 20px' }}>Post Listing</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#94a3b8', pointerEvents: 'none' }} />
          <input className="input-field" style={{ paddingLeft: 42 }} placeholder="Search events, skills, roles, names…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {tab === 'teams' && (
          <select className="input-field" style={{ width: 'auto', minWidth: 140 }} value={filterEvent} onChange={e => setFilterEvent(e.target.value)}>
            <option value="all">All Events</option>
            {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, padding: 6, background: '#f1f5f9', borderRadius: 16, marginBottom: 20 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, padding: '10px 16px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: tab === t.id ? 'white' : 'transparent',
              color:      tab === t.id ? '#0f172a' : '#94a3b8',
              boxShadow:  tab === t.id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            }}>
            {t.label}
            <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 20,
              background: tab === t.id ? '#eff6ff' : 'transparent',
              color:      tab === t.id ? '#D66A3D' : '#94a3b8',
            }}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Team Listings grid */}
      {tab === 'teams' && (
        loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
            {[1,2,3,4,5,6].map(i => <div key={i} className="shimmer-line" style={{ height: 200, borderRadius: 16 }} />)}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="card" style={{ padding: 64, textAlign: 'center' }}>
            <Users style={{ width: 40, height: 40, color: '#cbd5e1', margin: '0 auto 12px' }} />
            <p style={{ color: '#94a3b8', fontSize: 14 }}>No listings match your search.</p>
          </div>
        ) : (
          <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
            {filteredListings.map((listing, i) => (
              <motion.div key={listing.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <TeamCard listing={listing} onConnect={setConnectTarget} />
              </motion.div>
            ))}
          </motion.div>
        )
      )}

      {/* Event Board grid */}
      {tab === 'board' && (
        filteredEvents.length === 0 ? (
          <div className="card" style={{ padding: 64, textAlign: 'center' }}>
            <Star style={{ width: 40, height: 40, color: '#cbd5e1', margin: '0 auto 12px' }} />
            <p style={{ color: '#94a3b8', fontSize: 14 }}>No events yet. Post one!</p>
          </div>
        ) : (
          <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
            {filteredEvents.map((ev, i) => (
              <motion.div key={ev.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <EventCard ev={ev} listings={listings} onCreateOD={createTeamOD} />
              </motion.div>
            ))}
          </motion.div>
        )
      )}

      {/* Connect Modal */}
      {connectTarget && <ConnectModal listing={connectTarget} onClose={() => setConnectTarget(null)} />}
    </div>
  )
}


