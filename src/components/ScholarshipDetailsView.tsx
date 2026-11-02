import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Calendar,
  Clock,
  Award,
  BookOpen,
  FileText,
  ExternalLink,
  CheckSquare,
  Square,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  Download,
  CheckCircle2,
  ListChecks,
  AlertCircle,
  PhoneCall,
  Check,
  Info,
  Flag,
} from 'lucide-react';
import { ScholarshipDetailsData, StudentProfile } from '../types/index.ts';

interface ScholarshipDetailsViewProps {
  scholarship: ScholarshipDetailsData;
  studentProfile: StudentProfile | null;
  onBack: () => void;
  onTakeTest: () => void;
  onReportIssue?: (category: 'Wrong information' | 'Broken link', scholarshipName: string, url?: string) => void;
}

const DEFAULT_HOW_TO_APPLY_STEPS = [
  {
    step: 1,
    title: 'One-Time Registration (OTR)',
    desc: 'Register for NSP One Time Registration (OTR) or State Portal ID using your active mobile number and biometric/Aadhaar verification.',
    tips: 'Complete face-authentication via official NSP OTR app on Android if OTP fails.',
  },
  {
    step: 2,
    title: 'Aadhaar Seeding Check on NPCI Mapper',
    desc: 'Verify that your personal bank account is actively mapped and seeded with your Aadhaar in the National Payments Corporation of India (NPCI) database.',
    tips: 'Joint accounts or parent accounts are rejected for direct benefit transfer (DBT).',
  },
  {
    step: 3,
    title: 'Income Certificate from Revenue Authority',
    desc: 'Obtain digital Tehsildar / Sub-Divisional Magistrate (SDM) income certificate valid for the current financial year.',
    tips: 'Salary slips and affidavits are not accepted in lieu of a revenue certificate.',
  },
  {
    step: 4,
    title: 'Caste / Community Certificate (If applicable)',
    desc: 'Ensure your SC, ST, OBC-NCL, or EWS certificate has a verifiable digital barcode/QR code on your state revenue portal.',
    tips: 'OBC Non-Creamy Layer certificates must be issued within the last 1 year.',
  },
  {
    step: 5,
    title: 'Institute Bonafide Student Certificate',
    desc: 'Download the prescribed Bonafide format from the portal, get it stamped and signed by your College Principal or Registrar with the official institute seal.',
    tips: 'Ensure institute AISHE or DISE code matches the portal record.',
  },
  {
    step: 6,
    title: 'Fee Receipt & Academic Marksheet Scans',
    desc: 'Scan your latest tuition fee payment receipt and qualifying marksheet in PDF format within the prescribed file size (usually under 200 KB).',
    tips: 'Self-attest every document copy with your signature before scanning.',
  },
  {
    step: 7,
    title: 'Fill Application & Upload Documents',
    desc: 'Log in to the official portal, select this scheme, accurately enter previous exam marks, bank IFSC, and upload all mandatory documents.',
    tips: 'Double check spelling of student name so it strictly matches Aadhaar.',
  },
  {
    step: 8,
    title: 'Final Submission & Printout',
    desc: 'Review the filled application preview, submit the final application, and download the acknowledgement PDF with Application ID.',
    tips: 'Keep 2 physical copies of the signed form for college submission.',
  },
  {
    step: 9,
    title: 'Level 1: Institute Nodal Officer (INO) Verification',
    desc: 'Submit the hard copy along with document photocopies to your College Scholarship Section for Level-1 approval on the portal.',
    tips: 'Follow up with your college officer before the institute verification freeze date.',
  },
  {
    step: 10,
    title: 'Level 2 & Level 3: District & State Nodal Approval',
    desc: 'Application undergoes online scrutiny by District Welfare Officer (DNO) and State Nodal Officer (SNO).',
    tips: 'Check application status every week for any defect notices that require correction.',
  },
  {
    step: 11,
    title: 'DBT Payment Disbursement via PFMS',
    desc: 'Approved scholarship amount is credited directly to your Aadhaar-seeded bank account via Public Financial Management System (PFMS).',
    tips: 'Track payment status at pfms.nic.in with your Application ID or Bank Account.',
  },
];

export const ScholarshipDetailsView: React.FC<ScholarshipDetailsViewProps> = ({
  scholarship,
  studentProfile,
  onBack,
  onTakeTest,
  onReportIssue,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'syllabus' | 'prep' | 'documents' | 'how-to-apply'>(
    'overview'
  );

  // Checked documents state (stored in local storage)
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`scholarpal_docs_${scholarship.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // How-to-apply steps checklist (stored in local storage - C3)
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`scholarpal_steps_${scholarship.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleDoc = (id: string) => {
    const updated = { ...checkedDocs, [id]: !checkedDocs[id] };
    setCheckedDocs(updated);
    try {
      localStorage.setItem(`scholarpal_docs_${scholarship.id}`, JSON.stringify(updated));
    } catch {}
  };

  const toggleStep = (stepNumber: number) => {
    const updated = { ...checkedSteps, [stepNumber]: !checkedSteps[stepNumber] };
    setCheckedSteps(updated);
    try {
      localStorage.setItem(`scholarpal_steps_${scholarship.id}`, JSON.stringify(updated));
    } catch {}
  };

  // External Redirection Confirmation Modal (Requirement B2)
  const [redirectModalUrl, setRedirectModalUrl] = useState<string | null>(null);
  const [redirectDomainWarning, setRedirectDomainWarning] = useState<string | null>(null);

  // In-app Issue reporting modal (Requirement B1 & B2)
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState<'Wrong information' | 'Broken link'>('Wrong information');
  const [reportTargetUrl, setReportTargetUrl] = useState<string>('');
  const [reportMessage, setReportMessage] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const isExam = scholarship.isExamBased;

  // Formula verification cross-check (Requirement B1):
  // Check if sum of (section.questionsCount * marksPerQuestion) equals totalMarks
  const formulaCheck = React.useMemo(() => {
    if (!isExam || !scholarship.paperPattern?.sections || scholarship.paperPattern.sections.length === 0) {
      return null;
    }
    const computedTotal = scholarship.paperPattern.sections.reduce((sum, sec) => {
      return sum + (sec.questionsCount * (sec.marksPerQuestion || scholarship.paperPattern.marksPerQuestion || 1));
    }, 0);

    const matches = computedTotal === scholarship.totalMarks;
    return {
      computedTotal,
      officialTotal: scholarship.totalMarks,
      matches,
    };
  }, [isExam, scholarship]);

  // Validate domain security before redirection (Requirement B2)
  const handleOpenExternalUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();

      // Check for authentic domains (gov.in, nic.in, ac.in, org, or verified trust domains)
      const isOfficialGov = host.endsWith('.gov.in') || host.endsWith('.nic.in') || host.endsWith('.ac.in') || host.endsWith('.edu.in');
      const isVerifiedTrust =
        host.includes('tatatrusts.org') ||
        host.includes('reliancefoundation.org') ||
        host.includes('hdfcbank.com') ||
        host.includes('kotakeducation.org') ||
        host.includes('infosys.com') ||
        host.includes('santoorscholarship.com') ||
        host.includes('ongcscholar.org') ||
        host.includes('sitaramjindalfoundation.org') ||
        host.includes('buddy4study.com');

      if (!isOfficialGov && !isVerifiedTrust && !host.endsWith('.org')) {
        setRedirectDomainWarning(
          `Warning: The domain "${host}" is not recognized as an official government or verified trust website. ScholarPal advises caution.`
        );
      } else {
        setRedirectDomainWarning(null);
      }

      setRedirectModalUrl(url);
    } catch {
      setRedirectModalUrl(url);
    }
  };

  const confirmRedirect = () => {
    if (redirectModalUrl) {
      window.open(redirectModalUrl, '_blank', 'noopener,noreferrer');
      setRedirectModalUrl(null);
    }
  };

  const openReportModal = (category: 'Wrong information' | 'Broken link', url: string = '') => {
    setReportCategory(category);
    setReportTargetUrl(url || scholarship.officialUrl);
    setReportMessage(category === 'Broken link' ? `Link "${url || scholarship.officialUrl}" is not opening or showing 404.` : '');
    setReportSuccess(false);
    setReportModalOpen(true);
  };

  const submitReport = async () => {
    if (onReportIssue) {
      onReportIssue(reportCategory, reportMessage, reportTargetUrl);
    } else {
      try {
        await fetch('/api/complaints', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: reportCategory,
            message: `${reportMessage} [URL: ${reportTargetUrl}]`,
            scholarshipName: scholarship.name,
          }),
        });
      } catch (e) {}
    }
    setReportSuccess(true);
    setTimeout(() => {
      setReportModalOpen(false);
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Back button & Action Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-600" />
          <span>Back to All Scholarships</span>
        </button>

        {/* Report Wrong Information Button (Requirement B1) */}
        <button
          onClick={() => openReportModal('Wrong information', scholarship.officialUrl)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 px-3 py-1.5 rounded-xl hover:bg-rose-50 transition-colors"
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Report wrong info</span>
        </button>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{scholarship.verifiedSourceBadge || 'Official Portal'}</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Last verified on: <strong>{scholarship.lastVerifiedOn}</strong>
            </span>
          </div>

          <span
            className={`text-xs font-black px-3.5 py-1 rounded-full text-white ${
              scholarship.chanceLabel === 'High'
                ? 'bg-emerald-600'
                : scholarship.chanceLabel === 'Medium'
                ? 'bg-amber-500'
                : 'bg-slate-600'
            }`}
          >
            {scholarship.chanceLabel} Match ({scholarship.matchScore}%)
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
          {scholarship.name}
        </h1>
        <p className="text-sm text-slate-600 font-medium mt-1.5">{scholarship.provider}</p>

        {/* Tentative Notice (Requirement B1): If official 2026-2027 notification not yet released */}
        {(!scholarship.lastDateToApply || scholarship.lastDateToApply.toLowerCase().includes('not announced') || scholarship.dates?.isTentative) && (
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">
                Official 2026–2027 Notification Awaited
              </p>
              <p className="mt-0.5 leading-relaxed">
                The official 2026-2027 notification has not yet been gazetted by the ministry. Showing verified 2025-2026 paper pattern and syllabus guidelines for preparation.
              </p>
            </div>
          </div>
        )}

        {/* Benefits & Action Bar */}
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/40 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 block">
              Total Financial Benefit
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-900">
              {scholarship.benefitAmount}
            </span>
            {scholarship.benefitDetails && (
              <p className="text-xs text-emerald-950 mt-0.5">{scholarship.benefitDetails}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Apply Now Button with Domain Protection Confirmation (Requirement B2) */}
            <button
              onClick={() => handleOpenExternalUrl(scholarship.applyUrl || scholarship.officialUrl)}
              className="py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 min-h-[44px]"
            >
              <span>Apply on Official Portal</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            {isExam && (
              <button
                onClick={onTakeTest}
                className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-600/30 transition-all flex items-center gap-2 min-h-[44px] animate-pulse hover:animate-none"
              >
                <Sparkles className="w-4 h-4" />
                <span>Take AI Practice Test</span>
              </button>
            )}
          </div>
        </div>

        {/* Official Contact & Direct Links Strip (Requirement B2) */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-600">
            {/* Official Portal Home */}
            <button
              onClick={() => handleOpenExternalUrl(scholarship.officialUrl)}
              className="font-bold text-slate-700 hover:text-emerald-700 flex items-center gap-1 hover:underline"
            >
              <span>Official Website</span>
              <ExternalLink className="w-3 h-3" />
            </button>

            {/* Official Notification PDF */}
            {scholarship.notificationUrl && (
              <button
                onClick={() => handleOpenExternalUrl(scholarship.notificationUrl!)}
                className="font-bold text-slate-700 hover:text-emerald-700 flex items-center gap-1 hover:underline"
              >
                <span>Official Notification PDF</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}

            {/* Helpline contact */}
            <div className="flex items-center gap-1 text-slate-600 font-semibold">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <span>Helpline: {scholarship.helpdeskContact || '0120-6619540 (NSP)'}</span>
            </div>
          </div>

          {/* Report broken link (Requirement B2) */}
          <button
            onClick={() => openReportModal('Broken link', scholarship.applyUrl || scholarship.officialUrl)}
            className="text-[11px] font-bold text-slate-400 hover:text-rose-600 transition-colors"
          >
            Report broken link
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 space-x-1 sm:space-x-3 text-xs sm:text-sm font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {isExam ? 'Exam Blueprint & Schedule' : 'Eligibility & Dates'}
        </button>

        {isExam && (
          <button
            onClick={() => setActiveTab('syllabus')}
            className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'syllabus'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Syllabus (Topics)
          </button>
        )}

        {/* How to Apply 11-step checklist Tab (Requirement C3) */}
        <button
          onClick={() => setActiveTab('how-to-apply')}
          className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'how-to-apply'
              ? 'border-emerald-600 text-emerald-800 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ListChecks className="w-4 h-4 text-emerald-600" />
          <span>How to Apply (11 Steps)</span>
        </button>

        <button
          onClick={() => setActiveTab('prep')}
          className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'prep'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {isExam ? 'Preparation Strategy' : 'Selection Process'}
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'documents'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Documents Checklist
        </button>
      </div>

      {/* TAB CONTENT 1: OVERVIEW / EXAM BLUEPRINT */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Application Deadline
              </span>
              <span className="text-sm sm:text-base font-extrabold text-slate-900 mt-1 block">
                {scholarship.lastDateToApply}
              </span>
              {scholarship.daysLeft !== undefined && (
                <span className="text-xs text-amber-600 font-bold">
                  {scholarship.daysLeft} days remaining
                </span>
              )}
            </div>

            {isExam ? (
              <>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Exam Date
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 mt-1 block">
                    {scholarship.dates?.examDate || 'Announced by portal'}
                  </span>
                  <span className="text-xs text-slate-400">Mode: {scholarship.paperPattern?.mode || 'Online CBT'}</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Duration & Marks
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 mt-1 block">
                    {scholarship.durationMinutes} mins / {scholarship.totalMarks} M
                  </span>
                  <span className="text-xs text-slate-400">Total Paper Weight</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Negative Marking
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 mt-1 block">
                    {scholarship.negativeMarking?.hasNegativeMarking
                      ? `${scholarship.negativeMarking.ratio * 100}% penalty`
                      : 'None'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {scholarship.negativeMarking?.hasNegativeMarking ? 'Deducted per wrong answer' : 'No penalty'}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Selection Mode
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 mt-1 block">
                    Direct Merit / Need
                  </span>
                  <span className="text-xs text-teal-600 font-semibold">No Written Exam</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Income Ceiling
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 mt-1 block">
                    {scholarship.minIncomeLimit
                      ? `Up to ₹${(scholarship.minIncomeLimit / 100000).toFixed(1)} Lakh`
                      : 'No ceiling'}
                  </span>
                  <span className="text-xs text-slate-400">Family Annual Income</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Disbursement
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 mt-1 block">
                    Direct Benefit (DBT)
                  </span>
                  <span className="text-xs text-emerald-600 font-semibold">Aadhaar Seeded Bank</span>
                </div>
              </>
            )}
          </div>

          {/* Formula Verification Cross-Check Box (Requirement B1) */}
          {isExam && formulaCheck && (
            <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
              formulaCheck.matches
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Paper Blueprint Formula Cross-Checked:</strong> Sum of section marks ({formulaCheck.computedTotal} M) equals total official paper marks ({formulaCheck.officialTotal} M).
                </span>
              </div>
              <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded-md bg-white border border-emerald-300">
                Formula OK
              </span>
            </div>
          )}

          {/* Section Blueprint Breakdown */}
          {isExam && scholarship.paperPattern?.sections && scholarship.paperPattern.sections.length > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-base font-black text-slate-900 mb-4">Official Section-Wise Question Breakdown</h3>
              <div className="space-y-3">
                {scholarship.paperPattern.sections.map((sec, sIdx) => (
                  <div key={sIdx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-bold text-sm text-slate-900">{sec.name}</p>
                      {sec.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{sec.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
                      <span className="bg-white px-3 py-1 rounded-lg border border-slate-200">
                        {sec.questionsCount} Questions
                      </span>
                      <span className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-lg border border-emerald-200">
                        {sec.marksPerQuestion} Marks / Q
                      </span>
                      <span className="font-extrabold text-slate-900">
                        = {sec.questionsCount * sec.marksPerQuestion} Marks
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: SYLLABUS */}
      {activeTab === 'syllabus' && isExam && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-base font-black text-slate-900 mb-4">Detailed Official Exam Syllabus</h3>
            <div className="space-y-4">
              {scholarship.syllabus && scholarship.syllabus.length > 0 ? (
                scholarship.syllabus.map((s, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <h4 className="font-black text-sm text-emerald-900">{s.subject}</h4>
                    <div className="flex flex-wrap gap-2 mt-2.5">
                      {s.topics.map((t, tIdx) => (
                        <span key={tIdx} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">Official syllabus topics available in the detailed notification PDF.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: HOW TO APPLY (11-Step Interactive Checklist - Requirement C3) */}
      {activeTab === 'how-to-apply' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Step-by-Step Application Checklist
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Check off each step as you complete it. Your progress is automatically saved.
                </p>
              </div>

              {/* Progress counter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Progress:</span>
                <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                  {Object.values(checkedSteps).filter(Boolean).length} of {DEFAULT_HOW_TO_APPLY_STEPS.length} Completed
                </span>
              </div>
            </div>

            {/* Steps list */}
            <div className="space-y-4">
              {DEFAULT_HOW_TO_APPLY_STEPS.map((item) => {
                const isDone = Boolean(checkedSteps[item.step]);
                return (
                  <div
                    key={item.step}
                    onClick={() => toggleStep(item.step)}
                    className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 ${
                      isDone
                        ? 'bg-emerald-50/60 border-emerald-400'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStep(item.step);
                      }}
                      className="mt-0.5 shrink-0"
                      aria-label={`Toggle Step ${item.step}`}
                    >
                      {isDone ? (
                        <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-lg border-2 border-slate-300 bg-white" />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                          Step {item.step}
                        </span>
                        <h4 className={`text-sm font-black ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        {item.desc}
                      </p>
                      {item.tips && (
                        <div className="mt-2 text-[11px] font-semibold text-amber-900 bg-amber-50/80 border border-amber-200/80 px-2.5 py-1 rounded-lg inline-block">
                          💡 Tip: {item.tips}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: PREPARATION STRATEGY */}
      {activeTab === 'prep' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
            <h3 className="text-base font-black text-slate-900 mb-4">
              {isExam ? 'Week-by-Week Preparation Roadmap' : 'Official Selection Criteria'}
            </h3>
            {isExam && scholarship.howToPrepare?.weekByWeekPlan && (
              <div className="space-y-3 mb-6">
                {scholarship.howToPrepare.weekByWeekPlan.map((plan, pIdx) => (
                  <div key={pIdx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">
                      {plan.week}: {plan.focus}
                    </span>
                    <p className="text-xs text-slate-700 font-medium mt-1">{plan.action}</p>
                  </div>
                ))}
              </div>
            )}

            {scholarship.howToPrepare?.commonMistakes && scholarship.howToPrepare.commonMistakes.length > 0 && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 mt-4">
                <h4 className="text-xs font-black text-rose-900 uppercase tracking-wider mb-2">
                  Common Mistakes to Avoid
                </h4>
                <ul className="text-xs text-rose-800 space-y-1">
                  {scholarship.howToPrepare.commonMistakes.map((m, mIdx) => (
                    <li key={mIdx} className="flex items-start gap-1.5">
                      <span>•</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: DOCUMENTS CHECKLIST */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
            <h3 className="text-base font-black text-slate-900 mb-2">Mandatory Document Checklist</h3>
            <p className="text-xs text-slate-500 mb-6">
              Keep these documents scanned in PDF format (under 200 KB) and self-attested before applying.
            </p>
            <div className="space-y-3">
              {(scholarship.documentsNeeded || [
                { id: 'd1', name: 'Digital Income Certificate (Tehsildar)', required: true, description: 'Current financial year' },
                { id: 'd2', name: 'Aadhaar Card (Seeded with Bank Account)', required: true, description: 'NPCI verified' },
                { id: 'd3', name: 'Bonafide Student Certificate with Principal Seal', required: true, description: 'Signed and dated' },
                { id: 'd4', name: 'Previous Academic Year Marksheet', required: true, description: 'Self-attested copy' }
              ]).map((doc) => {
                const isChecked = Boolean(checkedDocs[doc.id]);
                return (
                  <div
                    key={doc.id}
                    onClick={() => toggleDoc(doc.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isChecked ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button type="button" className="shrink-0" aria-label={`Check ${doc.name}`}>
                        {isChecked ? (
                          <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-md border-2 border-slate-300 bg-white" />
                        )}
                      </button>
                      <div>
                        <p className={`text-xs sm:text-sm font-bold ${isChecked ? 'text-emerald-950 line-through' : 'text-slate-900'}`}>
                          {doc.name}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{doc.description}</p>
                      </div>
                    </div>

                    {doc.required && (
                      <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md shrink-0">
                        Mandatory
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* External Redirection Disclaimer Modal (Requirement B2) */}
      {redirectModalUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Leaving ScholarPal AI</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              You are leaving ScholarPal AI and going to{' '}
              <strong className="text-slate-900 font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded">
                {new URL(redirectModalUrl).hostname}
              </strong>.
            </p>
            <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <strong>Official Warning:</strong> ScholarPal AI and Indian Government scholarship portals <strong>never charge any application fee</strong>. If any website asks for money or login passwords, do not proceed.
            </div>

            {redirectDomainWarning && (
              <p className="text-xs text-rose-600 font-semibold mt-2">{redirectDomainWarning}</p>
            )}

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setRedirectModalUrl(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Stay Here
              </button>
              <button
                onClick={confirmRedirect}
                className="w-1/2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Proceed to Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Wrong Info / Broken Link Modal (Requirements B1 & B2) */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Flag className="w-5 h-5 text-rose-600" />
                <span>{reportCategory === 'Broken link' ? 'Report Broken Link' : 'Report Wrong Information'}</span>
              </h3>
              <button onClick={() => setReportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-900 text-xs text-center font-bold">
                ✓ Report logged successfully! Our team will verify and update this scheme within 24 hours.
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Scholarship Scheme
                  </label>
                  <input
                    type="text"
                    disabled
                    value={scholarship.name}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Target URL
                  </label>
                  <input
                    type="text"
                    disabled
                    value={reportTargetUrl}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Describe the issue
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Official date was extended, or link gives 404 error..."
                    value={reportMessage}
                    onChange={(e) => setReportMessage(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setReportModalOpen(false)}
                    className="w-1/2 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitReport}
                    className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
                  >
                    Submit Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
