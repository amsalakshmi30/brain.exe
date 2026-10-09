// ── Notification types ────────────────────────────────────────
import { UserRole } from '@/types'

export type NotifType =
  | 'new_event'
  | 'od_deadline'
  | 'od_approved'
  | 'od_rejected'
  | 'proof_due'
  | 'team_listing'

export interface AppNotification {
  id: string
  type: NotifType
  title: string
  message: string
  timestamp: Date
  read: boolean
  forRoles: UserRole[]
  link?: string
  urgent?: boolean
}

// ── Mock notifications ────────────────────────────────────────
const now = new Date()
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3_600_000)
const daysAgo  = (d: number) => new Date(now.getTime() - d * 86_400_000)

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  // ── Student notifications ─────────────────────────────────
  {
    id: 'n1',
    type: 'new_event',
    title: '🎉 New Event Added',
    message: 'Smart India Hackathon 2026 has been listed on the Event Board. Apply before seats fill up!',
    timestamp: hoursAgo(1),
    read: false,
    forRoles: ['student'],
    link: '/team-finder',
    urgent: false,
  },
  {
    id: 'n2',
    type: 'new_event',
    title: '🚀 New Event: HackWithInfy',
    message: 'HackWithInfy 2026 registration is now open. Check the Event Board for details.',
    timestamp: hoursAgo(5),
    read: false,
    forRoles: ['student'],
    link: '/team-finder',
  },
  {
    id: 'n3',
    type: 'team_listing',
    title: '👥 New Team Listing',
    message: 'Kavya Reddy is looking for a Full Stack Developer for Smart India Hackathon.',
    timestamp: hoursAgo(8),
    read: true,
    forRoles: ['student'],
    link: '/team-finder',
  },
  {
    id: 'n4',
    type: 'od_approved',
    title: '✅ OD Approved',
    message: 'Your OD request for "Smart India Hackathon 2026" has been approved by your Class Advisor.',
    timestamp: daysAgo(1),
    read: true,
    forRoles: ['student'],
    link: '/student',
  },
  {
    id: 'n5',
    type: 'proof_due',
    title: '📎 Certificate Upload Due Soon',
    message: 'Your OD for "HackWithInfy 2026" ended 2 days ago. Upload your proof within 5 days to avoid rejection.',
    timestamp: daysAgo(2),
    read: false,
    forRoles: ['student'],
    link: '/student',
    urgent: true,
  },

  // ── Faculty notifications ─────────────────────────────────
  {
    id: 'n6',
    type: 'od_deadline',
    title: '⏰ OD Approval Deadline Today',
    message: "Arjun Sharma's OD request for Smart India Hackathon expires tonight. Approve or reject before 11:59 PM.",
    timestamp: hoursAgo(2),
    read: false,
    forRoles: ['faculty', 'advisor'],
    link: '/advisor',
    urgent: true,
  },
  {
    id: 'n7',
    type: 'od_deadline',
    title: '⚠️ 3 ODs Awaiting Your Action',
    message: '3 student OD requests are due for approval in the next 24 hours. Review them now.',
    timestamp: hoursAgo(4),
    read: false,
    forRoles: ['faculty', 'advisor', 'hod'],
    link: '/advisor',
    urgent: true,
  },
  {
    id: 'n8',
    type: 'od_deadline',
    title: '⏰ Preethi Kumar — OD Expires Tomorrow',
    message: "Preethi Kumar's OD request for National Paper Presentation is pending HOD approval. Event starts tomorrow.",
    timestamp: hoursAgo(6),
    read: false,
    forRoles: ['hod', 'advisor'],
    link: '/hod',
    urgent: true,
  },
  {
    id: 'n9',
    type: 'new_event',
    title: '📋 New Team Listing Posted',
    message: 'Siddharth Nair has posted a team listing for HackWithInfy 2026. 4 students are now registered.',
    timestamp: daysAgo(1),
    read: true,
    forRoles: ['faculty', 'advisor'],
    link: '/team-finder',
  },
]

// ── Helpers ───────────────────────────────────────────────────
export function getNotificationsForRole(role: UserRole): AppNotification[] {
  return MOCK_NOTIFICATIONS.filter(n => n.forRoles.includes(role))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

export function getUnreadCount(role: UserRole): number {
  return getNotificationsForRole(role).filter(n => !n.read).length
}

export function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}
