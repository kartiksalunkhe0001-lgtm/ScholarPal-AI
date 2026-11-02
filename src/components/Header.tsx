import React from 'react';
import {
  GraduationCap,
  Sparkles,
  User,
  History,
  LifeBuoy,
  LogOut,
  Trash2,
  Menu,
  X,
  ShieldCheck,
  Bookmark,
  FileEdit,
} from 'lucide-react';
import { UserAccount } from '../types/index.ts';

interface HeaderProps {
  user: UserAccount | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onDeleteData: () => void;
  activeView: 'home' | 'results' | 'details' | 'test' | 'my-tests' | 'complaints' | 'bookmarks' | 'notes';
  onNavigate: (view: 'home' | 'my-tests' | 'complaints' | 'bookmarks' | 'notes') => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenAuth,
  onSignOut,
  onDeleteData,
  activeView,
  onNavigate,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [profileDropdown, setProfileDropdown] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 text-left focus:outline-hidden group"
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
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeView === 'home' || activeView === 'results' || activeView === 'details'
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-800 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Find Scholarships
          </button>
          <button
            onClick={() => onNavigate('my-tests')}
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
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
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
              activeView === 'complaints'
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-800 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LifeBuoy className="w-4 h-4 text-emerald-600" />
            Help & Grievance
          </button>
        </nav>

        {/* Right CTA / Account */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 transition-colors text-slate-800 focus:outline-hidden"
                aria-expanded={profileDropdown}
                aria-label="User Account Menu"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                  {user.name.charAt(0) || 'S'}
                </div>
                <span className="text-sm font-medium max-w-[120px] truncate hidden sm:inline">
                  {user.name.split(' ')[0]}
                </span>
              </button>

              {profileDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-slate-700 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs text-slate-700 font-medium">Signed in as</p>
                      <p className="font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-700 truncate">{user.emailOrPhone}</p>
                    </div>

                    <button
                      onClick={() => {
                        setProfileDropdown(false);
                        onNavigate('my-tests');
                      }}
                      className="w-full px-4 py-2 text-xs sm:text-sm text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-800"
                    >
                      <History className="w-4 h-4 text-emerald-600" />
                      My Practice Tests
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdown(false);
                        onNavigate('bookmarks');
                      }}
                      className="w-full px-4 py-2 text-xs sm:text-sm text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-800"
                    >
                      <Bookmark className="w-4 h-4 text-amber-500" />
                      Bookmarked Questions
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdown(false);
                        onNavigate('notes');
                      }}
                      className="w-full px-4 py-2 text-xs sm:text-sm text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-800"
                    >
                      <FileEdit className="w-4 h-4 text-teal-600" />
                      My Personal Notes
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdown(false);
                        onNavigate('complaints');
                      }}
                      className="w-full px-4 py-2 text-xs sm:text-sm text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-800"
                    >
                      <LifeBuoy className="w-4 h-4 text-slate-700" />
                      Grievance Tickets
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        setProfileDropdown(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="w-full px-4 py-2.5 text-sm text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete My Data
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdown(false);
                        onSignOut();
                      }}
                      className="w-full px-4 py-2.5 text-sm text-left hover:bg-slate-50 text-slate-700 flex items-center gap-2.5"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm shadow-sm transition-all flex items-center gap-2 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Toggle Navigation Menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <button
            onClick={() => {
              setMenuOpen(false);
              onNavigate('home');
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-base font-semibold text-slate-800 hover:bg-emerald-50 hover:text-emerald-800"
          >
            Find Scholarships
          </button>
          <button
            onClick={() => {
              setMenuOpen(false);
              onNavigate('my-tests');
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-base font-semibold text-slate-800 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2"
          >
            <History className="w-4 h-4 text-emerald-600" />
            My Tests
          </button>
          <button
            onClick={() => {
              setMenuOpen(false);
              onNavigate('complaints');
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-base font-semibold text-slate-800 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2"
          >
            <LifeBuoy className="w-4 h-4 text-emerald-600" />
            Help & Grievance
          </button>
        </div>
      )}

      {/* In-app Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Erase All Personal Data?</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              This will permanently delete your stored profile details, academic records, saved test attempts, and grievance tickets from this device.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Keep My Data
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDeleteData();
                }}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
