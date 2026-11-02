import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTotalFamilyIncome,
  calculateDaysLeft,
  evaluateScholarshipEligibility,
  calculateTestResults,
  calculateFormProgress,
  calculateFacetCounts,
  filterAndRankScholarships,
} from './rules.ts';
import { StudentProfile, Scholarship, MockTest } from '../types/index.ts';

test('calculateTotalFamilyIncome calculates correctly and ignores negative numbers', () => {
  const members = [
    {
      relation: 'Father' as const,
      profession: 'Farmer' as const,
      annualIncome: 90000,
      isGovtEmployee: false,
    },
    {
      relation: 'Mother' as const,
      profession: 'Daily-wage worker' as const,
      annualIncome: 45000,
      isGovtEmployee: false,
    },
  ];
  assert.equal(calculateTotalFamilyIncome(members), 135000);
  assert.equal(calculateTotalFamilyIncome([]), 0);
});

test('calculateDaysLeft calculates days accurately', () => {
  const today = new Date('2026-10-31T10:00:00Z');
  const target = '2026-11-10T10:00:00Z';
  assert.equal(calculateDaysLeft(target, today), 10);
  assert.equal(calculateDaysLeft('Not announced yet - check the official website', today), null);
});

test('evaluateScholarshipEligibility filters out mismatched education or income ceiling', () => {
  const profile: StudentProfile = {
    educationLevel: 'undergraduate',
    gender: 'Female',
    age: 19,
    casteCategory: 'OBC Non-Creamy Layer',
    state: 'Maharashtra',
    district: 'Pune',
    locality: 'Pune city',
    fatherAlive: true,
    motherAlive: true,
    isOrphan: false,
    earningMembers: [],
    totalAnnualIncome: 120000,
    readyForExam: true,
    wantsNoExam: true,
    alreadyReceivingScholarship: false,
    privacyConsent: true,
  };

  const aictePragati: Scholarship = {
    id: 'pragati-1',
    name: 'AICTE Pragati Scholarship for Girls',
    provider: 'AICTE, Ministry of Education',
    verified: true,
    benefitAmount: '₹50,000 / year',
    isExamBased: false,
    lastDateToApply: '2026-12-31',
    chanceLabel: 'High',
    matchScore: 90,
    whyQualify: [],
    type: 'Central',
    officialUrl: 'https://www.aicte-india.org',
    verifiedSourceBadge: 'Official AICTE Portal',
    lastVerifiedOn: '2026-10-15',
    minIncomeLimit: 800000,
    genderEligibility: 'Female Only',
    eligibleLevels: ['diploma', 'undergraduate'],
  };

  const evalResult = evaluateScholarshipEligibility(profile, aictePragati);
  assert.equal(evalResult.isEligible, true);
  assert.equal(evalResult.chanceLabel, 'High');

  // Male student should not be eligible for Pragati
  const maleProfile: StudentProfile = { ...profile, gender: 'Male' };
  const maleResult = evaluateScholarshipEligibility(maleProfile, aictePragati);
  assert.equal(maleResult.isEligible, false);

  // Income exceeds ceiling
  const richProfile: StudentProfile = { ...profile, totalAnnualIncome: 1000000 };
  const richResult = evaluateScholarshipEligibility(richProfile, aictePragati);
  assert.equal(richResult.isEligible, false);
});

test('calculateTestResults applies negative marking and calculates accuracy correctly', () => {
  const mockTest: MockTest = {
    id: 'test-1',
    scholarshipId: 'pragati-1',
    scholarshipName: 'Sample Exam',
    totalQuestions: 2,
    totalMarks: 8,
    durationMinutes: 10,
    negativeMarkRatio: 0.25,
    sections: [
      {
        name: 'General Awareness',
        questions: [
          {
            id: 'q1',
            sectionName: 'General Awareness',
            subject: 'Science',
            topic: 'Physics',
            difficulty: 'Easy',
            questionText: 'What is the SI unit of Force?',
            options: ['Joule', 'Newton', 'Pascal', 'Watt'],
            correctOptionIndex: 1, // Newton
            explanation: 'Newton is the SI unit of Force.',
            marks: 4,
            negativeMarks: 1,
          },
          {
            id: 'q2',
            sectionName: 'General Awareness',
            subject: 'Maths',
            topic: 'Algebra',
            difficulty: 'Medium',
            questionText: 'Solve $2x = 10$',
            options: ['3', '4', '5', '6'],
            correctOptionIndex: 2, // 5
            explanation: '$x = 10 / 2 = 5$',
            marks: 4,
            negativeMarks: 1,
          },
        ],
      },
    ],
  };

  // Case 1: Q1 right, Q2 wrong
  const answers = { q1: 1, q2: 0 };
  const times = { q1: 30, q2: 50 };
  const bookmarks = { q2: true };
  const notes = { q2: 'Review algebra formulas' };

  const result = calculateTestResults(mockTest, answers, times, bookmarks, notes);
  assert.equal(result.correctCount, 1);
  assert.equal(result.wrongCount, 1);
  assert.equal(result.unattemptedCount, 0);
  assert.equal(result.score, 3); // 4 - 1 = 3
  assert.equal(result.accuracy, 50);
  assert.equal(result.bookmarkedQuestionIds.length, 1);
  assert.equal(result.userNotes.length, 1);
  assert.equal(result.userNotes[0].note, 'Review algebra formulas');
});

test('calculateFormProgress starts at 0% and reaches 100% only when all required fields are valid', () => {
  // Empty profile: 0%
  const emptyProgress = calculateFormProgress({});
  assert.equal(emptyProgress.percent, 0);
  assert.equal(emptyProgress.isReady, false);

  // Partial profile
  const partialProfile: Partial<StudentProfile> = {
    privacyConsent: true,
    educationLevel: 'undergraduate',
    ugDegree: 'B.Tech',
    ugYear: '2nd Year',
    gender: 'Female',
    age: 19,
    casteCategory: 'General/Unreserved',
    state: 'Maharashtra',
    district: 'Pune',
    locality: 'Kothrud',
  };
  const partialProgress = calculateFormProgress(partialProfile);
  assert.ok(partialProgress.percent > 0 && partialProgress.percent < 100);
  assert.equal(partialProgress.isReady, false);

  // Full valid profile
  const fullProfile: StudentProfile = {
    privacyConsent: true,
    educationLevel: 'undergraduate',
    ugDegree: 'B.Tech',
    ugYear: '2nd Year',
    gender: 'Female',
    age: 19,
    casteCategory: 'General/Unreserved',
    state: 'Maharashtra',
    district: 'Pune',
    locality: 'Kothrud',
    fatherAlive: true,
    motherAlive: true,
    isOrphan: false,
    earningMembers: [
      { relation: 'Father', profession: 'Farmer', annualIncome: 90000, isGovtEmployee: false }
    ],
    totalAnnualIncome: 90000,
    readyForExam: true,
    wantsNoExam: false,
    alreadyReceivingScholarship: false,
  };
  const fullProgress = calculateFormProgress(fullProfile);
  assert.equal(fullProgress.percent, 100);
  assert.equal(fullProgress.isReady, true);
});

test('filterAndRankScholarships with multi-group filters and facet counts works independently', () => {

  const testList: Scholarship[] = [
    {
      id: 's1',
      name: 'Central Exam Scheme',
      provider: 'Ministry of Education',
      verified: true,
      benefitAmount: '₹50,000 / year',
      isExamBased: true,
      lastDateToApply: '2026-12-31',
      chanceLabel: 'High',
      matchScore: 90,
      whyQualify: ['Central grant'],
      type: 'Central',
      officialUrl: 'https://scholarships.gov.in',
      verifiedSourceBadge: 'NSP',
      lastVerifiedOn: '2026-10-25',
      eligibleLevels: ['undergraduate'],
      tags: ['Engineering', 'NSP'],
    },
    {
      id: 's2',
      name: 'State Merit Direct',
      provider: 'State Govt',
      verified: true,
      benefitAmount: '₹20,000 / year',
      isExamBased: false,
      lastDateToApply: '2026-12-31',
      chanceLabel: 'Medium',
      matchScore: 70,
      whyQualify: ['State merit'],
      type: 'State',
      officialUrl: 'https://mahadbt.maharashtra.gov.in',
      verifiedSourceBadge: 'State',
      lastVerifiedOn: '2026-10-25',
      eligibleLevels: ['diploma'],
      tags: ['Diploma', 'MahaDBT'],
    },
  ];

  const facets = calculateFacetCounts(testList, { sortBy: 'chance' });
  assert.equal(facets.examTypes.exam, 1);
  assert.equal(facets.examTypes['no-exam'], 1);
  assert.equal(facets.providers.Central, 1);
  assert.equal(facets.providers.State, 1);

  // Filter by exam
  const filtered = filterAndRankScholarships(testList, {
    examTypes: ['exam'],
    sortBy: 'chance',
  });
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, 's1');

  // Search by keyword in tags or provider
  const searched = filterAndRankScholarships(testList, {
    searchQuery: 'mahadbt',
    sortBy: 'chance',
  });
  assert.equal(searched.length, 1);
  assert.equal(searched[0].id, 's2');
});

