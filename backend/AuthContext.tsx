// ============================================================
//  CAMPUS-SYNC — AUTH CONTEXT (5 roles, mock + Firebase dual mode)
// ============================================================
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User as FirebaseUser } from 'firebase/auth'
import { UserProfile } from '@/types'
import { DEMO_PROFILES } from '@/lib/mockData'

const IS_MOCK = !import.meta.env.VITE_FIREBASE_PROJECT_ID ||
  import.meta.env.VITE_FIREBASE_PROJECT_ID === 'demo-project' ||
  import.meta.env.VITE_FIREBASE_PROJECT_ID === 'YOUR_PROJECT_ID'

const MOCK_SESSION_KEY = 'CAMPUS-SYNC_mock_user'

interface AuthContextValue {
  firebaseUser: FirebaseUser | null
  userProfile:  UserProfile | null
  loading:      boolean
  isMockMode:   boolean
  mockSignIn:   (email: string, password: string) => Promise<void>
  mockSignOut:  () => void
}

const AuthContext = createContext<AuthContextValue>({
  firebaseUser: null, userProfile: null, loading: true,
  isMockMode: false, mockSignIn: async () => {}, mockSignOut: () => {},
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [userProfile,  setUserProfile]  = useState<UserProfile | null>(null)
  const [loading,      setLoading]      = useState(true)

  // ── Mock mode ──────────────────────────────────────────────
  useEffect(() => {
    if (!IS_MOCK) return
    const saved = localStorage.getItem(MOCK_SESSION_KEY)
    if (saved) {
      try { setUserProfile(JSON.parse(saved)) } catch {}
    }
    setLoading(false)
  }, [])

  const mockSignIn = async (email: string, password: string) => {
    const account = DEMO_PROFILES[email.toLowerCase()]
    if (!account) throw new Error('No demo account found. Use one of the role buttons below.')
    if (account.password !== password) throw new Error('Incorrect password. Use: demo1234')
    const profile: UserProfile = {
      uid: account.uid, name: account.name, email: account.email, role: account.role,
      department: account.department, className: account.className, rollNo: account.rollNo,
      advisorId: account.advisorId, createdAt: new Date().toISOString(),
    }
    setUserProfile(profile)
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(profile))
  }

  const mockSignOut = () => {
    setUserProfile(null)
    localStorage.removeItem(MOCK_SESSION_KEY)
  }

  // ── Real Firebase mode ─────────────────────────────────────
  useEffect(() => {
    if (IS_MOCK) return

    let unsubProfile: (() => void) | undefined
    let unsubAuth:    (() => void) | undefined

    // Safety timeout — never stay stuck loading > 8 seconds
    const timeout = setTimeout(() => setLoading(false), 8000)

    const init = async () => {
      try {
        const { onAuthStateChanged } = await import('firebase/auth')
        const { auth, db }           = await import('@/lib/firebase')

        unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
          clearTimeout(timeout)
          setFirebaseUser(fbUser)

          if (!fbUser) {
            setUserProfile(null)
            setLoading(false)
            return
          }

          try {
            const { doc, getDoc, onSnapshot } = await import('firebase/firestore')

            // Try to fetch the user profile doc
            const snap = await getDoc(doc(db, 'users', fbUser.uid))

            if (snap.exists()) {
              setUserProfile({ uid: snap.id, ...snap.data() } as UserProfile)
              setLoading(false)

              // Live updates
              unsubProfile = onSnapshot(
                doc(db, 'users', fbUser.uid),
                (s) => {
                  if (s.exists()) setUserProfile({ uid: s.id, ...s.data() } as UserProfile)
                },
                () => {} // silently ignore snapshot errors
              )
            } else {
              // User exists in Auth but not Firestore yet — create a minimal profile
              const fallback: UserProfile = {
                uid:        fbUser.uid,
                name:       fbUser.displayName ?? fbUser.email?.split('@')[0] ?? 'User',
                email:      fbUser.email ?? '',
                role:       'student',
                department: '',
                className:  '',
                rollNo:     '',
                createdAt:  new Date().toISOString(),
              }
              setUserProfile(fallback)
              setLoading(false)

              // Try to save the fallback profile to Firestore
              try {
                const { setDoc, serverTimestamp } = await import('firebase/firestore')
                await setDoc(doc(db, 'users', fbUser.uid), {
                  ...fallback, createdAt: serverTimestamp(),
                })
              } catch {}
            }
          } catch (err) {
            console.error('Firestore profile fetch error:', err)
            setLoading(false)
          }
        }, (err) => {
          console.error('Firebase Auth error:', err)
          setLoading(false)
        })
      } catch (err) {
        console.error('Firebase init error:', err)
        setLoading(false)
      }
    }

    init()

    return () => {
      clearTimeout(timeout)
      unsubAuth?.()
      unsubProfile?.()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ firebaseUser, userProfile, loading, isMockMode: IS_MOCK, mockSignIn, mockSignOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
