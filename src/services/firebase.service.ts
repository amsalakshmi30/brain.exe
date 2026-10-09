// ============================================================
//  CAMPUS-SYNC — COMPLETE FIREBASE BACKEND SERVICE
//  Single source of truth for all Firebase operations.
//  Collections: users, odRequests, teamListings, events,
//               notifications, timetables
// ============================================================

import {
  UserProfile, ODRequest, ODStage,
  TeamListing, EventBoardItem, Notification,
} from '@/types'

// ── Helpers ───────────────────────────────────────────────────
const getDb      = async () => (await import('@/lib/firebase')).db
const getAuth    = async () => (await import('@/lib/firebase')).auth
const getStorage = async () => (await import('@/lib/firebase')).storage

// ─────────────────────────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────────────────────────

/** Sign in with email + password */
export async function signIn(email: string, password: string) {
  const { signInWithEmailAndPassword } = await import('firebase/auth')
  return signInWithEmailAndPassword(await getAuth(), email, password)
}

/** Sign out current user */
export async function signOut() {
  const { signOut: fbSignOut } = await import('firebase/auth')
  return fbSignOut(await getAuth())
}

/** Create a new user account and write their profile to Firestore */
export async function signUp(
  email: string,
  password: string,
  profile: Omit<UserProfile, 'uid'>,
) {
  const { createUserWithEmailAndPassword }    = await import('firebase/auth')
  const { setDoc, doc, serverTimestamp }      = await import('firebase/firestore')
  const db   = await getDb()
  const auth = await getAuth()
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await setDoc(doc(db, 'users', cred.user.uid), {
    ...profile,
    uid:       cred.user.uid,
    createdAt: serverTimestamp(),
  })
  return cred
}

/** Fetch a single user profile document */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const { doc, getDoc } = await import('firebase/firestore')
  const db   = await getDb()
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? ({ uid: snap.id, ...snap.data() } as UserProfile) : null
}

/** Update fields on a user's profile */
export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore')
  const db = await getDb()
  await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() })
}

// ─────────────────────────────────────────────────────────────
//  OD REQUESTS
// ─────────────────────────────────────────────────────────────

/** Real-time stream of a student's own OD requests */
export function subscribeToUserODs(uid: string, cb: (ods: ODRequest[]) => void) {
  return (async () => {
    const { collection, query, where, onSnapshot } = await import('firebase/firestore')
    const db = await getDb()
    const q  = query(
      collection(db, 'odRequests'),
      where('createdBy', '==', uid),
      // No orderBy — avoids composite index; sort client-side
    )
    return onSnapshot(q,
      snap => cb(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() } as ODRequest))
          .sort((a, b) => {
            const ta = (a.createdAt as any)?.seconds ?? 0
            const tb = (b.createdAt as any)?.seconds ?? 0
            return tb - ta
          })
      ),
      err => console.error('subscribeToUserODs:', err))
  })().catch(err => { console.error(err); return () => {} })
}

/** Real-time stream of all ODs at a specific workflow stage */
export function subscribeToStageODs(stage: ODStage, cb: (ods: ODRequest[]) => void) {
  return (async () => {
    const { collection, query, where, onSnapshot } = await import('firebase/firestore')
    const db = await getDb()
    const q  = query(
      collection(db, 'odRequests'),
      where('currentStage', '==', stage),
      // No orderBy — avoids composite index; sort client-side
    )
    return onSnapshot(q,
      snap => cb(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() } as ODRequest))
          .sort((a, b) => (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0))
      ),
      err => console.error('subscribeToStageODs:', err))
  })().catch(err => { console.error(err); return () => {} })
}

/** Real-time stream of ALL OD requests (for admin / advisor overview) */
export function subscribeToAllODs(cb: (ods: ODRequest[]) => void) {
  return (async () => {
    const { collection, query, orderBy, onSnapshot } = await import('firebase/firestore')
    const db = await getDb()
    const q  = query(collection(db, 'odRequests'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as ODRequest))),
      err => console.error('subscribeToAllODs:', err))
  })().catch(err => { console.error(err); return () => {} })
}

/** Submit a new OD request */
export async function submitODRequest(odData: Omit<ODRequest, 'id'>) {
  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
  const db = await getDb()
  return addDoc(collection(db, 'odRequests'), {
    ...odData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

/**
 * Advance an OD through the approval chain.
 * Stages: submitted → advisor_review → hod_review → approved / rejected
 * On HOD final approval, automatically notifies all affected faculty.
 */
export async function advanceODApproval(
  odId:         string,
  action:       'approved' | 'rejected' | 'changes_requested',
  approverId:   string,
  approverName: string,
  comment:      string,
  currentStage: ODStage,
) {
  const { doc, updateDoc, arrayUnion, serverTimestamp } = await import('firebase/firestore')
  const db = await getDb()

  const NEXT_STAGE: Partial<Record<ODStage, ODStage>> = {
    submitted:      'advisor_review',
    advisor_review: 'hod_review',
    hod_review:     'approved',
  }

  const newStage: ODStage =
    action === 'approved'
      ? (NEXT_STAGE[currentStage] ?? 'approved')
      : action === 'changes_requested'
        ? currentStage  // stays in same stage, remarks added
        : 'rejected'

  const historyEntry = {
    stage: currentStage, action, approverId, approverName, comment,
    timestamp: new Date().toISOString(),
  }

  await updateDoc(doc(db, 'odRequests', odId), {
    currentStage:    newStage,
    approvalHistory: arrayUnion(historyEntry),
    updatedAt:       serverTimestamp(),
    // If final HOD approval, move to proof_pending
    ...(currentStage === 'hod_review' && action === 'approved'
      ? { currentStage: 'proof_pending', proofStatus: 'pending' }
      : {}),
  })

  // Notify affected faculty after HOD approval
  if (currentStage === 'hod_review' && action === 'approved') {
    await _triggerFacultyNotifications(odId)
  }
}

/** Upload participation proof certificate to Storage + update Firestore */
export async function submitODProof(odId: string, file: File): Promise<string> {
  const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage')
  const { doc, updateDoc, arrayUnion, serverTimestamp } = await import('firebase/firestore')
  const storage = await getStorage()
  const db      = await getDb()

  const storageRef = ref(storage, `od-proofs/${odId}/${Date.now()}_${file.name}`)
  const snap       = await uploadBytes(storageRef, file)
  const url        = await getDownloadURL(snap.ref)

  await updateDoc(doc(db, 'odRequests', odId), {
    certificateUrl:  url,
    currentStage:    'proof_pending',
    proofStatus:     'submitted',
    approvalHistory: arrayUnion({
      stage: 'proof_pending', action: 'proof_submitted',
      approverId: 'student', approverName: 'Student',
      comment: 'Participation certificate uploaded.',
      timestamp: new Date().toISOString(),
    }),
    updatedAt: serverTimestamp(),
  })
  return url
}

/** Advisor marks a submitted proof as verified */
export async function verifyODProof(odId: string, advisorId: string, advisorName: string) {
  const { doc, updateDoc, arrayUnion, serverTimestamp } = await import('firebase/firestore')
  const db = await getDb()
  await updateDoc(doc(db, 'odRequests', odId), {
    currentStage:    'verified',
    proofStatus:     'verified',
    approvalHistory: arrayUnion({
      stage: 'proof_pending', action: 'verified',
      approverId: advisorId, approverName: advisorName,
      comment: 'Participation certificate verified.',
      timestamp: new Date().toISOString(),
    }),
    updatedAt: serverTimestamp(),
  })
}

// ─────────────────────────────────────────────────────────────
//  FACULTY NOTIFICATIONS (internal)
// ─────────────────────────────────────────────────────────────

/** Cross-reference timetable and notify affected faculty */
async function _triggerFacultyNotifications(odId: string) {
  const {
    doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp,
  } = await import('firebase/firestore')
  const db = await getDb()

  const odSnap = await getDoc(doc(db, 'odRequests', odId))
  if (!odSnap.exists()) return
  const od = { id: odSnap.id, ...odSnap.data() } as ODRequest

  const ttQuery = query(collection(db, 'timetables'), where('className', '==', od.className))
  const ttSnap  = await getDocs(ttQuery)

  const affected = new Map<string, { periods: string[]; subject: string }>()

  ttSnap.docs.forEach(d => {
    const slot = d.data()
    if (od.periods.includes(slot.period)) {
      if (!affected.has(slot.facultyId)) {
        affected.set(slot.facultyId, { periods: [], subject: slot.subject })
      }
      affected.get(slot.facultyId)!.periods.push(slot.period)
    }
  })

  const batch = Array.from(affected.entries()).map(([facultyId, info]) =>
    addDoc(collection(db, 'notifications'), {
      userId:      facultyId,
      title:       'Student on OD',
      message:     `${od.creatorName} (${od.rollNo}, ${od.className}) has an approved OD on ${od.startDate}–${od.endDate} covering ${info.subject} periods: ${info.periods.join(', ')}.`,
      type:        'faculty_alert',
      read:        false,
      relatedOdId: odId,
      createdAt:   serverTimestamp(),
    }),
  )
  await Promise.all(batch)
}

// ─────────────────────────────────────────────────────────────
//  TEAM LISTINGS
// ─────────────────────────────────────────────────────────────

/** Real-time stream of all team listings */
export function subscribeToTeamListings(cb: (listings: TeamListing[]) => void) {
  return (async () => {
    const { collection, query, orderBy, onSnapshot } = await import('firebase/firestore')
    const db = await getDb()
    const q  = query(collection(db, 'teamListings'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as TeamListing))),
      err => console.error('subscribeToTeamListings:', err))
  })().catch(err => { console.error(err); return () => {} })
}

/** Post a new team listing */
export async function createTeamListing(listing: Omit<TeamListing, 'id' | 'createdAt'>) {
  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
  const db = await getDb()
  return addDoc(collection(db, 'teamListings'), { ...listing, createdAt: serverTimestamp() })
}

/** Delete a team listing (only the owner should call this) */
export async function deleteTeamListing(listingId: string) {
  const { doc, deleteDoc } = await import('firebase/firestore')
  const db = await getDb()
  return deleteDoc(doc(db, 'teamListings', listingId))
}

// ─────────────────────────────────────────────────────────────
//  EVENTS BOARD
// ─────────────────────────────────────────────────────────────

/** Real-time stream of all posted events */
export function subscribeToEvents(cb: (events: EventBoardItem[]) => void) {
  return (async () => {
    const { collection, query, orderBy, onSnapshot } = await import('firebase/firestore')
    const db = await getDb()
    const q  = query(collection(db, 'events'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as EventBoardItem))),
      err => console.error('subscribeToEvents:', err))
  })().catch(err => { console.error(err); return () => {} })
}

/** Admin / Student posts a new event to the board */
export async function createEvent(event: Omit<EventBoardItem, 'id' | 'createdAt'>) {
  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
  const db = await getDb()
  return addDoc(collection(db, 'events'), { ...event, createdAt: serverTimestamp() })
}

/** Delete an event (admin only) */
export async function deleteEvent(eventId: string) {
  const { doc, deleteDoc } = await import('firebase/firestore')
  const db = await getDb()
  return deleteDoc(doc(db, 'events', eventId))
}

// ─────────────────────────────────────────────────────────────
//  NOTIFICATIONS
// ─────────────────────────────────────────────────────────────

/** Real-time stream of a user's notifications (newest first) */
export function subscribeToNotifications(userId: string, cb: (ns: Notification[]) => void) {
  return (async () => {
    const { collection, query, where, orderBy, onSnapshot } = await import('firebase/firestore')
    const db = await getDb()
    const q  = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    )
    return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification))),
      err => console.error('subscribeToNotifications:', err))
  })().catch(err => { console.error(err); return () => {} })
}

/** Mark a single notification as read */
export async function markNotificationRead(notifId: string) {
  const { doc, updateDoc } = await import('firebase/firestore')
  const db = await getDb()
  return updateDoc(doc(db, 'notifications', notifId), { read: true })
}

/** Mark ALL of a user's notifications as read */
export async function markAllNotificationsRead(userId: string) {
  const { collection, query, where, getDocs, writeBatch, doc } = await import('firebase/firestore')
  const db    = await getDb()
  const q     = query(collection(db, 'notifications'), where('userId', '==', userId), where('read', '==', false))
  const snap  = await getDocs(q)
  const batch = writeBatch(db)
  snap.docs.forEach(d => batch.update(doc(db, 'notifications', d.id), { read: true }))
  return batch.commit()
}

/** Send a deadline reminder notification to advisor/HOD */
export async function sendDeadlineReminder(
  odId:       string,
  odTitle:    string,
  studentName:string,
  targetRole: 'advisor' | 'hod',
  daysLeft:   number,
) {
  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
  const db = await getDb()
  return addDoc(collection(db, 'notifications'), {
    targetRole,
    relatedOdId: odId,
    title:       'Approval Reminder',
    message:     `${studentName}'s OD request "${odTitle}" needs your attention. Event starts in ${daysLeft} day(s).`,
    type:        'reminder',
    read:        false,
    createdAt:   serverTimestamp(),
  })
}
