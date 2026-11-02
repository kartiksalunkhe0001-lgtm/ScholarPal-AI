import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  Clock,
  Sparkles,
} from 'lucide-react';
import { AiDiagnosticResult } from '../types/index.ts';

interface AiDiagnosticsViewProps {
  onBack: () => void;
}

export const AiDiagnosticsView: React.FC<AiDiagnosticsViewProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [results, setResults] = useState<AiDiagnosticResult[]>([]);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [expandedErrors, setExpandedErrors] = useState<Record<string, boolean>>({});
  const [expandedPreviews, setExpandedPreviews] = useState<Record<string, boolean>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const fetchDiagnostics = async (specificTestId?: 'plain' | 'search' | 'json' | 'search_json') => {
    if (specificTestId) {
      setTestingId(specificTestId);
    } else {
      setLoading(true);
      setResults([]);
    }
    setGeneralError(null);

    try {
      const res = await fetch('/api/ai/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(specificTestId ? { testId: specificTestId } : {}),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setLastChecked(new Date(data.timestamp || Date.now()).toLocaleTimeString());

      if (specificTestId && data.results?.[0]) {
        setResults((prev) => {
          const index = prev.findIndex((r) => r.id === specificTestId);
          if (index >= 0) {
            const next = [...prev];
            next[index] = data.results[0];
            return next;
          }
          return [...prev, data.results[0]];
        });
      } else if (Array.isArray(data.results)) {
        setResults(data.results);
      }
    } catch (err: any) {
      setGeneralError(err?.message || 'Failed to connect to /api/ai/diagnostics endpoint');
    } finally {
      setLoading(false);
      setTestingId(null);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const toggleError = (id: string) => {
    setExpandedErrors((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const togglePreview = (id: string) => {
    setExpandedPreviews((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const passCount = results.filter((r) => r.status === 'PASS').length;
  const failCount = results.filter((r) => r.status === 'FAIL').length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-emerald-700 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to ScholarPal Home</span>
        </button>

        <div className="flex items-center gap-2">
          {lastChecked && (
            <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
              Last run: {lastChecked}
            </span>
          )}
          <button
            onClick={() => fetchDiagnostics()}
            disabled={loading || Boolean(testingId)}
            className="inline-flex items-center gap-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Running Live Tests...' : 'Re-run All 4 Tests'}</span>
          </button>
        </div>
      </div>

      {/* Main Title Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 border border-emerald-500/20">
        <div className="flex items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold uppercase tracking-wider mb-2 border border-emerald-400/30">
              <Activity className="w-3.5 h-3.5" />
              <span>AI System Diagnostics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Check AI Connection</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Live server-side health check testing 4 real Gemini 3 call pathways: Plain call, Google Search grounding, JSON Schema, and Hybrid Search + JSON.
            </p>
          </div>

          <div className="p-3 bg-white/10 rounded-2xl hidden md:block">
            <Cpu className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        {/* Status Counter Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <div className="text-slate-400 font-medium">Primary Model</div>
            <div className="text-sm font-extrabold text-emerald-300 mt-0.5">gemini-3.8-flash</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <div className="text-slate-400 font-medium">Fallback Model</div>
            <div className="text-sm font-extrabold text-teal-300 mt-0.5">gemini-3.6-flash</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <div className="text-slate-400 font-medium">Passed Tests</div>
            <div className="text-sm font-extrabold text-emerald-400 mt-0.5">{passCount} / 4</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <div className="text-slate-400 font-medium">Failed Tests</div>
            <div className="text-sm font-extrabold text-rose-400 mt-0.5">{failCount} / 4</div>
          </div>
        </div>
      </div>

      {/* Security Privacy Notice */}
      <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 mb-6 text-xs text-emerald-900 flex items-start sm:items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5 sm:mt-0" />
        <div className="leading-relaxed">
          <strong>Privacy & Security Guarantee:</strong> All tests run exclusively on the server backend through the <code className="bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-mono text-[11px]">GEMINI_API_KEY</code> secret. The secret key is never sent to or displayed in the browser. Error messages are strictly scrubbed of credentials.
        </div>
      </div>

      {/* General Error Banner */}
      {generalError && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 mb-6 text-rose-900">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Connection Failure</span>
          </div>
          <p className="text-xs text-rose-700 mt-1">{generalError}</p>
          <button
            onClick={() => fetchDiagnostics()}
            className="mt-3 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
          >
            Retry Diagnostics
          </button>
        </div>
      )}

      {/* Test Results List */}
      <div className="space-y-4">
        {loading && results.length === 0 && (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Running 4 Live Connection Tests...</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Testing plain text, search grounding, structured JSON schema, and hybrid fallback pipeline against Gemini API.
            </p>
          </div>
        )}

        {results.map((test) => {
          const isPassed = test.status === 'PASS';
          const isExpandedError = Boolean(expandedErrors[test.id]);
          const isExpandedPreview = Boolean(expandedPreviews[test.id]);
          const isCurrentTesting = testingId === test.id;

          return (
            <div
              key={test.id}
              className={`bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border transition-all shadow-sm ${
                isPassed ? 'border-emerald-200 hover:border-emerald-300' : 'border-rose-200 hover:border-rose-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {isPassed ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900">{test.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                      {test.modelUsed && (
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          Model: {test.modelUsed}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {test.durationMs} ms
                      </span>
                      {test.pipelineDetails && (
                        <span className="text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-md">
                          {test.pipelineDetails}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      isPassed
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {test.status}
                  </span>

                  <button
                    onClick={() => fetchDiagnostics(test.id)}
                    disabled={isCurrentTesting || loading}
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-200"
                    title="Re-test this specific pathway"
                    aria-label={`Re-test ${test.name}`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCurrentTesting ? 'animate-spin text-emerald-600' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Success Result Preview */}
              {isPassed && test.resultPreview && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                    <span className="font-bold">Live Output Preview:</span>
                    <button
                      onClick={() => togglePreview(test.id)}
                      className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpandedPreview ? 'Hide response' : 'Show full response'}</span>
                      {isExpandedPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-xs text-slate-800 overflow-x-auto">
                    {isExpandedPreview ? test.resultPreview : test.resultPreview.slice(0, 120) + (test.resultPreview.length > 120 ? '...' : '')}
                  </div>

                  {test.sources && test.sources.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-slate-600">Grounded Sources:</span>
                      {test.sources.map((src, i) => (
                        <a
                          key={i}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 hover:underline inline-flex items-center gap-1 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100"
                        >
                          <span>{src.title}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Exact Error Details for FAIL (Requirement 1 & 8) */}
              {!isPassed && test.error && (
                <div className="mt-4 pt-4 border-t border-rose-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-1.5 text-rose-700 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Failure Reason (API Key Redacted)</span>
                    </div>

                    <button
                      onClick={() => toggleError(test.id)}
                      className="text-xs font-bold text-rose-700 hover:text-rose-800 flex items-center gap-1 cursor-pointer underline"
                    >
                      <span>{isExpandedError ? 'Hide full details' : 'Show exact error details'}</span>
                      {isExpandedError ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-3 font-mono text-[11px] sm:text-xs text-rose-900 overflow-x-auto leading-relaxed">
                    {isExpandedError ? test.error : test.error.slice(0, 160) + (test.error.length > 160 ? '...' : '')}
                  </div>

                  <div className="mt-2 text-[11px] text-slate-500">
                    {test.error.includes('429') && 'Suggestion: Quota limit reached on Free Tier. ScholarPal automatically uses its verified offline catalog and 2-step pipeline so students never face downtime.'}
                    {test.error.includes('503') && 'Suggestion: Gemini 3.8 is experiencing high-demand spikes. ScholarPal automatically retries with backoff and falls back to gemini-3.6-flash.'}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          Need help? If Gemini 3 is experiencing temporary demand spikes, ScholarPal AI uses its master verified database of 150+ scholarships.
        </div>
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-xs shrink-0"
        >
          Return to ScholarPal
        </button>
      </div>
    </div>
  );
};
