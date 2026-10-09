// ============================================================
//  CAMPUS-SYNC — MOCK DATA
//  All demo data for 5 roles, OD requests in every stage,
//  a full timetable, team listings, and event board entries.
// ============================================================
import {
  ODRequest, UserProfile, TimetableEntry, EventBoardItem, TeamListing, Notification,
} from '@/types'

// ─── Demo User Profiles ──────────────────────────────────────
export const DEMO_PROFILES: Record<string, UserProfile & { password: string }> = {
  'student@demo.com': {
    uid: 'stu-001', name: 'Arjun Sharma', email: 'student@demo.com',
    role: 'student', department: 'Computer Science', className: 'CSE-A',
    rollNo: '21CS101', advisorId: 'adv-001', createdAt: '', password: 'demo1234',
  },
  'advisor@demo.com': {
    uid: 'adv-001', name: 'Dr. Priya Nair', email: 'advisor@demo.com',
    role: 'advisor', department: 'Computer Science', className: 'CSE-A',
    createdAt: '', password: 'demo1234',
  },
  'hod@demo.com': {
    uid: 'hod-001', name: 'Prof. Ramesh Kumar', email: 'hod@demo.com',
    role: 'hod', department: 'Computer Science', createdAt: '', password: 'demo1234',
  },
  'faculty@demo.com': {
    uid: 'fac-001', name: 'Mr. Suresh Pillai', email: 'faculty@demo.com',
    role: 'faculty', department: 'Computer Science', createdAt: '', password: 'demo1234',
  },
  'admin@demo.com': {
    uid: 'adm-001', name: 'Prof. Sunita Rao', email: 'admin@demo.com',
    role: 'admin', department: 'Administration', createdAt: '', password: 'demo1234',
  },
}

export const MOCK_USER = DEMO_PROFILES['student@demo.com'] as UserProfile

// ─── Mock Timetable for CSE-A ────────────────────────────────
export const MOCK_TIMETABLE: TimetableEntry[] = [
  { id: 'tt-01', className: 'CSE-A', day: 'Monday',    period: 'Period 1', subject: 'Data Structures',       facultyId: 'fac-001', facultyName: 'Mr. Suresh Pillai' },
  { id: 'tt-02', className: 'CSE-A', day: 'Monday',    period: 'Period 2', subject: 'Operating Systems',     facultyId: 'fac-002', facultyName: 'Dr. Kavitha Menon' },
  { id: 'tt-03', className: 'CSE-A', day: 'Monday',    period: 'Period 3', subject: 'DBMS',                  facultyId: 'fac-003', facultyName: 'Mr. Anand Kumar' },
  { id: 'tt-04', className: 'CSE-A', day: 'Monday',    period: 'Period 4', subject: 'Computer Networks',     facultyId: 'fac-001', facultyName: 'Mr. Suresh Pillai' },
  { id: 'tt-05', className: 'CSE-A', day: 'Tuesday',   period: 'Period 1', subject: 'Operating Systems',     facultyId: 'fac-002', facultyName: 'Dr. Kavitha Menon' },
  { id: 'tt-06', className: 'CSE-A', day: 'Tuesday',   period: 'Period 2', subject: 'Data Structures',       facultyId: 'fac-001', facultyName: 'Mr. Suresh Pillai' },
  { id: 'tt-07', className: 'CSE-A', day: 'Tuesday',   period: 'Period 3', subject: 'Machine Learning',      facultyId: 'fac-004', facultyName: 'Dr. Meera Krishnan' },
  { id: 'tt-08', className: 'CSE-A', day: 'Tuesday',   period: 'Period 4', subject: 'Software Engineering',  facultyId: 'fac-005', facultyName: 'Ms. Rekha Iyer' },
  { id: 'tt-09', className: 'CSE-A', day: 'Wednesday', period: 'Period 1', subject: 'DBMS',                  facultyId: 'fac-003', facultyName: 'Mr. Anand Kumar' },
  { id: 'tt-10', className: 'CSE-A', day: 'Wednesday', period: 'Period 2', subject: 'Machine Learning',      facultyId: 'fac-004', facultyName: 'Dr. Meera Krishnan' },
  { id: 'tt-11', className: 'CSE-A', day: 'Wednesday', period: 'Period 3', subject: 'Data Structures',       facultyId: 'fac-001', facultyName: 'Mr. Suresh Pillai' },
  { id: 'tt-12', className: 'CSE-A', day: 'Thursday',  period: 'Period 1', subject: 'Computer Networks',     facultyId: 'fac-001', facultyName: 'Mr. Suresh Pillai' },
  { id: 'tt-13', className: 'CSE-A', day: 'Thursday',  period: 'Period 2', subject: 'Software Engineering',  facultyId: 'fac-005', facultyName: 'Ms. Rekha Iyer' },
  { id: 'tt-14', className: 'CSE-A', day: 'Thursday',  period: 'Period 3', subject: 'Operating Systems',     facultyId: 'fac-002', facultyName: 'Dr. Kavitha Menon' },
  { id: 'tt-15', className: 'CSE-A', day: 'Friday',    period: 'Period 1', subject: 'Machine Learning',      facultyId: 'fac-004', facultyName: 'Dr. Meera Krishnan' },
  { id: 'tt-16', className: 'CSE-A', day: 'Friday',    period: 'Period 2', subject: 'DBMS',                  facultyId: 'fac-003', facultyName: 'Mr. Anand Kumar' },
  { id: 'tt-17', className: 'CSE-A', day: 'Friday',    period: 'Period 3', subject: 'Software Engineering',  facultyId: 'fac-005', facultyName: 'Ms. Rekha Iyer' },
  { id: 'tt-18', className: 'CSE-A', day: 'Friday',    period: 'Period 4', subject: 'Data Structures',       facultyId: 'fac-001', facultyName: 'Mr. Suresh Pillai' },
]

// ─── Helper — days from today ─────────────────────────────────
const daysFrom = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

// ─── Mock OD Requests ─────────────────────────────────────────
export const MOCK_OD_REQUESTS: ODRequest[] = [
  // 1. URGENT — start in 2 days, still at advisor review
  {
    id: 'od-001',
    title: 'Smart India Hackathon 2026',
    eventType: 'External',
    category: 'Hackathon',
    institution: 'AICTE / Government of India',
    startDate: daysFrom(2),
    endDate: daysFrom(4),
    periods: ['Period 1', 'Period 2', 'Period 3', 'Period 4'],
    description: 'National-level hackathon organized by AICTE. Our team is presenting an AI-based crop disease detection solution.',
    isTeam: true,
    teamMembers: [
      { rollNo: '21CS101', name: 'Arjun Sharma',  department: 'CSE' },
      { rollNo: '21CS102', name: 'Kavya Reddy',   department: 'CSE' },
      { rollNo: '21CS103', name: 'Rohan Mehta',   department: 'CSE' },
      { rollNo: '21CS104', name: 'Preethi Kumar', department: 'CSE' },
    ],
    createdBy: 'stu-001', creatorName: 'Arjun Sharma', creatorEmail: 'student@demo.com',
    department: 'Computer Science', className: 'CSE-A', rollNo: '21CS101',
    isUrgent: true,
    currentStage: 'advisor_review',
    approvalHistory: [
      { stage: 'submitted', action: 'submitted', approverId: 'stu-001', approverName: 'Arjun Sharma', comment: 'OD request submitted for SIH team participation.', timestamp: new Date(Date.now() - 86400000).toISOString() },
    ],
    proofStatus: 'not_required',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },

  // 2. HOD Review stage
  {
    id: 'od-002',
    title: 'National Symposium on AI & Robotics',
    eventType: 'External',
    category: 'Symposium',
    institution: 'IIT Madras',
    startDate: daysFrom(7),
    endDate: daysFrom(8),
    periods: ['Period 1', 'Period 2'],
    description: 'Two-day national symposium on AI & Robotics. Selected as participant for paper presentation.',
    isTeam: false,
    teamMembers: [],
    createdBy: 'stu-001', creatorName: 'Arjun Sharma', creatorEmail: 'student@demo.com',
    department: 'Computer Science', className: 'CSE-A', rollNo: '21CS101',
    isUrgent: false,
    currentStage: 'hod_review',
    approvalHistory: [
      { stage: 'submitted', action: 'submitted', approverId: 'stu-001', approverName: 'Arjun Sharma', comment: 'OD submitted for paper presentation at IIT Madras.', timestamp: new Date(Date.now() - 4 * 86400000).toISOString() },
      { stage: 'advisor_review', action: 'approved', approverId: 'adv-001', approverName: 'Dr. Priya Nair', comment: 'Excellent initiative! Forwarding to HOD for final approval.', timestamp: new Date(Date.now() - 3 * 86400000).toISOString() },
    ],
    proofStatus: 'not_required',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },

  // 3. APPROVED — faculty notified
  {
    id: 'od-003',
    title: 'Workshop on Cybersecurity Fundamentals',
    eventType: 'Internal',
    category: 'Workshop',
    institution: 'Sri Venkateswara College of Engineering',
    startDate: daysFrom(10),
    endDate: daysFrom(10),
    periods: ['Period 2', 'Period 3', 'Period 4'],
    description: 'Full-day workshop on ethical hacking and cybersecurity basics organized by the college cyber club.',
    isTeam: false,
    teamMembers: [],
    createdBy: 'stu-001', creatorName: 'Arjun Sharma', creatorEmail: 'student@demo.com',
    department: 'Computer Science', className: 'CSE-A', rollNo: '21CS101',
    isUrgent: false,
    currentStage: 'approved',
    approvalHistory: [
      { stage: 'submitted', action: 'submitted', approverId: 'stu-001', approverName: 'Arjun Sharma', comment: 'OD submitted for cybersecurity workshop.', timestamp: new Date(Date.now() - 6 * 86400000).toISOString() },
      { stage: 'advisor_review', action: 'approved', approverId: 'adv-001', approverName: 'Dr. Priya Nair', comment: 'Approved. Good for skill development.', timestamp: new Date(Date.now() - 5 * 86400000).toISOString() },
      { stage: 'hod_review', action: 'approved', approverId: 'hod-001', approverName: 'Prof. Ramesh Kumar', comment: 'Approved. Faculty notified.', timestamp: new Date(Date.now() - 4 * 86400000).toISOString() },
    ],
    proofStatus: 'not_required',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },

  // 4. PROOF PENDING — event ended, waiting for certificate
  {
    id: 'od-004',
    title: 'Google Solution Challenge 2026',
    eventType: 'External',
    category: 'Hackathon',
    institution: 'Google',
    startDate: daysFrom(-5),
    endDate: daysFrom(-3),
    periods: ['Period 1', 'Period 2', 'Period 3', 'Period 4'],
    description: 'Participated in Google Solution Challenge targeting SDG goals. Built an app for education accessibility.',
    isTeam: true,
    teamMembers: [
      { rollNo: '21CS101', name: 'Arjun Sharma',  department: 'CSE' },
      { rollNo: '21CS105', name: 'Siddharth Nair', department: 'CSE' },
    ],
    createdBy: 'stu-001', creatorName: 'Arjun Sharma', creatorEmail: 'student@demo.com',
    department: 'Computer Science', className: 'CSE-A', rollNo: '21CS101',
    isUrgent: false,
    currentStage: 'proof_pending',
    approvalHistory: [
      { stage: 'submitted', action: 'submitted', approverId: 'stu-001', approverName: 'Arjun Sharma', comment: 'OD for Google Solution Challenge.', timestamp: new Date(Date.now() - 10 * 86400000).toISOString() },
      { stage: 'advisor_review', action: 'approved', approverId: 'adv-001', approverName: 'Dr. Priya Nair', comment: 'Approved.', timestamp: new Date(Date.now() - 9 * 86400000).toISOString() },
      { stage: 'hod_review', action: 'approved', approverId: 'hod-001', approverName: 'Prof. Ramesh Kumar', comment: 'Approved. All the best!', timestamp: new Date(Date.now() - 8 * 86400000).toISOString() },
    ],
    proofStatus: 'pending',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },

  // 5. VERIFIED — proof submitted and verified
  {
    id: 'od-005',
    title: 'Inter-College Cricket Tournament',
    eventType: 'External',
    category: 'Sports',
    institution: 'Sports Authority of Tamil Nadu',
    startDate: daysFrom(-15),
    endDate: daysFrom(-13),
    periods: ['Period 1', 'Period 2', 'Period 3', 'Period 4'],
    description: 'State-level inter-college cricket tournament. Represented the college in the finals.',
    isTeam: false,
    teamMembers: [],
    createdBy: 'stu-001', creatorName: 'Arjun Sharma', creatorEmail: 'student@demo.com',
    department: 'Computer Science', className: 'CSE-A', rollNo: '21CS101',
    isUrgent: false,
    currentStage: 'verified',
    approvalHistory: [
      { stage: 'submitted', action: 'submitted', approverId: 'stu-001', approverName: 'Arjun Sharma', comment: 'OD for inter-college cricket.', timestamp: new Date(Date.now() - 20 * 86400000).toISOString() },
      { stage: 'advisor_review', action: 'approved', approverId: 'adv-001', approverName: 'Dr. Priya Nair', comment: 'Proud of the team!', timestamp: new Date(Date.now() - 19 * 86400000).toISOString() },
      { stage: 'hod_review', action: 'approved', approverId: 'hod-001', approverName: 'Prof. Ramesh Kumar', comment: 'Approved. Represent well!', timestamp: new Date(Date.now() - 18 * 86400000).toISOString() },
      { stage: 'proof_pending', action: 'proof_submitted', approverId: 'stu-001', approverName: 'Arjun Sharma', comment: 'Participation certificate uploaded.', timestamp: new Date(Date.now() - 10 * 86400000).toISOString() },
      { stage: 'approved', action: 'verified', approverId: 'adv-001', approverName: 'Dr. Priya Nair', comment: 'Certificate verified. OD marked complete.', timestamp: new Date(Date.now() - 9 * 86400000).toISOString() },
    ],
    certificateUrl: 'https://example.com/certificate.pdf',
    proofStatus: 'verified',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 9 * 86400000).toISOString(),
  },

  // 6. REJECTED
  {
    id: 'od-006',
    title: 'National Paper Presentation at SRM',
    eventType: 'External',
    category: 'Paper Presentation',
    institution: 'SRM Institute of Science and Technology',
    startDate: daysFrom(-8),
    endDate: daysFrom(-7),
    periods: ['Period 1', 'Period 2'],
    description: 'Paper presentation on blockchain-based supply chain management.',
    isTeam: false,
    teamMembers: [],
    createdBy: 'stu-001', creatorName: 'Arjun Sharma', creatorEmail: 'student@demo.com',
    department: 'Computer Science', className: 'CSE-A', rollNo: '21CS101',
    isUrgent: false,
    currentStage: 'rejected',
    approvalHistory: [
      { stage: 'submitted', action: 'submitted', approverId: 'stu-001', approverName: 'Arjun Sharma', comment: 'OD submitted.', timestamp: new Date(Date.now() - 12 * 86400000).toISOString() },
      { stage: 'advisor_review', action: 'rejected', approverId: 'adv-001', approverName: 'Dr. Priya Nair', comment: 'Attendance is already below 75%. Cannot grant additional OD at this time.', timestamp: new Date(Date.now() - 11 * 86400000).toISOString() },
    ],
    proofStatus: 'not_required',
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 11 * 86400000).toISOString(),
  },
]

// OD requests for Advisor queue (advisor_review stage)
export const MOCK_ADVISOR_QUEUE = MOCK_OD_REQUESTS.filter(r => r.currentStage === 'advisor_review')
export const MOCK_HOD_QUEUE     = MOCK_OD_REQUESTS.filter(r => r.currentStage === 'hod_review')
export const MOCK_PROOF_QUEUE   = MOCK_OD_REQUESTS.filter(r => r.currentStage === 'proof_pending')

// ─── Mock notifications for the faculty dashboard ─────────────
// Simulates that on OD approval, faculty are notified
export const MOCK_FACULTY_OD_ALERTS = [
  {
    studentName: 'Arjun Sharma',
    rollNo: '21CS101',
    odTitle: 'Workshop on Cybersecurity Fundamentals',
    date: daysFrom(10),
    periods: ['Period 2', 'Period 3', 'Period 4'],
    subject: 'Data Structures',
    className: 'CSE-A',
  },
]

// ─── Mock Event Board ─────────────────────────────────────────
export const MOCK_EVENTS: EventBoardItem[] = [
  {
    id: 'ev-001',
    title: 'Smart India Hackathon 2026',
    link: 'https://www.sih.gov.in',
    category: 'Hackathon',
    deadline: daysFrom(14),
    description: 'AICTE national-level hackathon. Solve real-world problems for government ministries. Open to all UG/PG students.',
    postedBy: 'stu-001', postedByName: 'Arjun Sharma',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    eventDate: daysFrom(16), prize: '₹10,00,000', organizer: 'AICTE / MoE', location: 'Pan India (College Round)', mode: 'Offline',
  },
  {
    id: 'ev-002',
    title: 'HackWithInfy 2026',
    link: 'https://hackwithinfy.com',
    category: 'Hackathon',
    deadline: daysFrom(21),
    description: 'Infosys hackathon for engineering students. Great prizes and PPO opportunities for winners.',
    postedBy: 'stu-001', postedByName: 'Arjun Sharma',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    eventDate: daysFrom(25), prize: '₹5,00,000 + PPO', organizer: 'Infosys', location: 'Online', mode: 'Online',
  },
  {
    id: 'ev-003',
    title: 'National Paper Presentation — IEEE SSIT',
    link: 'https://ieee.org/ssit',
    category: 'Paper Presentation',
    deadline: daysFrom(30),
    description: 'IEEE-sponsored paper presentation on sustainable technology. Open to all branches. Best paper gets published.',
    postedBy: 'stu-001', postedByName: 'Arjun Sharma',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    eventDate: daysFrom(35), prize: 'Publication + ₹25,000', organizer: 'IEEE SSIT', location: 'IIT Bombay, Mumbai', mode: 'Offline',
  },
  {
    id: 'ev-004',
    title: 'COGNITION ’26 — National Tech Symposium',
    link: 'https://cognition2026.in',
    category: 'Symposium',
    deadline: daysFrom(7),
    description: 'Multi-event national-level technical symposium hosted by PSG College of Technology. Paper presentation, coding, debugging, and more.',
    postedBy: 'stu-002', postedByName: 'Kavya Reddy',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    eventDate: daysFrom(9), prize: '₹50,000 total', organizer: 'PSG College of Technology', location: 'Coimbatore', mode: 'Offline',
  },
  {
    id: 'ev-005',
    title: 'Google Solution Challenge 2026',
    link: 'https://developers.google.com/community/gdsc-solution-challenge',
    category: 'Hackathon',
    deadline: daysFrom(45),
    description: 'Build a solution using Google technology to address one of the UN’s 17 Sustainable Development Goals.',
    postedBy: 'stu-003', postedByName: 'Rohan Mehta',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    eventDate: daysFrom(60), prize: 'Global Recognition + ₹8,00,000', organizer: 'Google GDSC', location: 'Global (Online)', mode: 'Online',
  },
  {
    id: 'ev-006',
    title: 'AI/ML Workshop — NASSCOM FutureSkills',
    link: 'https://futureskills.nasscom.in',
    category: 'Workshop',
    deadline: daysFrom(5),
    description: '2-day intensive workshop on Machine Learning and Generative AI. Certification provided upon completion.',
    postedBy: 'stu-001', postedByName: 'Arjun Sharma',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    eventDate: daysFrom(6), prize: 'Certificate + Internship Referral', organizer: 'NASSCOM', location: 'Online', mode: 'Online',
  },
  {
    id: 'ev-007',
    title: 'Inter-College Cricket Championship',
    link: 'https://sportsindia.edu.in/cricket',
    category: 'Sports',
    deadline: daysFrom(10),
    description: 'State-level inter-college cricket tournament. Team of 15. Accommodation provided for outstation teams.',
    postedBy: 'stu-004', postedByName: 'Preethi Kumar',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    eventDate: daysFrom(12), prize: '₹30,000 + Trophy', organizer: 'Anna University', location: 'Chennai', mode: 'Offline',
  },
  {
    id: 'ev-008',
    title: 'DevHack ’26 — 48hr Product Hackathon',
    link: 'https://devhack2026.in',
    category: 'Hackathon',
    deadline: daysFrom(3),
    description: 'Build a market-ready product in 48 hours. Judges from top startups and VCs. Solo or team up to 4.',
    postedBy: 'stu-002', postedByName: 'Kavya Reddy',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    eventDate: daysFrom(4), prize: '₹2,00,000 + VC Pitch', organizer: 'DevHack Collective', location: 'Bangalore', mode: 'Offline',
  },
]

// ─── Mock Team Listings ───────────────────────────────────────
export const MOCK_TEAM_LISTINGS: TeamListing[] = [
  {
    id: 'tl-001',
    eventId: 'ev-001', eventTitle: 'Smart India Hackathon 2026',
    userId: 'stu-001', userName: 'Arjun Sharma',
    skills: ['React', 'Node.js', 'Firebase', 'ML/AI', 'Python'],
    roleWanted: 'ML Engineer',
    availability: 'Full-time for hackathon weekend',
    bio: 'Final year CSE student. Built 3 hackathon projects. Looking for ML expert to complete our team of 6.',
    connectedWith: [],
    contactEmail: 'student@demo.com',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'tl-002',
    eventId: 'ev-002', eventTitle: 'HackWithInfy 2026',
    userId: 'stu-002', userName: 'Kavya Reddy',
    skills: ['Python', 'Data Science', 'UI/UX', 'Figma', 'Tableau'],
    roleWanted: 'Full Stack Developer',
    availability: 'Evenings + weekends',
    bio: '3rd year CSE. Strong in data science and design. Need a full-stack dev to bring the idea to life.',
    connectedWith: [],
    contactEmail: 'kavya.reddy21@college.edu',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'tl-003',
    eventId: 'ev-001', eventTitle: 'Smart India Hackathon 2026',
    userId: 'stu-003', userName: 'Rohan Mehta',
    skills: ['IoT', 'Arduino', 'Embedded C', 'AWS', 'Raspberry Pi'],
    roleWanted: 'Backend / Cloud Engineer',
    availability: 'Full availability during hackathon',
    bio: 'Hardware + cloud enthusiast from ECE. Looking to complement a software team with hardware expertise.',
    connectedWith: [],
    contactEmail: 'rohan.mehta21@college.edu',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'tl-004',
    eventId: 'ev-001', eventTitle: 'Smart India Hackathon 2026',
    userId: 'stu-004', userName: 'Preethi Kumar',
    skills: ['UI/UX', 'Figma', 'React', 'Tailwind CSS', 'Adobe XD'],
    roleWanted: 'UI/UX Designer',
    availability: 'Weekends fully available',
    bio: 'Design-first thinker. 2+ years freelancing in UI/UX. Built apps that won best design at TechFest 2025.',
    connectedWith: [],
    contactEmail: 'preethi.kumar21@college.edu',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'tl-005',
    eventId: 'ev-002', eventTitle: 'HackWithInfy 2026',
    userId: 'stu-005', userName: 'Siddharth Nair',
    skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Docker', 'Kubernetes'],
    roleWanted: 'Frontend Developer',
    availability: 'Available from 5pm weekdays + full weekends',
    bio: 'Backend engineer wanting to expand to frontend. Strong in APIs and microservices.',
    connectedWith: [],
    contactEmail: 'siddharth.nair21@college.edu',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'tl-006',
    eventId: 'ev-003', eventTitle: 'National Paper Presentation — IEEE SSIT',
    userId: 'stu-006', userName: 'Anjali Krishnamurthy',
    skills: ['Research', 'LaTeX', 'Machine Learning', 'NLP', 'Academic Writing'],
    roleWanted: 'Co-Author / Researcher',
    availability: 'Flexible — working remotely',
    bio: 'Published 2 papers in IEEE conferences. Looking for a co-author with strong ML implementation skills.',
    connectedWith: [],
    contactEmail: 'anjali.km21@college.edu',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'tl-007',
    eventId: 'ev-001', eventTitle: 'Smart India Hackathon 2026',
    userId: 'stu-007', userName: 'Vikram Shankar',
    skills: ['Blockchain', 'Solidity', 'Web3.js', 'Ethereum', 'Smart Contracts'],
    roleWanted: 'Backend / Blockchain Dev',
    availability: 'Full hackathon weekend',
    bio: 'Blockchain dev with 2 deployed dApps. Our idea involves NFT-based supply chain tracking. Need a React dev.',
    connectedWith: [],
    contactEmail: 'vikram.s21@college.edu',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'tl-008',
    eventId: 'ev-002', eventTitle: 'HackWithInfy 2026',
    userId: 'stu-008', userName: 'Deepika Ramachandran',
    skills: ['Flutter', 'Dart', 'Firebase', 'REST APIs', 'Android'],
    roleWanted: 'Mobile Developer',
    availability: 'Evenings daily + full weekend',
    bio: '3rd year student with 1 published Play Store app. Looking for a ML engineer to add AI features to our app idea.',
    connectedWith: [],
    contactEmail: 'deepika.rc21@college.edu',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 'tl-009',
    eventId: 'ev-003', eventTitle: 'National Paper Presentation — IEEE SSIT',
    userId: 'stu-009', userName: 'Karthik Balaji',
    skills: ['Computer Vision', 'OpenCV', 'TensorFlow', 'Python', 'MATLAB'],
    roleWanted: 'Research Partner',
    availability: 'Flexible schedule',
    bio: 'Working on edge-AI for smart agriculture. Strong in CV and embedded ML. Need a partner for the paper.',
    connectedWith: [],
    contactEmail: 'karthik.b21@college.edu',
    createdAt: new Date(Date.now() - 9 * 86400000).toISOString(),
  },
  {
    id: 'tl-010',
    eventId: 'ev-001', eventTitle: 'Smart India Hackathon 2026',
    userId: 'stu-010', userName: 'Meghna Iyer',
    skills: ['Data Analysis', 'Power BI', 'SQL', 'Excel', 'Statistics'],
    roleWanted: 'Data Engineer',
    availability: 'Full time during hackathon',
    bio: 'Business analyst transitioning to tech. Strong in data storytelling and dashboards.',
    connectedWith: [],
    contactEmail: 'meghna.iyer21@college.edu',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'tl-011',
    eventId: 'ev-002', eventTitle: 'HackWithInfy 2026',
    userId: 'stu-011', userName: 'Rahul Pillai',
    skills: ['Cybersecurity', 'Ethical Hacking', 'Kali Linux', 'Pen Testing', 'Python'],
    roleWanted: 'Security Engineer',
    availability: 'Evenings + weekends',
    bio: 'CEH certified student. Working on a hack-proof OTP system idea. Need backend dev and UI designer.',
    connectedWith: [],
    contactEmail: 'rahul.p21@college.edu',
    createdAt: new Date(Date.now() - 11 * 86400000).toISOString(),
  },
  {
    id: 'tl-012',
    eventId: 'ev-001', eventTitle: 'Smart India Hackathon 2026',
    userId: 'stu-012', userName: 'Sneha Subramaniam',
    skills: ['GenAI', 'LangChain', 'OpenAI API', 'Vector DBs', 'Python'],
    roleWanted: 'ML / AI Engineer',
    availability: 'Fully available for the event',
    bio: 'AI enthusiast building RAG pipelines. Have a strong prototype already. Need a frontend dev and PM.',
    connectedWith: [],
    contactEmail: 'sneha.sub21@college.edu',
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
]

// ─── Mock Notifications ───────────────────────────────────────
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n-001', userId: 'stu-001',
    title: 'OD Approved ✓',
    message: 'Your OD for "Workshop on Cybersecurity Fundamentals" was fully approved. Faculty have been notified.',
    type: 'od_status', read: false, relatedOdId: 'od-003',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'n-002', userId: 'stu-001',
    title: 'Proof Due Soon',
    message: 'Please upload your participation certificate for "Google Solution Challenge" within the next 4 days.',
    type: 'proof_due', read: false, relatedOdId: 'od-004',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'n-003', userId: 'fac-001',
    title: 'Students on OD — Upcoming',
    message: 'Arjun Sharma (21CS101, CSE-A) has an approved OD on ' + daysFrom(10) + ' covering your Data Structures period.',
    type: 'faculty_alert', read: false, relatedOdId: 'od-003',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
]

