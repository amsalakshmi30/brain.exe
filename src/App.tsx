// ============================================================
//  CAMPUS-SYNC — APP ROUTER with 5-role routing
// ============================================================
import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import AppLayout from '@/components/layout/AppLayout'
import FullScreenLoader from '@/components/ui/FullScreenLoader'

const LandingPage       = lazy(() => import('@/pages/LandingPage'))
const LoginPage         = lazy(() => import('@/pages/auth/LoginPage'))
const SignupPage        = lazy(() => import('@/pages/auth/SignupPage'))
const StudentDashboard  = lazy(() => import('@/pages/student/StudentDashboard'))
const SubmitODPage      = lazy(() => import('@/pages/student/SubmitODPage'))
const ODDetailPage      = lazy(() => import('@/pages/student/ODDetailPage'))
const TeamFinderPage    = lazy(() => import('@/pages/student/TeamFinderPage'))
const AdvisorDashboard  = lazy(() => import('@/pages/advisor/AdvisorDashboard'))
const HodDashboard      = lazy(() => import('@/pages/hod/HodDashboard'))
const FacultyDashboard  = lazy(() => import('@/pages/faculty/FacultyDashboard'))
const AdminDashboard    = lazy(() => import('@/pages/admin/AdminDashboard'))
const EventsPage        = lazy(() => import('@/pages/events/EventsPage'))
const NotFoundPage      = lazy(() => import('@/pages/NotFoundPage'))

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { firebaseUser, userProfile, loading, isMockMode } = useAuth()
  if (loading) return <FullScreenLoader />
  const isLoggedIn = isMockMode ? !!userProfile : !!firebaseUser
  if (!isLoggedIn) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RequireRole({ children, roles }: { children: React.ReactNode; roles: string[] }) {
  const { userProfile, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (!userProfile) return <Navigate to="/login" replace />
  if (!roles.includes(userProfile.role)) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function DashboardRedirect() {
  const { userProfile, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (!userProfile) return <Navigate to="/login" replace />
  const routes: Record<string, string> = {
    student: '/student', advisor: '/advisor',
    hod: '/hod', faculty: '/faculty', admin: '/admin',
  }
  return <Navigate to={routes[userProfile.role] || '/student'} replace />
}

const R = (role: string[], page: React.ReactNode) => (
  <RequireAuth><RequireRole roles={role}><AppLayout>{page}</AppLayout></RequireRole></RequireAuth>
)
const RA = (page: React.ReactNode) => (
  <RequireAuth><AppLayout>{page}</AppLayout></RequireAuth>
)

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<FullScreenLoader />}>
        <Routes>
          <Route path="/"          element={<Navigate to="/login" replace />} />
          <Route path="/landing"   element={<LandingPage />} />
          <Route path="/login"     element={<LoginPage />} />
          <Route path="/signup"    element={<SignupPage />} />
          <Route path="/dashboard" element={<RequireAuth><DashboardRedirect /></RequireAuth>} />

          {/* Student */}
          <Route path="/student"          element={R(['student'], <StudentDashboard />)} />
          <Route path="/student/submit"   element={R(['student'], <SubmitODPage />)} />
          <Route path="/student/od/:id"   element={RA(<ODDetailPage />)} />
          <Route path="/team-finder"      element={RA(<TeamFinderPage />)} />
          <Route path="/events"           element={RA(<EventsPage />)} />

          {/* Advisor */}
          <Route path="/advisor" element={R(['advisor'], <AdvisorDashboard />)} />

          {/* HOD */}
          <Route path="/hod" element={R(['hod'], <HodDashboard />)} />

          {/* Faculty */}
          <Route path="/faculty" element={R(['faculty'], <FacultyDashboard />)} />

          {/* Admin */}
          <Route path="/admin" element={R(['admin'], <AdminDashboard />)} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}

