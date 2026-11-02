import React, { useState } from 'react';
import {
  LifeBuoy,
  Plus,
  Send,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileQuestion,
  PhoneCall,
} from 'lucide-react';
import { SupportTicket } from '../types/index.ts';
import { storage } from '../utils/storage.ts';

interface ComplaintsViewProps {
  tickets: SupportTicket[];
  onTicketCreated: (ticket: SupportTicket) => void;
  onNavigateHome: () => void;
}

export const ComplaintsView: React.FC<ComplaintsViewProps> = ({
  tickets,
  onTicketCreated,
  onNavigateHome,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [category, setCategory] = useState<SupportTicket['category']>('App problem');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          message,
          userContact: contact || 'App Student',
        }),
      });
      const data = await res.json();
      if (data.ticket) {
        storage.saveTicket(data.ticket);
        onTicketCreated(data.ticket);
        setMessage('');
        setShowCreateModal(false);
      }
    } catch {
      // Offline fallback
      const offlineTicket: SupportTicket = {
        id: `TKT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
        category,
        message,
        userId: 'student_offline',
        userName: 'ScholarPal Student',
        userPhoneOrEmail: contact || 'App Student',
        createdAt: new Date().toISOString(),
        status: 'Open',
        officialHelpdeskUrl: 'https://scholarships.gov.in',
      };
      storage.saveTicket(offlineTicket);
      onTicketCreated(offlineTicket);
      setMessage('');
      setShowCreateModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-emerald-600" />
            Helpdesk & Grievance Tickets
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Report wrong information, broken links, portal trouble, or technical glitches.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 self-start sm:self-auto min-h-[42px]"
        >
          <Plus className="w-4 h-4" />
          <span>New Grievance Ticket</span>
        </button>
      </div>

      {/* Official Government Portals Helpdesk Cards */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-5 mb-8">
        <h2 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <PhoneCall className="w-4 h-4 text-emerald-700" />
          Official Central & State Helpdesk Numbers
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-emerald-900 mt-3">
          <div className="p-3 rounded-2xl bg-white border border-emerald-100 shadow-2xs">
            <p className="font-bold text-slate-900">National Scholarship Portal (NSP)</p>
            <p className="text-[11px] text-slate-500">For Central Sector, Pre/Post-Matric, AICTE, UGC</p>
            <div className="mt-2 flex items-center justify-between font-mono font-bold text-emerald-700">
              <span>📞 0120-6619540</span>
              <a
                href="https://scholarships.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-sans text-slate-600 hover:text-emerald-700 flex items-center gap-1"
              >
                Grievance Portal <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-emerald-100 shadow-2xs">
            <p className="font-bold text-slate-900">AICTE Student Development Cell</p>
            <p className="text-[11px] text-slate-500">For Pragati, Saksham & Swanath Technical Schemes</p>
            <div className="mt-2 flex items-center justify-between font-mono font-bold text-emerald-700">
              <span>📞 011-29581333</span>
              <a
                href="https://www.aicte-india.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-sans text-slate-600 hover:text-emerald-700 flex items-center gap-1"
              >
                Helpdesk <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Past Tickets List */}
      <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4">
        Your Logged Tickets ({tickets.length})
      </h2>

      {tickets.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-sm">
          <FileQuestion className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No active grievances</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            If you encounter broken links or issues with official portals, log a ticket or chat with our 24/7 AI.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-xs text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
                    {t.id}
                  </span>
                  <span className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-md">
                    {t.category}
                  </span>
                </div>

                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                    t.status === 'Resolved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : t.status === 'In Review'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  ● {t.status}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-800 font-medium">{t.message}</p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                <span>
                  Logged on {new Date(t.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                </span>
                {t.officialHelpdeskUrl && (
                  <a
                    href={t.officialHelpdeskUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                  >
                    Official Portal Helpdesk <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-1">Log a Grievance Ticket</h3>
            <p className="text-xs text-slate-500 mb-4">
              Our team verifies data integrity and coordinates guidance for portal issues.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 min-h-[44px]"
                >
                  <option value="Wrong information">Wrong information in scholarship</option>
                  <option value="Broken link">Broken link / 404 URL</option>
                  <option value="Official portal trouble">Official portal trouble (NSP/State)</option>
                  <option value="App problem">App problem or bug</option>
                  <option value="Other">Other grievance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Describe the Issue
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide exact details or scheme name where error was observed..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contact Phone / Email (Optional for updates)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210 or your email"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 min-h-[40px]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 min-h-[40px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs min-h-[40px]"
                >
                  {loading ? 'Submitting...' : 'Register Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
