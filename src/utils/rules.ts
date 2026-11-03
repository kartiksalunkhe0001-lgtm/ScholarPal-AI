import {
  EarningMember,
  StudentProfile,
  Scholarship,
  MockTest,
  TestAttempt,
  ChanceLevel,
  EducationLevel,
} from '../types/index.ts';

/**
 * Calculates the total annual family income from the list of earning members.
 */
export function calculateTotalFamilyIncome(earningMembers: EarningMember[]): number {
  if (!earningMembers || earningMembers.length === 0) return 0;
  return earningMembers.reduce((sum, member) => {
    const inc = Number(member.annualIncome) || 0;
    return sum + (inc > 0 ? inc : 0);
  }, 0);
}

/**
 * Calculates days left from today until a target ISO date string.
 * Returns negative if expired, or null if date is not specified.
 */
export function calculateDaysLeft(targetDateStr: string, currentDate: Date = new Date()): number | null {
  if (!targetDateStr || targetDateStr.toLowerCase().includes('not announced')) {
    return null;
  }
  const target = new Date(targetDateStr);
  if (isNaN(target.getTime())) return null;
  
  const diffTime = target.getTime() - currentDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export interface MatchEvaluation {
  isEligible: boolean;
  score: number;
  chanceLabel: ChanceLevel;
  reasons: string[];
}

/**
 * Evaluates student eligibility and match percentage against a scholarship's criteria.
 */
export function evaluateScholarshipEligibility(
  profile: StudentProfile,
  scholarship: Scholarship
): MatchEvaluation {
  const reasons: string[] = [];
  let score = 50; // base score

  // 1. Education Level check
  if (scholarship.eligibleLevels && scholarship.eligibleLevels.length > 0) {
    if (!scholarship.eligibleLevels.includes(profile.educationLevel)) {
      return {
        isEligible: false,
        score: 0,
        chanceLabel: 'Low',
        reasons: ['Education level does not match requirement.'],
      };
    } else {
      score += 15;
      reasons.push('Matches your current education level.');
    }
  }

  // 2. Gender check
  if (scholarship.genderEligibility && scholarship.genderEligibility !== 'All') {
    if (scholarship.genderEligibility === 'Female Only' && profile.gender !== 'Female') {
      return {
        isEligible: false,
        score: 0,
        chanceLabel: 'Low',
        reasons: ['Reserved exclusively for female candidates.'],
      };
    }
    if (scholarship.genderEligibility === 'Female Only' && profile.gender === 'Female') {
      score += 20;
      reasons.push('Special reservation/quota for female students.');
    }
  }

  // 3. Income limit check
  const studentIncome = Number(profile.totalAnnualIncome) || 0;
  if (scholarship.minIncomeLimit && scholarship.minIncomeLimit > 0) {
    if (studentIncome > scholarship.minIncomeLimit) {
      return {
        isEligible: false,
        score: 0,
        chanceLabel: 'Low',
        reasons: [`Family income exceeds max ceiling of ₹${scholarship.minIncomeLimit.toLocaleString('en-IN')}`],
      };
    } else {
      score += 15;
      reasons.push(`Family income (₹${studentIncome.toLocaleString('en-IN')}) is well within the ceiling.`);
    }
  }

  // 4. Caste reservation check
  if (scholarship.reservedCategories && scholarship.reservedCategories.length > 0) {
    const isCategoryEligible = scholarship.reservedCategories.includes(profile.casteCategory);
    if (!isCategoryEligible) {
      return {
        isEligible: false,
        score: 0,
        chanceLabel: 'Low',
        reasons: ['Specific category reservation does not match.'],
      };
    } else {
      score += 15;
      reasons.push(`Direct category entitlement for ${profile.casteCategory}.`);
    }
  }

  // 5. Exam preference alignment
  if (scholarship.isExamBased && profile.wantsNoExam && !profile.readyForExam) {
    return {
      isEligible: false,
      score: 0,
      chanceLabel: 'Low',
      reasons: ['This is an exam-based scholarship, but your preference is without exam.'],
    };
  }

  // 6. Existing scholarship conflict check
  if (profile.alreadyReceivingScholarship && scholarship.allowsOtherScholarships === false) {
    return {
      isEligible: false,
      score: 0,
      chanceLabel: 'Low',
      reasons: ['Cannot be combined with another existing government scholarship.'],
    };
  }

  // 7. Special bonus factors
  if (profile.isOrphan) {
    score += 15;
    reasons.push('Priority consideration for orphan students.');
  }
  if (profile.hasDisability && (profile.disabilityPercentage ?? 0) >= 40) {
    score += 15;
    reasons.push(`Divyangjan quota eligibility (${profile.disabilityPercentage}% benchmark disability).`);
  }
  if (profile.marksPercentage && profile.marksPercentage >= 80) {
    score += 10;
    reasons.push(`Strong academic merit record (${profile.marksPercentage}% in previous exam).`);
  }

  // Bound score
  const finalScore = Math.min(98, Math.max(25, score));
  let chanceLabel: ChanceLevel = 'Medium';
  if (finalScore >= 75) {
    chanceLabel = 'High';
  } else if (finalScore < 50) {
    chanceLabel = 'Low';
  }

  return {
    isEligible: true,
    score: finalScore,
    chanceLabel,
    reasons: reasons.slice(0, 3),
  };
}

/**
 * Calculates real form progress based strictly on required fields that apply to this student.
 * Starts at 0% and reaches 100% only when every required field has a valid answer.
 * Optional fields (marks, schoolBoard, institutionType, disability, religion) do not count.
 */
export function calculateFormProgress(profile: Partial<StudentProfile>): {
  percent: number;
  validCount: number;
  totalCount: number;
  isReady: boolean;
} {
  if (!profile) return { percent: 0, validCount: 0, totalCount: 1, isReady: false };

  let totalRequired = 0;
  let validRequired = 0;

  const checkField = (isValid: boolean) => {
    totalRequired += 1;
    if (isValid) validRequired += 1;
  };

  // 1. Consent (Step 0)
  checkField(Boolean(profile.privacyConsent));
  if (typeof profile.age === 'number' && profile.age < 18) {
    checkField(Boolean(profile.parentGuardianConsent));
  }

  // 2. Education (Step 1)
  checkField(Boolean(profile.educationLevel));

  if (profile.educationLevel === 'class_1_10') {
    checkField(Boolean(profile.standard && profile.standard.trim().length > 0));
  } else if (profile.educationLevel === 'class_11_12') {
    checkField(Boolean(profile.class11_12Grade));
    checkField(Boolean(profile.stream11_12));
  } else if (profile.educationLevel === 'iti') {
    checkField(Boolean(profile.itiTradeType));
    checkField(Boolean(profile.itiTradeName && profile.itiTradeName.trim().length > 0));
    checkField(Boolean(profile.itiYear));
  } else if (profile.educationLevel === 'diploma') {
    checkField(Boolean(profile.diplomaType && profile.diplomaType.trim().length > 0));
    checkField(Boolean(profile.diplomaYear));
  } else if (profile.educationLevel === 'undergraduate') {
    checkField(Boolean(profile.ugDegree && profile.ugDegree.trim().length > 0));
    checkField(Boolean(profile.ugYear));
  } else if (profile.educationLevel === 'postgraduate') {
    checkField(Boolean(profile.pgDegree && profile.pgDegree.trim().length > 0));
    checkField(Boolean(profile.pgYear));
  } else if (profile.educationLevel === 'doctorate') {
    checkField(Boolean(profile.phdField && profile.phdField.trim().length > 0));
    checkField(Boolean(profile.phdYear));
  }

  // 3. Personal (Step 2)
  checkField(Boolean(profile.gender));
  checkField(typeof profile.age === 'number' && profile.age >= 4 && profile.age <= 75);
  checkField(Boolean(profile.casteCategory));

  // 4. Location (Step 3)
  checkField(Boolean(profile.state && profile.state.trim().length > 0));
  checkField(Boolean(profile.district && profile.district.trim().length > 0));
  checkField(Boolean(profile.locality && profile.locality.trim().length > 0));

  // 5. Family & Income (Step 4)
  checkField(profile.fatherAlive !== undefined);
  checkField(profile.motherAlive !== undefined);
  const hasEarningMembers =
    Array.isArray(profile.earningMembers) &&
    profile.earningMembers.length > 0 &&
    profile.earningMembers.every((m) => m.profession && typeof m.annualIncome === 'number');
  checkField(hasEarningMembers);

  // 6. Preferences (Step 5)
  // Student must select at least one preference: readyForExam or wantsNoExam
  checkField(Boolean(profile.readyForExam || profile.wantsNoExam));
  if (profile.alreadyReceivingScholarship) {
    checkField(Boolean(profile.existingScholarshipName && profile.existingScholarshipName.trim().length > 0));
  }

  const percent = totalRequired > 0 ? Math.round((validRequired / totalRequired) * 100) : 0;
  const isReady = validRequired === totalRequired && totalRequired > 0;

  return {
    percent,
    validCount: validRequired,
    totalCount: totalRequired,
    isReady,
  };
}

export interface FilterOptions {
  typeFilter?: 'all' | 'Central' | 'State' | 'Private';
  examFilter?: 'all' | 'exam' | 'no-exam';
  examTypes?: ('exam' | 'no-exam')[];
  providers?: ('Central' | 'State' | 'Private')[];
  educationLevels?: EducationLevel[];
  statuses?: ('open' | 'upcoming')[];
  sortBy: 'chance' | 'deadline' | 'amount';
  searchQuery?: string;
}

/**
 * Calculates facet counts for each filter group independently from the master list.
 */
export function calculateFacetCounts(
  scholarships: Scholarship[],
  activeFilters: FilterOptions
) {
  const counts = {
    examTypes: {
      exam: 0,
      'no-exam': 0,
    },
    providers: {
      Central: 0,
      State: 0,
      Private: 0,
    },
    educationLevels: {
      class_1_10: 0,
      class_11_12: 0,
      iti: 0,
      diploma: 0,
      undergraduate: 0,
      postgraduate: 0,
      doctorate: 0,
    } as Record<EducationLevel, number>,
    statuses: {
      open: 0,
      upcoming: 0,
    },
  };

  scholarships.forEach((s) => {
    // Exam
    if (s.isExamBased) counts.examTypes.exam++;
    else counts.examTypes['no-exam']++;

    // Provider
    if (s.type === 'Central') counts.providers.Central++;
    else if (s.type === 'State') counts.providers.State++;
    else if (s.type === 'Private') counts.providers.Private++;

    // Education Levels
    if (s.eligibleLevels) {
      s.eligibleLevels.forEach((lvl) => {
        if (counts.educationLevels[lvl] !== undefined) {
          counts.educationLevels[lvl]++;
        }
      });
    }

    // Status
    const days = s.daysLeft;
    if (days !== undefined && days >= 0) {
      counts.statuses.open++;
    } else if (!s.lastDateToApply || s.lastDateToApply.toLowerCase().includes('not announced')) {
      counts.statuses.upcoming++;
    } else {
      counts.statuses.open++;
    }
  });

  return counts;
}

/**
 * Filters and ranks scholarships according to student profile, independent multi-group filters, and sorting criteria.
 */
export function filterAndRankScholarships(
  scholarships: Scholarship[],
  filters: FilterOptions,
  currentDate: Date = new Date()
): Scholarship[] {
  let list = [...scholarships];

  // 1. Exam filter (independent group)
  if (filters.examTypes && filters.examTypes.length > 0) {
    list = list.filter((s) => {
      const isExam = s.isExamBased;
      if (filters.examTypes!.includes('exam') && isExam) return true;
      if (filters.examTypes!.includes('no-exam') && !isExam) return true;
      return false;
    });
  } else if (filters.examFilter && filters.examFilter !== 'all') {
    if (filters.examFilter === 'exam') {
      list = list.filter((s) => s.isExamBased);
    } else if (filters.examFilter === 'no-exam') {
      list = list.filter((s) => !s.isExamBased);
    }
  }

  // 2. Provider type filter (independent group)
  if (filters.providers && filters.providers.length > 0) {
    list = list.filter((s) => filters.providers!.includes(s.type));
  } else if (filters.typeFilter && filters.typeFilter !== 'all') {
    list = list.filter((s) => s.type === filters.typeFilter);
  }

  // 3. Education level filter (independent group)
  if (filters.educationLevels && filters.educationLevels.length > 0) {
    list = list.filter((s) => {
      if (!s.eligibleLevels || s.eligibleLevels.length === 0) return true;
      return s.eligibleLevels.some((lvl) => filters.educationLevels!.includes(lvl));
    });
  }

  // 4. Update days left
  list = list.map((item) => {
    const days = calculateDaysLeft(item.lastDateToApply, currentDate);
    return {
      ...item,
      daysLeft: days !== null ? days : undefined,
    };
  });

  // 5. Application status filter (open vs upcoming)
  if (filters.statuses && filters.statuses.length > 0) {
    list = list.filter((item) => {
      const isUpcoming =
        !item.lastDateToApply || item.lastDateToApply.toLowerCase().includes('not announced');
      const isOpen = item.daysLeft !== undefined && item.daysLeft >= 0;

      if (filters.statuses!.includes('upcoming') && isUpcoming) return true;
      if (filters.statuses!.includes('open') && isOpen) return true;
      return false;
    });
  } else {
    // Exclude expired scholarships (daysLeft < 0)
    list = list.filter((item) => item.daysLeft === undefined || item.daysLeft >= 0);
  }

  // 6. Search query across all fields (name, provider, state, tags, whyQualify)
  if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
    const rawQ = filters.searchQuery.toLowerCase().trim();
    const tokens = rawQ.split(/\s+/).filter(Boolean);

    list = list.filter((s) => {
      const searchableText = [
        s.name,
        s.provider,
        s.stateScope || '',
        s.examName || '',
        s.type,
        ...(s.whyQualify || []),
        ...(s.tags || []),
      ]
        .join(' ')
        .toLowerCase();

      // Check if all or any tokens match
      return tokens.every((token) => searchableText.includes(token));
    });
  }

  // 7. Sorting
  list.sort((a, b) => {
    if (filters.sortBy === 'chance') {
      const chanceOrder = { High: 3, Medium: 2, Low: 1 };
      const diff = chanceOrder[b.chanceLabel] - chanceOrder[a.chanceLabel];
      if (diff !== 0) return diff;
      return b.matchScore - a.matchScore;
    }
    if (filters.sortBy === 'deadline') {
      const aDays = a.daysLeft ?? 9999;
      const bDays = b.daysLeft ?? 9999;
      return aDays - bDays;
    }
    if (filters.sortBy === 'amount') {
      const getNum = (str: string) => {
        const m = str.replace(/,/g, '').match(/\d+/);
        return m ? parseInt(m[0], 10) : 0;
      };
      return getNum(b.benefitAmount) - getNum(a.benefitAmount);
    }
    return 0;
  });

  return list;
}


/**
 * Calculates test attempt results, applying correct negative marking and topic breakdown.
 */
export function calculateTestResults(
  mockTest: MockTest,
  userAnswers: Record<string, number>, // questionId -> selectedIndex
  timeSpentMap: Record<string, number>, // questionId -> seconds
  bookmarks: Record<string, boolean>,
  notes: Record<string, string>
): TestAttempt {
  const allQuestions = mockTest.sections.flatMap((s) => s.questions);
  const totalQuestions = allQuestions.length;

  let correctCount = 0;
  let wrongCount = 0;
  let unattemptedCount = 0;
  let totalScore = 0;
  let totalTimeSeconds = 0;

  const sectionMap: Record<
    string,
    { score: number; maxScore: number; correct: number; total: number; timeSeconds: number }
  > = {};

  const topicMap: Record<string, { topic: string; subject: string; correct: number; total: number }> =
    {};

  // Initialize sections
  mockTest.sections.forEach((sec) => {
    sectionMap[sec.name] = { score: 0, maxScore: 0, correct: 0, total: 0, timeSeconds: 0 };
  });

  const questionReviews = allQuestions.map((q) => {
    const userSelected = userAnswers[q.id];
    const isAttempted = userSelected !== undefined && userSelected !== null;
    const isCorrect = isAttempted && userSelected === q.correctOptionIndex;
    const time = timeSpentMap[q.id] || 0;
    totalTimeSeconds += time;

    // Section update
    if (!sectionMap[q.sectionName]) {
      sectionMap[q.sectionName] = { score: 0, maxScore: 0, correct: 0, total: 0, timeSeconds: 0 };
    }
    const sec = sectionMap[q.sectionName];
    sec.maxScore += q.marks;
    sec.total += 1;
    sec.timeSeconds += time;

    // Topic update
    const topicKey = `${q.subject}:::${q.topic}`;
    if (!topicMap[topicKey]) {
      topicMap[topicKey] = { topic: q.topic, subject: q.subject, correct: 0, total: 0 };
    }
    topicMap[topicKey].total += 1;

    if (!isAttempted) {
      unattemptedCount += 1;
    } else if (isCorrect) {
      correctCount += 1;
      totalScore += q.marks;
      sec.score += q.marks;
      sec.correct += 1;
      topicMap[topicKey].correct += 1;
    } else {
      wrongCount += 1;
      const penalty = q.negativeMarks || q.marks * (mockTest.negativeMarkRatio || 0.25);
      totalScore -= penalty;
      sec.score -= penalty;
    }

    return {
      questionId: q.id,
      selectedOption: isAttempted ? userSelected : null,
      isCorrect,
      timeSeconds: time,
      note: notes[q.id] || '',
      bookmarked: Boolean(bookmarks[q.id]),
      question: q,
    };
  });

  // Calculate average time per question to flag unusually long ones (> 2.2x avg)
  const avgTime = totalQuestions > 0 ? totalTimeSeconds / totalQuestions : 60;
  const timeThreshold = Math.max(120, avgTime * 2.2);

  const timeAnalysis = allQuestions.map((q, idx) => {
    const t = timeSpentMap[q.id] || 0;
    return {
      questionId: q.id,
      questionNumber: idx + 1,
      timeSeconds: t,
      isUnusuallyLong: t > timeThreshold,
    };
  });

  const attemptedCount = correctCount + wrongCount;
  const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

  const sectionAnalysis = Object.entries(sectionMap).map(([name, data]) => ({
    sectionName: name,
    score: Math.max(0, Math.round(data.score * 100) / 100),
    maxScore: data.maxScore,
    accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    timeSeconds: data.timeSeconds,
  }));

  const topicAnalysis = Object.values(topicMap);

  const bookmarkedQuestionIds = Object.keys(bookmarks).filter((id) => bookmarks[id]);
  const userNotesList = allQuestions
    .map((q, idx) => ({
      questionNumber: idx + 1,
      questionId: q.id,
      note: notes[q.id] || '',
      question: q,
    }))
    .filter((n) => n.note.trim().length > 0);

  // Generate actionable AI improvement plan based on weak areas
  const weakTopics = topicAnalysis.filter((t) => t.correct / t.total < 0.6).map((t) => t.topic);
  const longQuestionsCount = timeAnalysis.filter((t) => t.isUnusuallyLong).length;

  const aiImprovementPlan: string[] = [];
  if (accuracy < 70) {
    aiImprovementPlan.push(
      'Target accuracy before speed: Minimize speculative guessing to prevent negative marks penalty.'
    );
  }
  if (weakTopics.length > 0) {
    aiImprovementPlan.push(
      `Focus revision on priority topics with sub-60% accuracy: ${weakTopics.slice(0, 3).join(', ')}.`
    );
  }
  if (longQuestionsCount >= 3) {
    aiImprovementPlan.push(
      `Time pacing alert: ${longQuestionsCount} questions exceeded average solving time. Learn to bookmark and skip tedious questions on first pass.`
    );
  }
  if (unattemptedCount > totalQuestions * 0.3) {
    aiImprovementPlan.push(
      'Coverage strategy: Increase reading speed so you reach every question before timer zero.'
    );
  }
  if (aiImprovementPlan.length === 0) {
    aiImprovementPlan.push('Excellent pacing and high precision! Keep revising past papers and maintaining speed.');
  }

  return {
    id: `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    testId: mockTest.id,
    scholarshipId: mockTest.scholarshipId,
    scholarshipName: mockTest.scholarshipName,
    date: new Date().toISOString(),
    score: Math.max(0, Math.round(totalScore * 100) / 100),
    maxScore: mockTest.totalMarks,
    accuracy,
    correctCount,
    wrongCount,
    unattemptedCount,
    totalTimeSeconds,
    sectionAnalysis,
    topicAnalysis,
    timeAnalysis,
    questionReviews,
    bookmarkedQuestionIds,
    userNotes: userNotesList,
    aiImprovementPlan,
  };
}
