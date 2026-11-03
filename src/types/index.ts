export type EducationLevel =
  | 'class_1_10'
  | 'class_11_12'
  | 'iti'
  | 'diploma'
  | 'undergraduate'
  | 'postgraduate'
  | 'doctorate';

export type Gender = 'Male' | 'Female' | 'Transgender' | 'Prefer not to say';

export type CasteCategory =
  | 'General/Unreserved'
  | 'EWS'
  | 'OBC Non-Creamy Layer'
  | 'OBC Creamy Layer'
  | 'SC'
  | 'ST'
  | 'DNT/NT/SNT'
  | 'Prefer not to say';

export interface AiDiagnosticResult {
  id: 'plain' | 'search' | 'json' | 'search_json';
  name: string;
  status: 'PASS' | 'FAIL';
  durationMs: number;
  modelUsed?: string;
  resultPreview?: string;
  sourcesCount?: number;
  sources?: { title: string; url: string }[];
  error?: string;
  pipelineDetails?: string;
}

export type Profession =
  | 'Farmer'
  | 'Agricultural labourer'
  | 'Daily-wage worker'
  | 'Construction worker'
  | 'Private job'
  | 'Self-employed/Business'
  | 'Teacher'
  | 'Doctor/Engineer/other professional'
  | 'Armed forces/ex-serviceman'
  | 'Police/paramilitary'
  | 'Fisherman'
  | 'Artisan/weaver'
  | 'Driver'
  | 'Small shop/street vendor'
  | 'Retired/Pensioner'
  | 'Unemployed'
  | 'Other';

export interface EarningMember {
  relation: 'Father' | 'Mother' | 'Guardian/other';
  profession: Profession;
  annualIncome: number;
  isGovtEmployee: boolean;
  govtType?: 'Central Govt' | 'State Govt' | 'PSU' | 'Other';
}

export interface StudentProfile {
  // Step A: Education
  educationLevel: EducationLevel;
  standard?: string; // For 1st-10th
  stream11_12?: 'Science (PCM)' | 'Science (PCB)' | 'Science (PCMB)' | 'Science (Other)' | 'Commerce' | 'Arts/Humanities' | 'Vocational' | 'Other';
  class11_12Grade?: '11th' | '12th';
  itiTradeType?: 'Engineering' | 'Non-engineering';
  itiTradeName?: string;
  itiYear?: '1st Year' | '2nd Year';
  diplomaType?: string;
  diplomaYear?: '1st Year' | '2nd Year' | '3rd Year';
  ugDegree?: string;
  ugYear?: '1st Year' | '2nd Year' | '3rd Year' | '4th Year' | '5th Year';
  pgDegree?: string;
  pgYear?: '1st Year' | '2nd Year' | '3rd Year';
  phdField?: string;
  phdYear?: '1st Year' | '2nd Year' | '3rd Year' | '4th Year' | '5th Year+';

  // Step B: Personal
  gender: Gender;
  age: number;
  casteCategory: CasteCategory;

  // Step C: Location
  state: string;
  district: string;
  locality: string; // city/town/village

  // Step D: Family
  fatherAlive: boolean;
  motherAlive: boolean;
  isOrphan: boolean;
  earningMembers: EarningMember[];
  totalAnnualIncome: number;

  // Step E: Preferences
  readyForExam: boolean;
  wantsNoExam: boolean;
  alreadyReceivingScholarship: boolean;
  existingScholarshipName?: string;
  existingScholarshipAmount?: number;

  // Step F: Optional extras
  marksPercentage?: number;
  schoolBoard?: 'CBSE' | 'ICSE' | 'State board' | 'Other';
  institutionType?: 'Government' | 'Aided' | 'Private';
  hasDisability?: boolean;
  disabilityPercentage?: number;
  religionMinority?: 'None' | 'Muslim' | 'Christian' | 'Sikh' | 'Buddhist' | 'Jain' | 'Parsi' | 'Other';

  // Consent
  privacyConsent: boolean;
  parentGuardianConsent?: boolean;
}

export type ChanceLevel = 'High' | 'Medium' | 'Low';

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  verified: boolean;
  benefitAmount: string; // e.g. "₹50,000 / year"
  benefitDetails?: string;
  isExamBased: boolean;
  examName?: string;
  lastDateToApply: string; // ISO date or "Not announced yet - check the official website"
  daysLeft?: number;
  chanceLabel: ChanceLevel;
  matchScore: number; // 0 - 100
  whyQualify: string[];
  type: 'Central' | 'State' | 'Private';
  officialUrl: string;
  applyUrl?: string; // Direct application / registration URL
  notificationUrl?: string; // Official PDF / notification URL
  helpdeskContact?: string; // Helpline phone or email
  stateScope?: string; // e.g. 'All India' or specific state name
  verifiedSourceBadge: string;
  lastVerifiedOn: string;
  minIncomeLimit?: number;
  genderEligibility?: 'All' | 'Female Only' | 'Transgender/Other';
  eligibleLevels: EducationLevel[];
  reservedCategories?: CasteCategory[];
  disabilityEligible?: boolean;
  allowsOtherScholarships?: boolean;
  religionMinority?: string;
  tags?: string[];
}

export interface PaperSection {
  name: string;
  questionsCount: number;
  marksPerQuestion: number;
  description?: string;
}

export interface ScholarshipDetailsData extends Scholarship {
  syllabus: {
    subject: string;
    topics: string[];
  }[];
  paperPattern: {
    sections: PaperSection[];
    totalQuestions: number;
    marksPerQuestion: number;
    mode: 'Online (CBT)' | 'Offline (Pen & Paper)' | 'Hybrid' | 'Merit/Direct';
    language: string;
    isPatternVerified?: boolean;
    verificationNotice?: string;
  };
  negativeMarking: {
    hasNegativeMarking: boolean;
    description: string;
    ratio: number; // e.g. 0.25 (1/4 mark)
  };
  dates: {
    applicationStart: string;
    applicationEnd: string;
    examDate?: string;
    isTentative?: boolean;
    notice?: string;
  };
  durationMinutes: number;
  totalMarks: number;
  howToPrepare: {
    weekByWeekPlan: { week: string; focus: string; action: string }[];
    subjectTips: { subject: string; tips: string }[];
    freeResources: { title: string; link: string; description: string }[];
    commonMistakes: string[];
  };
  selectionProcessNoExam?: string[];
  howToApplySteps?: string[];
  documentsNeeded: {
    id: string;
    name: string;
    required: boolean;
    description: string;
  }[];
  previousYearPapers: {
    year: string;
    sourceTitle: string;
    officialUrl?: string;
    note?: string;
  }[];
}

export interface MockQuestion {
  id: string;
  sectionName: string;
  subject: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionText: string; // KaTeX math supported like $x^2 + y^2 = r^2$
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  marks: number;
  negativeMarks: number;
}

export interface MockTest {
  id: string;
  scholarshipId: string;
  scholarshipName: string;
  totalQuestions: number;
  totalMarks: number;
  durationMinutes: number;
  negativeMarkRatio: number;
  sections: {
    name: string;
    questions: MockQuestion[];
  }[];
  isPatternVerified?: boolean;
  verificationSource?: string;
  banner?: string;
}

export interface QuestionReviewItem {
  questionId: string;
  selectedOption: number | null; // null if unattempted
  isCorrect: boolean;
  timeSeconds: number;
  note: string;
  bookmarked: boolean;
  question?: MockQuestion; // snapshot of question for review outside session
}

export interface TestAttempt {
  id: string;
  testId: string;
  scholarshipId: string;
  scholarshipName: string;
  date: string;
  score: number;
  maxScore: number;
  accuracy: number; // percentage
  correctCount: number;
  wrongCount: number;
  unattemptedCount: number;
  totalTimeSeconds: number;
  sectionAnalysis: {
    sectionName: string;
    score: number;
    maxScore: number;
    accuracy: number;
    timeSeconds: number;
  }[];
  topicAnalysis: {
    topic: string;
    subject: string;
    correct: number;
    total: number;
  }[];
  timeAnalysis: {
    questionId: string;
    questionNumber: number;
    timeSeconds: number;
    isUnusuallyLong: boolean;
  }[];
  questionReviews: QuestionReviewItem[];
  bookmarkedQuestionIds: string[];
  userNotes: { questionNumber: number; questionId: string; note: string; question?: MockQuestion }[];
  aiImprovementPlan: string[];
}

export interface StudentComplaint {
  id: string;
  category: string;
  message: string;
  userId: string;
  userName: string;
  userContact?: string;
  userPhoneOrEmail?: string;
  createdAt: string;
  status: 'Open' | 'In Review' | 'In Progress' | 'Resolved';
  officialHelpdeskUrl?: string;
  scholarshipName?: string;
  brokenUrl?: string;
}

export type SupportTicket = StudentComplaint;

export interface SavedScholarshipItem {
  id: string;
  userId: string;
  scholarship: Scholarship;
  savedAt: string;
  applied: boolean;
  appliedAt?: string | null;
  reminders: {
    open: boolean;
    sevenDays: boolean;
    oneDay: boolean;
    threeDaysExam: boolean;
  };
  lastChecked?: string;
}

export interface StudentNotification {
  id: string;
  userId: string;
  scholarshipId?: string;
  scholarshipName?: string;
  title: string;
  message: string;
  type: 'opened' | 'closing_soon' | 'dates_changed' | 'exam_soon' | 'general' | 'deadline_7d' | 'deadline_1d';
  read: boolean;
  createdAt: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  createdAt?: string;
  authMethod?: 'google';
  savedProfile?: StudentProfile;
  checklistTicks?: Record<string, string[]>;
  savedScholarshipIds?: string[];
  testAttempts?: TestAttempt[];
  tickets?: StudentComplaint[];
}

export interface MultiGroupFilters {
  examTypes: ('exam' | 'no-exam')[];
  providers: ('Central' | 'State' | 'Private')[];
  educationLevels: EducationLevel[];
  statuses: ('open' | 'upcoming')[];
  sortBy: 'chance' | 'deadline' | 'amount';
  searchQuery?: string;
}


