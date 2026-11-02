import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  User,
  MapPin,
  Users,
  Compass,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Plus,
  Trash2,
  AlertCircle,
  Check,
  CheckCircle2,
} from 'lucide-react';
import {
  StudentProfile,
  EducationLevel,
  Gender,
  CasteCategory,
  Profession,
  EarningMember,
} from '../types/index.ts';
import { INDIAN_STATES_AND_UTS, DISTRICTS_BY_STATE } from '../data/indianLocations.ts';
import { calculateTotalFamilyIncome, calculateFormProgress } from '../utils/rules.ts';
import {
  SCHOOL_BOARDS,
  ITI_TRADES,
  DIPLOMA_BOARDS,
  TOP_UNIVERSITIES_AND_INSTITUTES,
} from '../data/indianEducationBoards.ts';

interface ProfileFormProps {
  initialProfile?: StudentProfile | null;
  onSubmit: (profile: StudentProfile) => void;
  onCancelEdit?: () => void;
}

const STEPS = [
  { id: 'consent', label: 'Consent', icon: ShieldCheck },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'family', label: 'Family & Income', icon: Users },
  { id: 'preferences', label: 'Preferences', icon: Compass },
  { id: 'extras', label: 'Optional Extras', icon: Sparkles },
];

const PROFESSIONS: Profession[] = [
  'Farmer',
  'Agricultural labourer',
  'Daily-wage worker',
  'Construction worker',
  'Private job',
  'Self-employed/Business',
  'Teacher',
  'Doctor/Engineer/other professional',
  'Armed forces/ex-serviceman',
  'Police/paramilitary',
  'Fisherman',
  'Artisan/weaver',
  'Driver',
  'Small shop/street vendor',
  'Retired/Pensioner',
  'Unemployed',
  'Other',
];

export const ProfileForm: React.FC<ProfileFormProps> = ({
  initialProfile,
  onSubmit,
  onCancelEdit,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form State
  // Form State (Defaults to empty for fresh visitor so progress starts at 0% - Requirement A1)
  const [educationLevel, setEducationLevel] = useState<EducationLevel | ''>(
    initialProfile?.educationLevel || ''
  );
  const [standard, setStandard] = useState(initialProfile?.standard || '');
  const [stream11_12, setStream11_12] = useState<any>(
    initialProfile?.stream11_12 || ''
  );
  const [class11_12Grade, setClass11_12Grade] = useState<'11th' | '12th' | ''>(
    initialProfile?.class11_12Grade || ''
  );
  const [itiTradeType, setItiTradeType] = useState<'Engineering' | 'Non-engineering' | ''>(
    initialProfile?.itiTradeType || ''
  );
  const [itiTradeName, setItiTradeName] = useState(initialProfile?.itiTradeName || '');
  const [itiYear, setItiYear] = useState<'1st Year' | '2nd Year' | ''>(
    initialProfile?.itiYear || ''
  );
  const [diplomaType, setDiplomaType] = useState(
    initialProfile?.diplomaType || ''
  );
  const [diplomaYear, setDiplomaYear] = useState<'1st Year' | '2nd Year' | '3rd Year' | ''>(
    initialProfile?.diplomaYear || ''
  );
  const [ugDegree, setUgDegree] = useState(initialProfile?.ugDegree || '');
  const [ugYear, setUgYear] = useState<any>(initialProfile?.ugYear || '');
  const [pgDegree, setPgDegree] = useState(initialProfile?.pgDegree || '');
  const [pgYear, setPgYear] = useState<any>(initialProfile?.pgYear || '');
  const [phdField, setPhdField] = useState(
    initialProfile?.phdField || ''
  );
  const [phdYear, setPhdYear] = useState<any>(initialProfile?.phdYear || '');

  // Step B: Personal
  const [gender, setGender] = useState<Gender | ''>(initialProfile?.gender || '');
  const [age, setAge] = useState<number | ''>(initialProfile?.age ? initialProfile.age : '');
  const [casteCategory, setCasteCategory] = useState<CasteCategory | ''>(
    initialProfile?.casteCategory || ''
  );

  // Step C: Location
  const [state, setState] = useState(initialProfile?.state || '');
  const [district, setDistrict] = useState(initialProfile?.district || '');
  const [customDistrict, setCustomDistrict] = useState('');
  const [locality, setLocality] = useState(initialProfile?.locality || '');

  // Step D: Family
  const [fatherAlive, setFatherAlive] = useState<boolean | undefined>(
    initialProfile?.fatherAlive
  );
  const [motherAlive, setMotherAlive] = useState<boolean | undefined>(
    initialProfile?.motherAlive
  );
  const [earningMembers, setEarningMembers] = useState<EarningMember[]>(
    initialProfile?.earningMembers || []
  );
  const [totalAnnualIncome, setTotalAnnualIncome] = useState<number>(
    initialProfile?.totalAnnualIncome || 0
  );

  // Step E: Preferences
  const [readyForExam, setReadyForExam] = useState(
    initialProfile?.readyForExam !== undefined ? initialProfile.readyForExam : false
  );
  const [wantsNoExam, setWantsNoExam] = useState(
    initialProfile?.wantsNoExam !== undefined ? initialProfile.wantsNoExam : false
  );
  const [alreadyReceivingScholarship, setAlreadyReceivingScholarship] = useState(
    Boolean(initialProfile?.alreadyReceivingScholarship)
  );
  const [existingScholarshipName, setExistingScholarshipName] = useState(
    initialProfile?.existingScholarshipName || ''
  );
  const [existingScholarshipAmount, setExistingScholarshipAmount] = useState<number>(
    initialProfile?.existingScholarshipAmount || 0
  );

  // Step F: Optional Extras
  const [marksPercentage, setMarksPercentage] = useState<string>(
    initialProfile?.marksPercentage ? String(initialProfile.marksPercentage) : ''
  );
  const [schoolBoard, setSchoolBoard] = useState<any>(initialProfile?.schoolBoard || '');
  const [institutionType, setInstitutionType] = useState<any>(
    initialProfile?.institutionType || ''
  );
  const [hasDisability, setHasDisability] = useState(Boolean(initialProfile?.hasDisability));
  const [disabilityPercentage, setDisabilityPercentage] = useState<number>(
    initialProfile?.disabilityPercentage || 40
  );
  const [religionMinority, setReligionMinority] = useState<any>(
    initialProfile?.religionMinority || 'None'
  );

  // Consent (defaults to false for new users so progress starts at 0% - Requirement A1)
  const [privacyConsent, setPrivacyConsent] = useState(
    initialProfile?.privacyConsent !== undefined ? initialProfile.privacyConsent : false
  );
  const [parentGuardianConsent, setParentGuardianConsent] = useState(
    initialProfile?.parentGuardianConsent !== undefined ? initialProfile.parentGuardianConsent : false
  );

  // Recalculate family income when earning members change
  useEffect(() => {
    const calc = calculateTotalFamilyIncome(earningMembers);
    setTotalAnnualIncome(calc);
  }, [earningMembers]);

  // Handle orphan condition when both parents passed away
  const isOrphan = Boolean(fatherAlive === false && motherAlive === false);

  // Real-time calculation of required fields and live progress %
  const currentFormData = React.useMemo<Partial<StudentProfile>>(() => ({
    privacyConsent,
    parentGuardianConsent,
    educationLevel: (educationLevel || undefined) as EducationLevel | undefined,
    standard,
    class11_12Grade: (class11_12Grade || undefined) as any,
    stream11_12,
    itiTradeType: (itiTradeType || undefined) as any,
    itiTradeName,
    itiYear: (itiYear || undefined) as any,
    diplomaType,
    diplomaYear: (diplomaYear || undefined) as any,
    ugDegree,
    ugYear,
    pgDegree,
    pgYear,
    phdField,
    phdYear,
    gender: (gender || undefined) as Gender | undefined,
    age: typeof age === 'number' ? age : (Number(age) || 0),
    casteCategory: (casteCategory || undefined) as CasteCategory | undefined,
    state,
    district: customDistrict.trim() || district,
    locality: locality.trim(),
    fatherAlive,
    motherAlive,
    isOrphan,
    earningMembers,
    totalAnnualIncome,
    readyForExam,
    wantsNoExam,
    alreadyReceivingScholarship,
    existingScholarshipName,
  }), [
    privacyConsent,
    parentGuardianConsent,
    educationLevel,
    standard,
    class11_12Grade,
    stream11_12,
    itiTradeType,
    itiTradeName,
    itiYear,
    diplomaType,
    diplomaYear,
    ugDegree,
    ugYear,
    pgDegree,
    pgYear,
    phdField,
    phdYear,
    gender,
    age,
    casteCategory,
    state,
    customDistrict,
    district,
    locality,
    fatherAlive,
    motherAlive,
    isOrphan,
    earningMembers,
    totalAnnualIncome,
    readyForExam,
    wantsNoExam,
    alreadyReceivingScholarship,
    existingScholarshipName,
  ]);

  const formProgress = React.useMemo(() => {
    return calculateFormProgress(currentFormData);
  }, [currentFormData]);

  // Auto-save form draft to localStorage for crash resilience (A4)
  useEffect(() => {
    try {
      localStorage.setItem('scholarpal_profile_draft', JSON.stringify(currentFormData));
    } catch {
      // ignore
    }
  }, [currentFormData]);

  const validateStep = (stepIdx: number): boolean => {
    const newErrors: Record<string, string> = {};

    const numAge = typeof age === 'number' ? age : Number(age) || 0;

    if (stepIdx === 0) {
      if (!privacyConsent) {
        newErrors.privacyConsent = 'You must agree that details will be used only for matching.';
      }
      if (numAge > 0 && numAge < 18 && !parentGuardianConsent) {
        newErrors.parentGuardianConsent =
          'Parent or guardian agreement is required for students under 18.';
      }
    } else if (stepIdx === 1) {
      if (!educationLevel) newErrors.educationLevel = 'Please select what you are studying.';
    } else if (stepIdx === 2) {
      if (!numAge || numAge < 4 || numAge > 75) newErrors.age = 'Please enter a valid age.';
      if (!gender) newErrors.gender = 'Please select your gender.';
      if (!casteCategory) newErrors.casteCategory = 'Please select your caste/category.';
    } else if (stepIdx === 3) {
      if (!state) newErrors.state = 'Please select your State / UT.';
      const activeDistrict = customDistrict.trim() || district;
      if (!activeDistrict) newErrors.district = 'Please specify your district.';
      if (!locality.trim()) newErrors.locality = 'Please enter your city, town, or village.';
    } else if (stepIdx === 4) {
      if (earningMembers.length === 0) {
        newErrors.earningMembers = 'Please add at least one earning member or guardian.';
      }
      if (totalAnnualIncome < 0) {
        newErrors.totalAnnualIncome = 'Total annual income cannot be negative.';
      }
    } else if (stepIdx === 5) {
      if (!readyForExam && !wantsNoExam) {
        newErrors.preferences = 'Please tick at least one: exam-based or no-exam scholarships.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(STEPS.length - 1, prev + 1));
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleSubmit = () => {
    if (!validateStep(currentStep)) return;

    const numAge = typeof age === 'number' ? age : Number(age) || 18;
    const finalDistrict = customDistrict.trim() || district;
    const profile: StudentProfile = {
      educationLevel: educationLevel as EducationLevel,
      standard,
      stream11_12,
      class11_12Grade: (class11_12Grade || undefined) as any,
      itiTradeType: (itiTradeType || undefined) as any,
      itiTradeName,
      itiYear: (itiYear || undefined) as any,
      diplomaType,
      diplomaYear: (diplomaYear || undefined) as any,
      ugDegree,
      ugYear,
      pgDegree,
      pgYear,
      phdField,
      phdYear,
      gender: gender as Gender,
      age: numAge,
      casteCategory: casteCategory as CasteCategory,
      state,
      district: finalDistrict,
      locality: locality.trim(),
      fatherAlive: fatherAlive ?? true,
      motherAlive: motherAlive ?? true,
      isOrphan: Boolean(fatherAlive === false && motherAlive === false),
      earningMembers,
      totalAnnualIncome: Number(totalAnnualIncome) || 0,
      readyForExam,
      wantsNoExam,
      alreadyReceivingScholarship,
      existingScholarshipName: alreadyReceivingScholarship ? existingScholarshipName : undefined,
      existingScholarshipAmount: alreadyReceivingScholarship ? Number(existingScholarshipAmount) : undefined,
      marksPercentage: marksPercentage ? Number(marksPercentage) : undefined,
      schoolBoard,
      institutionType,
      hasDisability,
      disabilityPercentage: hasDisability ? Number(disabilityPercentage) : undefined,
      religionMinority,
      privacyConsent,
      parentGuardianConsent: numAge < 18 ? parentGuardianConsent : undefined,
    };

    onSubmit(profile);
  };

  // Earning member helpers
  const addEarningMember = () => {
    const defaultRelation = isOrphan
      ? 'Guardian/other'
      : fatherAlive
      ? 'Father'
      : 'Mother';
    setEarningMembers([
      ...earningMembers,
      {
        relation: defaultRelation,
        profession: 'Farmer',
        annualIncome: 50000,
        isGovtEmployee: false,
      },
    ]);
  };

  const removeEarningMember = (index: number) => {
    setEarningMembers(earningMembers.filter((_, i) => i !== index));
  };

  const updateEarningMember = (index: number, updates: Partial<EarningMember>) => {
    const list = [...earningMembers];
    list[index] = { ...list[index], ...updates };
    setEarningMembers(list);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero Welcome Badge */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Class 1 to Doctorate Level Coverage
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Find Verified Indian Scholarships
        </h1>
        <p className="text-slate-600 text-base max-w-xl mx-auto mt-2">
          Tell us about your education and background. Our AI matches open government and verified
          trust scholarships with 100% eligibility accuracy.
        </p>
      </div>

      {/* Multi-step progress bar (Bug A1 Fix: starts at 0% and shows real completion of applicable required fields) */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 mb-8">
        <div className="flex items-center justify-between mb-3 text-xs font-bold uppercase tracking-wider">
          <span className="text-slate-600">
            Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].label}
          </span>
          <span className="text-emerald-700 font-black flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {formProgress.percent}% Completed ({formProgress.validCount}/{formProgress.totalCount} fields)
          </span>
        </div>

        {/* Progress track */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${formProgress.percent}%` }}
          />
        </div>

        {/* Step dots - visible on tablets/desktops */}
        <div className="hidden sm:flex justify-between items-center mt-4">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (idx < currentStep) setCurrentStep(idx);
                }}
                disabled={idx > currentStep}
                className={`flex flex-col items-center group focus:outline-hidden ${
                  idx > currentStep ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                    isCurrent
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-300'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span
                  className={`text-[11px] font-semibold mt-1.5 ${
                    isCurrent ? 'text-emerald-700' : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Step Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200">
        {/* STEP 0: PRIVACY & CONSENT */}
        {currentStep === 0 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Privacy & Data Consent
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                ScholarPal AI respects your privacy and complies with Indian digital student safety
                standards.
              </p>
            </div>

            {/* Safety callout banner */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 leading-relaxed">
                <p className="font-bold text-sm text-emerald-950 mb-1">
                  We Never Ask For Sensitive Personal Credentials
                </p>
                ScholarPal will <strong>never ask</strong> for your Aadhaar card number, bank
                passbook account number, UPI PIN, or any external OTP. Your academic and financial
                details are processed solely to calculate matching scholarship schemes.
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <label className="flex items-start gap-3.5 p-4 rounded-2xl border-2 border-slate-200 hover:border-emerald-500 transition-colors cursor-pointer bg-slate-50/50">
                <input
                  type="checkbox"
                  checked={privacyConsent}
                  onChange={(e) => setPrivacyConsent(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded-sm text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-semibold text-slate-800 leading-snug">
                  My details will be used only to match scholarships.{' '}
                  <span className="text-rose-500">*</span>
                </span>
              </label>
              {errors.privacyConsent && (
                <p className="text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.privacyConsent}
                </p>
              )}

              {typeof age === 'number' && age < 18 && (
                <div className="p-4 rounded-2xl border-2 border-amber-200 bg-amber-50/50">
                  <label className="flex items-start gap-3.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={parentGuardianConsent}
                      onChange={(e) => setParentGuardianConsent(e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded-sm text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm font-semibold text-slate-800 leading-snug">
                      My parent or guardian knows and agrees to me using this scholarship finder.{' '}
                      <span className="text-rose-500">* (Required for age under 18)</span>
                    </span>
                  </label>
                  {errors.parentGuardianConsent && (
                    <p className="text-xs text-rose-600 flex items-center gap-1 mt-2">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.parentGuardianConsent}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 1: EDUCATION */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                What are you currently studying?
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Select your education level to view schemes tailored to your grade or degree.
              </p>
            </div>

            {/* Level selection cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { id: 'class_1_10', title: 'Class 1 to 10', subtitle: 'Primary & Secondary School' },
                { id: 'class_11_12', title: 'Class 11 and 12', subtitle: 'Higher Secondary (HSC/Inter)' },
                { id: 'iti', title: 'ITI Trade', subtitle: 'Industrial Training Institute' },
                { id: 'diploma', title: 'Polytechnic Diploma', subtitle: 'Technical / Vocational' },
                { id: 'undergraduate', title: 'Undergraduate (UG)', subtitle: 'B.Tech, B.Sc, BA, MBBS, etc.' },
                { id: 'postgraduate', title: 'Postgraduate (PG)', subtitle: 'M.Tech, M.Sc, MBA, MA, etc.' },
                { id: 'doctorate', title: 'Doctorate (Ph.D.)', subtitle: 'Research, DM, Post-Doc' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setEducationLevel(lvl.id as EducationLevel)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all min-h-[58px] ${
                    educationLevel === lvl.id
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <p
                    className={`font-bold text-sm ${
                      educationLevel === lvl.id ? 'text-emerald-900' : 'text-slate-900'
                    }`}
                  >
                    {lvl.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{lvl.subtitle}</p>
                </button>
              ))}
            </div>

            {/* Specific level details */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 mt-4 space-y-4">
              {educationLevel === 'class_1_10' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Select Standard / Class
                  </label>
                  <select
                    value={standard}
                    onChange={(e) => setStandard(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 min-h-[48px]"
                  >
                    {[
                      '1st', '2nd', '3rd', '4th', '5th',
                      '6th', '7th', '8th', '9th', '10th',
                    ].map((s) => (
                      <option key={s} value={s}>
                        Class {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {educationLevel === 'class_11_12' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Class
                    </label>
                    <select
                      value={class11_12Grade}
                      onChange={(e) => setClass11_12Grade(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 min-h-[48px]"
                    >
                      <option value="11th">Class 11th</option>
                      <option value="12th">Class 12th</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Stream
                    </label>
                    <select
                      value={stream11_12}
                      onChange={(e) => setStream11_12(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 min-h-[48px]"
                    >
                      <option value="Science (PCM)">Science (PCM - Physics, Chem, Math)</option>
                      <option value="Science (PCB)">Science (PCB - Physics, Chem, Bio)</option>
                      <option value="Science (PCMB)">Science (PCMB - Math & Bio)</option>
                      <option value="Science (Other)">Science (Other)</option>
                      <option value="Commerce">Commerce</option>
                      <option value="Arts/Humanities">Arts / Humanities</option>
                      <option value="Vocational">Vocational</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              )}

              {educationLevel === 'iti' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Trade Certification Board
                    </label>
                    <select
                      value={itiTradeType}
                      onChange={(e) => setItiTradeType(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 min-h-[48px]"
                    >
                      <option value="Engineering">NCVT - National Council for Vocational Training (Engineering)</option>
                      <option value="Non-engineering">NCVT - National Council (Non-Engineering)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Trade Specialization
                    </label>
                    <select
                      value={itiTradeName}
                      onChange={(e) => setItiTradeName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 min-h-[48px]"
                    >
                      {ITI_TRADES.map((trade) => (
                        <option key={trade} value={trade}>
                          {trade}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Year
                    </label>
                    <select
                      value={itiYear}
                      onChange={(e) => setItiYear(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 min-h-[48px]"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                    </select>
                  </div>
                </div>
              )}

              {educationLevel === 'diploma' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Diploma Stream
                    </label>
                    <select
                      value={diplomaType}
                      onChange={(e) => setDiplomaType(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 min-h-[48px]"
                    >
                      <option value="Engineering/Polytechnic: Computer/IT">Polytechnic: Computer / IT</option>
                      <option value="Engineering/Polytechnic: Mechanical">Polytechnic: Mechanical</option>
                      <option value="Engineering/Polytechnic: Civil">Polytechnic: Civil</option>
                      <option value="Engineering/Polytechnic: Electrical">Polytechnic: Electrical</option>
                      <option value="Engineering/Polytechnic: Electronics">Polytechnic: Electronics</option>
                      <option value="Engineering/Polytechnic: Automobile">Polytechnic: Automobile</option>
                      <option value="Engineering/Polytechnic: Chemical">Polytechnic: Chemical</option>
                      <option value="Pharmacy (D.Pharm)">Pharmacy (D.Pharm)</option>
                      <option value="Nursing/Paramedical">Nursing / Paramedical</option>
                      <option value="Agriculture">Agriculture</option>
                      <option value="Hotel Management">Hotel Management</option>
                      <option value="Fashion/Design">Fashion / Design</option>
                      <option value="Education (D.El.Ed)">Education (D.El.Ed)</option>
                      <option value="Other">Other Diploma</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Year of Study
                    </label>
                    <select
                      value={diplomaYear}
                      onChange={(e) => setDiplomaYear(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 min-h-[48px]"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                    </select>
                  </div>
                </div>
              )}

              {educationLevel === 'undergraduate' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Undergraduate Degree
                    </label>
                    <select
                      value={ugDegree}
                      onChange={(e) => setUgDegree(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 min-h-[48px]"
                    >
                      <option value="B.E/B.Tech">B.E / B.Tech (Engineering)</option>
                      <option value="MBBS/BDS/AYUSH">MBBS / BDS / AYUSH (Medical)</option>
                      <option value="B.Sc">B.Sc (Science)</option>
                      <option value="B.Com">B.Com (Commerce)</option>
                      <option value="BA">BA (Arts)</option>
                      <option value="BBA/BMS">BBA / BMS (Management)</option>
                      <option value="BCA">BCA (Computer Applications)</option>
                      <option value="B.Pharm">B.Pharm (Pharmacy)</option>
                      <option value="B.Sc Nursing/Paramedical">B.Sc Nursing / Paramedical</option>
                      <option value="LLB/BA LLB">LLB / BA LLB (Law)</option>
                      <option value="B.Ed">B.Ed (Education)</option>
                      <option value="B.Arch/B.Des">B.Arch / B.Des (Architecture/Design)</option>
                      <option value="Agriculture/Horticulture/Forestry/Veterinary">Agriculture / Veterinary</option>
                      <option value="Hotel Management">Hotel Management</option>
                      <option value="Mass Communication">Mass Communication / Journalism</option>
                      <option value="Fine/Performing Arts">Fine / Performing Arts</option>
                      <option value="Physical Education/Sports">Physical Education / Sports</option>
                      <option value="Other">Other UG Degree</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Year of Study
                    </label>
                    <select
                      value={ugYear}
                      onChange={(e) => setUgYear(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 min-h-[48px]"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="5th Year">5th Year</option>
                    </select>
                  </div>
                </div>
              )}

              {educationLevel === 'postgraduate' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Postgraduate Degree
                    </label>
                    <select
                      value={pgDegree}
                      onChange={(e) => setPgDegree(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 min-h-[48px]"
                    >
                      <option value="M.E/M.Tech">M.E / M.Tech</option>
                      <option value="M.Sc">M.Sc</option>
                      <option value="MBA/PGDM">MBA / PGDM</option>
                      <option value="MCA">MCA</option>
                      <option value="MA">MA</option>
                      <option value="M.Com">M.Com</option>
                      <option value="LLM">LLM</option>
                      <option value="M.Ed">M.Ed</option>
                      <option value="MD/MS/MDS">MD / MS / MDS</option>
                      <option value="M.Pharm">M.Pharm</option>
                      <option value="M.Arch/M.Des">M.Arch / M.Des</option>
                      <option value="MSW">MSW</option>
                      <option value="PG Diploma">PG Diploma</option>
                      <option value="Other">Other PG Degree</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Year of Study
                    </label>
                    <select
                      value={pgYear}
                      onChange={(e) => setPgYear(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 min-h-[48px]"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                    </select>
                  </div>
                </div>
              )}

              {educationLevel === 'doctorate' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Doctorate Program / Discipline
                    </label>
                    <select
                      value={phdField}
                      onChange={(e) => setPhdField(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 min-h-[48px]"
                    >
                      <option value="Ph.D. in Science">Ph.D. in Science</option>
                      <option value="Ph.D. in Engineering & Technology">Ph.D. in Engineering & Technology</option>
                      <option value="Ph.D. in Humanities & Social Sciences">Ph.D. in Humanities & Social Sciences</option>
                      <option value="Ph.D. in Commerce & Management">Ph.D. in Commerce & Management</option>
                      <option value="Ph.D. in Medical & Health Sciences">Ph.D. in Medical & Health Sciences</option>
                      <option value="Ph.D. in Law">Ph.D. in Law</option>
                      <option value="Ph.D. in Agriculture">Ph.D. in Agriculture</option>
                      <option value="Ph.D. in Education">Ph.D. in Education</option>
                      <option value="D.Sc/D.Litt">D.Sc / D.Litt</option>
                      <option value="DM/MCh">DM / MCh</option>
                      <option value="Post-doctoral">Post-doctoral</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Year of Research
                    </label>
                    <select
                      value={phdYear}
                      onChange={(e) => setPhdYear(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 min-h-[48px]"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="5th Year+">5th Year+</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: PERSONAL */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Personal Background
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Gender, age, and social category help match specific reservations and affirmative action schemes.
              </p>
            </div>

            <div className="space-y-5">
              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Gender
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(['Male', 'Female', 'Transgender', 'Prefer not to say'] as Gender[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`p-3.5 rounded-xl border-2 text-center font-bold text-sm transition-all min-h-[48px] ${
                        gender === g
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Age (in years)
                </label>
                <input
                  type="number"
                  min={5}
                  max={70}
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 font-bold text-base focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 min-h-[48px]"
                />
                {errors.age && (
                  <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.age}
                  </p>
                )}
              </div>

              {/* Caste Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Social Category / Caste Group
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(
                    [
                      'General/Unreserved',
                      'EWS',
                      'OBC Non-Creamy Layer',
                      'OBC Creamy Layer',
                      'SC',
                      'ST',
                      'DNT/NT/SNT',
                      'Prefer not to say',
                    ] as CasteCategory[]
                  ).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCasteCategory(c)}
                      className={`p-3 rounded-xl border-2 text-left font-semibold text-sm transition-all min-h-[48px] flex items-center justify-between ${
                        casteCategory === c
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span>{c}</span>
                      {casteCategory === c && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: LOCATION */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Where do you live?
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Many state governments offer special scholarships exclusively for native residents.
              </p>
            </div>

            <div className="space-y-4">
              {/* State / UT */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  State / Union Territory (All 28 States & 8 UTs)
                </label>
                <select
                  value={state}
                  onChange={(e) => {
                    const newState = e.target.value;
                    setState(newState);
                    const list = DISTRICTS_BY_STATE[newState] || [];
                    setDistrict(list[0] || '');
                    setCustomDistrict('');
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-emerald-500 min-h-[48px]"
                >
                  {INDIAN_STATES_AND_UTS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  District
                </label>
                <div className="space-y-2">
                  <select
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      if (e.target.value !== '__other__') {
                        setCustomDistrict('');
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-emerald-500 min-h-[48px]"
                  >
                    {(DISTRICTS_BY_STATE[state] || []).map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                    <option value="__other__">My district is not listed (Type manually)</option>
                  </select>

                  {district === '__other__' && (
                    <input
                      type="text"
                      placeholder="Type your district name"
                      value={customDistrict}
                      onChange={(e) => setCustomDistrict(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-emerald-500 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 min-h-[48px]"
                    />
                  )}
                </div>
              </div>

              {/* City / Town / Village */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  City, Town, or Village
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pune, Baramati, or village name"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 min-h-[48px]"
                />
                {errors.locality && (
                  <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.locality}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: FAMILY & INCOME */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Family & Household Income
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Income caps are defined by official schemes (e.g. ₹2.5L, ₹4.5L, or ₹8L per annum).
              </p>
            </div>

            {/* Parents Status Checkboxes */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Parents Status
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Father status */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800">Father</span>
                  <div className="flex gap-2 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setFatherAlive(true)}
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        fatherAlive ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      Alive
                    </button>
                    <button
                      type="button"
                      onClick={() => setFatherAlive(false)}
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        !fatherAlive ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      Passed Away
                    </button>
                  </div>
                </div>

                {/* Mother status */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800">Mother</span>
                  <div className="flex gap-2 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setMotherAlive(true)}
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        motherAlive ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      Alive
                    </button>
                    <button
                      type="button"
                      onClick={() => setMotherAlive(false)}
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        !motherAlive ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      Passed Away
                    </button>
                  </div>
                </div>
              </div>

              {isOrphan && (
                <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs">
                  <strong>Orphan Status Detected:</strong> AICTE Swanath and special state schemes
                  provide 100% full fee waiver and priority support for orphan students.
                </div>
              )}
            </div>

            {/* Earning Members */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Who earns money in your family?
                </span>
                <button
                  type="button"
                  onClick={addEarningMember}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Earning Member
                </button>
              </div>

              {earningMembers.map((member, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <select
                        value={member.relation}
                        onChange={(e) =>
                          updateEarningMember(idx, { relation: e.target.value as any })
                        }
                        className="text-sm font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:outline-hidden"
                      >
                        {fatherAlive && <option value="Father">Father</option>}
                        {motherAlive && <option value="Mother">Mother</option>}
                        <option value="Guardian/other">Guardian / Other</option>
                      </select>
                    </div>

                    {earningMembers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEarningMember(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1 rounded-sm"
                        aria-label="Remove earning member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Profession
                      </label>
                      <select
                        value={member.profession}
                        onChange={(e) =>
                          updateEarningMember(idx, { profession: e.target.value as Profession })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 min-h-[40px]"
                      >
                        {PROFESSIONS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Annual Income (in ₹)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={5000}
                        value={member.annualIncome}
                        onChange={(e) =>
                          updateEarningMember(idx, {
                            annualIncome: parseInt(e.target.value, 10) || 0,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 min-h-[40px]"
                      />
                    </div>
                  </div>

                  {/* Govt Employee check */}
                  <div className="pt-1 flex flex-wrap items-center gap-3 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={member.isGovtEmployee}
                        onChange={(e) =>
                          updateEarningMember(idx, { isGovtEmployee: e.target.checked })
                        }
                        className="rounded-sm text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Government Employee?</span>
                    </label>

                    {member.isGovtEmployee && (
                      <select
                        value={member.govtType || 'State Govt'}
                        onChange={(e) =>
                          updateEarningMember(idx, { govtType: e.target.value as any })
                        }
                        className="px-2 py-1 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800"
                      >
                        <option value="Central Govt">Central Govt</option>
                        <option value="State Govt">State Govt</option>
                        <option value="PSU">PSU / Public Sector</option>
                        <option value="Other">Other</option>
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Total Annual Family Income Box */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Total Annual Family Income
                </span>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Automatically calculated from members above. You can adjust if needed.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-slate-800">₹</span>
                <input
                  type="number"
                  value={totalAnnualIncome}
                  onChange={(e) => setTotalAnnualIncome(parseInt(e.target.value, 10) || 0)}
                  className="w-36 px-3 py-2 rounded-xl border border-emerald-400 bg-white font-black text-base text-emerald-950 focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: PREFERENCES */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Your Scholarship Preferences
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Tell us whether you want to take an exam or prefer direct merit schemes.
              </p>
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-3.5 p-4 rounded-2xl border-2 border-slate-200 hover:border-emerald-500 transition-all cursor-pointer bg-slate-50/40">
                <input
                  type="checkbox"
                  checked={readyForExam}
                  onChange={(e) => setReadyForExam(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded-sm text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-sm font-bold text-slate-900 block">
                    I am ready to give an exam to get a scholarship
                  </span>
                  <span className="text-xs text-slate-500">
                    Includes NMMSS, CSIR NET JRF, Reliance Aptitude Test, etc. Includes free AI mock test prep.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3.5 p-4 rounded-2xl border-2 border-slate-200 hover:border-emerald-500 transition-all cursor-pointer bg-slate-50/40">
                <input
                  type="checkbox"
                  checked={wantsNoExam}
                  onChange={(e) => setWantsNoExam(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded-sm text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-sm font-bold text-slate-900 block">
                    I want scholarships without any exam (Direct Merit / Need-Based)
                  </span>
                  <span className="text-xs text-slate-500">
                    Direct disbursement based on board marks, family income, or community quota (e.g. AICTE Pragati, Post-Matric, PM-USP).
                  </span>
                </div>
              </label>

              {errors.preferences && (
                <p className="text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.preferences}
                </p>
              )}

              {/* Already receiving a scholarship check */}
              <div className="pt-4 border-t border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alreadyReceivingScholarship}
                    onChange={(e) => setAlreadyReceivingScholarship(e.target.checked)}
                    className="w-5 h-5 rounded-sm text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-semibold text-slate-800">
                    I am already receiving another scholarship
                  </span>
                </label>

                {alreadyReceivingScholarship && (
                  <div className="mt-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                    <p className="text-xs text-amber-900 font-medium">
                      Note: Certain central government schemes cannot be combined with another government scheme. We will filter out conflicting schemes for you.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                          Scholarship Scheme Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. State Post-Matric or Private Trust"
                          value={existingScholarshipName}
                          onChange={(e) => setExistingScholarshipName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 min-h-[40px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                          Yearly Amount Received (₹)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 15000"
                          value={existingScholarshipAmount}
                          onChange={(e) =>
                            setExistingScholarshipAmount(parseInt(e.target.value, 10) || 0)
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 min-h-[40px]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: OPTIONAL EXTRAS */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider mb-1">
                Optional Extras
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Sharpen Your Scholarship Match
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                These optional details unlock exclusive merit cutoffs, minority schemes, and Divyangjan benefits.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Previous Marks */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Marks / Percentage in Last Exam (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="e.g. 82"
                  value={marksPercentage}
                  onChange={(e) => setMarksPercentage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold text-sm min-h-[44px]"
                />
              </div>

              {/* School Board / University (Requirement C2) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  School Board / Examining Body
                </label>
                <select
                  value={schoolBoard}
                  onChange={(e) => setSchoolBoard(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-semibold text-sm min-h-[44px]"
                >
                  <optgroup label="National & International Boards">
                    {SCHOOL_BOARDS.filter((b) => b.stateOrType === 'National' || b.stateOrType === 'International').map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="State Boards (SSC / HSC / Intermediate)">
                    {SCHOOL_BOARDS.filter((b) => b.stateOrType !== 'National' && b.stateOrType !== 'International').map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Institution Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  School / College Type
                </label>
                <select
                  value={institutionType}
                  onChange={(e) => setInstitutionType(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-semibold text-sm min-h-[44px]"
                >
                  <option value="Government">Government Institution</option>
                  <option value="Aided">Government Aided Institution</option>
                  <option value="Private">Private / Self-Financed</option>
                </select>
              </div>

              {/* Religious Minority */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Religious Minority Community
                </label>
                <select
                  value={religionMinority}
                  onChange={(e) => setReligionMinority(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-semibold text-sm min-h-[44px]"
                >
                  <option value="None">None / General</option>
                  <option value="Muslim">Muslim</option>
                  <option value="Christian">Christian</option>
                  <option value="Sikh">Sikh</option>
                  <option value="Buddhist">Buddhist</option>
                  <option value="Jain">Jain</option>
                  <option value="Parsi">Parsi</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Disability Criteria */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDisability}
                  onChange={(e) => setHasDisability(e.target.checked)}
                  className="w-5 h-5 rounded-sm text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-bold text-slate-800">
                  Person with Benchmark Disability (Divyangjan)?
                </span>
              </label>

              {hasDisability && (
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-600">Disability Percentage:</span>
                  <input
                    type="number"
                    min={40}
                    max={100}
                    value={disabilityPercentage}
                    onChange={(e) =>
                      setDisabilityPercentage(parseInt(e.target.value, 10) || 40)
                    }
                    className="w-24 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900"
                  />
                  <span className="text-xs text-slate-500">(Min 40% for AICTE Saksham & Central Quota)</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Buttons Nav */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              className="py-3 px-5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors flex items-center gap-2 min-h-[48px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : onCancelEdit ? (
            <button
              type="button"
              onClick={onCancelEdit}
              className="py-3 px-5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors min-h-[48px]"
            >
              Cancel Edit
            </button>
          ) : (
            <div />
          )}

          {currentStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="py-3 px-7 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 min-h-[48px]"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-2">
              {!formProgress.isReady && (
                <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                  Complete required fields ({formProgress.validCount}/{formProgress.totalCount})
                </span>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!formProgress.isReady}
                className={`py-3.5 px-8 rounded-xl font-extrabold text-base shadow-lg transition-all flex items-center gap-2 min-h-[50px] ${
                  formProgress.isReady
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-emerald-600/30 animate-pulse hover:animate-none cursor-pointer'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                <span>Generate Results</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
