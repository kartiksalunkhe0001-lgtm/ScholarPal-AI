import { StudentProfile, UserAccount, TestAttempt, SupportTicket } from '../types/index.ts';

const USER_KEY = 'scholarpal_user';
const PROFILE_KEY = 'scholarpal_profile';
const ATTEMPTS_KEY = 'scholarpal_attempts';
const TICKETS_KEY = 'scholarpal_tickets';

export const storage = {
  getUser(): UserAccount | null {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setUser(user: UserAccount | null) {
    if (!user) {
      localStorage.removeItem(USER_KEY);
    } else {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  getProfile(): StudentProfile | null {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveProfile(profile: StudentProfile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    // Also attach to user if signed in
    const user = this.getUser();
    if (user) {
      user.savedProfile = profile;
      this.setUser(user);
    }
  },

  getAttempts(): TestAttempt[] {
    try {
      const data = localStorage.getItem(ATTEMPTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveAttempt(attempt: TestAttempt) {
    const list = this.getAttempts();
    const updated = [attempt, ...list.filter((a) => a.id !== attempt.id)];
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(updated));
  },

  getTickets(): SupportTicket[] {
    try {
      const data = localStorage.getItem(TICKETS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveTicket(ticket: SupportTicket) {
    const list = this.getTickets();
    const updated = [ticket, ...list.filter((t) => t.id !== ticket.id)];
    localStorage.setItem(TICKETS_KEY, JSON.stringify(updated));
  },

  deleteAllUserData() {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(ATTEMPTS_KEY);
    localStorage.removeItem(TICKETS_KEY);
    localStorage.removeItem('scholarpal_profile_draft');
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('scholarpal_') || key.startsWith('mock_')) {
          localStorage.removeItem(key);
        }
      });
    } catch {}
  },
};
