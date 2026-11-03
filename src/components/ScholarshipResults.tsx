import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  ArrowUpDown,
  BookOpen,
  Award,
  AlertCircle,
  Edit3,
  ExternalLink,
  Search,
  CheckCircle2,
  X,
  RotateCcw,
  Globe,
  Compass,
  Heart,
  Bell,
  AlertTriangle,
} from 'lucide-react';
import { Scholarship, ChanceLevel, EducationLevel } from '../types/index.ts';
import { calculateFacetCounts, filterAndRankScholarships } from '../utils/rules.ts';
import { SCHOLARSHIP_CATALOG } from '../data/scholarshipCatalog.ts';

interface ScholarshipResultsProps {
  scholarships: Scholarship[];
  loading: boolean;
  error?: string | null;
  onRetry: () => void;
  onSelectScholarship: (scholarship: Scholarship) => void;
  onEditProfile: () => void;
  onOfficialSearch?: (query: string) => void;
  savedScholarshipIds?: string[];
  onToggleSave?: (scholarship: Scholarship) => void;
  onOpenRemindMe?: (scholarship: Scholarship) => void;
  isLiveCheckUnavailable?: boolean;
}

export const ScholarshipResults: React.FC<ScholarshipResultsProps> = ({
  scholarships,
  loading,
  error,
  onRetry,
  onSelectScholarship,
  onEditProfile,
  onOfficialSearch,
  savedScholarshipIds = [],
  onToggleSave,
  onOpenRemindMe,
  isLiveCheckUnavailable = false,
}) => {
  // Tab: 'matched' vs 'catalog' (Requirement C1)
  const [activeTab, setActiveTab] = useState<'matched' | 'catalog'>('matched');

  // Master list of all results - filters NEVER overwrite this state (Bug A2 Fix)
  const allResults = useMemo(() => {
    if (activeTab === 'catalog') {
      return SCHOLARSHIP_CATALOG;
    }
    return scholarships && scholarships.length > 0 ? scholarships : SCHOLARSHIP_CATALOG;
  }, [activeTab, scholarships]);

  // Independent multi-group filter states
  const [selectedExamTypes, setSelectedExamTypes] = useState<('exam' | 'no-exam')[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<('Central' | 'State' | 'Private')[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<EducationLevel[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<('open' | 'upcoming')[]>([]);
  const [sortBy, setSortBy] = useState<'chance' | 'deadline' | 'amount'>('chance');

  // Debounced search query (Bug A3 Fix)
  const [rawSearchQuery, setRawSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(rawSearchQuery.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [rawSearchQuery]);

  // Pagination / Load More state (Bug A2 Fix: up to 40 scholarships with Load More)
  const [visibleCount, setVisibleCount] = useState(12);
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  // Reset visibleCount when filters or tab change
  useEffect(() => {
    setVisibleCount(12);
  }, [selectedExamTypes, selectedProviders, selectedLevels, selectedStatuses, sortBy, debouncedSearchQuery, activeTab]);

  // Toggle helpers for multi-select inside a group (OR inside group, AND between groups)
  const toggleExamType = (type: 'exam' | 'no-exam') => {
    setSelectedExamTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleProvider = (prov: 'Central' | 'State' | 'Private') => {
    setSelectedProviders((prev) =>
      prev.includes(prov) ? prev.filter((p) => p !== prov) : [...prev, prov]
    );
  };

  const toggleLevel = (lvl: EducationLevel) => {
    setSelectedLevels((prev) =>
      prev.includes(lvl) ? prev.filter((l) => l !== lvl) : [...prev, lvl]
    );
  };

  const toggleStatus = (st: 'open' | 'upcoming') => {
    setSelectedStatuses((prev) =>
      prev.includes(st) ? prev.filter((s) => s !== st) : [...prev, st]
    );
  };

  const clearAllFilters = () => {
    setSelectedExamTypes([]);
    setSelectedProviders([]);
    setSelectedLevels([]);
    setSelectedStatuses([]);
    setRawSearchQuery('');
    setDebouncedSearchQuery('');
    setSortBy('chance');
  };

  const hasActiveFilters =
    selectedExamTypes.length > 0 ||
    selectedProviders.length > 0 ||
    selectedLevels.length > 0 ||
    selectedStatuses.length > 0 ||
    debouncedSearchQuery.length > 0;

  // Calculate live facet counts independently for all filter options
  const facetCounts = useMemo(() => {
    return calculateFacetCounts(allResults, {
      sortBy,
      searchQuery: debouncedSearchQuery,
    });
  }, [allResults, sortBy, debouncedSearchQuery]);

  // Filtered and sorted scholarships computed via useMemo with pure rules engine
  const filteredScholarships = useMemo(() => {
    return filterAndRankScholarships(
      allResults,
      {
        examTypes: selectedExamTypes,
        providers: selectedProviders,
        educationLevels: selectedLevels,
        statuses: selectedStatuses,
        sortBy,
        searchQuery: debouncedSearchQuery,
      },
      new Date()
    );
  }, [allResults, selectedExamTypes, selectedProviders, selectedLevels, selectedStatuses, sortBy, debouncedSearchQuery]);

  // Sliced items for display
  const displayedScholarships = useMemo(() => {
    return filteredScholarships.slice(0, visibleCount);
  }, [filteredScholarships, visibleCount]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner & Tab Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {activeTab === 'matched' ? 'Verified Scholarships For You' : 'All Verified Scholarships Catalog'}
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full shadow-xs">
              {filteredScholarships.length} Available
            </span>
          </div>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Grounded against official Indian central ministries, state portals, and verified CSR trusts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Catalog vs Matched Tab Switcher (C1) */}
          <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-bold text-slate-700">
            <button
              onClick={() => setActiveTab('matched')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'matched'
                  ? 'bg-white text-emerald-800 shadow-sm font-extrabold'
                  : 'hover:text-slate-900'
              }`}
            >
              My Matches ({scholarships.length})
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'catalog'
                  ? 'bg-white text-emerald-800 shadow-sm font-extrabold'
                  : 'hover:text-slate-900'
              }`}
            >
              Browse Catalog ({SCHOLARSHIP_CATALOG.length})
            </button>
          </div>

          <button
            onClick={onEditProfile}
            className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors min-h-[38px]"
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Edit Details</span>
          </button>
        </div>
      </div>

      {/* Official Safety Banner */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 mb-6 text-xs text-emerald-950 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <strong>Official Portal Guarantee:</strong> ScholarPal AI redirects only to verified government (.gov.in / .nic.in / .ac.in) or verified trust domains. Applying is 100% free of cost.
          </span>
        </div>
        <span className="text-[11px] font-bold text-emerald-800 hidden md:inline">2026-2027 Academic Year</span>
      </div>

      {/* Primary Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200 mb-8 space-y-4">
        {/* Search Input (A3 fix: debounced, partial matching, keywords) */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by scheme name, provider, ministry, state, or tag (e.g. NSP, Pragati, Girls, SC, Engineering)..."
              value={rawSearchQuery}
              onChange={(e) => setRawSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-hidden bg-slate-50/50 focus:bg-white"
            />
            {rawSearchQuery && (
              <button
                onClick={() => setRawSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Clear search text"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
              <ArrowUpDown className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sort:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden min-h-[42px]"
            >
              <option value="chance">Highest Match & Chance</option>
              <option value="deadline">Nearest Deadline (Days Left)</option>
              <option value="amount">Highest Benefit Amount</option>
            </select>
          </div>
        </div>

        {/* Independent Multi-Select Filter Groups (A2 fix) */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          {/* 1. Exam Type Filter Group */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-500 w-24 shrink-0">Exam Type:</span>
            <button
              onClick={() => toggleExamType('no-exam')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                selectedExamTypes.includes('no-exam')
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>Direct Merit / No Exam</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedExamTypes.includes('no-exam') ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {facetCounts.examTypes['no-exam']}
              </span>
            </button>
            <button
              onClick={() => toggleExamType('exam')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                selectedExamTypes.includes('exam')
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>Exam-Based</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedExamTypes.includes('exam') ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {facetCounts.examTypes.exam}
              </span>
            </button>
          </div>

          {/* 2. Provider Filter Group */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-500 w-24 shrink-0">Provider:</span>
            {(['Central', 'State', 'Private'] as const).map((prov) => {
              const isSelected = selectedProviders.includes(prov);
              const count = facetCounts.providers[prov] || 0;
              return (
                <button
                  key={prov}
                  onClick={() => toggleProvider(prov)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{prov === 'Central' ? 'Central Ministries' : prov === 'State' ? 'State Government' : 'Private / CSR Trusts'}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 3. Education Level Filter Group */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-500 w-24 shrink-0">Education:</span>
            {[
              { id: 'class_1_10', label: 'School (1-10)' },
              { id: 'class_11_12', label: 'Class 11-12' },
              { id: 'iti', label: 'ITI' },
              { id: 'diploma', label: 'Diploma' },
              { id: 'undergraduate', label: 'UG (B.Tech/B.Sc)' },
              { id: 'postgraduate', label: 'PG (Master)' },
              { id: 'doctorate', label: 'Doctorate' },
            ].map((lvl) => {
              const isSelected = selectedLevels.includes(lvl.id as EducationLevel);
              const count = facetCounts.educationLevels[lvl.id as EducationLevel] || 0;
              return (
                <button
                  key={lvl.id}
                  onClick={() => toggleLevel(lvl.id as EducationLevel)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                    isSelected
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{lvl.label}</span>
                  <span className={`text-[10px] px-1 py-0.2 rounded-full ${isSelected ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 4. Application Status Filter */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-500 w-24 shrink-0">Status:</span>
            <button
              onClick={() => toggleStatus('open')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                selectedStatuses.includes('open')
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>Currently Open</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedStatuses.includes('open') ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {facetCounts.statuses.open}
              </span>
            </button>
            <button
              onClick={() => toggleStatus('upcoming')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                selectedStatuses.includes('upcoming')
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>Upcoming / Announcement Awaited</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedStatuses.includes('upcoming') ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {facetCounts.statuses.upcoming}
              </span>
            </button>
          </div>
        </div>

        {/* Results Count Line & Clear Filters (A2 requirement) */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <p className="font-bold text-slate-700">
            Showing <span className="text-emerald-700 font-extrabold">{displayedScholarships.length}</span> of{' '}
            <span className="text-slate-900 font-black">{filteredScholarships.length}</span> scholarships
            {allResults.length > filteredScholarships.length && (
              <span className="text-slate-400 font-normal ml-1">({allResults.length} total in catalog)</span>
            )}
          </p>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear all filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-3xl p-12 text-center shadow-md border border-slate-100 my-8">
          <div className="inline-flex p-4 rounded-2xl bg-emerald-50 text-emerald-600 mb-4 animate-bounce">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Scanning Official Portals with Google Search Grounding...
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Verifying current eligibility criteria and 2026 notifications across National Scholarship Portal, UGC, AICTE, state portals and verified trusts.
          </p>
          <div className="w-48 h-1.5 bg-slate-100 rounded-full mx-auto mt-6 overflow-hidden">
            <div className="w-full h-full bg-emerald-600 animate-pulse" />
          </div>
        </div>
      )}

      {/* Error State with friendly message, Retry button, and Show details line (Requirement 8) */}
      {error && !loading && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 sm:p-8 text-center my-8 shadow-xs">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-rose-900">Unable to load live scholarship results</h2>
          <p className="text-xs text-rose-700 mt-1 max-w-md mx-auto">
            We had difficulty reaching official scholarship servers. You can retry the live search or browse the verified catalog scholarships below.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
            <button
              onClick={onRetry}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors"
            >
              Retry Live Search
            </button>
            <button
              onClick={() => setShowErrorDetails(!showErrorDetails)}
              className="px-3.5 py-2 text-xs font-bold text-rose-800 hover:text-rose-900 underline cursor-pointer"
            >
              {showErrorDetails ? 'Hide details' : 'Show details'}
            </button>
          </div>

          {showErrorDetails && (
            <div className="mt-4 p-3.5 bg-white border border-rose-200 rounded-xl text-left font-mono text-[11px] text-rose-900 max-w-xl mx-auto overflow-x-auto leading-relaxed">
              <div className="font-bold text-slate-500 mb-1 text-[10px] uppercase tracking-wider font-sans">
                Technical Error Details:
              </div>
              {error}
            </div>
          )}
        </div>
      )}

      {/* Zero Search Matches State with AI Search Fallback Button (A3 fix) */}
      {!loading && !error && filteredScholarships.length === 0 && (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 my-8 shadow-sm">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            No scholarships found for "{rawSearchQuery || 'current filters'}"
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
            We searched our entire 150+ scholarship verified catalog. Try clearing your active filters or let our AI search official government web portals right now.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <button
              onClick={clearAllFilters}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Clear Filters & Show All
            </button>
            <button
              onClick={() => {
                if (onOfficialSearch) onOfficialSearch(rawSearchQuery);
                else onRetry();
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Search Official Sources with AI</span>
            </button>
          </div>
        </div>
      )}

      {/* Fallback Banner (Requirement 4) */}
      {!loading && isLiveCheckUnavailable && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-semibold flex items-center gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>Live check unavailable - confirm dates on the official site</span>
        </div>
      )}

      {/* Scholarship Cards Grid */}
      {!loading && displayedScholarships.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedScholarships.map((item) => {
            const isHigh = item.chanceLabel === 'High';
            const isMedium = item.chanceLabel === 'Medium';
            const isSaved = savedScholarshipIds.includes(item.id);

            return (
              <div
                key={item.id}
                onClick={() => onSelectScholarship(item)}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-md hover:shadow-xl hover:border-emerald-400 transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Top strip badge */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{item.verifiedSourceBadge || 'Official Portal'}</span>
                    </span>

                    <div className="flex items-center gap-1">
                      {onOpenRemindMe && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenRemindMe(item);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Set reminders & add to calendar"
                          aria-label="Set reminders"
                        >
                          <Bell className="w-4 h-4" />
                        </button>
                      )}
                      {onToggleSave && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSave(item);
                          }}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isSaved
                              ? 'text-rose-600 bg-rose-50'
                              : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                          }`}
                          title={isSaved ? 'Remove from saved' : 'Save scholarship'}
                          aria-label="Save scholarship"
                        >
                          <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-600 text-rose-600' : ''}`} />
                        </button>
                      )}
                      <div
                        className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full ${
                          isHigh
                            ? 'bg-emerald-600 text-white'
                            : isMedium
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-600 text-white'
                        }`}
                      >
                        <span>{item.chanceLabel} Match</span>
                        <span className="opacity-90 font-medium">({item.matchScore}%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Title & Provider */}
                  <h2 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                    {item.name}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-1">
                    {item.provider}
                  </p>

                  {/* State / National badge */}
                  {item.stateScope && (
                    <span className="inline-block mt-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      📍 {item.stateScope}
                    </span>
                  )}

                  {/* Key Highlights: Benefit Amount & Exam/No-Exam tag */}
                  <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Scholarship Grant
                      </span>
                      <span className="text-sm font-extrabold text-emerald-700">
                        {item.benefitAmount}
                      </span>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-xl ${
                        item.isExamBased
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-teal-50 text-teal-700 border border-teal-200'
                      }`}
                    >
                      {item.isExamBased ? '📝 Exam Based' : '🎯 Direct Merit'}
                    </span>
                  </div>

                  {/* Why you qualify */}
                  <div className="mt-3.5 space-y-1">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Why you qualify:
                    </p>
                    <ul className="text-xs text-slate-600 space-y-1">
                      {(item.whyQualify || ['Matches your student profile criteria']).slice(0, 2).map((reason, rIdx) => (
                        <li key={rIdx} className="flex items-start gap-1.5 leading-snug">
                          <span className="text-emerald-600 font-bold text-xs mt-0.5">•</span>
                          <span className="line-clamp-2">{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Footer: Deadline & Action CTA */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      {item.daysLeft !== undefined && item.daysLeft >= 0
                        ? `${item.daysLeft} days left`
                        : item.lastDateToApply || 'Official portal active'}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                    <span>View & Prepare</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More Button (Bug A2 Requirement: 20-40 scholarships with Load more) */}
      {!loading && filteredScholarships.length > visibleCount && (
        <div className="text-center mt-10">
          <button
            onClick={() => setVisibleCount((prev) => prev + 12)}
            className="px-8 py-3 rounded-2xl bg-white border-2 border-emerald-500 text-emerald-700 hover:bg-emerald-50 font-black text-sm shadow-sm transition-all"
          >
            Load More Scholarships ({filteredScholarships.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
};
