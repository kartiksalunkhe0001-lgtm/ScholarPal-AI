import React, { useState } from 'react';
import {
  Award,
  Clock,
  Target,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Bookmark,
  FileEdit,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { TestAttempt, MockTest } from '../types/index.ts';
import { MathText } from './MathText.tsx';
import { storage } from '../utils/storage.ts';

interface TestResultsViewProps {
  attempt: TestAttempt;
  mockTest: MockTest;
  onRetake: () => void;
  onNewVersion?: () => void;
  onBackToScholarship: () => void;
}

export const TestResultsView: React.FC<TestResultsViewProps> = ({
  attempt: initialAttempt,
  mockTest,
  onRetake,
  onNewVersion,
  onBackToScholarship,
}) => {
  const [attempt, setAttempt] = useState<TestAttempt>(initialAttempt);
  const [reviewFilter, setReviewFilter] = useState<
    'all' | 'wrong' | 'unattempted' | 'bookmarked' | 'notes'
  >('all');
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});

  const allQuestions = React.useMemo(() => {
    return mockTest.sections.flatMap((s) => s.questions);
  }, [mockTest]);

  const toggleSolution = (id: string) => {
    setExpandedSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Get attempts history for this scholarship (Requirement C5)
  const attemptsHistory = React.useMemo(() => {
    const list = storage.getAttempts();
    return list.filter((a) => a.scholarshipId === attempt.scholarshipId);
  }, [attempt.scholarshipId]);

  // Handle live updating of student notes
  const handleUpdateNote = (questionId: string, newNoteText: string) => {
    const updatedReviews = attempt.questionReviews.map((r) =>
      r.questionId === questionId ? { ...r, note: newNoteText.trim() } : r
    );
    const updatedNotesList = attempt.userNotes
      .filter((n) => n.questionId !== questionId)
      .concat(
        newNoteText.trim().length > 0
          ? [
              {
                questionNumber: allQuestions.findIndex((q) => q.id === questionId) + 1,
                questionId,
                note: newNoteText.trim(),
                question: allQuestions.find((q) => q.id === questionId),
              },
            ]
          : []
      );

    const updatedAttempt: TestAttempt = {
      ...attempt,
      questionReviews: updatedReviews,
      userNotes: updatedNotesList,
    };

    setAttempt(updatedAttempt);
    storage.saveAttempt(updatedAttempt);
  };

  const filteredQuestions = allQuestions.filter((q) => {
    const review = attempt.questionReviews.find((r) => r.questionId === q.id);
    if (!review) return true;

    if (reviewFilter === 'wrong') {
      return review.selectedOption !== null && !review.isCorrect;
    }
    if (reviewFilter === 'unattempted') {
      return review.selectedOption === null;
    }
    if (reviewFilter === 'bookmarked') {
      return review.bookmarked;
    }
    if (reviewFilter === 'notes') {
      return review.note.trim().length > 0;
    }
    return true;
  });

  const avgTimePerQuestion =
    allQuestions.length > 0
      ? Math.round(attempt.totalTimeSeconds / allQuestions.length)
      : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Top Banner with Score and Accuracy */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-800 mb-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Evaluation Report
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {attempt.scholarshipName}
            </h1>
            <p className="text-emerald-100/70 text-xs sm:text-sm mt-1">
              Completed on {new Date(attempt.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}
            </p>
          </div>

          {/* Big Score Card */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
            <div className="text-center">
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                Total Score
              </span>
              <span className="text-3xl sm:text-4xl font-black text-white">
                {attempt.score}{' '}
                <span className="text-lg text-emerald-200 font-semibold">/ {attempt.maxScore}</span>
              </span>
              <span className="text-[10px] text-emerald-200 block mt-0.5">
                (Negative marking applied)
              </span>
            </div>

            <div className="w-px h-12 bg-white/20" />

            <div className="text-center">
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                Accuracy
              </span>
              <span className="text-3xl sm:text-4xl font-black text-emerald-300">
                {attempt.accuracy}%
              </span>
              <span className="text-[10px] text-emerald-200 block mt-0.5">Precision rate</span>
            </div>
          </div>
        </div>

        {/* 4 Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/10 text-center">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-xs text-emerald-200 font-medium block">Correct</span>
            <span className="text-xl font-bold text-emerald-400 mt-0.5 block">
              {attempt.correctCount} Qs
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-xs text-rose-200 font-medium block">Incorrect</span>
            <span className="text-xl font-bold text-rose-400 mt-0.5 block">
              {attempt.wrongCount} Qs
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-xs text-amber-200 font-medium block">Unattempted</span>
            <span className="text-xl font-bold text-amber-400 mt-0.5 block">
              {attempt.unattemptedCount} Qs
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-xs text-slate-200 font-medium block">Total Time</span>
            <span className="text-xl font-bold text-white mt-0.5 block">
              {Math.floor(attempt.totalTimeSeconds / 60)}m {attempt.totalTimeSeconds % 60}s
            </span>
          </div>
        </div>
      </div>

      {/* AI Improvement Plan Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-200 mb-8">
        <h2 className="text-base font-extrabold text-slate-900 mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          ScholarPal AI Personal Improvement Strategy
        </h2>
        <div className="space-y-2">
          {attempt.aiImprovementPlan.map((plan, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-3"
            >
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="text-xs sm:text-sm text-emerald-950 font-medium leading-relaxed">
                {plan}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Section & Topic Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Section Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            Section-Wise Performance
          </h3>
          <div className="space-y-4">
            {attempt.sectionAnalysis.map((sec, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                  <span>{sec.sectionName}</span>
                  <span className="text-emerald-700">
                    {sec.score} / {sec.maxScore} Marks ({sec.accuracy}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, sec.accuracy))}%` }}
                  />
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  Time spent: {Math.floor(sec.timeSeconds / 60)}m {sec.timeSeconds % 60}s
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Topic Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-600" />
            Topic-Wise Strengths & Weaknesses
          </h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {attempt.topicAnalysis.map((top, idx) => {
              const pct = top.total > 0 ? Math.round((top.correct / top.total) * 100) : 0;
              const isWeak = pct < 60;

              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{top.topic}</span>
                    <span className="text-[11px] text-slate-400">{top.subject}</span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                        isWeak ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {top.correct} / {top.total} ({pct}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Time Analysis Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            Time Analysis Per Question
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Average: {avgTimePerQuestion}s per question
          </span>
        </div>

        {/* Time flags summary */}
        <div className="flex flex-wrap gap-2 mb-4">
          {attempt.timeAnalysis.map((t) => (
            <div
              key={t.questionId}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 ${
                t.isUnusuallyLong
                  ? 'bg-rose-50 text-rose-700 border-rose-300'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <span>Q{t.questionNumber}:</span>
              <span>{t.timeSeconds}s</span>
              {t.isUnusuallyLong && <AlertTriangle className="w-3 h-3 text-rose-500" />}
            </div>
          ))}
        </div>
      </div>

      {/* Question Review Section with Filter Tabs */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-6">
          <h2 className="text-lg font-black text-slate-900">
            Question-by-Question Detailed Review
          </h2>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-1.5 text-xs font-bold">
            {(
              [
                { id: 'all', label: `All (${allQuestions.length})` },
                { id: 'wrong', label: `Wrong (${attempt.wrongCount})` },
                { id: 'unattempted', label: `Skipped (${attempt.unattemptedCount})` },
                { id: 'bookmarked', label: `Bookmarked (${attempt.bookmarkedQuestionIds.length})` },
                { id: 'notes', label: `With Notes (${attempt.userNotes.length})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setReviewFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  reviewFilter === tab.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Questions list */}
        <div className="space-y-6">
          {filteredQuestions.map((q, idx) => {
            const review = attempt.questionReviews.find((r) => r.questionId === q.id);
            const userAns = review?.selectedOption;
            const isCorrect = review?.isCorrect;
            const hasAns = userAns !== null && userAns !== undefined;
            const isExpanded = Boolean(expandedSolutions[q.id]);

            return (
              <div
                key={q.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3"
              >
                {/* Meta info */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      Q{allQuestions.indexOf(q) + 1}
                    </span>
                    <span className="font-semibold text-slate-500">{q.topic}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasAns ? (
                      isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 font-bold px-2.5 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+{q.marks})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 font-bold px-2.5 py-0.5 rounded-md">
                          <XCircle className="w-3.5 h-3.5" /> Wrong (-{q.negativeMarks})
                        </span>
                      )
                    ) : (
                      <span className="text-amber-700 bg-amber-50 font-bold px-2.5 py-0.5 rounded-md">
                        Unattempted (0)
                      </span>
                    )}

                    <span className="text-slate-400 font-mono">
                      {review?.timeSeconds || 0}s spent
                    </span>
                  </div>
                </div>

                {/* Problem text */}
                <div className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                  <MathText text={q.questionText} />
                </div>

                {/* Options display */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  {q.options.map((opt, oIdx) => {
                    const isUserChoice = userAns === oIdx;
                    const isRightChoice = q.correctOptionIndex === oIdx;

                    let badge = 'border-slate-200 bg-slate-50 text-slate-700';
                    if (isRightChoice) {
                      badge = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                    } else if (isUserChoice && !isRightChoice) {
                      badge = 'border-rose-400 bg-rose-50 text-rose-950 font-semibold';
                    }

                    return (
                      <div
                        key={oIdx}
                        className={`p-3 rounded-xl border flex items-start gap-2.5 ${badge}`}
                      >
                        <span className="font-bold">{String.fromCharCode(65 + oIdx)}.</span>
                        <div className="flex-1">
                          <MathText text={opt} />
                          {isRightChoice && (
                            <span className="text-[10px] text-emerald-700 font-bold ml-1.5">
                              ✓ (Correct Answer)
                            </span>
                          )}
                          {isUserChoice && !isRightChoice && (
                            <span className="text-[10px] text-rose-600 font-bold ml-1.5">
                              ✗ (Your Choice)
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Note display and inline editor (Requirement A6) */}
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold flex items-center gap-1.5 text-amber-900">
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>My Note:</span>
                    </span>
                    <button
                      onClick={() => {
                        const newNote = prompt('Edit your note for this question:', review?.note || '');
                        if (newNote !== null) {
                          handleUpdateNote(q.id, newNote);
                        }
                      }}
                      className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline"
                    >
                      {review?.note ? 'Edit Note' : '+ Add Note'}
                    </button>
                  </div>
                  <p className="italic text-slate-800">
                    {review?.note || 'No notes added yet for this question. Tap "+ Add Note" to save formulas or key insights.'}
                  </p>
                </div>

                {/* Step-by-step Solution Accordion */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => toggleSolution(q.id)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <span>{isExpanded ? 'Hide Solution' : 'View Step-by-Step Solution'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                      <MathText text={q.explanation} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Score History & Progress Trend across Attempts (Requirement C5) */}
      {attemptsHistory.length > 1 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-8">
          <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Score History & Improvement Trend
          </h3>
          <div className="space-y-3">
            {attemptsHistory.slice(0, 5).map((hist, hIdx) => (
              <div key={hist.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">
                    Attempt #{attemptsHistory.length - hIdx}
                  </span>
                  <span className="text-slate-400 ml-2">
                    {new Date(hist.date).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-emerald-700">
                    {hist.score} / {hist.maxScore} M
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                    {hist.accuracy}% Acc
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Navigation CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          onClick={onBackToScholarship}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm shadow-xs min-h-[44px]"
        >
          Return to Scholarship Details
        </button>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={onRetake}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border-2 border-emerald-600 bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-1.5 min-h-[44px]"
            title="Retake this exact test without calling AI"
          >
            <RotateCcw className="w-4 h-4 text-emerald-600" />
            <span>Retake This Test</span>
          </button>

          {onNewVersion && (
            <button
              onClick={onNewVersion}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5 min-h-[44px]"
              title="Generate fresh AI questions"
            >
              <Sparkles className="w-4 h-4" />
              <span>New Version (New AI Questions)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
