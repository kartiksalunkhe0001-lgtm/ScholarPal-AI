import React, { useState } from 'react';
import { X, Bell, Calendar, Download, Check, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { Scholarship } from '../types/index.ts';
import { buildGoogleCalendarUrl, generateIcsFile, downloadIcs } from '../utils/calendar.ts';

interface RemindMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  scholarship: Scholarship;
  initialReminders?: {
    open: boolean;
    sevenDays: boolean;
    oneDay: boolean;
    threeDaysExam: boolean;
  };
  onSaveReminders: (reminders: {
    open: boolean;
    sevenDays: boolean;
    oneDay: boolean;
    threeDaysExam: boolean;
  }) => void;
}

export const RemindMeModal: React.FC<RemindMeModalProps> = ({
  isOpen,
  onClose,
  scholarship,
  initialReminders,
  onSaveReminders,
}) => {
  const [reminders, setReminders] = useState({
    open: initialReminders?.open ?? true,
    sevenDays: initialReminders?.sevenDays ?? true,
    oneDay: initialReminders?.oneDay ?? true,
    threeDaysExam: initialReminders?.threeDaysExam ?? false,
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const isDateUnannounced =
    !scholarship.lastDateToApply ||
    scholarship.lastDateToApply.toLowerCase().includes('not announced');

  const handleSave = () => {
    onSaveReminders(reminders);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleDownloadIcs = () => {
    if (isDateUnannounced) return;
    const ics = generateIcsFile({
      title: `[ScholarPal AI] Last Date: ${scholarship.name}`,
      description: `Application deadline for ${scholarship.name} (${scholarship.provider}). Official Portal: ${scholarship.officialUrl}`,
      startDate: scholarship.lastDateToApply,
      url: scholarship.officialUrl,
    });
    downloadIcs(`${scholarship.name.replace(/[^a-zA-Z0-9]/g, '_')}_deadline`, ics);
  };

  const googleCalUrl = !isDateUnannounced
    ? buildGoogleCalendarUrl({
        title: `[ScholarPal AI] Last Date: ${scholarship.name}`,
        description: `Application deadline for ${scholarship.name} (${scholarship.provider}).\nBenefit: ${scholarship.benefitAmount}\nApply on official website: ${scholarship.officialUrl}`,
        startDate: scholarship.lastDateToApply,
        location: scholarship.provider,
      })
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-emerald-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Scholarship Reminders</h3>
              <p className="text-xs text-gray-500 truncate max-w-[280px] sm:max-w-xs">{scholarship.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Watching official site notice if date not announced */}
          {isDateUnannounced ? (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-950">Dates not announced yet for 2026-27 cycle</p>
                <p className="text-amber-800 mt-0.5">
                  Watching the official website - we will tell you when dates are announced.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
              <div>
                <span className="font-semibold">Last Date to Apply: </span>
                <span className="font-bold text-emerald-800">{scholarship.lastDateToApply}</span>
                {scholarship.daysLeft !== undefined && (
                  <span className="ml-2 text-[11px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                    {scholarship.daysLeft > 0 ? `${scholarship.daysLeft} days left` : 'Closing today'}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Reminder Trigger Checkboxes */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              Notify me inside the app:
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={reminders.open}
                onChange={(e) => setReminders({ ...reminders, open: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 border-gray-300"
              />
              <div className="text-xs">
                <span className="font-semibold text-gray-800 block">When applications open</span>
                <span className="text-gray-500 text-[11px]">Instant alert when portal opens for new applications</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={reminders.sevenDays}
                onChange={(e) => setReminders({ ...reminders, sevenDays: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 border-gray-300"
              />
              <div className="text-xs">
                <span className="font-semibold text-gray-800 block">7 days before the last date</span>
                <span className="text-gray-500 text-[11px]">Time to obtain pending income certificates or bonafide</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={reminders.oneDay}
                onChange={(e) => setReminders({ ...reminders, oneDay: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 border-gray-300"
              />
              <div className="text-xs">
                <span className="font-semibold text-gray-800 block">1 day before the last date</span>
                <span className="text-gray-500 text-[11px]">Final urgent reminder to submit and download printout</span>
              </div>
            </label>

            {scholarship.isExamBased && (
              <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={reminders.threeDaysExam}
                  onChange={(e) => setReminders({ ...reminders, threeDaysExam: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 border-gray-300"
                />
                <div className="text-xs">
                  <span className="font-semibold text-gray-800 block">3 days before the exam</span>
                  <span className="text-gray-500 text-[11px]">Admit card reminder and quick mock test revision</span>
                </div>
              </label>
            )}
          </div>

          {/* Add to Calendar Section */}
          {!isDateUnannounced && (
            <div className="pt-3 border-t border-gray-100">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                External Calendar Sync:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href={googleCalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50/40 text-gray-700 hover:text-blue-700 text-xs font-semibold transition-colors"
                >
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Google Calendar</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>

                <button
                  type="button"
                  onClick={handleDownloadIcs}
                  className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-gray-700 hover:text-emerald-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Download .ics file</span>
                </button>
              </div>
            </div>
          )}

          {/* Guidance note per Requirement 6 */}
          <div className="p-3 rounded-xl bg-gray-50 text-[11px] text-gray-600 leading-relaxed border border-gray-100">
            🔔 <strong>Note:</strong> Reminders appear when you open ScholarPal AI. For phone alerts when the app is closed, tap <strong>Add to calendar</strong>.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Reminders</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
