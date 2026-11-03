import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { ProfileForm } from './components/ProfileForm.tsx';
import { ScholarshipResults } from './components/ScholarshipResults.tsx';
import { ScholarshipDetailsView } from './components/ScholarshipDetailsView.tsx';
import { MockTestView } from './components/MockTestView.tsx';
import { TestResultsView } from './components/TestResultsView.tsx';
import { ChatbotWidget } from './components/ChatbotWidget.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { MyTestsView } from './components/MyTestsView.tsx';
import { ComplaintsView } from './components/ComplaintsView.tsx';
import { AiDiagnosticsView } from './components/AiDiagnosticsView.tsx';
import { SavedScholarshipsView } from './components/SavedScholarshipsView.tsx';
import { RemindMeModal } from './components/RemindMeModal.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { fetchWithRetry, safeJsonParse } from './utils/api.ts';
import {
  StudentProfile,
  Scholarship,
  ScholarshipDetailsData,
  MockTest,
  TestAttempt,
  UserAccount,
  SupportTicket,
  SavedScholarshipItem,
  StudentNotification,
  StudentComplaint,
} from './types/index.ts';
import { storage } from './utils/storage.ts';
import { calculateTestResults } from './utils/rules.ts';
import {
  auth,
  checkRedirectAuth,
  signOutUser,
  syncUserProfileToFirestore,
  getUserDataFromFirestore,
  saveScholarshipToFirestore,
  removeSavedScholarshipFromFirestore,
  markScholarshipAppliedInFirestore,
  getSavedScholarshipsFromFirestore,
  saveNotificationToFirestore,
  getNotificationsFromFirestore,
  markNotificationReadInFirestore,
  markAllNotificationsReadInFirestore,
  saveTestAttemptToFirestore,
  getTestAttemptsFromFirestore,
  deleteAllUserDataFromFirestore,
  saveComplaintToFirestore,
  getComplaintsFromFirestore,
} from './firebase.ts';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  // Navigation & View State
  const [activeView, setActiveView] = useState<
    'home' | 'results' | 'details' | 'test' | 'test-results' | 'my-tests' | 'complaints' | 'diagnostics' | 'saved'
  >('home');
  const [myTestsTab, setMyTestsTab] = useState<'tests' | 'bookmarks' | 'notes'>('tests');

  // User and Auth State
  const [user, setUser] = useState<UserAccount | null>(() => storage.getUser());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingScholarship, setPendingScholarship] = useState<Scholarship | null>(null);

  // Profile and Results State
  const [profile, setProfile] = useState<StudentProfile | null>(() => storage.getProfile());
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loadingScholarships, setLoadingScholarships] = useState(false);
  const [scholarshipError, setScholarshipError] = useState<string | null>(null);
  const [liveSearchFailed, setLiveSearchFailed] = useState(false);

  // Saved scholarships & Notifications
  const [savedScholarships, setSavedScholarships] = useState<SavedScholarshipItem[]>([]);
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [remindModalScholarship, setRemindModalScholarship] = useState<Scholarship | null>(null);
  const [checklistTicks, setChecklistTicks] = useState<Record<string, string[]>>({});

  // Mock test error modal state (Requirement 8)
  const [testError, setTestError] = useState<string | null>(null);
  const [showTestErrorDetails, setShowTestErrorDetails] = useState(false);

  // Current Active Scholarship Details
  const [activeScholarship, setActiveScholarship] = useState<ScholarshipDetailsData | null>(null);
  const [isRefreshingDetails, setIsRefreshingDetails] = useState(false);

  // Mock Test State
  const [currentMockTest, setCurrentMockTest] = useState<MockTest | null>(null);
  const [loadingTest, setLoadingTest] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState<TestAttempt | null>(null);

  // Test attempts & Grievance tickets
  const [savedAttempts, setSavedAttempts] = useState<TestAttempt[]>(() => storage.getAttempts());
  const [tickets, setTickets] = useState<SupportTicket[]>(() => storage.getTickets());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // 1. Firebase Auth listener and redirect result
  useEffect(() => {
    checkRedirectAuth().then((redirectUser) => {
      if (redirectUser) {
        const userAccount: UserAccount = {
          id: redirectUser.uid,
          name: redirectUser.displayName || 'ScholarPal Student',
          email: redirectUser.email || '',
          photoURL: redirectUser.photoURL || undefined,
          createdAt: redirectUser.metadata.creationTime || new Date().toISOString(),
        };
        setUser(userAccount);
        storage.setUser(userAccount);
      }
    });

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userAccount: UserAccount = {
          id: fbUser.uid,
          name: fbUser.displayName || 'ScholarPal Student',
          email: fbUser.email || '',
          photoURL: fbUser.photoURL || undefined,
          createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
        };
        setUser(userAccount);
        storage.setUser(userAccount);

        // Fetch user data from Firestore
        try {
          const remoteData = await getUserDataFromFirestore(fbUser.uid);
          if (remoteData?.profile) {
            setProfile(remoteData.profile);
            storage.saveProfile(remoteData.profile);
          } else {
            const localProf = storage.getProfile();
            if (localProf) {
              await syncUserProfileToFirestore(fbUser.uid, {
                name: userAccount.name,
                email: userAccount.email,
                photoURL: userAccount.photoURL,
                profile: localProf,
              });
            }
          }

          if (remoteData?.checklistTicks) {
            setChecklistTicks(remoteData.checklistTicks);
          }

          // Fetch saved scholarships
          const remoteSaved = await getSavedScholarshipsFromFirestore(fbUser.uid);
          setSavedScholarships(remoteSaved);

          // Fetch notifications
          const remoteNotifs = await getNotificationsFromFirestore(fbUser.uid);
          setNotifications(remoteNotifs);

          // Fetch test attempts
          const remoteAttempts = await getTestAttemptsFromFirestore(fbUser.uid);
          if (remoteAttempts.length > 0) {
            setSavedAttempts(remoteAttempts);
          }

          // Fetch complaints
          const remoteComplaints = await getComplaintsFromFirestore(fbUser.uid);
          if (remoteComplaints.length > 0) {
            setTickets(remoteComplaints);
          }

          // Background date re-check on open (max 5 per visit)
          const itemsToCheck = remoteSaved.slice(0, 5);
          for (const item of itemsToCheck) {
            const sch = item.scholarship;
            const daysLeft = sch.daysLeft;
            if (daysLeft !== undefined && !item.applied) {
              if (daysLeft <= 7 && daysLeft > 1 && item.reminders?.sevenDays) {
                const notifId = `notif_7d_${sch.id}`;
                if (!remoteNotifs.some((n) => n.id === notifId)) {
                  const newNotif: StudentNotification = {
                    id: notifId,
                    userId: fbUser.uid,
                    title: `7 Days Left: ${sch.name}`,
                    message: `Application deadline is on ${sch.lastDateToApply}. Complete your submission on the official portal!`,
                    type: 'deadline_7d',
                    scholarshipId: sch.id,
                    read: false,
                    createdAt: new Date().toISOString(),
                  };
                  await saveNotificationToFirestore(fbUser.uid, newNotif);
                  setNotifications((prev) => [newNotif, ...prev]);
                }
              }
              if (daysLeft <= 1 && daysLeft >= 0 && item.reminders?.oneDay) {
                const notifId = `notif_1d_${sch.id}`;
                if (!remoteNotifs.some((n) => n.id === notifId)) {
                  const newNotif: StudentNotification = {
                    id: notifId,
                    userId: fbUser.uid,
                    title: `Last Date Tomorrow: ${sch.name}`,
                    message: `Official portal closing very soon. Please submit your application and check document attachments.`,
                    type: 'deadline_1d',
                    scholarshipId: sch.id,
                    read: false,
                    createdAt: new Date().toISOString(),
                  };
                  await saveNotificationToFirestore(fbUser.uid, newNotif);
                  setNotifications((prev) => [newNotif, ...prev]);
                }
              }
            }
          }
        } catch (err) {
          console.warn('Error loading Firestore data on login:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // URL Query Check for ?autostart=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1' && !profile) {
      const demoProfile: StudentProfile = {
        educationLevel: 'undergraduate',
        ugDegree: 'B.E/B.Tech',
        ugYear: '3rd Year',
        gender: 'Female',
        age: 20,
        casteCategory: 'OBC Non-Creamy Layer',
        state: 'Maharashtra',
        district: 'Pune',
        locality: 'Pune City',
        fatherAlive: true,
        motherAlive: true,
        isOrphan: false,
        earningMembers: [
          {
            relation: 'Father',
            profession: 'Farmer',
            annualIncome: 90000,
            isGovtEmployee: false,
          },
          {
            relation: 'Mother',
            profession: 'Daily-wage worker',
            annualIncome: 40000,
            isGovtEmployee: false,
          },
        ],
        totalAnnualIncome: 130000,
        readyForExam: true,
        wantsNoExam: true,
        alreadyReceivingScholarship: false,
        marksPercentage: 82,
        schoolBoard: 'State board',
        institutionType: 'Government',
        privacyConsent: true,
      };
      setProfile(demoProfile);
      handleProfileSubmit(demoProfile);
    }
  }, []);

  // Fetch Scholarships for Profile with 3-minute timeout and skipCache support
  const fetchScholarships = async (p: StudentProfile, skipCache: boolean = false) => {
    setLoadingScholarships(true);
    setScholarshipError(null);
    setLiveSearchFailed(false);
    try {
      const res = await fetchWithRetry(
        '/api/scholarships/match',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...p, skipCache }),
          skipCache,
        },
        1,
        180000 // 3 minutes timeout
      );
      if (!res.ok) throw new Error('Failed to match scholarships. Please try again.');
      const data = await safeJsonParse(res, { scholarships: [] });
      setScholarships(data.scholarships || []);
      setActiveView('results');
    } catch (err: any) {
      setScholarshipError(err?.message || 'Network error while searching scholarships.');
      setLiveSearchFailed(true);
      setActiveView('results');
    } finally {
      setLoadingScholarships(false);
    }
  };

  const handleProfileSubmit = (newProfile: StudentProfile) => {
    setProfile(newProfile);
    storage.saveProfile(newProfile);
    if (user) {
      syncUserProfileToFirestore(user.id, { profile: newProfile }).catch((e) =>
        console.warn('Failed to sync profile to Firestore:', e)
      );
    }
    setIsEditingProfile(false);
    fetchScholarships(newProfile);
  };

  // Sign-in gate on tapping a scholarship
  const handleSelectScholarship = (sch: Scholarship) => {
    if (!user) {
      setPendingScholarship(sch);
      setAuthModalOpen(true);
      return;
    }
    openScholarshipDetails(sch);
  };

  const openScholarshipDetails = async (sch: Scholarship) => {
    setPendingScholarship(null);
    try {
      const res = await fetchWithRetry('/api/scholarships/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scholarshipId: sch.id,
          scholarshipName: sch.name,
          studentProfile: profile,
        }),
      });
      if (res.ok) {
        const data = await safeJsonParse<any>(res, null);
        if (data?.details) {
          setActiveScholarship(data.details);
          setActiveView('details');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }

    setActiveScholarship(sch as ScholarshipDetailsData);
    setActiveView('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefreshDetails = async () => {
    if (!activeScholarship) return;
    setIsRefreshingDetails(true);
    try {
      const res = await fetchWithRetry('/api/scholarships/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scholarshipId: activeScholarship.id,
          scholarshipName: activeScholarship.name,
          studentProfile: profile,
          skipCache: true,
        }),
      });
      if (res.ok) {
        const data = await safeJsonParse<any>(res, null);
        if (data?.details) {
          setActiveScholarship(data.details);
          showToast('Details refreshed from verified official portal sources.');
        }
      }
    } catch (e) {
      console.warn('Failed to refresh details:', e);
    } finally {
      setIsRefreshingDetails(false);
    }
  };

  const handleAuthSuccess = (signedInUser: UserAccount) => {
    setUser(signedInUser);
    storage.setUser(signedInUser);
    setAuthModalOpen(false);

    if (pendingScholarship) {
      openScholarshipDetails(pendingScholarship);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (e) {}
    setUser(null);
    storage.setUser(null);
    setSavedScholarships([]);
    setNotifications([]);
    setActiveView('home');
  };

  const handleDeleteAllData = async () => {
    if (user) {
      try {
        await deleteAllUserDataFromFirestore(user.id);
      } catch (e) {
        console.warn('Error deleting user data from Firestore:', e);
      }
    }
    try {
      await signOutUser();
    } catch (e) {}
    storage.deleteAllUserData();
    setUser(null);
    setProfile(null);
    setScholarships([]);
    setActiveScholarship(null);
    setCurrentMockTest(null);
    setCurrentAttempt(null);
    setSavedAttempts([]);
    setTickets([]);
    setSavedScholarships([]);
    setNotifications([]);
    setActiveView('home');
    showToast('All your personal profile data, test history, and saved scholarships have been completely erased.');
  };

  // Saved Scholarships & Reminders Handlers
  const handleToggleSaveScholarship = async (sch: Scholarship) => {
    if (!user) {
      setPendingScholarship(sch);
      setAuthModalOpen(true);
      return;
    }
    const isAlreadySaved = savedScholarships.some((s) => s.id === sch.id);
    if (isAlreadySaved) {
      await removeSavedScholarshipFromFirestore(user.id, sch.id);
      setSavedScholarships((prev) => prev.filter((s) => s.id !== sch.id));
      showToast(`Removed "${sch.name}" from saved.`);
    } else {
      await saveScholarshipToFirestore(user.id, sch);
      const newItem: SavedScholarshipItem = {
        id: sch.id,
        userId: user.id,
        scholarship: sch,
        savedAt: new Date().toISOString(),
        applied: false,
        reminders: { open: true, sevenDays: true, oneDay: true, threeDaysExam: false },
        lastChecked: new Date().toISOString(),
      };
      setSavedScholarships((prev) => [...prev, newItem]);
      showToast(`Saved "${sch.name}"!`);
    }
  };

  const handleOpenRemindMe = (sch: Scholarship) => {
    if (!user) {
      setPendingScholarship(sch);
      setAuthModalOpen(true);
      return;
    }
    setRemindModalScholarship(sch);
  };

  const handleSaveReminders = async (reminders: {
    open: boolean;
    sevenDays: boolean;
    oneDay: boolean;
    threeDaysExam: boolean;
  }) => {
    if (!user || !remindModalScholarship) return;
    await saveScholarshipToFirestore(user.id, remindModalScholarship, reminders);
    setSavedScholarships((prev) =>
      prev.map((item) => (item.id === remindModalScholarship.id ? { ...item, reminders } : item))
    );
    showToast('Reminders updated successfully.');
  };

  const handleToggleApplied = async (scholarshipId: string, applied: boolean) => {
    if (!user) return;
    await markScholarshipAppliedInFirestore(user.id, scholarshipId, applied);
    setSavedScholarships((prev) =>
      prev.map((item) => (item.id === scholarshipId ? { ...item, applied } : item))
    );
    showToast(applied ? 'Marked as applied. Reminders paused!' : 'Application status reset.');
  };

  const handleRemoveSaved = async (scholarshipId: string) => {
    if (!user) return;
    await removeSavedScholarshipFromFirestore(user.id, scholarshipId);
    setSavedScholarships((prev) => prev.filter((item) => item.id !== scholarshipId));
    showToast('Scholarship removed from saved.');
  };

  const handleMarkNotificationRead = async (notifId: string) => {
    if (!user) return;
    await markNotificationReadInFirestore(user.id, notifId);
    setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, read: true } : n)));
  };

  const handleMarkAllNotificationsRead = async () => {
    if (!user) return;
    await markAllNotificationsReadInFirestore(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleChecklistChange = async (scholarshipId: string, docNames: string[]) => {
    setChecklistTicks((prev) => ({ ...prev, [scholarshipId]: docNames }));
    if (user) {
      try {
        await syncUserProfileToFirestore(user.id, {
          checklistTicks: {
            ...checklistTicks,
            [scholarshipId]: docNames,
          },
        });
      } catch (e) {
        console.warn('Failed to sync checklist ticks to Firestore:', e);
      }
    }
  };

  // Trigger Mock Test
  const handleTakeMockTest = async () => {
    if (!activeScholarship) return;
    setLoadingTest(true);
    setTestError(null);

    const fingerprints = savedAttempts
      .filter((a) => a.scholarshipId === activeScholarship.id || a.scholarshipName === activeScholarship.name)
      .flatMap((a) => a.questionReviews.map((r) => r.question?.questionText || r.questionId))
      .filter(Boolean);

    try {
      const res = await fetchWithRetry(
        '/api/mock-test/generate',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scholarshipId: activeScholarship.id,
            scholarshipName: activeScholarship.name,
            syllabus: activeScholarship.syllabus,
            totalQuestions: 10,
            questionFingerprints: fingerprints,
          }),
        },
        1,
        180000
      );

      const data = await safeJsonParse<any>(res, null);

      if (data?.isRefused) {
        showToast(data.message || 'Official exam pattern not yet verified for this scholarship.');
        return;
      }

      if (data?.mockTest) {
        setCurrentMockTest(data.mockTest);
        setActiveView('test');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setTestError('Unable to generate practice test right now. Please retry.');
      }
    } catch (err: any) {
      setTestError(err?.message || 'Connection timeout while generating exam. Please retry.');
    } finally {
      setLoadingTest(false);
    }
  };

  // Retake exact same test without calling AI again
  const handleRetakeTest = () => {
    if (!currentMockTest) return;
    try {
      localStorage.removeItem(`mock_progress_${currentMockTest.id}`);
    } catch (e) {}
    setCurrentAttempt(null);
    setActiveView('test');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Finish and evaluate mock test
  const handleFinishTest = (
    answers: Record<string, number>,
    timeSpent: Record<string, number>,
    bookmarks: Record<string, boolean>,
    notes: Record<string, string>
  ) => {
    if (!currentMockTest) return;

    const attempt = calculateTestResults(
      currentMockTest,
      answers,
      timeSpent,
      bookmarks,
      notes
    );

    setCurrentAttempt(attempt);
    storage.saveAttempt(attempt);
    const updatedAttempts = storage.getAttempts();
    setSavedAttempts(updatedAttempts);

    if (user) {
      saveTestAttemptToFirestore(user.id, attempt).catch((e) =>
        console.warn('Failed to save attempt to Firestore:', e)
      );
    }

    setActiveView('test-results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ErrorBoundary fallbackTitle="ScholarPal AI Application Error">
      <div className="min-h-screen flex flex-col bg-slate-50/60 text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">
        {/* Header */}
        <Header
          user={user}
          onOpenAuth={() => setAuthModalOpen(true)}
          onSignOut={handleSignOut}
          onDeleteData={handleDeleteAllData}
          activeView={activeView}
          onNavigate={(view) => {
            if (view === 'home') {
              if (scholarships.length > 0 && !isEditingProfile) {
                setActiveView('results');
              } else {
                setActiveView('home');
              }
            } else if (view === 'saved') {
              setActiveView('saved');
            } else if (view === 'profile') {
              setIsEditingProfile(true);
              setActiveView('home');
            } else if (view === 'my-tests') {
              setMyTestsTab('tests');
              setActiveView('my-tests');
            } else if (view === 'complaints') {
              setActiveView('complaints');
            } else {
              setActiveView(view as any);
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          savedCount={savedScholarships.length}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          onSelectScholarshipFromNotification={(schId) => {
            const found = scholarships.find((s) => s.id === schId);
            if (found) handleSelectScholarship(found);
          }}
        />

        {/* Main View Router wrapped in ErrorBoundary */}
        <main className="flex-1">
          {/* VIEW 1: HOME & PROFILE FORM */}
          {(activeView === 'home' || isEditingProfile) && (
            <ErrorBoundary fallbackTitle="Form Error">
              <ProfileForm
                initialProfile={profile}
                onSubmit={handleProfileSubmit}
                onCancelEdit={
                  scholarships.length > 0
                    ? () => {
                        setIsEditingProfile(false);
                        setActiveView('results');
                      }
                    : undefined
                }
              />
            </ErrorBoundary>
          )}

          {/* VIEW 2: SCHOLARSHIP MATCHED RESULTS */}
          {activeView === 'results' && !isEditingProfile && (
            <ErrorBoundary fallbackTitle="Results Error">
              <ScholarshipResults
                scholarships={scholarships}
                loading={loadingScholarships}
                error={scholarshipError}
                onRetry={() => profile && fetchScholarships(profile, true)}
                onSelectScholarship={handleSelectScholarship}
                onEditProfile={() => setIsEditingProfile(true)}
                savedScholarshipIds={savedScholarships.map((s) => s.id)}
                onToggleSave={handleToggleSaveScholarship}
                onOpenRemindMe={handleOpenRemindMe}
                isLiveCheckUnavailable={liveSearchFailed}
              />
            </ErrorBoundary>
          )}

          {/* VIEW 3: SCHOLARSHIP DETAILS */}
          {activeView === 'details' && activeScholarship && (
            <ErrorBoundary fallbackTitle="Details Error">
              <ScholarshipDetailsView
                scholarship={activeScholarship}
                studentProfile={profile}
                onBack={() => setActiveView('results')}
                onTakeTest={handleTakeMockTest}
                isSaved={savedScholarships.some((s) => s.id === activeScholarship.id)}
                onToggleSave={() => handleToggleSaveScholarship(activeScholarship)}
                onOpenRemindMe={() => handleOpenRemindMe(activeScholarship)}
                onRefreshDetails={handleRefreshDetails}
                isRefreshing={isRefreshingDetails}
                onChecklistChange={(docNames) => handleChecklistChange(activeScholarship.id, docNames)}
                initialCheckedDocs={checklistTicks[activeScholarship.id] || []}
              />
            </ErrorBoundary>
          )}

          {/* VIEW 4: LIVE AI MOCK TEST */}
          {activeView === 'test' && currentMockTest && (
            <ErrorBoundary fallbackTitle="Mock Test Error">
              <MockTestView
                mockTest={currentMockTest}
                onFinishTest={handleFinishTest}
                onExitTest={() => setActiveView('details')}
              />
            </ErrorBoundary>
          )}

          {/* VIEW 5: TEST EVALUATION RESULTS */}
          {activeView === 'test-results' && currentAttempt && currentMockTest && (
            <ErrorBoundary fallbackTitle="Evaluation Error">
              <TestResultsView
                attempt={currentAttempt}
                mockTest={currentMockTest}
                onRetake={handleRetakeTest}
                onNewVersion={handleTakeMockTest}
                onBackToScholarship={() => setActiveView('details')}
              />
            </ErrorBoundary>
          )}

          {/* VIEW 6: MY TESTS HISTORY */}
          {activeView === 'my-tests' && (
            <ErrorBoundary fallbackTitle="Dashboard Error">
              <MyTestsView
                attempts={savedAttempts}
                initialTab={myTestsTab}
                onSelectAttempt={(att) => {
                  setCurrentAttempt(att);
                  if (currentMockTest && currentMockTest.id === att.testId) {
                    setActiveView('test-results');
                  } else {
                    setCurrentMockTest({
                      id: att.testId,
                      scholarshipId: att.scholarshipId,
                      scholarshipName: att.scholarshipName,
                      totalQuestions: att.questionReviews.length,
                      totalMarks: att.maxScore,
                      durationMinutes: Math.round(att.totalTimeSeconds / 60) || 30,
                      negativeMarkRatio: 0.25,
                      sections: [
                        {
                          name: 'Exam Questions',
                          questions: att.questionReviews.map((r, i) => ({
                            id: r.questionId,
                            sectionName: 'Exam Questions',
                            subject: 'Subject',
                            topic: 'Topic',
                            difficulty: 'Medium',
                            questionText: `Question ${i + 1}`,
                            options: ['Option A', 'Option B', 'Option C', 'Option D'],
                            correctOptionIndex: 0,
                            explanation: 'Review solution available.',
                            marks: 4,
                            negativeMarks: 1,
                          })),
                        },
                      ],
                    });
                    setActiveView('test-results');
                  }
                }}
                onNavigateHome={() => setActiveView('home')}
              />
            </ErrorBoundary>
          )}

          {/* VIEW 7: SAVED SCHOLARSHIPS VIEW */}
          {activeView === 'saved' && (
            <ErrorBoundary fallbackTitle="Saved Scholarships Error">
              <SavedScholarshipsView
                savedItems={savedScholarships}
                onOpenDetails={openScholarshipDetails}
                onRemove={handleRemoveSaved}
                onToggleApplied={handleToggleApplied}
                onUpdateReminders={(schId, reminders) => {
                  const item = savedScholarships.find((s) => s.id === schId);
                  if (item && user) {
                    saveScholarshipToFirestore(user.id, item.scholarship, reminders);
                    setSavedScholarships((prev) =>
                      prev.map((s) => (s.id === schId ? { ...s, reminders } : s))
                    );
                    showToast('Reminders updated.');
                  }
                }}
                onFindMore={() => {
                  if (scholarships.length > 0) setActiveView('results');
                  else setActiveView('home');
                }}
              />
            </ErrorBoundary>
          )}

          {/* VIEW 8: GRIEVANCE & HELPDESK TICKETS */}
          {activeView === 'complaints' && (
            <ErrorBoundary fallbackTitle="Helpdesk Error">
              <ComplaintsView
                tickets={tickets}
                onTicketCreated={(newTicket) => {
                  setTickets(storage.getTickets());
                  if (user) {
                    saveComplaintToFirestore(user.id, newTicket).catch((e) =>
                      console.warn('Failed to save complaint to Firestore:', e)
                    );
                  }
                }}
                onNavigateHome={() => setActiveView('home')}
              />
            </ErrorBoundary>
          )}

          {/* VIEW 9: CHECK AI CONNECTION DIAGNOSTICS */}
          {activeView === 'diagnostics' && (
            <ErrorBoundary fallbackTitle="Diagnostics Error">
              <AiDiagnosticsView
                onBack={() => {
                  setActiveView('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </ErrorBoundary>
          )}

          {/* Remind Me Sheet Modal */}
          {remindModalScholarship && (
            <RemindMeModal
              isOpen={Boolean(remindModalScholarship)}
              onClose={() => setRemindModalScholarship(null)}
              scholarship={remindModalScholarship}
              initialReminders={
                savedScholarships.find((s) => s.id === remindModalScholarship.id)?.reminders
              }
              onSaveReminders={handleSaveReminders}
            />
          )}

          {/* Mock Test Error Modal with Retry & Show details (Requirement 8) */}
          {testError && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
                <h3 className="text-lg font-black text-rose-900">Unable to Generate Practice Test</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  We encountered a temporary network delay reaching the test generation server. You can retry preparing your exam or view the error details.
                </p>

                {showTestErrorDetails && (
                  <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl font-mono text-[11px] text-rose-900 overflow-x-auto">
                    {testError}
                  </div>
                )}

                <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => setShowTestErrorDetails(!showTestErrorDetails)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    {showTestErrorDetails ? 'Hide details' : 'Show details'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTestError(null)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setTestError(null);
                        handleTakeMockTest();
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-xs font-bold text-white shadow-xs cursor-pointer"
                    >
                      Retry Generation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* In-app Toast Banner */}
          {toastMessage && (
            <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          )}
        </main>

        {/* Sign-in Gate Modal (Google Sign In Only) */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
          pendingScholarshipName={pendingScholarship?.name}
        />

        {/* 24/7 AI Chatbot Floating Widget */}
        <ChatbotWidget
          studentProfile={profile}
          currentScholarship={activeScholarship}
          onOpenComplaints={() => setActiveView('complaints')}
        />

        {/* Trust & Safety Footer with Check AI connection link */}
        <Footer
          onDeleteData={handleDeleteAllData}
          onOpenDiagnostics={() => {
            setActiveView('diagnostics');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>
    </ErrorBoundary>
  );
}
