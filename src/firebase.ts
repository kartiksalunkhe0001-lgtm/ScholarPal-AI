import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { StudentProfile, Scholarship, TestAttempt, StudentComplaint, StudentNotification, SavedScholarshipItem } from './types/index.ts';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore (supporting custom databaseId if configured)
export const db =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

// Initialize Auth & Google Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Test connection on boot per Firebase skill guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection test notice:', error.message);
    }
  }
}
testConnection();

/**
 * Real Google Sign-in via popup with redirect fallback
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err: any) {
    console.warn('Google popup error, attempting redirect fallback:', err?.message || err);
    if (
      err?.code === 'auth/popup-blocked' ||
      err?.code === 'auth/popup-closed-by-user' ||
      err?.code === 'auth/cancelled-popup-request'
    ) {
      await signInWithRedirect(auth, googleProvider);
    }
    throw err;
  }
}

/**
 * Handle redirect result after sign-in page redirect returns
 */
export async function checkRedirectAuth(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    return result ? result.user : null;
  } catch (err) {
    console.error('Redirect auth error:', err);
    return null;
  }
}

/**
 * Sign out helper
 */
export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

// -------------------------------------------------------------
// Firestore Helpers for User Data, Saved Scholarships, Notifications
// -------------------------------------------------------------

export async function syncUserProfileToFirestore(
  userId: string,
  data: {
    name?: string | null;
    email?: string | null;
    photoURL?: string | null;
    profile?: StudentProfile | null;
    checklistTicks?: Record<string, string[]>;
  }
) {
  if (!userId) return;
  const userDocRef = doc(db, 'users', userId);
  await setDoc(
    userDocRef,
    {
      uid: userId,
      name: data.name || 'ScholarPal Student',
      email: data.email || '',
      photoURL: data.photoURL || '',
      profile: data.profile || null,
      checklistTicks: data.checklistTicks || {},
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

export async function getUserDataFromFirestore(userId: string) {
  if (!userId) return null;
  const userDocRef = doc(db, 'users', userId);
  const snap = await getDoc(userDocRef);
  return snap.exists() ? snap.data() : null;
}

export async function saveScholarshipToFirestore(
  userId: string,
  scholarship: Scholarship,
  reminders?: { open?: boolean; sevenDays?: boolean; oneDay?: boolean; threeDaysExam?: boolean }
) {
  if (!userId || !scholarship?.id) return;
  const schRef = doc(db, 'users', userId, 'savedScholarships', scholarship.id);
  const data: SavedScholarshipItem = {
    id: scholarship.id,
    userId,
    scholarship,
    savedAt: new Date().toISOString(),
    applied: false,
    reminders: {
      open: reminders?.open ?? true,
      sevenDays: reminders?.sevenDays ?? true,
      oneDay: reminders?.oneDay ?? true,
      threeDaysExam: reminders?.threeDaysExam ?? false,
    },
  };
  await setDoc(schRef, data, { merge: true });
}

export async function removeSavedScholarshipFromFirestore(userId: string, scholarshipId: string) {
  if (!userId || !scholarshipId) return;
  const schRef = doc(db, 'users', userId, 'savedScholarships', scholarshipId);
  await deleteDoc(schRef);
}

export async function markScholarshipAppliedInFirestore(userId: string, scholarshipId: string, applied: boolean) {
  if (!userId || !scholarshipId) return;
  const schRef = doc(db, 'users', userId, 'savedScholarships', scholarshipId);
  await updateDoc(schRef, {
    applied,
    appliedAt: applied ? new Date().toISOString() : null,
  });
}

export async function getSavedScholarshipsFromFirestore(userId: string): Promise<SavedScholarshipItem[]> {
  if (!userId) return [];
  const colRef = collection(db, 'users', userId, 'savedScholarships');
  const snap = await getDocs(colRef);
  const list: SavedScholarshipItem[] = [];
  snap.forEach((d) => {
    list.push(d.data() as SavedScholarshipItem);
  });
  return list;
}

export async function saveNotificationToFirestore(userId: string, notification: StudentNotification) {
  if (!userId || !notification.id) return;
  const notifRef = doc(db, 'users', userId, 'notifications', notification.id);
  await setDoc(notifRef, notification, { merge: true });
}

export async function getNotificationsFromFirestore(userId: string): Promise<StudentNotification[]> {
  if (!userId) return [];
  const colRef = collection(db, 'users', userId, 'notifications');
  const snap = await getDocs(colRef);
  const list: StudentNotification[] = [];
  snap.forEach((d) => {
    list.push(d.data() as StudentNotification);
  });
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function markNotificationReadInFirestore(userId: string, notificationId: string) {
  if (!userId || !notificationId) return;
  const notifRef = doc(db, 'users', userId, 'notifications', notificationId);
  await updateDoc(notifRef, { read: true });
}

export async function markAllNotificationsReadInFirestore(userId: string) {
  if (!userId) return;
  const colRef = collection(db, 'users', userId, 'notifications');
  const snap = await getDocs(colRef);
  const promises = snap.docs.map((d) => updateDoc(d.ref, { read: true }));
  await Promise.all(promises);
}

export async function saveTestAttemptToFirestore(userId: string, attempt: TestAttempt) {
  if (!userId || !attempt.id) return;
  const ref = doc(db, 'users', userId, 'testAttempts', attempt.id);
  await setDoc(ref, attempt);
}

export async function getTestAttemptsFromFirestore(userId: string): Promise<TestAttempt[]> {
  if (!userId) return [];
  const colRef = collection(db, 'users', userId, 'testAttempts');
  const snap = await getDocs(colRef);
  const list: TestAttempt[] = [];
  snap.forEach((d) => list.push(d.data() as TestAttempt));
  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function saveComplaintToFirestore(userId: string, complaint: StudentComplaint) {
  if (!userId || !complaint.id) return;
  const ref = doc(db, 'users', userId, 'complaints', complaint.id);
  await setDoc(ref, complaint);
}

export async function getComplaintsFromFirestore(userId: string): Promise<StudentComplaint[]> {
  if (!userId) return [];
  const colRef = collection(db, 'users', userId, 'complaints');
  const snap = await getDocs(colRef);
  const list: StudentComplaint[] = [];
  snap.forEach((d) => list.push(d.data() as StudentComplaint));
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Delete all user data from Firestore and local storage ("Delete my data")
 */
export async function deleteAllUserDataFromFirestore(userId: string): Promise<void> {
  if (!userId) return;

  // 1. Delete all saved scholarships
  const savedRef = collection(db, 'users', userId, 'savedScholarships');
  const savedSnap = await getDocs(savedRef);
  for (const d of savedSnap.docs) {
    await deleteDoc(d.ref);
  }

  // 2. Delete all notifications
  const notifRef = collection(db, 'users', userId, 'notifications');
  const notifSnap = await getDocs(notifRef);
  for (const d of notifSnap.docs) {
    await deleteDoc(d.ref);
  }

  // 3. Delete all test attempts
  const testsRef = collection(db, 'users', userId, 'testAttempts');
  const testsSnap = await getDocs(testsRef);
  for (const d of testsSnap.docs) {
    await deleteDoc(d.ref);
  }

  // 4. Delete all complaints
  const compRef = collection(db, 'users', userId, 'complaints');
  const compSnap = await getDocs(compRef);
  for (const d of compSnap.docs) {
    await deleteDoc(d.ref);
  }

  // 5. Delete root user document
  const userDocRef = doc(db, 'users', userId);
  await deleteDoc(userDocRef);
}
