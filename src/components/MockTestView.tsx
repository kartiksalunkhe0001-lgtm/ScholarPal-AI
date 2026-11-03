import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Bookmark,
  BookmarkCheck,
  FileEdit,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Send,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  ListFilter,
  X,
} from 'lucide-react';
import { MockTest, MockQuestion } from '../types/index.ts';
import { MathText } from './MathText.tsx';

interface MockTestViewProps {
  mockTest: MockTest;
  onFinishTest: (
    answers: Record<string, number>,
    timeSpent: Record<string, number>,
    bookmarks: Record<string, boolean>,
    notes: Record<string, string>
  ) => void;
  onExitTest: () => void;
}

export const MockTestView: React.FC<MockTestViewProps> = ({
  mockTest,
  onFinishTest,
  onExitTest,
}) => {
  const allQuestions: MockQuestion[] = React.useMemo(() => {
    return mockTest.sections.flatMap((s) => s.questions);
  }, [mockTest]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Storage key for auto-saving in-progress state
  const testStorageKey = `mock_progress_${mockTest.id}`;

  // State
  const [answers, setAnswers] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(testStorageKey);
      return saved ? JSON.parse(saved).answers || {} : {};
    } catch {
      return {};
    }
  });

  const [timeSpent, setTimeSpent] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(testStorageKey);
      return saved ? JSON.parse(saved).timeSpent || {} : {};
    } catch {
      return {};
    }
  });

  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(testStorageKey);
      return saved ? JSON.parse(saved).bookmarks || {} : {};
    } catch {
      return {};
    }
  });

  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(testStorageKey);
      return saved ? JSON.parse(saved).notes || {} : {};
    } catch {
      return {};
    }
  });

  const [visited, setVisited] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(testStorageKey);
      return saved ? JSON.parse(saved).visited || { [allQuestions[0]?.id]: true } : { [allQuestions[0]?.id]: true };
    } catch {
      return { [allQuestions[0]?.id]: true };
    }
  });

  // Countdown timer in seconds
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(testStorageKey);
      return saved ? JSON.parse(saved).secondsRemaining || mockTest.durationMinutes * 60 : mockTest.durationMinutes * 60;
    } catch {
      return mockTest.durationMinutes * 60;
    }
  });

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNoteText, setCurrentNoteText] = useState('');
  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false);

  const activeQuestion = allQuestions[currentIndex] || allQuestions[0];

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        testStorageKey,
        JSON.stringify({
          answers,
          timeSpent,
          bookmarks,
          notes,
          visited,
          secondsRemaining,
        })
      );
    } catch (e) {
      // ignore quota errors
    }
  }, [answers, timeSpent, bookmarks, notes, visited, secondsRemaining, testStorageKey]);

  // Overall Countdown and per-question background time measurement
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit when time hits zero
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });

      // Increment time for the currently viewed question in background
      if (activeQuestion) {
        setTimeSpent((prev) => ({
          ...prev,
          [activeQuestion.id]: (prev[activeQuestion.id] || 0) + 1,
        }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeQuestion]);

  // Mark current as visited
  useEffect(() => {
    if (activeQuestion) {
      setVisited((prev) => ({ ...prev, [activeQuestion.id]: true }));
      setCurrentNoteText(notes[activeQuestion.id] || '');
    }
  }, [currentIndex, activeQuestion, notes]);

  const handleSelectOption = (optIndex: number) => {
    setAnswers((prev) => ({ ...prev, [activeQuestion.id]: optIndex }));
  };

  const handleClearResponse = () => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[activeQuestion.id];
      return next;
    });
  };

  const handleToggleBookmark = () => {
    setBookmarks((prev) => ({
      ...prev,
      [activeQuestion.id]: !prev[activeQuestion.id],
    }));
  };

  const handleSaveNote = () => {
    setNotes((prev) => ({
      ...prev,
      [activeQuestion.id]: currentNoteText,
    }));
    setShowNoteModal(false);
  };

  const handleFinalSubmit = () => {
    try {
      localStorage.removeItem(testStorageKey);
    } catch {}
    onFinishTest(answers, timeSpent, bookmarks, notes);
  };

  // Format seconds mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const bookmarkedCount = Object.values(bookmarks).filter(Boolean).length;
  const unattemptedCount = allQuestions.length - answeredCount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Test Header with Timer & Quick Actions */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-6 flex flex-wrap items-center justify-between gap-3 sticky top-20 z-30">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Practice Test
          </span>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 line-clamp-1">
            {mockTest.scholarshipName}
          </h2>
        </div>

        {/* Middle: Timer & Auto-submit indicator */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-black text-base sm:text-lg border ${
            secondsRemaining < 300
              ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
              : 'bg-slate-900 text-emerald-400 border-slate-800'
          }`}
        >
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>{formatTime(secondsRemaining)}</span>
        </div>

        {/* Right side: Palette toggle on mobile and Submit button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobilePaletteOpen(true)}
            className="lg:hidden p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1"
          >
            <ListFilter className="w-4 h-4" />
            <span>Palette</span>
          </button>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center gap-1.5 min-h-[40px]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Test</span>
          </button>
        </div>
      </div>

      {/* Banner for unannounced or typical pattern */}
      {mockTest.banner && (
        <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <div className="font-bold">{mockTest.banner}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Question Panel (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200">
            {/* Question Meta Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                  Question {currentIndex + 1} of {allQuestions.length}
                </span>
                <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                  {activeQuestion.sectionName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-sm border border-slate-200">
                  Topic: {activeQuestion.topic}
                </span>
                <span className="text-[11px] font-bold text-slate-600">
                  +{activeQuestion.marks} / -{activeQuestion.negativeMarks} Marks
                </span>
              </div>
            </div>

            {/* Question Text with KaTeX math rendering */}
            <div className="py-6 text-slate-900 text-base sm:text-lg font-medium leading-relaxed">
              <MathText text={activeQuestion.questionText} />
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {activeQuestion.options.map((opt, optIdx) => {
                const isSelected = answers[activeQuestion.id] === optIdx;
                const optionLabel = String.fromCharCode(65 + optIdx); // A, B, C, D

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3.5 min-h-[52px] ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-400'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {optionLabel}
                    </span>
                    <span className="text-sm sm:text-base font-semibold leading-snug flex-1">
                      <MathText text={opt} />
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions: Clear, Bookmark, Add Note */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                {answers[activeQuestion.id] !== undefined && (
                  <button
                    onClick={handleClearResponse}
                    className="py-2 px-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Response</span>
                  </button>
                )}

                <button
                  onClick={handleToggleBookmark}
                  className={`py-2 px-3 rounded-xl border font-bold flex items-center gap-1.5 transition-colors ${
                    bookmarks[activeQuestion.id]
                      ? 'bg-purple-100 text-purple-800 border-purple-300'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {bookmarks[activeQuestion.id] ? (
                    <BookmarkCheck className="w-3.5 h-3.5 text-purple-700" />
                  ) : (
                    <Bookmark className="w-3.5 h-3.5" />
                  )}
                  <span>{bookmarks[activeQuestion.id] ? 'Bookmarked' : 'Bookmark'}</span>
                </button>

                <button
                  onClick={() => setShowNoteModal(true)}
                  className={`py-2 px-3 rounded-xl border font-bold flex items-center gap-1.5 transition-colors ${
                    notes[activeQuestion.id]
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>{notes[activeQuestion.id] ? 'Edit Note' : 'Add Note'}</span>
                </button>
              </div>

              {/* Prev / Next */}
              <div className="flex items-center gap-2">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  disabled={currentIndex === allQuestions.length - 1}
                  onClick={() =>
                    setCurrentIndex((prev) => Math.min(allQuestions.length - 1, prev + 1))
                  }
                  className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Note Preview if present */}
            {notes[activeQuestion.id] && (
              <div className="mt-4 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                <span className="font-bold">Your Thinking Note:</span> {notes[activeQuestion.id]}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Question Palette & Status Summary (1 col) */}
        <div className="hidden lg:block space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
            <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider mb-3">
              Question Palette
            </h3>

            {/* Palette legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-600 mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-600" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span>Skipped ({unattemptedCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-purple-500" />
                <span>Bookmarked ({bookmarkedCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-200" />
                <span>Not Visited</span>
              </div>
            </div>

            {/* Question buttons grid */}
            <div className="grid grid-cols-5 gap-2 max-h-[360px] overflow-y-auto p-1">
              {allQuestions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = answers[q.id] !== undefined;
                const isBookmarked = Boolean(bookmarks[q.id]);
                const isVisited = Boolean(visited[q.id]);

                let bgClass = 'bg-slate-100 text-slate-600 hover:bg-slate-200';
                if (isBookmarked) {
                  bgClass = 'bg-purple-500 text-white font-bold';
                } else if (isAnswered) {
                  bgClass = 'bg-emerald-600 text-white font-bold';
                } else if (isVisited) {
                  bgClass = 'bg-amber-100 text-amber-900 font-bold border border-amber-300';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-xl text-xs flex items-center justify-center transition-all ${bgClass} ${
                      isCurrent ? 'ring-2 ring-emerald-500 scale-105 shadow-xs' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Exit test safely */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      'Are you sure you want to pause or exit? Your answers are auto-saved and you can resume anytime.'
                    )
                  ) {
                    onExitTest();
                  }
                }}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Exit to Scholarship
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Palette Drawer */}
      {mobilePaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-base text-slate-900">Question Palette</h3>
              <button
                onClick={() => setMobilePaletteOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {allQuestions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = answers[q.id] !== undefined;
                const isBookmarked = Boolean(bookmarks[q.id]);
                const isVisited = Boolean(visited[q.id]);

                let bgClass = 'bg-slate-100 text-slate-600';
                if (isBookmarked) bgClass = 'bg-purple-500 text-white font-bold';
                else if (isAnswered) bgClass = 'bg-emerald-600 text-white font-bold';
                else if (isVisited)
                  bgClass = 'bg-amber-100 text-amber-900 font-bold border border-amber-300';

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setMobilePaletteOpen(false);
                    }}
                    className={`h-10 rounded-xl text-xs flex items-center justify-center ${bgClass} ${
                      isCurrent ? 'ring-2 ring-emerald-500 font-black' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Note modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100">
            <h3 className="font-extrabold text-base text-slate-900 mb-1">
              Add Personal Note for Question {currentIndex + 1}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Type your rough thinking, doubt, or reminder to review later.
            </p>

            <textarea
              rows={4}
              value={currentNoteText}
              onChange={(e) => setCurrentNoteText(e.target.value)}
              placeholder="e.g. Check formula derivation, eliminate option C first..."
              className="w-full p-3.5 rounded-2xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />

            <div className="mt-4 flex justify-end gap-2 text-xs font-bold">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Submit Dialog */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 mb-2">
              Ready to submit your practice test?
            </h3>
            <p className="text-xs text-slate-600 mb-6">
              Review your progress summary before final evaluation.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-6 text-center">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-lg font-black text-emerald-800 block">{answeredCount}</span>
                <span className="text-[11px] font-bold text-emerald-700">Answered</span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-lg font-black text-amber-800 block">
                  {unattemptedCount}
                </span>
                <span className="text-[11px] font-bold text-amber-700">Unanswered</span>
              </div>
              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200">
                <span className="text-lg font-black text-purple-800 block">{bookmarkedCount}</span>
                <span className="text-[11px] font-bold text-purple-700">Bookmarked</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="w-1/2 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Continue Test
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  handleFinalSubmit();
                }}
                className="w-1/2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/30"
              >
                Yes, Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
