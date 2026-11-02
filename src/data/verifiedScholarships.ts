import { ScholarshipDetailsData } from '../types/index.ts';

export const VERIFIED_SCHOLARSHIPS_DB: ScholarshipDetailsData[] = [
  // 1. AICTE Pragati Scholarship for Girls
  {
    id: 'aicte-pragati',
    name: 'AICTE Pragati Scholarship Scheme for Girl Students',
    provider: 'All India Council for Technical Education (AICTE), Ministry of Education, Govt. of India',
    verified: true,
    benefitAmount: '₹50,000 / year',
    benefitDetails: '₹50,000 per annum for every year of study towards college fees, books, and equipment.',
    isExamBased: false,
    lastDateToApply: '2026-12-31',
    daysLeft: 61,
    chanceLabel: 'High',
    matchScore: 94,
    whyQualify: [
      'Reserved exclusively for girl students admitted to technical degree or diploma courses.',
      'Family income limit is up to ₹8,00,000 per annum.',
      'Direct merit-based allocation on official National Scholarship Portal.'
    ],
    type: 'Central',
    officialUrl: 'https://www.aicte-india.org/schemes/students-development-schemes/Pragati',
    verifiedSourceBadge: 'Official AICTE & NSP Portal',
    lastVerifiedOn: '2026-10-20',
    minIncomeLimit: 800000,
    genderEligibility: 'Female Only',
    eligibleLevels: ['diploma', 'undergraduate'],
    syllabus: [
      {
        subject: 'Academic Merit Evaluation',
        topics: ['Class 12th Board marks', 'JEE Main / State CET Rank', 'Technical Diploma entry score']
      }
    ],
    paperPattern: {
      sections: [],
      totalQuestions: 0,
      marksPerQuestion: 0,
      mode: 'Merit/Direct',
      language: 'English/Hindi'
    },
    negativeMarking: {
      hasNegativeMarking: false,
      description: 'No examination required. Selected directly on the basis of qualifying exam merit.',
      ratio: 0
    },
    dates: {
      applicationStart: '2026-09-01',
      applicationEnd: '2026-12-31'
    },
    durationMinutes: 0,
    totalMarks: 100,
    howToPrepare: {
      weekByWeekPlan: [
        { week: 'Week 1', focus: 'Document Collation', action: 'Obtain digital caste certificate, income certificate from Tehsildar, and college admission bonafide.' },
        { week: 'Week 2', focus: 'NSP Registration', action: 'Create OTR (One Time Registration) profile on scholarships.gov.in and verify Aadhaar linkage.' },
        { week: 'Week 3', focus: 'Institute Verification', action: 'Coordinate with College Nodal Officer (INO) for institute-level verification before deadline.' }
      ],
      subjectTips: [
        { subject: 'Income Certificate', tips: 'Ensure validity covers current financial year 2026-27 and specifies family income under 8 Lakhs.' },
        { subject: 'Bank Account', tips: 'Account must be in student name and strictly seeded with Aadhaar in NPCI mapper.' }
      ],
      freeResources: [
        { title: 'AICTE Official Portal Guidelines', link: 'https://www.aicte-india.org', description: 'Complete scheme rules, FAQs and affidavit formats.' },
        { title: 'National Scholarship Portal Manual', link: 'https://scholarships.gov.in', description: 'Step by step manual for student registration and tracking.' }
      ],
      commonMistakes: [
        'Entering parent bank details instead of student personal bank account.',
        'Delay in college nodal officer approval before final freeze date.',
        'Submitting salary slip instead of revenue authority income certificate.'
      ]
    },
    selectionProcessNoExam: [
      'Selection is made strictly on the basis of merit in the qualifying examination (Class 12th or equivalent for Degree, Class 10th for Diploma).',
      'Maximum two girl children per family are eligible.',
      'Disbursement is executed through Direct Benefit Transfer (DBT) directly into Aadhaar-seeded bank accounts.'
    ],
    howToApplySteps: [
      'Visit National Scholarship Portal (scholarships.gov.in).',
      'Register for NSP One Time Registration (OTR) with mobile number.',
      'Log in and navigate to AICTE Schemes > Pragati Scholarship Scheme.',
      'Fill academic details, roll numbers, family income, and upload bonafide certificate.',
      'Submit the application and inform your college administrative office to verify it on NSP.'
    ],
    documentsNeeded: [
      { id: 'd1', name: 'Income Certificate from competent Revenue Authority (Tehsildar/SDM)', required: true, description: 'Certifying family income is below ₹8.00 Lakh' },
      { id: 'd2', name: 'Bonafide Student Certificate issued by AICTE approved college/polytechnic', required: true, description: 'Signed with college seal' },
      { id: 'd3', name: 'Class 10th & 12th Marksheets', required: true, description: 'Self-attested copies' },
      { id: 'd4', name: 'Aadhaar Card copy & Bank Passbook', required: true, description: 'Account must be Aadhaar-seeded on NPCI' },
      { id: 'd5', name: 'Parent Declaration Affidavit', required: true, description: 'Stating not more than 2 girl children are availing the scheme' }
    ],
    previousYearPapers: []
  },

  // 2. Central Sector Scheme of Scholarship for College and University Students (PM-USP)
  {
    id: 'pm-usp-csss',
    name: 'Central Sector Scheme of Scholarships for College and University Students (PM-USP)',
    provider: 'Department of Higher Education, Ministry of Education, Govt. of India',
    verified: true,
    benefitAmount: '₹12,000 to ₹20,000 / year',
    benefitDetails: '₹12,000/yr for graduation (first 3 years) and ₹20,000/yr at post-graduation level.',
    isExamBased: false,
    lastDateToApply: '2026-11-30',
    daysLeft: 30,
    chanceLabel: 'High',
    matchScore: 91,
    whyQualify: [
      'For meritorious students scoring above 80th percentile in relevant stream in Class 12th State Board / CBSE / CISCE.',
      'Family income ceiling is ₹4,50,000 per annum.',
      'Enrolled in regular undergraduate degree courses.'
    ],
    type: 'Central',
    officialUrl: 'https://scholarships.gov.in',
    verifiedSourceBadge: 'Official National Scholarship Portal (NSP)',
    lastVerifiedOn: '2026-10-18',
    minIncomeLimit: 450000,
    genderEligibility: 'All',
    eligibleLevels: ['undergraduate', 'postgraduate'],
    syllabus: [],
    paperPattern: {
      sections: [],
      totalQuestions: 0,
      marksPerQuestion: 0,
      mode: 'Merit/Direct',
      language: 'English/Hindi'
    },
    negativeMarking: {
      hasNegativeMarking: false,
      description: 'Merit-based selection; no entrance examination.',
      ratio: 0
    },
    dates: {
      applicationStart: '2026-08-15',
      applicationEnd: '2026-11-30'
    },
    durationMinutes: 0,
    totalMarks: 100,
    howToPrepare: {
      weekByWeekPlan: [
        { week: 'Week 1', focus: 'Percentile Check', action: 'Verify your Board 80th percentile cut-off score published on NSP.' },
        { week: 'Week 2', focus: 'Income Proof', action: 'Procure official income certificate from competent government revenue officer.' },
        { week: 'Week 3', focus: 'Form Submission', action: 'Complete NSP form submission and note down application ID.' }
      ],
      subjectTips: [
        { subject: 'Eligibility', tips: 'Only regular full-time courses are eligible; distance/correspondence students cannot apply.' }
      ],
      freeResources: [
        { title: 'NSP Portal Guidelines', link: 'https://scholarships.gov.in', description: 'Official FAQs and list of board-wise cutoffs.' }
      ],
      commonMistakes: [
        'Missing renewal deadline in subsequent years of college (requires 50% aggregate and 75% attendance).'
      ]
    },
    selectionProcessNoExam: [
      'State-wise quotas allocated based on population of 18-25 age group.',
      'Cutoff list divided in 3:2:1 ratio for Science, Commerce, and Humanities.',
      'Direct credit via PFMS.'
    ],
    howToApplySteps: [
      'Go to scholarships.gov.in and log in with OTR.',
      'Select Central Sector Scheme under Ministry of Education.',
      'Enter Class 12 board roll number, passing year, and current college details.',
      'Submit and print acknowledgment.'
    ],
    documentsNeeded: [
      { id: 'pm1', name: 'Class 12th Board Marksheet', required: true, description: 'Showing marks above the 80th percentile cut-off' },
      { id: 'pm2', name: 'Income Certificate', required: true, description: 'Annual family income not exceeding ₹4.50 Lakh' },
      { id: 'pm3', name: 'College Admission Receipt / Bonafide', required: true, description: 'Certifying admission into recognized university/college' },
      { id: 'pm4', name: 'Aadhaar Card', required: true, description: 'Aadhaar linked bank account' }
    ],
    previousYearPapers: []
  },

  // 3. National Means-cum-Merit Scholarship Scheme (NMMSS) - EXAM BASED
  {
    id: 'nmms-exam',
    name: 'National Means-cum-Merit Scholarship Scheme (NMMSS)',
    provider: 'Department of School Education & Literacy, Ministry of Education, Govt. of India',
    verified: true,
    benefitAmount: '₹12,000 / year (₹1,000/month)',
    benefitDetails: '₹12,000 per annum from Class 9 to Class 12 (total ₹48,000) for school education.',
    isExamBased: true,
    examName: 'State Level NMMSS Selection Examination',
    lastDateToApply: '2026-11-20',
    daysLeft: 20,
    chanceLabel: 'High',
    matchScore: 96,
    whyQualify: [
      'Designed for students studying in Class 8th in Government, Local body, and Govt-aided schools.',
      'Parental annual income from all sources must not exceed ₹3,50,000.',
      'Guarantees financial support till completion of Class 12th.'
    ],
    type: 'Central',
    officialUrl: 'https://scholarships.gov.in',
    verifiedSourceBadge: 'Official MoE & SCERT Portal',
    lastVerifiedOn: '2026-10-25',
    minIncomeLimit: 350000,
    genderEligibility: 'All',
    eligibleLevels: ['class_1_10'],
    syllabus: [
      {
        subject: 'Mental Ability Test (MAT)',
        topics: ['Analogy', 'Classification', 'Numerical Series', 'Pattern Perception', 'Hidden Figures', 'Coding-Decoding', 'Blood Relations']
      },
      {
        subject: 'Scholastic Aptitude Test (SAT) - Science',
        topics: ['Cell Structure', 'Microorganisms', 'Force & Pressure', 'Light & Sound', 'Combustion & Flame', 'Chemical Effects of Current']
      },
      {
        subject: 'Scholastic Aptitude Test (SAT) - Social Studies',
        topics: ['Modern Indian History (1857 Revolt, Freedom Struggle)', 'Resources & Industries', 'Indian Constitution', 'Judiciary & Social Justice']
      },
      {
        subject: 'Scholastic Aptitude Test (SAT) - Mathematics',
        topics: ['Rational Numbers', 'Linear Equations in One Variable', 'Understanding Quadrilaterals', 'Squares & Cubes', 'Algebraic Expressions', 'Mensuration']
      }
    ],
    paperPattern: {
      sections: [
        { name: 'Paper I: Mental Ability Test (MAT)', questionsCount: 90, marksPerQuestion: 1, description: 'Reasoning and logical thinking' },
        { name: 'Paper II: Scholastic Aptitude Test (SAT)', questionsCount: 90, marksPerQuestion: 1, description: 'Class 7 & 8 Science (35 Qs), Social Studies (35 Qs), Maths (20 Qs)' }
      ],
      totalQuestions: 180,
      marksPerQuestion: 1,
      mode: 'Offline (Pen & Paper)',
      language: 'English, Hindi, and Regional State Languages'
    },
    negativeMarking: {
      hasNegativeMarking: false,
      description: 'No negative marking. 0 marks deducted for wrong answers.',
      ratio: 0
    },
    dates: {
      applicationStart: '2026-08-01',
      applicationEnd: '2026-11-20',
      examDate: '2026-12-15'
    },
    durationMinutes: 180,
    totalMarks: 180,
    howToPrepare: {
      weekByWeekPlan: [
        { week: 'Week 1', focus: 'MAT Foundation', action: 'Master number series, alphabetical codes, and visual puzzle tricks.' },
        { week: 'Week 2', focus: 'NCERT Class 7 & 8 Science', action: 'Revise core definitions, chemical formulas, and physics laws.' },
        { week: 'Week 3', focus: 'Maths Problem Solving', action: 'Practise 30 mensuration, linear equation, and quadrilateral questions daily.' },
        { week: 'Week 4', focus: 'Full Mock Simulations', action: 'Attempt timed practice papers within 90 minutes per section.' }
      ],
      subjectTips: [
        { subject: 'MAT (Mental Ability)', tips: 'Solve 20 reasoning questions daily. Focus heavily on odd-one-out and missing number matrices.' },
        { subject: 'Science', tips: 'Follow NCERT Class 7 and 8 textbooks word-by-word. Focus on diagrams and key reactions.' },
        { subject: 'Social Science', tips: 'Create a timeline of the Indian freedom movement and memorize key constitutional articles.' }
      ],
      freeResources: [
        { title: 'NCERT Class 7 & 8 e-Books', link: 'https://ncert.nic.in/textbook.php', description: 'Official free digital textbooks for Science, Maths, Social Science.' },
        { title: 'State SCERT Previous Papers', link: 'https://scholarships.gov.in', description: 'Download official question papers and answer keys.' }
      ],
      commonMistakes: [
        'Spending over 1 minute on a difficult MAT puzzle; move quickly and return later since there is no negative marking.',
        'Ignoring Social Studies: it holds 35 crucial marks out of 90 in SAT.'
      ]
    },
    documentsNeeded: [
      { id: 'n1', name: 'Class 7th Pass Marksheet (min 55% marks, 50% for SC/ST)', required: true, description: 'Certified by school headmaster' },
      { id: 'n2', name: 'Parental Income Certificate below ₹3.5 Lakh', required: true, description: 'Issued by competent authority' },
      { id: 'n3', name: 'Category / Caste Certificate (SC/ST/OBC)', required: false, description: 'For quota benefits' },
      { id: 'n4', name: 'Disability Certificate (if applicable, min 40%)', required: false, description: 'Issued by district medical board' }
    ],
    previousYearPapers: [
      { year: '2025', sourceTitle: 'Official State SCERT / MoE Solved Paper', officialUrl: 'https://scholarships.gov.in', note: 'Standard state model question paper' },
      { year: '2024', sourceTitle: 'MoE NMMSS National Exemplar Paper', officialUrl: 'https://scholarships.gov.in', note: 'MAT and SAT bilingual sets' }
    ]
  },

  // 4. CSIR-UGC National Eligibility Test (NET) Junior Research Fellowship (JRF) - EXAM BASED
  {
    id: 'csir-ugc-net-jrf',
    name: 'CSIR-UGC NET Junior Research Fellowship (JRF) & Lectureship',
    provider: 'Council of Scientific & Industrial Research (CSIR) & NTA',
    verified: true,
    benefitAmount: '₹37,000 / month + HRA + ₹20,000 Annual Contingency',
    benefitDetails: '₹37,000/mo for first 2 years (JRF), enhanced to ₹42,000/mo (SRF) for subsequent 3 years + House Rent Allowance.',
    isExamBased: true,
    examName: 'Joint CSIR-UGC NET Examination',
    lastDateToApply: '2026-11-25',
    daysLeft: 25,
    chanceLabel: 'High',
    matchScore: 92,
    whyQualify: [
      'For M.Sc / BS-MS / B.Tech / Integrated MS students in Chemical, Earth, Life, Mathematical, and Physical Sciences.',
      'Age limit up to 30 years for JRF (relaxable by 5 years for SC/ST/PwD/Women).',
      'Provides full financial independence during Ph.D. research in premier Indian institutes.'
    ],
    type: 'Central',
    officialUrl: 'https://csirhrdg.res.in',
    verifiedSourceBadge: 'Official CSIR HRDG & NTA Portal',
    lastVerifiedOn: '2026-10-22',
    genderEligibility: 'All',
    eligibleLevels: ['postgraduate', 'doctorate'],
    syllabus: [
      {
        subject: 'Part A: General Science & Quantitative Reasoning',
        topics: ['Graphical Analysis', 'Numerical Ability', 'Series Formation', 'Combinatorics', 'Data Interpretation']
      },
      {
        subject: 'Part B: Core Subject Knowledge (Advanced)',
        topics: ['Thermodynamics & Kinetics', 'Quantum Mechanics / Molecular Biology', 'Linear Algebra / Differential Equations', 'Organic Synthesis']
      },
      {
        subject: 'Part C: Higher Order Analytical & Research Concepts',
        topics: ['Scientific Experimental Design', 'Interdisciplinary Problem Solving', 'Model Hypotheses Testing']
      }
    ],
    paperPattern: {
      sections: [
        { name: 'Part A: General Aptitude', questionsCount: 20, marksPerQuestion: 2, description: 'Answer any 15 questions (Max 30 marks)' },
        { name: 'Part B: Subject Multiple Choice', questionsCount: 50, marksPerQuestion: 2, description: 'Answer any 35 questions (Max 70 marks)' },
        { name: 'Part C: Higher Value Scientific Questions', questionsCount: 75, marksPerQuestion: 4, description: 'Answer any 25 questions (Max 100 marks)' }
      ],
      totalQuestions: 75,
      marksPerQuestion: 4,
      mode: 'Online (CBT)',
      language: 'English and Hindi'
    },
    negativeMarking: {
      hasNegativeMarking: true,
      description: '25% negative marking (1/4th of the question mark is deducted for each wrong answer).',
      ratio: 0.25
    },
    dates: {
      applicationStart: '2026-09-15',
      applicationEnd: '2026-11-25',
      examDate: '2026-12-28'
    },
    durationMinutes: 180,
    totalMarks: 200,
    howToPrepare: {
      weekByWeekPlan: [
        { week: 'Week 1', focus: 'Part A Speed Drills', action: 'Practice 30 aptitude and graph questions daily to secure easy 20+ marks.' },
        { week: 'Week 2', focus: 'Part B Core Concepts', action: 'Revise standard master-level textbooks and formula derivations.' },
        { week: 'Week 3', focus: 'Part C Research Application', action: 'Practice choosing the best 25 questions out of 75 options with minimal risk.' },
        { week: 'Week 4', focus: 'Computer-Based Mocks', action: 'Sit for full 3-hour tests strictly observing the 1/4th negative penalty.' }
      ],
      subjectTips: [
        { subject: 'Question Selection', tips: 'In Part C, you have huge choice (attempt 25 out of 75). Select only 100% confident questions.' },
        { subject: 'Negative Marking Management', tips: 'Do not make blind guesses; a 25% penalty can drop your rank drastically.' }
      ],
      freeResources: [
        { title: 'CSIR HRDG Syllabus & Question Repository', link: 'https://csirhrdg.res.in', description: 'Official curriculum brochures and answer keys.' },
        { title: 'NTA CBT Mock Exam Server', link: 'https://nta.ac.in/quiz', description: 'Real browser exam simulation software.' }
      ],
      commonMistakes: [
        'Attempting excess questions beyond the section maximum (system will only grade first attempts).',
        'Neglecting Part A general aptitude which forms the rank differentiator.'
      ]
    },
    documentsNeeded: [
      { id: 'c1', name: 'Master’s Degree or Attestation Form from HoD (for final year students)', required: true, description: 'Minimum 55% marks (50% for SC/ST/PwD)' },
      { id: 'c2', name: 'Category Certificate (SC/ST/OBC-NCL/EWS) in Govt of India format', required: false, description: 'Must be current financial year for OBC/EWS' },
      { id: 'c3', name: 'Passport size photo and digital signature', required: true, description: 'As per NTA specifications' }
    ],
    previousYearPapers: [
      { year: '2025', sourceTitle: 'CSIR NET Question Paper with Final Key', officialUrl: 'https://csirnet.nta.ac.in', note: 'All subjects CBT archive' },
      { year: '2024', sourceTitle: 'CSIR NET Official Archive', officialUrl: 'https://csirhrdg.res.in', note: 'Answer keys with question IDs' }
    ]
  },

  // 5. Reliance Foundation Undergraduate & Postgraduate Scholarships
  {
    id: 'reliance-foundation-ug-pg',
    name: 'Reliance Foundation Undergraduate & Postgraduate Scholarship',
    provider: 'Reliance Foundation (CSR Initiative of Reliance Industries Ltd.)',
    verified: true,
    benefitAmount: 'Up to ₹2,00,000 (UG) / ₹6,00,000 (PG)',
    benefitDetails: 'Full grant disbursed over the entire degree program for tuition fees and academic development.',
    isExamBased: true,
    examName: 'Reliance Foundation Online Aptitude Test',
    lastDateToApply: '2026-11-15',
    daysLeft: 15,
    chanceLabel: 'High',
    matchScore: 89,
    whyQualify: [
      'Open to 1st year full-time regular undergraduate and postgraduate students across all disciplines.',
      'Household annual income up to ₹15,00,000 (priority given to income < ₹2.5 Lakh).',
      'Requires minimum 60% in Class 12th.'
    ],
    type: 'Private',
    officialUrl: 'https://www.scholarships.reliancefoundation.org',
    verifiedSourceBadge: 'Official Reliance Foundation Portal',
    lastVerifiedOn: '2026-10-24',
    minIncomeLimit: 1500000,
    genderEligibility: 'All',
    eligibleLevels: ['undergraduate', 'postgraduate'],
    syllabus: [
      {
        subject: 'General Mental Ability & Verbal Ability',
        topics: ['Sentence Correction', 'Reading Comprehension', 'Logical Deduction', 'Syllogisms']
      },
      {
        subject: 'Numerical Ability & Data Analysis',
        topics: ['Percentages & Ratios', 'Simple & Compound Interest', 'Profit & Loss', 'Charts & Tables']
      }
    ],
    paperPattern: {
      sections: [
        { name: 'Verbal Ability', questionsCount: 20, marksPerQuestion: 1, description: 'Grammar, vocabulary, comprehension' },
        { name: 'Analytical & Numerical Ability', questionsCount: 20, marksPerQuestion: 1, description: 'Maths and logic' },
        { name: 'General Awareness', questionsCount: 20, marksPerQuestion: 1, description: 'Current affairs and science in everyday life' }
      ],
      totalQuestions: 60,
      marksPerQuestion: 1,
      mode: 'Online (CBT)',
      language: 'English'
    },
    negativeMarking: {
      hasNegativeMarking: false,
      description: 'Zero negative marking. No deduction for incorrect answers.',
      ratio: 0
    },
    dates: {
      applicationStart: '2026-08-20',
      applicationEnd: '2026-11-15',
      examDate: '2026-11-28'
    },
    durationMinutes: 60,
    totalMarks: 60,
    howToPrepare: {
      weekByWeekPlan: [
        { week: 'Week 1', focus: 'Aptitude Basics', action: 'Review basic percentage, ratio, and speed math calculations.' },
        { week: 'Week 2', focus: 'Verbal Logic', action: 'Solve reading comprehension passages under time constraint.' },
        { week: 'Week 3', focus: 'Online Practice Test', action: 'Take the mock test provided on the Reliance Foundation portal.' }
      ],
      subjectTips: [
        { subject: 'Online Test', tips: 'Test is proctored online; ensure webcam and quiet room setup.' }
      ],
      freeResources: [
        { title: 'Reliance Foundation FAQ & Guide', link: 'https://www.scholarships.reliancefoundation.org', description: 'Official selection syllabus and test instructions.' }
      ],
      commonMistakes: [
        'Attempting the online test on a phone without stable broadband.'
      ]
    },
    documentsNeeded: [
      { id: 'rf1', name: 'Class 10th and 12th Board Marksheet', required: true, description: 'With at least 60% marks' },
      { id: 'rf2', name: 'College Admission Bonafide / ID card', required: true, description: 'Proving 1st year enrollment' },
      { id: 'rf3', name: 'Family Income Proof', required: true, description: 'Salary slip, ITR, or Tehsildar certificate' },
      { id: 'rf4', name: 'Identity Proof (Aadhaar/Voter ID)', required: true, description: 'Valid government ID' }
    ],
    previousYearPapers: [
      { year: '2025', sourceTitle: 'Reliance Foundation Sample Questions', officialUrl: 'https://www.scholarships.reliancefoundation.org', note: 'Official aptitude sample sets' }
    ]
  },

  // 6. Post-Matric Scholarship for SC / ST / OBC Students (Ministry of Social Justice & Empowerment)
  {
    id: 'post-matric-sc-st-obc',
    name: 'Post-Matric Scholarship Scheme for SC, ST & OBC Students',
    provider: 'Ministry of Social Justice and Empowerment & Ministry of Tribal Affairs, Govt. of India',
    verified: true,
    benefitAmount: 'Complete Tuition Reimbursement + Maintenance Allowance up to ₹13,500/year',
    benefitDetails: 'Covers non-refundable fees (tuition, library, exam fees) directly paid plus monthly living stipend.',
    isExamBased: false,
    lastDateToApply: '2026-12-15',
    daysLeft: 45,
    chanceLabel: 'High',
    matchScore: 97,
    whyQualify: [
      'Entitlement scheme for SC/ST students with family income up to ₹2,50,000/yr (or OBC-NCL up to ₹1,50,000 to ₹2,50,000 depending on state).',
      'Covers Class 11, 12, ITI, Polytechnic, UG, PG, and Ph.D. degrees.',
      'Guaranteed reimbursement under Central-State sharing.'
    ],
    type: 'Central',
    officialUrl: 'https://scholarships.gov.in',
    verifiedSourceBadge: 'Official NSP & State Social Welfare Portals',
    lastVerifiedOn: '2026-10-21',
    minIncomeLimit: 250000,
    genderEligibility: 'All',
    reservedCategories: ['SC', 'ST', 'OBC Non-Creamy Layer', 'DNT/NT/SNT'],
    eligibleLevels: ['class_11_12', 'iti', 'diploma', 'undergraduate', 'postgraduate', 'doctorate'],
    syllabus: [],
    paperPattern: {
      sections: [],
      totalQuestions: 0,
      marksPerQuestion: 0,
      mode: 'Merit/Direct',
      language: 'English/Hindi'
    },
    negativeMarking: {
      hasNegativeMarking: false,
      description: 'Zero exam. Direct DBT entitlement upon certificate verification.',
      ratio: 0
    },
    dates: {
      applicationStart: '2026-08-01',
      applicationEnd: '2026-12-15'
    },
    durationMinutes: 0,
    totalMarks: 100,
    howToPrepare: {
      weekByWeekPlan: [
        { week: 'Week 1', focus: 'Caste & Income Verification', action: 'Ensure digital caste certificate barcode is verifiable on state portal.' },
        { week: 'Week 2', focus: 'NSP / State Portal Filing', action: 'Upload fee receipt and bonafide from college.' },
        { week: 'Week 3', focus: 'College Endorsement', action: 'Verify with college scholarship clerk that application is forwarded to District Social Welfare Officer.' }
      ],
      subjectTips: [
        { subject: 'Aadhaar Linkage', tips: 'Check NPCI Aadhaar seeding status in your bank account; otherwise payment bounces.' }
      ],
      freeResources: [
        { title: 'Ministry Guidelines Document', link: 'https://socialjustice.gov.in', description: 'Official allowance slab details for hostellers and day scholars.' }
      ],
      commonMistakes: [
        'Uploading invalid expired income certificate.',
        'Entering wrong fee receipt breakdown.'
      ]
    },
    selectionProcessNoExam: [
      'All eligible applicants belonging to target categories with valid certificates receive scholarship funds.',
      '60% funding from Central Government, 40% from State Government.'
    ],
    howToApplySteps: [
      'Apply either via NSP (scholarships.gov.in) or state portal (e.g., MahaDBT, SSP Karnataka, OASIS WB, Medhabruti Odisha).',
      'Fill post-matric form with institute code and fee structure.',
      'Submit digital copies of caste, income, and previous marksheet.'
    ],
    documentsNeeded: [
      { id: 'sc1', name: 'Caste Certificate issued by Revenue Officer / Sub-Divisional Officer', required: true, description: 'Must have digital verification number' },
      { id: 'sc2', name: 'Income Certificate from Tehsildar (below ₹2.50 Lakh)', required: true, description: 'Issued for current financial year' },
      { id: 'sc3', name: 'College Admission Fee Receipt', required: true, description: 'Showing non-refundable tuition and institutional fees' },
      { id: 'sc4', name: 'Previous Year Passing Marksheet', required: true, description: 'Proof of progressing to current academic year' },
      { id: 'sc5', name: 'Hosteller Certificate (if living in hostel)', required: false, description: 'Entitles student to higher hosteller maintenance allowance' }
    ],
    previousYearPapers: []
  },

  // 7. AICTE Saksham Scholarship Scheme for Specially-Abled Students
  {
    id: 'aicte-saksham',
    name: 'AICTE Saksham Scholarship Scheme for Specially-Abled Students',
    provider: 'All India Council for Technical Education (AICTE)',
    verified: true,
    benefitAmount: '₹50,000 / year',
    benefitDetails: '₹50,000 per annum for tuition fees, computer purchase, books and assistive devices.',
    isExamBased: false,
    lastDateToApply: '2026-12-31',
    daysLeft: 61,
    chanceLabel: 'High',
    matchScore: 95,
    whyQualify: [
      'Open to differently-abled students with disability not less than 40%.',
      'Admitted to technical degree or diploma courses in AICTE approved institutions.',
      'Family income limit up to ₹8,00,000 per year.'
    ],
    type: 'Central',
    officialUrl: 'https://www.aicte-india.org',
    verifiedSourceBadge: 'Official AICTE & NSP Portal',
    lastVerifiedOn: '2026-10-15',
    minIncomeLimit: 800000,
    genderEligibility: 'All',
    eligibleLevels: ['diploma', 'undergraduate'],
    disabilityEligible: true,
    syllabus: [],
    paperPattern: {
      sections: [],
      totalQuestions: 0,
      marksPerQuestion: 0,
      mode: 'Merit/Direct',
      language: 'English/Hindi'
    },
    negativeMarking: {
      hasNegativeMarking: false,
      description: 'Direct merit award for Divyangjan students; no examination.',
      ratio: 0
    },
    dates: {
      applicationStart: '2026-09-01',
      applicationEnd: '2026-12-31'
    },
    durationMinutes: 0,
    totalMarks: 100,
    howToPrepare: {
      weekByWeekPlan: [
        { week: 'Week 1', focus: 'UDID Card', action: 'Ensure Unique Disability ID (UDID) card is ready.' },
        { week: 'Week 2', focus: 'NSP Filing', action: 'Submit application under AICTE Saksham.' }
      ],
      subjectTips: [],
      freeResources: [
        { title: 'AICTE Saksham Guidelines', link: 'https://www.aicte-india.org', description: 'Eligibility rules and norms.' }
      ],
      commonMistakes: ['Disability certificate below 40% threshold.']
    },
    selectionProcessNoExam: [
      'All eligible disabled candidates who qualify minimum criteria are awarded scholarship.'
    ],
    howToApplySteps: [
      'Log into NSP (scholarships.gov.in).',
      'Select AICTE Saksham Scheme.',
      'Provide UDID disability number and college bonafide.'
    ],
    documentsNeeded: [
      { id: 'sak1', name: 'Disability Certificate / UDID Card showing min 40% disability', required: true, description: 'Issued by authorized medical board' },
      { id: 'sak2', name: 'Annual Family Income Certificate below ₹8 Lakh', required: true, description: 'Issued by Tehsildar' },
      { id: 'sak3', name: 'Admission Bonafide Certificate from AICTE Institute', required: true, description: 'Signed by Principal/Director' }
    ],
    previousYearPapers: []
  },

  // 8. HDFC Bank Parivartan's ECSS Programme
  {
    id: 'hdfc-parivartan-ecss',
    name: 'HDFC Bank Parivartan’s Educational Crisis Support Scholarship (ECSS)',
    provider: 'HDFC Bank CSR Parivartan',
    verified: true,
    benefitAmount: 'Up to ₹75,000 / year',
    benefitDetails: 'School (Class 1-12) gets up to ₹35,000; Diploma & UG/PG students get up to ₹75,000.',
    isExamBased: false,
    lastDateToApply: '2026-11-10',
    daysLeft: 10,
    chanceLabel: 'High',
    matchScore: 91,
    whyQualify: [
      'Open to Indian students from Class 1 to Postgraduate level facing economic crisis or parent loss.',
      'Annual family income must be less than or equal to ₹2,50,000.',
      'Requires minimum 55% marks in previous examination.'
    ],
    type: 'Private',
    officialUrl: 'https://www.hdfcbank.com',
    verifiedSourceBadge: 'Official HDFC Bank Parivartan Portal',
    lastVerifiedOn: '2026-10-26',
    minIncomeLimit: 250000,
    genderEligibility: 'All',
    eligibleLevels: ['class_1_10', 'class_11_12', 'iti', 'diploma', 'undergraduate', 'postgraduate'],
    syllabus: [],
    paperPattern: {
      sections: [],
      totalQuestions: 0,
      marksPerQuestion: 0,
      mode: 'Merit/Direct',
      language: 'English/Hindi'
    },
    negativeMarking: {
      hasNegativeMarking: false,
      description: 'Merit-cum-means direct grant based on interview and academic documents.',
      ratio: 0
    },
    dates: {
      applicationStart: '2026-07-01',
      applicationEnd: '2026-11-10'
    },
    durationMinutes: 0,
    totalMarks: 100,
    howToPrepare: {
      weekByWeekPlan: [
        { week: 'Week 1', focus: 'Crisis / Income Documentation', action: 'Collect family income certificate, proof of crisis/loss, and previous marksheets.' },
        { week: 'Week 2', focus: 'Online Application', action: 'Fill online profile with truthful details of family condition.' }
      ],
      subjectTips: [],
      freeResources: [
        { title: 'HDFC Parivartan Guidelines', link: 'https://www.hdfcbank.com', description: 'Application norms and document specs.' }
      ],
      commonMistakes: ['Providing unclear scans of fee receipts.']
    },
    selectionProcessNoExam: [
      'Shortlisting based on academic merit and severity of economic need.',
      'Telephonic verification/interview before final scholarship release.'
    ],
    howToApplySteps: [
      'Submit application through official HDFC Parivartan scholarship application page.',
      'Attach current year fee receipt, marksheet, income proof, and crisis documentation.'
    ],
    documentsNeeded: [
      { id: 'hd1', name: 'Previous Year Marksheet (minimum 55% marks)', required: true, description: 'Grade card of previous academic class' },
      { id: 'hd2', name: 'Income Certificate (Family income <= 2.5 Lakh)', required: true, description: 'Tehsildar certificate or BPL card' },
      { id: 'hd3', name: 'Current Year Admission Proof / Fee Receipt', required: true, description: 'Showing admission in recognized school/college' },
      { id: 'hd4', name: 'Proof of Crisis / Single Parent / Orphan document (if applicable)', required: false, description: 'Death certificate or medical record' }
    ],
    previousYearPapers: []
  }
];
