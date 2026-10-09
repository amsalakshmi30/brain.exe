import { UserRole } from '@/types'

export interface RoleTheme {
  primary:   string
  secondary: string
  gradient:  string
  glow:      string
  blob1:     string
  blob2:     string
  blob3:     string
  label:     string
}

// ── All roles now use the navy/warm-orange palette ─────────────
// Each has a distinct accent from the approved palette:
//   Student  → warm orange (accent)
//   Advisor  → muted green (success)
//   HOD      → deep navy (navy itself)
//   Faculty  → mustard (warning)
//   Admin    → muted red (error)
//
// No blues, purples, teals, or indigos anywhere.

export const ROLE_THEMES: Record<UserRole, RoleTheme> = {
  student: {
    primary:   '#D66A3D',
    secondary: '#f4b896',
    gradient:  'linear-gradient(135deg, #D66A3D 0%, #c0552e 100%)',
    glow:      'rgba(214,106,61,0.35)',
    blob1:     'rgba(214,106,61,0.14)',
    blob2:     'rgba(192,85,46,0.10)',
    blob3:     'rgba(211,154,40,0.10)',
    label:     'Student',
  },
  advisor: {
    primary:   '#3F8F68',
    secondary: '#7fc9a4',
    gradient:  'linear-gradient(135deg, #3F8F68 0%, #2e6e50 100%)',
    glow:      'rgba(63,143,104,0.35)',
    blob1:     'rgba(63,143,104,0.14)',
    blob2:     'rgba(46,110,80,0.10)',
    blob3:     'rgba(211,154,40,0.08)',
    label:     'Class Advisor',
  },
  hod: {
    primary:   '#172033',
    secondary: '#c0cde0',
    gradient:  'linear-gradient(135deg, #172033 0%, #2d3f60 100%)',
    glow:      'rgba(23,32,51,0.35)',
    blob1:     'rgba(23,32,51,0.10)',
    blob2:     'rgba(45,63,96,0.08)',
    blob3:     'rgba(214,106,61,0.08)',
    label:     'Head of Dept.',
  },
  faculty: {
    primary:   '#D39A28',
    secondary: '#f0d27a',
    gradient:  'linear-gradient(135deg, #D39A28 0%, #b07e18 100%)',
    glow:      'rgba(211,154,40,0.35)',
    blob1:     'rgba(211,154,40,0.14)',
    blob2:     'rgba(176,126,24,0.10)',
    blob3:     'rgba(214,106,61,0.08)',
    label:     'Subject Faculty',
  },
  admin: {
    primary:   '#B94A48',
    secondary: '#e89e9d',
    gradient:  'linear-gradient(135deg, #B94A48 0%, #963030 100%)',
    glow:      'rgba(185,74,72,0.35)',
    blob1:     'rgba(185,74,72,0.12)',
    blob2:     'rgba(150,48,48,0.08)',
    blob3:     'rgba(214,106,61,0.10)',
    label:     'Admin',
  },
}

export function getRoleTheme(role?: UserRole): RoleTheme {
  return role ? ROLE_THEMES[role] : ROLE_THEMES.student
}
