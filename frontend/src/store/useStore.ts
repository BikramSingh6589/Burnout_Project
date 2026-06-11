import { create } from 'zustand';
<<<<<<< HEAD

// Types
export interface User {
=======
import { apiRequest } from '../lib/api';

type AssessmentFormData = {
  stressLevel: number;
  academicSatisfaction: number;
  studyHours: number;
  assignmentBacklog: number;
  procrastination: number;
  motivationLevel: number;
  energyLevel: number;
  sleepHours: number;
  screenTime: number;
};

const mapToInitialAssessmentPayload = (data: AssessmentFormData) => ({
  stressLevel: data.stressLevel,
  academicSatisfaction: data.academicSatisfaction,
  studyHours: data.studyHours,
  backlog: Math.min(10, data.assignmentBacklog),
  procrastination: data.procrastination,
  motivation: data.motivationLevel,
  energy: data.energyLevel,
  sleepHours: data.sleepHours,
  screenTime: data.screenTime,
});

const mapToWeeklyAssessmentPayload = (data: AssessmentFormData) => ({
  // Original weekly assessment transformed fields
  academicLoadScore: data.stressLevel * 10,
  stressScore: data.stressLevel * 10,
  sleepHoursAverage: data.sleepHours,
  sleepQualityScore: Math.min(100, Math.round((data.sleepHours / 8) * 100)),
  moodScore: data.energyLevel * 10,
  motivationScore: data.motivationLevel * 10,
  concentrationScore: data.academicSatisfaction * 10,
  physicalFatigueScore: (10 - data.energyLevel) * 10,
  // Original form fields (for consistency with Assessment model)
  stressLevel: data.stressLevel,
  academicSatisfaction: data.academicSatisfaction,
  studyHours: typeof data.studyHours === 'number' ? data.studyHours : 0,
  backlog: typeof data.assignmentBacklog === 'number' ? Math.min(10, data.assignmentBacklog) : 0,
  procrastination: data.procrastination,
  motivation: data.motivationLevel,
  energy: data.energyLevel,
  sleepHours: typeof data.sleepHours === 'number' ? data.sleepHours : 0,
  screenTime: typeof data.screenTime === 'number' ? data.screenTime : 0,
});

// Types
export interface User {
  id?: string;
>>>>>>> testing
  name: string;
  email: string;
  phone: string;
  gender: string;
  age: number;
<<<<<<< HEAD
=======
  profileCompleted?: boolean;
>>>>>>> testing
  assessmentCompleted: boolean;
  role: 'student' | 'admin' | null;
}

export interface JournalEntry {
  id: string;
  content: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  date: string;
  timestamp: number;
}

<<<<<<< HEAD
export interface TrackerHistory {
  date: string; // YYYY-MM-DD
=======
export interface BurnoutRisk {
  riskLevel: 'high' | 'moderate' | 'low';
  negativeRatio: number;
  totalEntries: number;
  negativeEntries: number;
  period: string;
}

export interface JournalAiEntry {
  id: string;
  studentId: string;
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  createdAt: string;
  updatedAt: string;
}

export interface TrackerHistory {
  date: string; // YYYY-MM-DD
  timestamp: number;
>>>>>>> testing
  burnoutScore: number;
  sleepHours: number;
  studyHours: number;
  screenTime: number;
  stressLevel: number;
  procrastination: number;
}

<<<<<<< HEAD
export interface Recommendation {
  id: string;
  title: string;
  reason: string;
  priority: 'High' | 'Medium' | 'Low';
=======
export interface AnalyticsSummary {
  burnoutScore: number;
  riskLevel: 'low' | 'moderate' | 'high';
  sleepAverage: number;
  moodTrend: 'Positive' | 'Neutral' | 'Negative';
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  assessmentCount: number;
  currentTrend: 'IMPROVING' | 'STABLE' | 'WORSENING';
  recommendations?: Recommendation[];
  baselineDifference?: number;
  baselineComparison?: {
    baselineScore: number;
    currentScore: number;
    difference: number;
    status: 'IMPROVED' | 'STABLE' | 'WORSENED';
  };
}

export interface LatestAssessment {
  burnoutScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  date: string;
}

export interface Recommendation {
  id: string;
  assessmentId?: string;
  category?: 'sleep' | 'stress' | 'motivation' | 'study' | 'screen-time' | 'mental-health' | 'general';
  title: string;
  reason: string;
  priority: 'High' | 'Medium' | 'Low';
  source?: 'AI' | 'rules';
>>>>>>> testing
  followedStatus: 'none' | 'followed' | 'partially' | 'not';
  rating: number; // 0 to 5
  feedbackText: string;
  dateGenerated: string;
<<<<<<< HEAD
=======
  createdAt?: string;
}

export interface PendingAiRecommendation {
  id: string;
  userId: string;
  assessmentId: string;
  studentName: string;
  studentEmail: string;
  category: string;
  priority: string;
  title: string;
  message: string;
  source: 'AI' | 'rules';
  createdAt: string;
>>>>>>> testing
}

export interface Notification {
  id: string;
  category: 'Assessment' | 'Risk' | 'Recommendation' | 'Mood' | 'General';
  message: string;
  read: boolean;
  date: string;
}

export interface AdminStudent {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  burnoutScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  lastAssessmentDate: string;
  sleepHoursAvg: number;
  stressLevelAvg: number;
  journalSentimentSummary: string; // e.g., "Mostly Negative", "Neutral"
}

export interface AdminSettings {
  highRiskThreshold: number;
  moderateRiskThreshold: number;
  assessmentIntervalDays: number;
<<<<<<< HEAD
=======
  maxWeeklyAssessmentsPerStudent: number;
>>>>>>> testing
  emailNotificationsEnabled: boolean;
  inAppNotificationsEnabled: boolean;
}

interface AppState {
  // Auth State
  user: User | null;
  isAuthenticated: boolean;
  otpVerified: boolean;
  authError: string | null;
<<<<<<< HEAD

  // Student Dashboard State
  journalEntries: JournalEntry[];
  trackerHistory: TrackerHistory[];
  recommendations: Recommendation[];
=======
  authToken: string | null;
  pendingVerificationEmail: string | null;

  // Student Dashboard State
  journalEntries: JournalEntry[];
  journalAiEntries: JournalAiEntry[];
  burnoutRisk: BurnoutRisk | null;
  trackerHistory: TrackerHistory[];
  analyticsSummary: AnalyticsSummary | null;
  latestAssessment: LatestAssessment | null;
  recommendations: Recommendation[];
  recommendationHistory: Recommendation[];
>>>>>>> testing
  notifications: Notification[];

  // Chat Widget State
  chatMessages: { id: string; sender: 'user' | 'ai'; text: string; timestamp: number }[];

  // Admin Portal State
  adminStudents: AdminStudent[];
  adminSettings: AdminSettings;

<<<<<<< HEAD
  // Actions
  login: (email: string, password: string, forceRole?: 'student' | 'admin') => Promise<boolean>;
  register: (userData: Omit<User, 'assessmentCompleted'>, password: string) => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<boolean>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<boolean>;
  
  // Assessments
  submitAssessment: (data: {
    stressLevel: number;
    academicSatisfaction: number;
    studyHours: number;
    assignmentBacklog: number;
    procrastination: number;
    motivationLevel: number;
    energyLevel: number;
    sleepHours: number;
    screenTime: number;
  }, isWeekly?: boolean) => void;
=======
  // Fetch actions
  fetchTrackerHistory: () => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  fetchJournalEntries: () => Promise<void>;
  fetchJournalAiEntries: () => Promise<void>;
  fetchBurnoutRisk: () => Promise<void>;
  fetchRecommendations: () => Promise<void>;
  fetchRecommendationHistory: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchAIHistory: () => Promise<void>;
  fetchAdminSettings: () => Promise<void>;

  // Actions
  login: (email: string, password: string, forceRole?: 'student' | 'admin') => Promise<boolean>;
  loginWithGoogle: (idToken: string) => Promise<boolean>;
  register: (userData: Omit<User, 'assessmentCompleted'>, password: string) => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<boolean>;
  resendOtp: () => Promise<boolean>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (email: string, token: string, password: string) => Promise<boolean>;
  fetchMe: () => Promise<boolean>;
  updateProfile: (profile: { name: string; phone: string; age: number; gender: string }) => Promise<boolean>;
  
  // Assessments
  submitAssessment: (data: AssessmentFormData, isWeekly?: boolean) => Promise<string | null>;
>>>>>>> testing

  // Journals
  addJournalEntry: (content: string) => void;
  deleteJournalEntry: (id: string) => void;
<<<<<<< HEAD
=======
  addJournalAiEntry: (content: string) => Promise<void>;
  deleteJournalAiEntry: (id: string) => Promise<void>;
>>>>>>> testing

  // Recommendations
  submitRecommendationFeedback: (
    id: string,
    followedStatus: 'followed' | 'partially' | 'not',
    rating: number,
    feedbackText: string
  ) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  deleteAllNotifications: () => void;
  addNotification: (category: Notification['category'], message: string) => void;

  // Chat actions
  sendChatMessage: (text: string) => void;

  // Admin actions
  adminSendNotification: (studentId: string | 'all', message: string, category: Notification['category']) => void;
  adminCreateRecommendation: (rec: Omit<Recommendation, 'id' | 'followedStatus' | 'rating' | 'feedbackText' | 'dateGenerated'>) => void;
  adminDeleteRecommendation: (id: string) => void;
  adminUpdateSettings: (settings: Partial<AdminSettings>) => void;
<<<<<<< HEAD
=======

  // Admin approval queue
  pendingAiRecommendations: PendingAiRecommendation[];
  pendingAiLoading: boolean;
  fetchPendingAiRecommendations: () => Promise<void>;
  approveAiRecommendation: (id: string) => Promise<void>;
  editApproveAiRecommendation: (id: string, payload: { title?: string; message?: string; priority?: string; category?: string }) => Promise<void>;
  rejectAiRecommendation: (id: string) => Promise<void>;
>>>>>>> testing
}

// Initial Mock Data Helpers
const getPastDateString = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

<<<<<<< HEAD
const defaultRecommendations: Recommendation[] = [
  {
    id: 'rec-1',
    title: 'Earlier Sleep Schedule',
    reason: 'Your average sleep of 5.8 hours is contributing to elevated stress levels.',
    priority: 'High',
    followedStatus: 'none',
    rating: 0,
    feedbackText: '',
    dateGenerated: getPastDateString(2),
  },
  {
    id: 'rec-2',
    title: 'Reduce Screen Time before Bed',
    reason: 'Evening screen use of >4 hours correlates with your reported insomnia and morning fatigue.',
    priority: 'High',
    followedStatus: 'none',
    rating: 0,
    feedbackText: '',
    dateGenerated: getPastDateString(2),
  },
  {
    id: 'rec-3',
    title: 'Take Structured Study Breaks (Pomodoro)',
    reason: 'Prolonged study sessions without breaks are diminishing your motivation score.',
    priority: 'Medium',
    followedStatus: 'none',
    rating: 0,
    feedbackText: '',
    dateGenerated: getPastDateString(2),
  },
  {
    id: 'rec-4',
    title: 'Break Down Backlog into Micro-Tasks',
    reason: 'Your assignment backlog of 8 tasks is triggering a procrastination loop.',
    priority: 'High',
    followedStatus: 'none',
    rating: 0,
    feedbackText: '',
    dateGenerated: getPastDateString(2),
  }
];

const mockTrackerHistory: TrackerHistory[] = [
  { date: getPastDateString(14), burnoutScore: 35, sleepHours: 7.5, studyHours: 5.0, screenTime: 3.5, stressLevel: 3, procrastination: 4 },
  { date: getPastDateString(13), burnoutScore: 38, sleepHours: 7.0, studyHours: 5.5, screenTime: 4.0, stressLevel: 4, procrastination: 3 },
  { date: getPastDateString(12), burnoutScore: 40, sleepHours: 6.8, studyHours: 6.0, screenTime: 4.5, stressLevel: 4, procrastination: 4 },
  { date: getPastDateString(11), burnoutScore: 42, sleepHours: 6.5, studyHours: 6.5, screenTime: 4.0, stressLevel: 5, procrastination: 5 },
  { date: getPastDateString(10), burnoutScore: 48, sleepHours: 6.0, studyHours: 7.0, screenTime: 5.0, stressLevel: 6, procrastination: 6 },
  { date: getPastDateString(9),  burnoutScore: 52, sleepHours: 5.8, studyHours: 7.5, screenTime: 5.5, stressLevel: 7, procrastination: 5 },
  { date: getPastDateString(8),  burnoutScore: 58, sleepHours: 5.5, studyHours: 8.0, screenTime: 6.0, stressLevel: 7, procrastination: 7 },
  { date: getPastDateString(7),  burnoutScore: 65, sleepHours: 5.0, studyHours: 8.5, screenTime: 6.5, stressLevel: 8, procrastination: 8 },
  { date: getPastDateString(6),  burnoutScore: 68, sleepHours: 5.2, studyHours: 9.0, screenTime: 6.0, stressLevel: 8, procrastination: 8 },
  { date: getPastDateString(5),  burnoutScore: 72, sleepHours: 4.8, studyHours: 9.5, screenTime: 7.0, stressLevel: 9, procrastination: 9 },
  { date: getPastDateString(4),  burnoutScore: 75, sleepHours: 4.5, studyHours: 10.0, screenTime: 7.5, stressLevel: 9, procrastination: 9 },
  { date: getPastDateString(3),  burnoutScore: 68, sleepHours: 6.0, studyHours: 6.0, screenTime: 5.0, stressLevel: 7, procrastination: 6 },
  { date: getPastDateString(2),  burnoutScore: 62, sleepHours: 6.5, studyHours: 5.5, screenTime: 4.5, stressLevel: 6, procrastination: 5 },
  { date: getPastDateString(1),  burnoutScore: 55, sleepHours: 7.0, studyHours: 5.0, screenTime: 4.0, stressLevel: 5, procrastination: 4 },
];

const mockJournalEntries: JournalEntry[] = [
  {
    id: 'j-1',
    content: 'Feeling extremely overwhelmed with the upcoming exams. There are so many assignments piled up and I do not know how I will complete them. I slept only 4 hours last night.',
    sentiment: 'Negative',
    date: getPastDateString(4),
    timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000
  },
  {
    id: 'j-2',
    content: 'Tired but slightly relieved after finishing my math homework. Still dreading the physics laboratory files that are due on Friday.',
    sentiment: 'Neutral',
    date: getPastDateString(2),
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000
  },
  {
    id: 'j-3',
    content: 'Took a study break and went for a run today. Feeling much more refreshed and clear-headed. I think the earlier sleep schedule is starting to help.',
    sentiment: 'Positive',
    date: getPastDateString(0),
    timestamp: Date.now()
  }
];

const mockNotifications: Notification[] = [
  {
    id: 'n-1',
    category: 'Assessment',
    message: 'Your weekly reassessment is due. Please take 2 minutes to update your wellness profile.',
    read: false,
    date: getPastDateString(0),
  },
  {
    id: 'n-2',
    category: 'Risk',
    message: 'Risk Level Warning: Your burnout score has entered the High Risk zone (75). Consider scheduling a self-care break.',
    read: false,
    date: getPastDateString(4),
  },
  {
    id: 'n-3',
    category: 'Recommendation',
    message: 'New personalized recommendation added: "Earlier Sleep Schedule".',
    read: true,
    date: getPastDateString(2),
  }
];
=======
interface BackendStudent {
  id?: string;
  _id?: string;
  name?: string;
  fullName?: string;
  email: string;
  phoneNumber?: string;
  gender?: string;
  age?: number;
  accountStatus?: string;
  profileCompleted?: boolean;
  assessmentCompleted?: boolean;
}

interface AuthResponse {
  success: boolean;
  token: string;
  user: BackendStudent;
}

interface MeResponse {
  success: boolean;
  user: BackendStudent;
}

interface RegisterResponse {
  success: boolean;
  message: string;
}

interface VerifyOtpResponse {
  success: boolean;
  token: string;
  user: BackendStudent;
}

interface RefreshTokenResponse {
  success: boolean;
  token: string;
  user: BackendStudent;
}

interface SettingsResponse {
  success: boolean;
  data: AdminSettings;
}

const AUTH_TOKEN_KEY = 'burnout_auth_token';
const AUTH_EXPIRES_AT_KEY = 'burnout_auth_expires_at';
const PENDING_EMAIL_KEY = 'burnout_pending_verification_email';
const SESSION_DURATION_MS = 2 * 24 * 60 * 60 * 1000;

const mapStudentToUser = (student: BackendStudent): User => ({
  id: student.id ?? student._id,
  name: student.name ?? student.fullName ?? '',
  email: student.email,
  phone: student.phoneNumber ?? '',
  gender: student.gender ?? 'Other',
  age: student.age ?? 0,
  profileCompleted: !!student.profileCompleted,
  assessmentCompleted: !!student.assessmentCompleted,
  role: 'student',
});

const storeSession = (token: string) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_EXPIRES_AT_KEY, String(Date.now() + SESSION_DURATION_MS));
};

const clearSession = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_EXPIRES_AT_KEY);
};

const getStoredAuthToken = () => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const expiresAt = Number(localStorage.getItem(AUTH_EXPIRES_AT_KEY));

  if (!token) return null;
  if (!expiresAt || expiresAt <= Date.now()) {
    clearSession();
    return null;
  }

  return token;
};
const getStoredPendingEmail = () => localStorage.getItem(PENDING_EMAIL_KEY);
>>>>>>> testing

const mockAdminStudents: AdminStudent[] = [
  {
    id: 's-1',
    name: 'Jane Doe',
    email: 'jane.doe@university.edu',
    phone: '+1 555-0199',
    age: 21,
    gender: 'Female',
    burnoutScore: 78,
    riskLevel: 'High',
    lastAssessmentDate: getPastDateString(2),
    sleepHoursAvg: 4.8,
    stressLevelAvg: 8.5,
    journalSentimentSummary: 'Mostly Negative'
  },
  {
    id: 's-2',
    name: 'John Smith',
    email: 'john.smith@university.edu',
    phone: '+1 555-0124',
    age: 22,
    gender: 'Male',
    burnoutScore: 55,
    riskLevel: 'Moderate',
    lastAssessmentDate: getPastDateString(3),
    sleepHoursAvg: 6.2,
    stressLevelAvg: 5.8,
    journalSentimentSummary: 'Neutral'
  },
  {
    id: 's-3',
    name: 'Alex Rivera',
    email: 'alex.rivera@university.edu',
    phone: '+1 555-0177',
    age: 20,
    gender: 'Non-binary',
    burnoutScore: 24,
    riskLevel: 'Low',
    lastAssessmentDate: getPastDateString(1),
    sleepHoursAvg: 7.8,
    stressLevelAvg: 2.1,
    journalSentimentSummary: 'Mostly Positive'
  },
  {
    id: 's-4',
    name: 'Emily Watson',
    email: 'emily.w@university.edu',
    phone: '+1 555-0143',
    age: 23,
    gender: 'Female',
    burnoutScore: 82,
    riskLevel: 'High',
    lastAssessmentDate: getPastDateString(1),
    sleepHoursAvg: 4.2,
    stressLevelAvg: 9.0,
    journalSentimentSummary: 'Negative'
  },
  {
    id: 's-5',
    name: 'Marcus Brody',
    email: 'marcus.b@university.edu',
    phone: '+1 555-0158',
    age: 21,
    gender: 'Male',
    burnoutScore: 48,
    riskLevel: 'Moderate',
    lastAssessmentDate: getPastDateString(4),
    sleepHoursAvg: 6.0,
    stressLevelAvg: 6.2,
    journalSentimentSummary: 'Neutral'
  }
];

<<<<<<< HEAD
export const useStore = create<AppState>((set, get) => ({
  // Auth State
  user: null,
  isAuthenticated: false,
  otpVerified: false,
  authError: null,

  // Student Dashboard State
  journalEntries: mockJournalEntries,
  trackerHistory: mockTrackerHistory,
  recommendations: defaultRecommendations,
  notifications: mockNotifications,
=======
const initialAuthToken = getStoredAuthToken();

export const useStore = create<AppState>((set, get) => ({
  // Auth State
  user: null,
  isAuthenticated: !!initialAuthToken,
  otpVerified: !!initialAuthToken,
  authError: null,
  authToken: initialAuthToken,
  pendingVerificationEmail: getStoredPendingEmail(),

  // Student Dashboard State
  journalEntries: [],
  journalAiEntries: [],
  burnoutRisk: null,
  trackerHistory: [],
  analyticsSummary: null,
  latestAssessment: null,
  recommendations: [],
  recommendationHistory: [],
  notifications: [],
>>>>>>> testing

  // Chat Widget State
  chatMessages: [
    {
      id: 'm-0',
      sender: 'ai',
      text: "Hi there! I'm your Wellness Assistant. I analyze your journal entries and weekly assessments to offer suggestions and monitor burnout. How are you feeling today?",
      timestamp: Date.now() - 1000 * 60 * 5,
    }
  ],

  // Admin Portal State
  adminStudents: mockAdminStudents,
  adminSettings: {
    highRiskThreshold: 70,
    moderateRiskThreshold: 40,
    assessmentIntervalDays: 7,
<<<<<<< HEAD
    emailNotificationsEnabled: true,
    inAppNotificationsEnabled: true,
  },

  // Actions
  login: async (email, _password, forceRole) => {
=======
    maxWeeklyAssessmentsPerStudent: 1,
    emailNotificationsEnabled: true,
    inAppNotificationsEnabled: true,
  },
  pendingAiRecommendations: [],
  pendingAiLoading: false,

  // Fetch actions
  fetchTrackerHistory: async () => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;
    try {
      const [initialResponse, weeklyResponse] = await Promise.all([
        apiRequest<{
          success: boolean;
          data: { history: any[] };
        }>('/assessment/history', { token }),
        apiRequest<{
          success: boolean;
          data: { history: any[] };
        }>('/weekly-assessment/history', { token }),
      ]);

      const initialHistory = initialResponse.data.history.map((h) => ({
        date: (h.completedAt ?? h.createdAt).split('T')[0],
        timestamp: new Date(h.completedAt ?? h.createdAt).getTime(),
        burnoutScore: h.burnoutScore,
        sleepHours: h.sleepHours ?? 0,
        studyHours: h.studyHours ?? 0,
        screenTime: h.screenTime ?? 0,
        stressLevel: h.stressLevel ?? 0,
        procrastination: h.procrastination ?? 0,
      }));

      const weeklyHistory = weeklyResponse.data.history.map((h) => ({
        date: (h.completedAt ?? h.createdAt).split('T')[0],
        timestamp: new Date(h.completedAt ?? h.createdAt).getTime(),
        burnoutScore: h.burnoutScore,
        // Now using the actual stored fields
        sleepHours: h.sleepHours ?? h.sleepHoursAverage ?? 0,
        studyHours: h.studyHours ?? (h.academicLoadScore ? Math.round(h.academicLoadScore / 10) : 0),
        screenTime: h.screenTime ?? 0,
        stressLevel: h.stressLevel ?? (h.stressScore ? Math.round(h.stressScore / 10) : 0),
        procrastination: h.procrastination ?? 0,
      }));

      const mapped = [...initialHistory, ...weeklyHistory]
        .sort((a, b) => a.timestamp - b.timestamp);

      set({ trackerHistory: mapped });
    } catch (err) {
      console.error('[Store] Failed to fetch tracker history:', err);
    }
  },

  fetchAnalytics: async () => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;
    try {
      const [analyticsResponse, latestResponse] = await Promise.all([
        apiRequest<{ success: boolean; data: any }>('/analytics/summary', { token }).catch(() => null),
        apiRequest<{ success: boolean; data: { assessment: any } }>('/assessment/latest', { token }).catch(() => null),
      ]);

      if (analyticsResponse?.success) {
        set({
          analyticsSummary: analyticsResponse.data,
          recommendations: analyticsResponse.data.recommendations ?? get().recommendations,
        });
      }

      if (latestResponse?.success && latestResponse.data.assessment) {
        set({
          latestAssessment: {
            burnoutScore: latestResponse.data.assessment.burnoutScore,
            riskLevel: latestResponse.data.assessment.riskLevel,
            date: latestResponse.data.assessment.completedAt || latestResponse.data.assessment.createdAt,
          },
        });
      }
    } catch (err) {
      console.error('[Store] Failed to fetch analytics:', err);
    }
  },

  fetchJournalEntries: async () => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;
    try {
      const response = await apiRequest<{
        success: boolean;
        data: any[];
      }>('/journal', { token });
      const mapped = response.data.map((j) => {
        let sentiment: JournalEntry['sentiment'] = 'Neutral';
        if (j.sentimentScore > 0) sentiment = 'Positive';
        else if (j.sentimentScore < 0) sentiment = 'Negative';

        return {
          id: j._id,
          content: j.notes ?? '',
          sentiment,
          date: (j.journaledAt ?? j.createdAt).split('T')[0],
          timestamp: new Date(j.journaledAt ?? j.createdAt).getTime(),
        };
      });
      set({ journalEntries: mapped });
    } catch (err) {
      console.error('[Store] Failed to fetch journal entries:', err);
    }
  },

  fetchRecommendations: async () => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;
    try {
      const response = await apiRequest<{
        success: boolean;
        data: Recommendation[];
      }>('/recommendations', { token });
      set({ recommendations: response.data });
    } catch (err) {
      console.error('[Store] Failed to fetch recommendations:', err);
    }
  },

  fetchRecommendationHistory: async () => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;
    try {
      const response = await apiRequest<{
        success: boolean;
        data: Recommendation[];
      }>('/recommendations/history', { token });
      set({ recommendationHistory: response.data });
    } catch (err) {
      console.error('[Store] Failed to fetch recommendation history:', err);
    }
  },

  fetchNotifications: async () => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;
    try {
      const response = await apiRequest<{
        success: boolean;
        data: Notification[];
      }>('/notifications', { token });
      set({ notifications: response.data });
    } catch (err) {
      console.error('[Store] Failed to fetch notifications:', err);
    }
  },

  fetchAIHistory: async () => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;
    try {
      const response = await apiRequest<{
        success: boolean;
        data: any[];
      }>('/ai/history', { token });
      set({ chatMessages: response.data });
    } catch (err) {
      console.error('[Store] Failed to fetch AI history:', err);
    }
  },

  fetchAdminSettings: async () => {
    try {
      const response = await apiRequest<SettingsResponse>('/settings');
      set({ adminSettings: response.data });
    } catch (err) {
      console.error('[Store] Failed to fetch admin settings:', err);
    }
  },

  // Actions
  login: async (email, password, forceRole) => {
>>>>>>> testing
    set({ authError: null });
    // Admin override
    if (forceRole === 'admin' || email.includes('admin')) {
      set({
        user: {
          name: 'System Admin',
          email: email,
          phone: '+1 555-9999',
          gender: 'Agnostic',
          age: 35,
          assessmentCompleted: true,
          role: 'admin',
        },
        isAuthenticated: true,
        otpVerified: true,
      });
<<<<<<< HEAD
      return true;
    }

    // Default student profile
    const emailPrefix = email.split('@')[0];
    const nameParts = emailPrefix.split(/[._-]+/).filter(Boolean);
    const displayName = nameParts
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
    const finalName = displayName.trim() ? displayName : 'Student Singh';
    set({
      user: {
        name: finalName,
        email: email,
        phone: '+91 9876543210',
        gender: 'Male',
        age: 21,
        assessmentCompleted: false, // Mock student starts needing an assessment
        role: 'student',
      },
      isAuthenticated: true,
      otpVerified: true,
    });
    return true;
  },

  register: async (userData, _password) => {
    set({
      user: {
        ...userData,
        assessmentCompleted: false, // Must take assessment
        role: 'student',
      },
      isAuthenticated: true, // Authenticated but needs OTP verification
      otpVerified: false,
      authError: null,
    });
    return true;
  },

  verifyOtp: async (otp) => {
    if (otp === '123456' || otp.length === 6) {
      set({ otpVerified: true });
      return true;
    }
    set({ authError: 'Invalid OTP code. Please enter 6 digits.' });
    return false;
  },

  logout: () => {
=======
      await get().fetchAdminSettings();
      return true;
    }

    try {
      const data = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      storeSession(data.token);
      localStorage.removeItem(PENDING_EMAIL_KEY);
      set({
        user: mapStudentToUser(data.user),
        authToken: data.token,
        pendingVerificationEmail: null,
        isAuthenticated: true,
        otpVerified: true,
      });

      // Fetch user specific data
      setTimeout(() => {
        get().fetchAdminSettings();
        get().fetchTrackerHistory();
        get().fetchJournalEntries();
        get().fetchJournalAiEntries();
        get().fetchBurnoutRisk();
        get().fetchRecommendations();
        get().fetchNotifications();
        get().fetchAIHistory();
      }, 50);

      return true;
    } catch (error) {
      set({ authError: error instanceof Error ? error.message : 'Login failed' });
      return false;
    }
  },

  loginWithGoogle: async (idToken) => {
    try {
      set({ authError: null });
      const data = await apiRequest<AuthResponse>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ token: idToken }),
      });

      storeSession(data.token);
      localStorage.removeItem(PENDING_EMAIL_KEY);
      set({
        user: mapStudentToUser(data.user),
        authToken: data.token,
        pendingVerificationEmail: null,
        isAuthenticated: true,
        otpVerified: true,
      });

      setTimeout(() => {
        get().fetchAdminSettings();
        get().fetchTrackerHistory();
        get().fetchJournalEntries();
        get().fetchJournalAiEntries();
        get().fetchBurnoutRisk();
        get().fetchRecommendations();
        get().fetchNotifications();
        get().fetchAIHistory();
      }, 50);

      return true;
    } catch (error) {
      set({
        authError: error instanceof Error ? error.message : 'Google sign-in failed',
      });
      return false;
    }
  },

  register: async (userData, password) => {
    try {
      set({ authError: null });
      await apiRequest<RegisterResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password,
          gender: userData.gender.toLowerCase(),
          age: userData.age,
        }),
      });

      clearSession();
      localStorage.setItem(PENDING_EMAIL_KEY, userData.email);
      set({
        user: {
          ...userData,
          assessmentCompleted: false,
        },
        authToken: null,
        pendingVerificationEmail: userData.email,
        isAuthenticated: false,
        otpVerified: false,
      });
      return true;
    } catch (error) {
      set({ authError: error instanceof Error ? error.message : 'Registration failed' });
      return false;
    }
  },

  verifyOtp: async (otp) => {
    const email = get().pendingVerificationEmail ?? get().user?.email;
    if (!email) {
      set({ authError: 'No pending email verification found.' });
      return false;
    }

    try {
      set({ authError: null });
      const data = await apiRequest<VerifyOtpResponse>('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });
      storeSession(data.token);
      localStorage.removeItem(PENDING_EMAIL_KEY);
      set({
        user: mapStudentToUser(data.user),
        authToken: data.token,
        isAuthenticated: true,
        otpVerified: true,
        pendingVerificationEmail: null,
      });

      setTimeout(() => {
        get().fetchAdminSettings();
        get().fetchTrackerHistory();
        get().fetchJournalEntries();
        get().fetchJournalAiEntries();
        get().fetchBurnoutRisk();
        get().fetchRecommendations();
        get().fetchNotifications();
        get().fetchAIHistory();
      }, 50);

      return true;
    } catch (error) {
      set({ authError: error instanceof Error ? error.message : 'OTP verification failed' });
      return false;
    }
  },

  resendOtp: async () => {
    const email = get().pendingVerificationEmail ?? get().user?.email;
    if (!email) {
      set({ authError: 'No pending email verification found.' });
      return false;
    }

    try {
      set({ authError: null });
      await apiRequest<{ success: boolean }>('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return true;
    } catch (error) {
      set({ authError: error instanceof Error ? error.message : 'Unable to resend OTP' });
      return false;
    }
  },

  logout: () => {
    clearSession();
    localStorage.removeItem(PENDING_EMAIL_KEY);
>>>>>>> testing
    set({
      user: null,
      isAuthenticated: false,
      otpVerified: false,
      authError: null,
<<<<<<< HEAD
=======
      authToken: null,
      pendingVerificationEmail: null,
      journalEntries: [],
  journalAiEntries: [],
  burnoutRisk: null,
      trackerHistory: [],
      recommendations: [],
      recommendationHistory: [],
      notifications: [],
      chatMessages: [
        {
          id: 'm-0',
          sender: 'ai',
          text: "Hi there! I'm your Wellness Assistant. I analyze your journal entries and weekly assessments to offer suggestions and monitor burnout. How are you feeling today?",
          timestamp: Date.now() - 1000 * 60 * 5,
        }
      ],
>>>>>>> testing
    });
  },

  forgotPassword: async (email) => {
<<<<<<< HEAD
    console.log(`Sending recovery email to: ${email}`);
    return true;
  },

  submitAssessment: (data, _isWeekly = false) => {
    // Layer 1 Rule-Based Scoring Formula
    // Base score components
    const stressFactor = data.stressLevel * 4; // max 40
    const motivationFactor = (10 - data.motivationLevel) * 2.5; // max 25
    const energyFactor = (10 - data.energyLevel) * 1.5; // max 15
    const satisfactionFactor = (10 - data.academicSatisfaction) * 1.0; // max 10
    const sleepFactor = Math.max(0, 8 - data.sleepHours) * 3; // sleep penalty, max 15-20
    const backlogFactor = data.assignmentBacklog * 2; // backlog penalty
    const procrastinationFactor = data.procrastination * 1.0; // max 10
    
    let computedScore = stressFactor + motivationFactor + energyFactor + satisfactionFactor + sleepFactor + backlogFactor + procrastinationFactor;
    
    // Clamp between 0 and 100
    computedScore = Math.min(100, Math.max(0, Math.round(computedScore)));

    const todayStr = new Date().toISOString().split('T')[0];

    // Create tracker entry
    const newTracker: TrackerHistory = {
      date: todayStr,
      burnoutScore: computedScore,
      sleepHours: data.sleepHours,
      studyHours: data.studyHours,
      screenTime: data.screenTime,
      stressLevel: data.stressLevel,
      procrastination: data.procrastination,
    };

    // Update user context and history
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: {
          ...currentUser,
          assessmentCompleted: true,
        },
      });
    }

    // Dynamic recommendations based on score and factors
    const newRecommendations: Recommendation[] = [];
    if (data.sleepHours < 6.5) {
      newRecommendations.push({
        id: `rec-${Date.now()}-1`,
        title: 'Earlier Sleep Schedule',
        reason: `Your sleep of ${data.sleepHours} hours is below the recommended 7-8 hours.`,
        priority: 'High',
        followedStatus: 'none',
        rating: 0,
        feedbackText: '',
        dateGenerated: todayStr,
      });
    }
    if (data.screenTime > 6) {
      newRecommendations.push({
        id: `rec-${Date.now()}-2`,
        title: 'Reduce Screen Time before Bed',
        reason: `Your daily screen time is ${data.screenTime} hours. Aim to disconnect 1 hour before bedtime.`,
        priority: 'Medium',
        followedStatus: 'none',
        rating: 0,
        feedbackText: '',
        dateGenerated: todayStr,
      });
    }
    if (data.assignmentBacklog > 5) {
      newRecommendations.push({
        id: `rec-${Date.now()}-3`,
        title: 'Break Down Backlog into Micro-Tasks',
        reason: `Your assignment backlog has reached ${data.assignmentBacklog} items, causing overload.`,
        priority: 'High',
        followedStatus: 'none',
        rating: 0,
        feedbackText: '',
        dateGenerated: todayStr,
      });
    }
    if (data.stressLevel > 7) {
      newRecommendations.push({
        id: `rec-${Date.now()}-4`,
        title: 'Daily 10-Minute Guided Mindfulness',
        reason: 'Your stress level is highly elevated. Incorporate brief breathing sessions.',
        priority: 'High',
        followedStatus: 'none',
        rating: 0,
        feedbackText: '',
        dateGenerated: todayStr,
      });
    }
    if (newRecommendations.length === 0) {
      newRecommendations.push({
        id: `rec-${Date.now()}-5`,
        title: 'Maintain Study-Life Balance',
        reason: 'Your scores are healthy. Keep taking regular study breaks to sustain this.',
        priority: 'Low',
        followedStatus: 'none',
        rating: 0,
        feedbackText: '',
        dateGenerated: todayStr,
      });
    }

    // Trigger Notification on high stress / high score
    const scoreRisk = computedScore >= 70 ? 'High' : computedScore >= 40 ? 'Moderate' : 'Low';
    if (computedScore >= 70) {
      get().addNotification('Risk', `High Burnout Warning: Your score is ${computedScore} (${scoreRisk} Risk). Action suggested.`);
    }

    set((state) => ({
      trackerHistory: [...state.trackerHistory, newTracker],
      recommendations: [...newRecommendations, ...state.recommendations].slice(0, 8),
    }));
  },

  addJournalEntry: (content) => {
    // Layer 4: Feature Extraction Engine & Sentiment Analysis Simulation
    // Analyze keywords for mock sentiment
    const contentLower = content.toLowerCase();
    
    let sentiment: JournalEntry['sentiment'] = 'Neutral';
    let negativePoints = 0;
    let positivePoints = 0;

    const negativeKeywords = ['tired', 'stressed', 'exhausted', 'overwhelmed', 'sad', 'angry', 'fail', 'bad', 'hard', 'stuck', 'sleepy', 'insomnia', 'procrastinating', 'backlog'];
    const positiveKeywords = ['happy', 'productive', 'good', 'refreshed', 'exercise', 'relax', 'fun', 'completed', 'progress', 'sleep well', 'motivated', 'excited'];

    negativeKeywords.forEach(word => {
      if (contentLower.includes(word)) negativePoints++;
    });

    positiveKeywords.forEach(word => {
      if (contentLower.includes(word)) positivePoints++;
    });

    if (negativePoints > positivePoints) {
      sentiment = 'Negative';
    } else if (positivePoints > negativePoints) {
      sentiment = 'Positive';
    }

    const newEntry: JournalEntry = {
      id: `j-${Date.now()}`,
      content,
      sentiment,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
    };

    // Layer 4: Extract features and simulate influence on burnout score
    // (e.g. adjust the last burnout score slightly based on the entry's sentiment)
    set((state) => {
      const updatedHistory = [...state.trackerHistory];
      if (updatedHistory.length > 0) {
        const lastIndex = updatedHistory.length - 1;
        const lastItem = updatedHistory[lastIndex];
        let scoreAdjustment = 0;
        
        if (sentiment === 'Negative') scoreAdjustment = 3;
        if (sentiment === 'Positive') scoreAdjustment = -3;
        
        updatedHistory[lastIndex] = {
          ...lastItem,
          burnoutScore: Math.min(100, Math.max(0, lastItem.burnoutScore + scoreAdjustment)),
        };
      }

      // Add a notification about sentiment analysis output
      const sentimentAlertMsg = `Sentiment analyzed: "${sentiment}". Emotional markers recorded.`;
      
      return {
        journalEntries: [newEntry, ...state.journalEntries],
        trackerHistory: updatedHistory,
        notifications: [
          {
            id: `n-${Date.now()}`,
            category: 'Mood',
            message: sentimentAlertMsg,
            read: false,
            date: new Date().toISOString().split('T')[0],
          },
          ...state.notifications
        ],
      };
    });
  },

  deleteJournalEntry: (id) => {
    set((state) => ({
      journalEntries: state.journalEntries.filter(entry => entry.id !== id),
    }));
  },

  submitRecommendationFeedback: (id, followedStatus, rating, feedbackText) => {
    set((state) => {
      const updatedRecommendations = state.recommendations.map((rec) => {
        if (rec.id === id) {
          return {
            ...rec,
            followedStatus,
            rating,
            feedbackText,
          };
        }
        return rec;
      });

      // Layer 5 Simulation: Create a notification acknowledging feedback
      const rec = state.recommendations.find(r => r.id === id);
      const recTitle = rec ? rec.title : 'Recommendation';

      return {
        recommendations: updatedRecommendations,
        notifications: [
          {
            id: `n-${Date.now()}`,
            category: 'Recommendation',
            message: `Feedback recorded for "${recTitle}". AI is adapting models to your habits.`,
            read: false,
            date: new Date().toISOString().split('T')[0],
          },
          ...state.notifications
        ]
      };
    });
  },

  markNotificationRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
  },

  deleteNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  deleteAllNotifications: () => {
    set(() => ({
      notifications: [],
    }));
  },

  addNotification: (category, message) => {
    const newNotif: Notification = {
      id: `n-${Date.now()}`,
      category,
      message,
      read: false,
      date: new Date().toISOString().split('T')[0],
    };
    set((state) => ({
      notifications: [newNotif, ...state.notifications],
    }));
  },

  sendChatMessage: (text) => {
=======
    try {
      set({ authError: null });
      await apiRequest<{ success: boolean }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return true;
    } catch (error) {
      set({ authError: error instanceof Error ? error.message : 'Password recovery failed' });
      return false;
    }
  },

  resetPassword: async (email, token, password) => {
    try {
      set({ authError: null });
      await apiRequest<{ success: boolean }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, otp: token, newPassword: password }),
      });
      return true;
    } catch (error) {
      set({ authError: error instanceof Error ? error.message : 'Password reset failed' });
      return false;
    }
  },

  fetchMe: async () => {
    const token = get().authToken ?? getStoredAuthToken();

    try {
      if (!token) {
        const refreshed = await apiRequest<RefreshTokenResponse>('/auth/refresh-token', {
          method: 'POST',
        });
        storeSession(refreshed.token);
        set({
          user: mapStudentToUser(refreshed.user),
          authToken: refreshed.token,
          isAuthenticated: true,
          otpVerified: true,
        });

        setTimeout(() => {
          get().fetchAdminSettings();
          get().fetchTrackerHistory();
          get().fetchJournalEntries();
        get().fetchJournalAiEntries();
        get().fetchBurnoutRisk();
          get().fetchRecommendations();
          get().fetchNotifications();
          get().fetchAIHistory();
        }, 50);

        return true;
      }

      const data = await apiRequest<MeResponse>('/auth/me', { token });
      set({
        user: mapStudentToUser(data.user),
        authToken: token,
        isAuthenticated: true,
        otpVerified: true,
      });

      setTimeout(() => {
        get().fetchAdminSettings();
        get().fetchTrackerHistory();
        get().fetchJournalEntries();
        get().fetchJournalAiEntries();
        get().fetchBurnoutRisk();
        get().fetchRecommendations();
        get().fetchNotifications();
        get().fetchAIHistory();
      }, 50);

      return true;
    } catch {
      try {
        const refreshed = await apiRequest<RefreshTokenResponse>('/auth/refresh-token', {
          method: 'POST',
        });
        storeSession(refreshed.token);
        set({
          user: mapStudentToUser(refreshed.user),
          authToken: refreshed.token,
          isAuthenticated: true,
          otpVerified: true,
        });

        setTimeout(() => {
          get().fetchAdminSettings();
          get().fetchTrackerHistory();
          get().fetchJournalEntries();
        get().fetchJournalAiEntries();
        get().fetchBurnoutRisk();
          get().fetchRecommendations();
          get().fetchNotifications();
          get().fetchAIHistory();
        }, 50);

        return true;
      } catch {
        clearSession();
        set({ user: null, authToken: null, isAuthenticated: false, otpVerified: false });
        return false;
      }
    }
  },

  updateProfile: async (profile) => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) {
      set({ authError: 'Please login again to update your profile.' });
      return false;
    }

    try {
      set({ authError: null });
      const data = await apiRequest<MeResponse>('/auth/me', {
        method: 'PATCH',
        token,
        body: JSON.stringify({
          name: profile.name,
          phoneNumber: profile.phone,
          age: profile.age,
          gender: profile.gender.toLowerCase(),
        }),
      });

      set({ user: mapStudentToUser(data.user) });
      return true;
    } catch (error) {
      set({ authError: error instanceof Error ? error.message : 'Profile update failed' });
      return false;
    }
  },

  submitAssessment: async (data, isWeekly = false) => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) {
      return 'You are not logged in. Please log in and try again.';
    }

    try {
      const maxWeeklyAssessments = Math.max(1, get().adminSettings.maxWeeklyAssessmentsPerStudent);
      const endpoint = isWeekly
        ? `/weekly-assessment?maxWeeklyAssessments=${maxWeeklyAssessments}`
        : '/assessment';
      const body = isWeekly
        ? mapToWeeklyAssessmentPayload(data)
        : mapToInitialAssessmentPayload(data);

      await apiRequest<{
        success: boolean;
        data: { assessment: { burnoutScore: number } };
      }>(endpoint, {
        method: 'POST',
        token,
        body: JSON.stringify(body),
      });

      const currentUser = get().user;
      if (currentUser && !isWeekly) {
        set({
          user: {
            ...currentUser,
            assessmentCompleted: true,
          },
        });
      }

      await get().fetchTrackerHistory();
      await get().fetchAnalytics();
      await get().fetchRecommendations();
      await get().fetchNotifications();

      return null; // null = success
    } catch (error) {
      console.error('[Assessment] Submit failed:', error);
      // Return the real backend message so the UI can show it
      if (error instanceof Error) return error.message;
      return 'Failed to save assessment. Please check your connection and try again.';
    }
  },

  addJournalEntry: async (content) => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;
    try {
      await apiRequest('/journal', {
        method: 'POST',
        token,
        body: JSON.stringify({ content }),
      });
      await get().fetchJournalEntries();
      await get().fetchNotifications();
      await get().fetchTrackerHistory();
    } catch (err) {
      console.error('[Store] Failed to add journal entry:', err);
    }
  },

  fetchJournalAiEntries: async () => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;
    try {
      const response = await apiRequest<{
        success: boolean;
        data: any[];
      }>('/journal-ai', { token });
      const mapped = response.data.map((j) => ({
        id: j._id,
        studentId: j.studentId,
        content: j.content,
        sentiment: j.sentiment,
        createdAt: j.createdAt,
        updatedAt: j.updatedAt,
      }));
      set({ journalAiEntries: mapped });
    } catch (err) {
      console.error('[Store] Failed to fetch AI journal entries:', err);
    }
  },

  addJournalAiEntry: async (content) => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;
    try {
      await apiRequest('/journal-ai', {
        method: 'POST',
        token,
        body: JSON.stringify({ content }),
      });
      await get().fetchJournalAiEntries();
    } catch (err) {
      console.error('[Store] Failed to add AI journal entry:', err);
    }
  },

  fetchBurnoutRisk: async () => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;
    try {
      const response = await apiRequest<{
        success: boolean;
        data: any;
      }>('/journal-ai/burnout-risk', { token });
      set({ burnoutRisk: response.data });
    } catch (err) {
      console.error('[Store] Failed to fetch burnout risk:', err);
    }
  },

  deleteJournalAiEntry: async (id) => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;
    try {
      await apiRequest(`/journal-ai/${id}`, {
        method: 'DELETE',
        token,
      });
      await get().fetchJournalAiEntries();
    } catch (err) {
      console.error('[Store] Failed to delete AI journal entry:', err);
    }
  },

  deleteJournalEntry: async (id) => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;
    try {
      await apiRequest(`/journal/${id}`, {
        method: 'DELETE',
        token,
      });
      await get().fetchJournalEntries();
    } catch (err) {
      console.error('[Store] Failed to delete journal entry:', err);
    }
  },

  submitRecommendationFeedback: async (id, followedStatus, rating, feedbackText) => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;
    try {
      await apiRequest(`/recommendations/${id}/feedback`, {
        method: 'POST',
        token,
        body: JSON.stringify({ status: followedStatus, rating, feedbackText }),
      });
      await get().fetchRecommendations();
      await get().fetchRecommendationHistory();
      await get().fetchNotifications();
    } catch (err) {
      console.error('[Store] Failed to submit recommendation feedback:', err);
    }
  },

  markNotificationRead: async (id) => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;
    try {
      await apiRequest(`/notifications/${id}/read`, {
        method: 'PATCH',
        token,
      });
      await get().fetchNotifications();
    } catch (err) {
      console.error('[Store] Failed to mark notification read:', err);
    }
  },

  markAllNotificationsRead: async () => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;
    try {
      await apiRequest('/notifications/read-all', {
        method: 'POST',
        token,
      });
      await get().fetchNotifications();
    } catch (err) {
      console.error('[Store] Failed to mark all notifications read:', err);
    }
  },

  deleteNotification: async (id) => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;
    try {
      await apiRequest(`/notifications/${id}`, {
        method: 'DELETE',
        token,
      });
      await get().fetchNotifications();
    } catch (err) {
      console.error('[Store] Failed to delete notification:', err);
    }
  },

  deleteAllNotifications: async () => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;
    try {
      await apiRequest('/notifications', {
        method: 'DELETE',
        token,
      });
      await get().fetchNotifications();
    } catch (err) {
      console.error('[Store] Failed to delete all notifications:', err);
    }
  },

  addNotification: () => {}, // No-op, managed by backend

  sendChatMessage: async (text) => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;

    // Optimistically add user message
>>>>>>> testing
    const userMsg = {
      id: `m-usr-${Date.now()}`,
      sender: 'user' as const,
      text,
      timestamp: Date.now(),
    };
<<<<<<< HEAD

=======
>>>>>>> testing
    set((state) => ({
      chatMessages: [...state.chatMessages, userMsg],
    }));

<<<<<<< HEAD
    // AI Response Simulation
    setTimeout(() => {
      const userText = text.toLowerCase();
      let aiResponseText = "I see. Let's talk more about that. Sharing your feelings in your mood journal is also a great way to monitor your progress.";

      if (userText.includes('sleep') || userText.includes('insomnia') || userText.includes('tired')) {
        aiResponseText = "Sleep disruption is a primary indicator of burnout. I highly recommend establishing a screen-free window 1 hour before sleeping and aiming for a consistent 7+ hours of sleep. Would you like me to log this sleep alert in your analytics?";
      } else if (userText.includes('exam') || userText.includes('study') || userText.includes('stress') || userText.includes('overwhelmed')) {
        aiResponseText = "Academic pressure can quickly cause burnout. I suggest scheduling 10-minute micro-breaks for every 50 minutes of studying, and focusing on breaking your backlog down into small daily steps.";
      } else if (userText.includes('motivated') || userText.includes('procrastinate') || userText.includes('lazy')) {
        aiResponseText = "Motivation drops can be due to continuous stress. Try using the Pomodoro technique to complete just one simple, 15-minute task. It helps lower the entry barrier.";
      } else if (userText.includes('hello') || userText.includes('hi')) {
        aiResponseText = "Hello! I'm here to support your student wellness journey. Feel free to talk to me about your academic workload, sleep habits, or mood.";
      }

      const aiMsg = {
        id: `m-ai-${Date.now()}`,
        sender: 'ai' as const,
        text: aiResponseText,
        timestamp: Date.now(),
      };

      set((state) => ({
        chatMessages: [...state.chatMessages, aiMsg],
      }));
    }, 1000);
=======
    try {
      const response = await apiRequest<{
        success: boolean;
        data: {
          userMessage: any;
          aiMessage: any;
        };
      }>('/ai/chat', {
        method: 'POST',
        token,
        body: JSON.stringify({ message: text }),
      });

      // Update state with AI response
      set((state) => ({
        chatMessages: [
          ...state.chatMessages.filter((m) => m.id !== userMsg.id),
          response.data.userMessage,
          response.data.aiMessage,
        ],
      }));
    } catch (err) {
      console.error('[Store] Failed to send chat message:', err);
    }
>>>>>>> testing
  },

  // Admin Actions
  adminSendNotification: (studentId, message, _category) => {
    if (studentId === 'all') {
      console.log(`Sending notification to all: ${message}`);
    } else {
      console.log(`Sending notification to student ${studentId}: ${message}`);
    }
  },

  adminCreateRecommendation: (rec) => {
    const newRec: Recommendation = {
      ...rec,
      id: `rec-admin-${Date.now()}`,
      followedStatus: 'none',
      rating: 0,
      feedbackText: '',
      dateGenerated: new Date().toISOString().split('T')[0],
    };
    set((state) => ({
      recommendations: [newRec, ...state.recommendations],
    }));
  },

  adminDeleteRecommendation: (id) => {
    set((state) => ({
      recommendations: state.recommendations.filter(r => r.id !== id),
    }));
  },

  adminUpdateSettings: (settings) => {
    set((state) => ({
      adminSettings: {
        ...state.adminSettings,
        ...settings,
      },
    }));
<<<<<<< HEAD
  }
}));

=======
    apiRequest<SettingsResponse>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
      .then((response) => set({ adminSettings: response.data }))
      .catch((err) => console.error('[Store] Failed to update admin settings:', err));
  },

  // Admin Approval Queue
  fetchPendingAiRecommendations: async () => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;
    set({ pendingAiLoading: true });
    try {
      const response = await apiRequest<{ success: boolean; data: PendingAiRecommendation[] }>(
        '/recommendations/admin/pending',
        { token },
      );
      set({ pendingAiRecommendations: response.data, pendingAiLoading: false });
    } catch (err) {
      console.error('[Store] Failed to fetch pending AI recommendations:', err);
      set({ pendingAiLoading: false });
    }
  },

  approveAiRecommendation: async (id) => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;
    try {
      await apiRequest(`/recommendations/admin/${id}/approve`, { method: 'PATCH', token });
      set((state) => ({
        pendingAiRecommendations: state.pendingAiRecommendations.filter((r) => r.id !== id),
      }));
    } catch (err) {
      console.error('[Store] Failed to approve recommendation:', err);
      throw err;
    }
  },

  editApproveAiRecommendation: async (id, payload) => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;
    try {
      await apiRequest(`/recommendations/admin/${id}/edit-approve`, {
        method: 'PATCH',
        token,
        body: JSON.stringify(payload),
      });
      set((state) => ({
        pendingAiRecommendations: state.pendingAiRecommendations.filter((r) => r.id !== id),
      }));
    } catch (err) {
      console.error('[Store] Failed to edit-approve recommendation:', err);
      throw err;
    }
  },

  rejectAiRecommendation: async (id) => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;
    try {
      await apiRequest(`/recommendations/admin/${id}/reject`, { method: 'DELETE', token });
      set((state) => ({
        pendingAiRecommendations: state.pendingAiRecommendations.filter((r) => r.id !== id),
      }));
    } catch (err) {
      console.error('[Store] Failed to reject recommendation:', err);
      throw err;
    }
  },
}));
>>>>>>> testing
