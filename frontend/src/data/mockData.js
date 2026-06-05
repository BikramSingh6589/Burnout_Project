export const studentProfile = {
  name: 'Aarav Sharma',
  email: 'aarav.sharma@student.edu',
  studentId: 'STU-2026-1042',
  role: 'Student',
  institution: 'Academic Wellness Institute',
  program: 'Computer Science',
};
export const weeklyTrends = [
  { week: 'Week 1', burnout: 25, sleep: 7.2, attendance: 86, sentiment: 72, stress: 4 },
  { week: 'Week 2', burnout: 38, sleep: 6.4, attendance: 80, sentiment: 64, stress: 5 },
  { week: 'Week 3', burnout: 52, sleep: 5.8, attendance: 72, sentiment: 51, stress: 7 },
  { week: 'Week 4', burnout: 69, sleep: 4.9, attendance: 58, sentiment: 36, stress: 9 },
];
export const assessmentDefaults = {
  stress: 8,
  motivation: 4,
  energy: 5,
  sleepQuality: 4,
  academicSatisfaction: 5,
};
export const academicDefaults = {
  attendance: 58,
  gpa: 7.1,
  previousScore: 71,
  pendingAssignments: 6,
  skippedTasks: 4,
  educationLevel: 'University',
};
export const lifestyleDefaults = {
  sleepHours: 4.8,
  studyHours: 6,
  exerciseMinutes: 15,
  screenTime: 4.5,
};
export const journalEntries = [
  {
    id: 1,
    date: 'Today',
    text: 'I feel exhausted after studying all night and the pending assignments are making me anxious.',
    sentiment: 'Negative',
    score: 32,
  },
  {
    id: 2,
    date: 'Yesterday',
    text: 'I completed two tasks but still feel low on energy.',
    sentiment: 'Neutral',
    score: 55,
  },
  {
    id: 3,
    date: 'This week',
    text: 'I felt motivated after planning my study blocks.',
    sentiment: 'Positive',
    score: 76,
  },
];
export const notifications = [
  { id: 1, type: 'danger', title: 'High burnout risk', detail: 'Current score is above the high-risk threshold.' },
  { id: 2, type: 'warning', title: 'Attendance below threshold', detail: 'Attendance is below 60%. Prioritize upcoming classes.' },
  { id: 3, type: 'danger', title: 'Negative mood trend', detail: 'Recent journal entries include stress keywords.' },
];
export const facultySnapshot = [
  { label: 'High-risk students', value: '18%', trend: '+4%' },
  { label: 'Assessment completion', value: '82%', trend: '+7%' },
  { label: 'Journal participation', value: '54%', trend: '+3%' },
];
