import React, { useState, useMemo } from 'react';
import {
  Bookmark,
  Calendar,
  Clock,
  Bell,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Download,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Search,
} from 'lucide-react';
import { SavedScholarshipItem, Scholarship } from '../types/index.ts';
import { buildGoogleCalendarUrl, generateIcsFile, downloadIcs } from '../utils/calendar.ts';
import { RemindMeModal } from './RemindMeModal.tsx';

interface SavedScholarshipsViewProps {
  savedItems: SavedScholarshipItem[];
  onOpenDetails: (scholarship: Scholarship) => void;
  onRemove: (scholarshipId: string) => void;
  onToggleApplied: (scholarshipId: string, applied: boolean) => void;
  onUpdateReminders: (
    scholarshipId: string,
    reminders: { open: boolean; sevenDays: boolean; oneDay: boolean; threeDaysExam: boolean }
  ) => void;
  onFindMore: () => void;
}

export const SavedScholarshipsView: React.FC<SavedScholarshipsViewProps> = ({
  savedItems,
  onOpenDetails,
  onRemove,
  onToggleApplied,
  onUpdateReminders,
  onFindMore,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'closing_soon' | 'upcoming' | 'applied'>('all');
  const [editingScholarship, setEditingScholarship] = useState<Scholarship | null>(null);

  // Categorize items
  const categorized = useMemo(() => {
    return savedItems.map((item) => {
      const sch = item.scholarship;
      const lastDate = sch.lastDateToApply;
      const isUnannounced = !lastDate || lastDate.toLowerCase().includes('not announced');
      const daysLeft = sch.daysLeft;

      let status: 'open' | 'closing_soon' | 'upcoming' = 'open';
      if (item.applied) {
        // marked applied
      } else if (isUnannounced) {
        status = 'upcoming';
      } else if (daysLeft !== undefined && daysLeft <= 7 && daysLeft >= 0) {
        status = 'closing_soon';
      } else if (daysLeft !== undefined && daysLeft < 0) {
        status = 'upcoming';
      } else {
        status = 'open';
      }

      return {
        ...item,
        derivedStatus: status,
      };
    });
  }, [savedItems]);

  const filteredItems = useMemo(() => {
    if (activeTab === 'all') return categorized;
    if (activeTab === 'applied') return categorized.filter((item) => item.applied);
    if (activeTab === 'open') return categorized.filter((item) => !item.applied && item.derivedStatus === 'open');
    if (activeTab === 'closing_soon')
      return categorized.filter((item) => !item.applied && item.derivedStatus === 'closing_soon');
    if (activeTab === 'upcoming')
      return categorized.filter((item) => !item.applied && item.derivedStatus === 'upcoming');
    return categorized;
  }, [categorized, activeTab]);

  const counts = useMemo(() => {
    return {
      all: categorized.length,
      open: categorized.filter((i) => !i.applied && i.derivedStatus === 'open').length,
      closing_soon: categorized.filter((i) => !i.applied && i.derivedStatus === 'closing_soon').length,
      upcoming: categorized.filter((i) => !i.applied && i.derivedStatus === 'upcoming').length,
      applied: categorized.filter((i) => i.applied).length,
    };
  }, [categorized]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Bookmark className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Saved Scholarships</h1>
          </div>
          <p className="text-sm text-gray-600">
            Track application deadlines, configure active notifications, and sync dates to your calendar.
          </p>
        </div>

        <button
          onClick={onFindMore}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Search className="w-4 h-4" />
          <span>Find More Scholarships</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 mb-6 scrollbar-none">
        {[
          { id: 'all', label: 'All Saved', count: counts.all },
          { id: 'open', label: 'Open', count: counts.open },
          { id: 'closing_soon', label: 'Closing Soon', count: counts.closing_soon },
          { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
          { id: 'applied', label: 'Applied', count: counts.applied },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === tab.id ? 'bg-emerald-800 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-gray-200 my-8">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-gray-800 mb-1">No scholarships in this section</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5">
            {activeTab === 'all'
              ? 'Tap the heart icon on any scholarship card or details page to track deadlines and get reminders here.'
              : `You do not have any scholarships marked under "${activeTab.replace('_', ' ')}".`}
          </p>
          <button
            onClick={onFindMore}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            <span>Browse Matched Scholarships</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredItems.map((item) => {
            const sch = item.scholarship;
            const isUnannounced =
              !sch.lastDateToApply || sch.lastDateToApply.toLowerCase().includes('not announced');
            const hasReminders =
              item.reminders &&
              (item.reminders.open || item.reminders.sevenDays || item.reminders.oneDay || item.reminders.threeDaysExam);

            const googleCalUrl = !isUnannounced
              ? buildGoogleCalendarUrl({
                  title: `[ScholarPal AI] Last Date: ${sch.name}`,
                  description: `Deadline for ${sch.name} (${sch.provider}). Benefit: ${sch.benefitAmount}. Official Portal: ${sch.officialUrl}`,
                  startDate: sch.lastDateToApply,
                  location: sch.provider,
                })
              : '';

            const handleDownloadIcs = (e: React.MouseEvent) => {
              e.stopPropagation();
              if (isUnannounced) return;
              const ics = generateIcsFile({
                title: `[ScholarPal AI] Last Date: ${sch.name}`,
                description: `Deadline for ${sch.name} (${sch.provider}). Official Portal: ${sch.officialUrl}`,
                startDate: sch.lastDateToApply,
                url: sch.officialUrl,
              });
              downloadIcs(`${sch.name.replace(/[^a-zA-Z0-9]/g, '_')}_deadline`, ics);
            };

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl bg-white border transition-all shadow-xs hover:shadow-md ${
                  item.applied ? 'border-gray-200 bg-gray-50/40 opacity-90' : 'border-gray-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left Column: Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {sch.type}
                      </span>
                      {sch.isExamBased ? (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200">
                          Exam: {sch.examName || 'Entrance Exam'}
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                          Direct Merit / Means
                        </span>
                      )}
                      {item.applied && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Applied</span>
                        </span>
                      )}
                    </div>

                    <h3
                      onClick={() => onOpenDetails(sch)}
                      className="text-base sm:text-lg font-bold text-gray-900 hover:text-emerald-700 cursor-pointer transition-colors leading-snug"
                    >
                      {sch.name}
                    </h3>
                    <p className="text-xs text-gray-600">{sch.provider}</p>

                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-1 text-xs text-gray-700">
                      <div>
                        <span className="text-gray-500">Benefit: </span>
                        <span className="font-bold text-emerald-800">{sch.benefitAmount}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-gray-500">Deadline: </span>
                        {isUnannounced ? (
                          <span className="font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md text-[11px]">
                            Not announced yet
                          </span>
                        ) : (
                          <span className="font-bold text-gray-900">
                            {sch.lastDateToApply}
                            {sch.daysLeft !== undefined && (
                              <span
                                className={`ml-1.5 text-[11px] px-2 py-0.5 rounded-full font-bold ${
                                  sch.daysLeft <= 7
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {sch.daysLeft > 0 ? `${sch.daysLeft}d left` : 'Closes today'}
                              </span>
                            )}
                          </span>
                        )}
                      </div>

                      {item.lastChecked && (
                        <span className="text-[11px] text-gray-400">
                          Last checked on {item.lastChecked.split('T')[0]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-wrap sm:flex-col items-center sm:items-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <button
                      type="button"
                      onClick={() => onOpenDetails(sch)}
                      className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors cursor-pointer"
                    >
                      View Details
                    </button>

                    <div className="flex items-center gap-1.5">
                      {/* Remind Me button */}
                      <button
                        type="button"
                        onClick={() => setEditingScholarship(sch)}
                        className={`p-2 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                          hasReminders && !item.applied
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                        title="Configure Reminders"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span className="text-[11px] hidden sm:inline">
                          {item.applied ? 'Reminders off' : hasReminders ? 'Reminding' : 'Remind me'}
                        </span>
                      </button>

                      {/* Add to Calendar links */}
                      {!isUnannounced && (
                        <>
                          <a
                            href={googleCalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:text-blue-700 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                            title="Add to Google Calendar"
                          >
                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                          </a>
                          <button
                            type="button"
                            onClick={handleDownloadIcs}
                            className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Download .ics file"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-600" />
                          </button>
                        </>
                      )}

                      {/* Mark Applied */}
                      <button
                        type="button"
                        onClick={() => onToggleApplied(item.id, !item.applied)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                          item.applied
                            ? 'border-gray-300 text-gray-600 hover:bg-gray-100'
                            : 'border-emerald-500 text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {item.applied ? 'Applied ✓' : 'Mark as applied'}
                      </button>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        className="p-2 text-gray-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reminder Config Modal */}
      {editingScholarship && (
        <RemindMeModal
          isOpen={Boolean(editingScholarship)}
          onClose={() => setEditingScholarship(null)}
          scholarship={editingScholarship}
          initialReminders={
            savedItems.find((i) => i.id === editingScholarship.id)?.reminders
          }
          onSaveReminders={(rems) => {
            onUpdateReminders(editingScholarship.id, rems);
          }}
        />
      )}
    </div>
  );
};
