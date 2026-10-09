# 🎓 CampusApprove

**A full-stack campus event approval platform with real-time tracking, multi-level workflow, and team-finder for hackathons.**

---

## 📁 Project Structure

```
campus-approve/
├── src/
│   ├── components/
│   │   ├── approver/
│   │   │   └── ApproverEventCard.tsx   # Shared review card (all approver roles)
│   │   ├── layout/
│   │   │   └── AppLayout.tsx           # Sidebar + top bar layout
│   │   └── ui/
│   │       ├── ApprovalStepper.tsx     # 5-stage visual progress bar
│   │       ├── Badges.tsx              # StageBadge + CategoryBadge
│   │       └── FullScreenLoader.tsx    # Animated loading screen
│   ├── contexts/
│   │   └── AuthContext.tsx             # Firebase Auth + Firestore profile listener
│   ├── lib/
│   │   └── firebase.ts                 # Firebase initialization
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx           # Login with demo account buttons
│   │   │   └── SignupPage.tsx          # Signup with role selector
│   │   ├── student/
│   │   │   ├── StudentDashboard.tsx    # Real-time event list + stats
│   │   │   ├── SubmitEventPage.tsx     # Event form with clash detection
│   │   │   ├── EventDetailPage.tsx     # Event detail + approval timeline
│   │   │   └── TeamFinderPage.tsx      # Browse + post team listings
│   │   ├── coordinator/
│   │   │   └── CoordinatorDashboard.tsx
│   │   ├── hod/
│   │   │   └── HodDashboard.tsx
│   │   ├── admin/
│   │   │   └── AdminDashboard.tsx      # Analytics + final queue + all events
│   │   ├── LandingPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── services/
│   │   └── firebase.service.ts         # All Firestore read/write logic
│   ├── types/
│   │   └── index.ts                    # TypeScript interfaces
│   ├── App.tsx                         # Router + route guards
│   ├── main.tsx                        # React entry point
│   └── index.css                       # Tailwind + global styles
├── firestore.rules                     # Firestore security rules
├── .env.example                        # Firebase config template
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- A Firebase project (free tier works)

### 1. Install Node.js
Download from [nodejs.org](https://nodejs.org/) — LTS version recommended.

### 2. Install Dependencies
```bash
cd campus-approve
npm install
```

### 3. Set Up Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/) → **Create Project**
2. Add a **Web App** → copy the config object
3. Enable **Authentication** → Email/Password provider
4. Enable **Firestore Database** → Start in **test mode** initially
5. Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
# then edit .env.local with your Firebase credentials
```

### 4. Apply Firestore Security Rules
In Firebase Console → Firestore → Rules tab, paste the contents of `firestore.rules`.

Or install Firebase CLI and run:
```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

### 5. Create Firestore Indexes
Add a **composite index** for the events collection:
- Collection: `events`
- Fields: `organizerUid` (ASC) + `createdAt` (DESC)
- Fields: `currentStage` (ASC) + `createdAt` (ASC)

(Firebase will prompt you in the browser console with a direct link when these are needed.)

### 6. Start Dev Server
```bash
npm run dev
```
Open `http://localhost:5173`

---

## 🎭 Demo Accounts (for Hackathon Judges)

Pre-seed these accounts in Firebase Auth + Firestore `/users` collection:

| Role       | Email              | Password   |
|------------|--------------------|------------|
| Student    | student@demo.com   | Demo@1234  |
| Coordinator| coord@demo.com     | Demo@1234  |
| HOD        | hod@demo.com       | Demo@1234  |
| Admin      | admin@demo.com     | Demo@1234  |

### Seed Script (run once in browser console or Node.js)
```js
// Paste into browser console after opening the app
// or run as a Node.js script with firebase-admin
const accounts = [
  { email: 'student@demo.com',  password: 'Demo@1234', displayName: 'Arjun Sharma',   role: 'student',     department: 'Computer Science' },
  { email: 'coord@demo.com',    password: 'Demo@1234', displayName: 'Priya Nair',      role: 'coordinator', department: 'Computer Science' },
  { email: 'hod@demo.com',      password: 'Demo@1234', displayName: 'Dr. Ramesh Kumar',role: 'hod',         department: 'Computer Science' },
  { email: 'admin@demo.com',    password: 'Demo@1234', displayName: 'Prof. Sunita Rao',role: 'admin',       department: 'Administration'   },
];
// Sign up each one via the /signup page or use Firebase Admin SDK
```

---

## 🔄 Approval Workflow

```
Student submits event
        ↓
  [submitted] ──────────────────────────────────────────────┐
        ↓                                                    │
 Coordinator Reviews  (coordinator_review)                   │
        ↓ approved                                           │
   HOD Reviews  (hod_review)                                 │ rejected
        ↓ approved                                           │ at any stage
 Admin Reviews  (admin_review)                               │
        ↓ approved                                           │
   ✅ APPROVED                            ❌ REJECTED ←──────┘
```

- Each approver sees **only their stage's requests**
- Every action requires a **mandatory comment**
- Student gets an **in-app notification** on every status change
- Real-time updates via **Firestore `onSnapshot`** listeners

---

## 🚀 Production Deployment

### Build
```bash
npm run build
# Output: dist/
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
# Set environment variables in Vercel dashboard
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**Add these env vars in your hosting dashboard:**
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

---

## 🗄️ Firestore Data Schema

### `/users/{uid}`
```typescript
{
  uid: string
  email: string
  displayName: string
  role: 'student' | 'coordinator' | 'hod' | 'admin'
  department?: string
  createdAt: Timestamp
}
```

### `/events/{id}`
```typescript
{
  title: string
  description: string
  category: 'Technical' | 'Cultural' | 'Sports' | 'Hackathon' | 'Workshop' | 'Other'
  date: string           // YYYY-MM-DD
  time: string           // HH:mm
  venue: string
  expectedBudget: number
  externalGuests: { name, organization, designation? }[]
  organizerUid: string
  organizerName: string
  organizerEmail: string
  currentStage: ApprovalStage
  approvalHistory: ApprovalEntry[]
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### `/teamListings/{id}`
```typescript
{
  eventTitle: string
  description: string
  teamSize: number
  currentMembers: number
  skillsNeeded: string[]
  contactEmail: string
  ownerUid: string
  ownerName: string
  createdAt: Timestamp
}
```

### `/notifications/{id}`
```typescript
{
  userId: string
  title: string
  message: string
  read: boolean
  eventId?: string
  createdAt: Timestamp
}
```

---

## 🛠️ Tech Stack

| Layer       | Technology                              |
|-------------|------------------------------------------|
| Frontend    | React 18 + TypeScript + Vite            |
| Styling     | Tailwind CSS 3 + custom design tokens   |
| Animation   | Framer Motion                           |
| Routing     | React Router v6                         |
| State       | React Context API + Firestore listeners |
| Backend     | Firebase Firestore + Firebase Auth      |
| Toasts      | react-hot-toast                         |
| Icons       | lucide-react                            |
| Deployment  | Vercel / Netlify                        |

---

## 🎨 Design System

- **Colors**: Deep indigo brand palette on `#0f0f23` dark surface
- **Glass morphism**: `glass-card` + `glass-card-hover` utilities
- **Animations**: Stagger reveals, spring transitions, progress bars
- **Typography**: Inter font from Google Fonts
- **Responsive**: Mobile drawer sidebar + desktop fixed sidebar
