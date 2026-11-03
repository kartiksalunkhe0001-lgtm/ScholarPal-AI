import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  User,
  History,
  LifeBuoy,
  LogOut,
  Trash2,
  Bookmark,
  Bell,
  CheckCircle2,
  Calendar,
  Clock,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { UserAccount, StudentNotification, Scholarship } from '../types/index.ts';

interface HeaderProps {
  user: UserAccount | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onDeleteData: () => void;
  activeView: string;
  onNavigate: (view: 'home' | 'my-tests' | 'complaints' | 'saved' | 'profile') => void;
  savedCount: number;
  notifications: StudentNotification[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onSelectScholarshipFromNotification?: (scholarshipId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenAuth,
  onSignOut,
  onDeleteData,
  activeView,
  onNavigate,
  savedCount,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onSelectScholarshipFromNotification,
}) => {
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [notifDropdown, setNotifDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 text-left focus:outline-hidden group cursor-pointer"
          aria-label="ScholarPal AI Home"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">
                Scholar<span className="text-emerald-700">Pal</span>
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-sm">
                <Sparkles className="w-2.5 h-2.5" /> AI
              </span>
            </div>
            <p className="text-[11px] text-slate-700 font-medium hidden sm:block">
              Find the right scholarship. Prepare to win it.
            </p>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              activeView === 'home' || activeView === 'results' || activeView === 'details'
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-800 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Find Scholarships
          </button>

          <button
            onClick={() => onNavigate('saved')}
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeView === 'saved'
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-800 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bookmark className="w-4 h-4 text-emerald-600" />
            <span>Saved</span>
            {savedCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigate('my-tests')}
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeView === 'my-tests'
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-800 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4 text-emerald-600" />
            My Tests
          </button>

          <button
            onClick={() => onNavigate('complaints')}
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeView === 'complaints'
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-800 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LifeBuoy className="w-4 h-4 text-emerald-600" />
            Help & Grievance
          </button>
        </nav>

        {/* Right CTA / Account & Notifications */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setNotifDropdown(!notifDropdown);
                setProfileDropdown(false);
              }}
              className="p-2.5 rounded-full text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition-colors relative cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {notifDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifDropdown(false)} />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-sm text-slate-900">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={onMarkAllNotificationsRead}
                        className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-gray-500">
                        <CheckCircle2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <span>No notifications yet. Save scholarships to get deadline reminders!</span>
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (!n.read) onMarkNotificationRead(n.id);
                            if (n.scholarshipId && onSelectScholarshipFromNotification) {
                              onSelectScholarshipFromNotification(n.scholarshipId);
                              setNotifDropdown(false);
                            }
                          }}
                          className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-left ${
                            !n.read ? 'bg-emerald-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <span
                              className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                !n.read ? 'bg-emerald-600' : 'bg-transparent'
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-900 leading-snug">{n.title}</p>
                              <p className="text-xs text-gray-600 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                              <span className="text-[10px] text-gray-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Account / Sign In */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setProfileDropdown(!profileDropdown);
                  setNotifDropdown(false);
                }}
                className="flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 rounded-full border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 transition-colors text-slate-800 focus:outline-hidden cursor-pointer"
                aria-expanded={profileDropdown}
                aria-label="User Account Menu"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-emerald-400"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                    {user.name.charAt(0) || 'S'}
                  </div>
                )}
                <span className="text-sm font-medium max-w-[120px] truncate hidden sm:inline">
                  {user.name.split(' ')[0]}
                </span>
              </button>

              {profileDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-slate-700 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-3">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover border border-emerald-300"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 truncate text-sm">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                    </div>

                    {/* Exact Menu Items Required by Task:
                        My Profile, My Tests, Saved Scholarships, My Complaints, Delete my data, Sign out */}
                    <button
                      onClick={() => {
                        setProfileDropdown(false);
                        onNavigate('profile');
                      }}
                      className="w-full px-4 py-2 text-xs sm:text-sm text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                    >
                      <User className="w-4 h-4 text-emerald-600" />
                      My Profile
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdown(false);
                        onNavigate('my-tests');
                      }}
                      className="w-full px-4 py-2 text-xs sm:text-sm text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                    >
                      <History className="w-4 h-4 text-emerald-600" />
                      My Tests
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdown(false);
                        onNavigate('saved');
                      }}
                      className="w-full px-4 py-2 text-xs sm:text-sm text-left hover:bg-slate-50 flex items-center justify-between text-slate-800 cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <Bookmark className="w-4 h-4 text-emerald-600" />
                        Saved Scholarships
                      </span>
                      {savedCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {savedCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdown(false);
                        onNavigate('complaints');
                      }}
                      className="w-full px-4 py-2 text-xs sm:text-sm text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                    >
                      <LifeBuoy className="w-4 h-4 text-emerald-600" />
                      My Complaints
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      onClick={() => {
                        setProfileDropdown(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="w-full px-4 py-2 text-xs sm:text-sm text-left hover:bg-rose-50 flex items-center gap-2.5 text-rose-700 cursor-pointer font-medium"
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                      Delete my data
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdown(false);
                        onSignOut();
                      }}
                      className="w-full px-4 py-2 text-xs sm:text-sm text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-slate-400" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Sign In with Google</span>
            </button>
          )}
        </div>
      </div>

      {/* Delete Data Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-gray-100 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete all your data?</h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-6">
              This will permanently erase your profile, saved scholarships, test attempts, complaints, and checklist ticks from Firestore and local storage, and sign you out.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDeleteData();
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Yes, Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
