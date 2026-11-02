import React, { useState } from 'react';
import {
  History,
  Award,
  Clock,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  Bookmark,
  FileEdit,
  Trash2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { TestAttempt, MockQuestion } from '../types/index.ts';
import { MathText } from './MathText.tsx';
import { storage } from '../utils/storage.ts';

interface MyTestsViewProps {
  attempts: TestAttempt[];
  onSelectAttempt: (attempt: TestAttempt) => void;
  onNavigateHome: () => void;
  initialTab?: 'tests' | 'bookmarks' | 'notes';
}

export const MyTestsView: React.FC<MyTestsViewProps> = ({
  attempts,
  onSelectAttempt,
  onNavigateHome,
  initialTab = 'tests',
}) => {
  const [activeTab, setActiveTab] = useState<'tests' | 'bookmarks' | 'notes'>(initialTab);
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});

  const toggleSolution = (id: string) => {
    setExpandedSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Collate all bookmarked questions across all attempts (Requirement A6)
  const allBookmarks = React.useMemo(() => {
    const list: {
      question: MockQuestion;
      scholarshipName: string;
      testDate: string;
      userNote?: string;
    }[] = [];

    attempts.forEach((att) => {
      att.questionReviews.forEach((review) => {
        if (review.bookmarked && review.question) {
          list.push({
            question: review.question,
            scholarshipName: att.scholarshipName,
            testDate: att.date,
            userNote: review.note,
          });
        }
      });
    });
    return list;
  }, [attempts]);

  // Collate all notes across all attempts (Requirement A6)
  const allNotes = React.useMemo(() => {
    const list: {
      questionId: string;
      questionNumber: number;
      note: string;
      question?: MockQuestion;
      scholarshipName: string;
      testDate: string;
      attemptId: string;
    }[] = [];

    attempts.forEach((att) => {
      att.userNotes.forEach((un) => {
        if (un.note && un.note.trim().length > 0) {
          list.push({
            questionId: un.questionId,
            questionNumber: un.questionNumber,
            note: un.note,
            question: un.question,
            scholarshipName: att.scholarshipName,
            testDate: att.date,
            attemptId: att.id,
          });
        }
      });
    });
    return list;
  }, [attempts]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-600" />
            Learning Dashboard & Test History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review detailed question solutions, time spent, and personal thinking notes.
          </p>
        </div>

        <button
          onClick={onNavigateHome}
          className="self-start sm:self-auto text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 transition-colors"
        >
          Find More Tests
        </button>
      </div>

      {/* Tabs Header (Requirement A6) */}
      <div className="flex border-b border-slate-200 mb-6 space-x-2 text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('tests')}
          className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'tests'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4 text-emerald-600" />
          <span>Past Attempts ({attempts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'bookmarks'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bookmark className="w-4 h-4 text-amber-500" />
          <span>Bookmarked Questions ({allBookmarks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'notes'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileEdit className="w-4 h-4 text-teal-600" />
          <span>My Notes ({allNotes.length})</span>
        </button>
      </div>

      {/* TAB 1: PAST TEST ATTEMPTS */}
      {activeTab === 'tests' && (
        <>
          {attempts.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 my-6 shadow-sm">
              <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No test attempts yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                Take an AI practice mock test for any verified exam-based scholarship to track your performance.
              </p>
              <button
                onClick={onNavigateHome}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700"
              >
                Explore Scholarships
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {attempts.map((att) => (
                <div
                  key={att.id}
                  onClick={() => onSelectAttempt(att)}
                  className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Completed
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 mt-1">
                      {att.scholarshipName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>
                        📅 {new Date(att.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </span>
                      <span>•</span>
                      <span>⏱️ {Math.floor(att.totalTimeSeconds / 60)} mins</span>
                      <span>•</span>
                      <span>⭐ {att.bookmarkedQuestionIds?.length || 0} bookmarks</span>
                      <span>•</span>
                      <span>📝 {att.userNotes?.length || 0} notes</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:border-l sm:border-slate-100 sm:pl-6">
                    <div className="text-left sm:text-right">
                      <span className="text-lg font-black text-slate-900 block">
                        {att.score} / {att.maxScore}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 block">
                        {att.accuracy}% Accuracy
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 2: BOOKMARKED QUESTIONS (Requirement A6) */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-4">
          {allBookmarks.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
              <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Bookmarked Questions Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                While taking a practice test or reviewing results, tap the Bookmark icon on any tricky question to save it here for quick revision.
              </p>
            </div>
          ) : (
            allBookmarks.map((item, bIdx) => {
              const q = item.question;
              const isExpanded = Boolean(expandedSolutions[q.id]);
              return (
                <div key={bIdx} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-extrabold text-emerald-700">{item.scholarshipName}</span>
                    <span>{new Date(item.testDate).toLocaleDateString('en-IN')}</span>
                  </div>

                  <div className="text-sm font-bold text-slate-900">
                    <MathText text={q.questionText} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                          oIdx === q.correctOptionIndex
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold'
                            : 'border-slate-200 bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="font-bold">{String.fromCharCode(65 + oIdx)}.</span>
                        <MathText text={opt} />
                      </div>
                    ))}
                  </div>

                  {item.userNote && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                      <strong>My Note:</strong> {item.userNote}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => toggleSolution(q.id)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'Hide Solution' : 'View Step-by-Step Solution'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 font-medium">
                      <MathText text={q.explanation} />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: MY NOTES (Requirement A6) */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          {allNotes.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
              <FileEdit className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Personal Notes Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                You can write notes during or after any mock test to remember formulas, error causes, or revision tips.
              </p>
            </div>
          ) : (
            allNotes.map((item, nIdx) => (
              <div key={nIdx} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-extrabold text-emerald-700">{item.scholarshipName}</span>
                  <span>{new Date(item.testDate).toLocaleDateString('en-IN')}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
                  <strong className="block text-amber-900 text-xs uppercase tracking-wider mb-1 font-bold">
                    Note:
                  </strong>
                  {item.note}
                </div>

                {item.question && (
                  <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Related Question:
                    </span>
                    <MathText text={item.question.questionText} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
