// ============================================================
//  CAMPUS-SYNC — SHARED TYPE DEFINITIONS
// ============================================================

export type UserRole = 'student' | 'advisor' | 'hod' | 'faculty' | 'admin'

export type ODCategory = 'Hackathon' | 'Symposium' | 'Workshop' | 'Sports' | 'Paper Presentation' | 'Cultural' | 'Other'
export type ODEventType = 'Internal' | 'External'

export type ODStage =
  | 'submitted'
  | 'advisor_review'
  | 'hod_review'
  | 'approved'
  | 'proof_pending'
  | 'verified'
  | 'rejected'
  | 'proof_overdue'

// ── User Profile (Firestore /users/{uid}) ───────────────────
export interface UserProfile {
  uid:        string
  name:       string
  email:      string
  role:       UserRole
  department: string
  className?: string    // e.g. "CSE-A"
  rollNo?:    string    // e.g. "21CS101"
  advisorId?: string    // UID of the class advisor
  createdAt:  string
}

// ── Team Member in a Team OD ─────────────────────────────────
export interface TeamMember {
  rollNo:     string
  name:       string
  department: string
  uid?:       string
}

// ── Approval History entry ───────────────────────────────────
export interface ApprovalEntry {
  stage:        ODStage
  action:       'submitted' | 'approved' | 'rejected' | 'changes_requested' | 'proof_submitted' | 'verified'
  approverId:   string
  approverName: string
  comment:      string
  timestamp:    string
}

// ── OD Request (Firestore /odRequests/{id}) ──────────────────
export interface ODRequest {
  id:             string
  title:          string
  eventType:      ODEventType
  category:       ODCategory
  institution:    string
  startDate:      string      // YYYY-MM-DD
  endDate:        string      // YYYY-MM-DD
  periods:        string[]    // e.g. ["Period 1", "Period 2"]
  description:    string
  proofUrl?:      string      // Registration proof upload URL
  isTeam:         boolean
  teamMembers:    TeamMember[]
  createdBy:      string      // UID
  creatorName:    string
  creatorEmail:   string
  department:     string
  className:      string
  rollNo:         string
  isUrgent:       boolean     // start date within 3 days & still pending
  currentStage:   ODStage
  approvalHistory:ApprovalEntry[]
  certificateUrl?: string     // Post-event proof
  proofStatus:    'pending' | 'submitted' | 'verified' | 'overdue' | 'not_required'
  createdAt:      string
  updatedAt:      string
}

// ── Timetable entry (Firestore /timetables/{id}) ─────────────
export type Weekday = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'

export interface TimetableEntry {
  id:        string
  className: string           // e.g. "CSE-A"
  day:       Weekday
  period:    string           // e.g. "Period 1"
  subject:   string
  facultyId: string
  facultyName: string
}

// ── Notification (Firestore /notifications/{id}) ─────────────
export interface Notification {
  id:          string
  userId:      string
  message:     string
  title:       string
  type:        'od_status' | 'faculty_alert' | 'proof_due' | 'urgent'
  read:        boolean
  relatedOdId?:string
  createdAt:   string
}

// ── Event Board (Firestore /events/{id}) ─────────────────────
export type EventBoardCategory = 'Hackathon' | 'Symposium' | 'Workshop' | 'Sports' | 'Paper Presentation' | 'Competition' | 'Other'

export interface EventBoardItem {
  id:          string
  title:       string
  link:        string
  category:    EventBoardCategory
  deadline:    string          // YYYY-MM-DD reg deadline
  description: string
  postedBy:    string          // UID
  postedByName:string
  createdAt:   string
  // ── Extended fields for Events page ──
  eventDate?:  string          // YYYY-MM-DD actual event date
  prize?:      string          // Prize/reward description
  organizer?:  string          // Hosting org
  location?:   string          // City / Online
  mode?:       'Online' | 'Offline' | 'Hybrid'
}

// ── Team Listing (Firestore /teamListings/{id}) ──────────────
export interface TeamListing {
  id:           string
  eventId:      string
  eventTitle:   string
  userId:       string
  userName:     string
  skills:       string[]
  roleWanted:   string
  availability: string
  bio:          string
  connectedWith:string[]       // UIDs who clicked Connect
  contactEmail: string
  createdAt:    string
}

