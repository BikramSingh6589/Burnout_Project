import { create } from 'zustand';
import { apiRequest } from '../lib/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5001/api';

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
  name: string;
  email: string;
  phone: string;
  gender: string;
  age: number;
  profileCompleted?: boolean;
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
  burnoutScore: number;
  sleepHours: number;
  studyHours: number;
  screenTime: number;
  stressLevel: number;
  procrastination: number;
}

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
  followedStatus: 'none' | 'followed' | 'partially' | 'not';
  rating: number; // 0 to 5
  feedbackText: string;
  dateGenerated: string;
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
}

export interface Notification {
  _id: string;
  type: 'assessment_reminder' | 'risk_alert' | 'recommendation' | 'ai_alert' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
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
  maxWeeklyAssessmentsPerStudent: number;
  emailNotificationsEnabled: boolean;
  inAppNotificationsEnabled: boolean;
}

export interface AdminDashboardMetrics {
  totalStudents: number;
  totalAssessments: number;
  lowRiskStudents: number;
  mediumRiskStudents: number;
  highRiskStudents: number;
  averageBurnoutScore: number;
}

interface AppState {
  // Auth State
  user: User | null;
  isAuthenticated: boolean;
  otpVerified: boolean;
  authError: string | null;
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
  notifications: Notification[];
  unreadNotificationCount: number;
  deletingRecommendationIds: Set<string>;
  recommendationsLoading: boolean;
  recommendationHistoryLoading: boolean;
  analyticsLoading: boolean;
  trackerHistoryLoading: boolean;
  burnoutRiskLoading: boolean;

  // Chat Widget State
  chatMessages: { id: string; sender: 'user' | 'ai'; text: string; timestamp: number }[];

  // Admin Portal State
  adminStudents: AdminStudent[];
  adminHighRiskStudents: AdminStudent[];
  adminDashboardMetrics: AdminDashboardMetrics | null;
  adminSettings: AdminSettings;
  adminStudentDetail: any | null;
  adminStudentLoading: boolean;

  // Fetch actions
  fetchTrackerHistory: () => Promise<void>;
  fetchAdminDashboardMetrics: () => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  fetchJournalEntries: () => Promise<void>;
  fetchJournalAiEntries: () => Promise<void>;
  fetchBurnoutRisk: () => Promise<void>;
  fetchRecommendations: () => Promise<void>;
  fetchRecommendationHistory: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchAIHistory: () => Promise<void>;
  clearAIHistory: () => Promise<void>;
  fetchAdminSettings: () => Promise<void>;
  fetchAdminStudents: (page?: number, limit?: number) => Promise<void>;
  fetchAdminHighRisk: (page?: number, limit?: number) => Promise<void>;
  fetchAdminStudentDetail: (studentId: string) => Promise<void>;
  sendWellnessEmail: (studentId: string, subject: string, message: string) => Promise<void>;

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

  // Journals
  addJournalEntry: (content: string) => void;
  deleteJournalEntry: (id: string) => void;
  addJournalAiEntry: (content: string) => Promise<void>;
  deleteJournalAiEntry: (id: string) => Promise<void>;

  // Recommendations
  submitRecommendationFeedback: (
    id: string,
    followedStatus: 'followed' | 'partially' | 'not',
    rating: number,
    feedbackText: string
  ) => void;
  deleteRecommendation: (id: string) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  deleteAllNotifications: () => void;
  addNotification: (type: Notification['type'], message: string) => void;

  // Chat actions
  sendChatMessage: (text: string) => void;

  // Admin actions
  adminSendNotification: (studentId: string | 'all', message: string, category: string) => Promise<void>;
  adminCreateRecommendation: (rec: Omit<Recommendation, 'id' | 'followedStatus' | 'rating' | 'feedbackText' | 'dateGenerated'>) => void;
  adminDeleteRecommendation: (id: string) => void;
  adminUpdateSettings: (settings: Partial<AdminSettings>) => void;

  // Admin approval queue
  pendingAiRecommendations: PendingAiRecommendation[];
  pendingAiLoading: boolean;
  fetchPendingAiRecommendations: () => Promise<void>;
  approveAiRecommendation: (id: string) => Promise<void>;
  editApproveAiRecommendation: (id: string, payload: { title?: string; message?: string; priority?: string; category?: string }) => Promise<void>;
  rejectAiRecommendation: (id: string) => Promise<void>;
}

// Initial Mock Data Helpers
const getPastDateString = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

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
  unreadNotificationCount: 0,
  deletingRecommendationIds: new Set(),
  recommendationsLoading: false,
  recommendationHistoryLoading: false,
  analyticsLoading: false,
  trackerHistoryLoading: false,
  burnoutRiskLoading: false,

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
  adminStudents: [],
  adminHighRiskStudents: [],
  adminDashboardMetrics: null,
  adminSettings: {
    highRiskThreshold: 70,
    moderateRiskThreshold: 40,
    assessmentIntervalDays: 7,
    maxWeeklyAssessmentsPerStudent: 1,
    emailNotificationsEnabled: true,
    inAppNotificationsEnabled: true,
  },
  adminStudentDetail: null,
  adminStudentLoading: false,
  pendingAiRecommendations: [],
  pendingAiLoading: false,

  // Fetch actions
  fetchTrackerHistory: async () => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;
    set({ trackerHistoryLoading: true });
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
        id: h._id || h.id || crypto.randomUUID(),
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
        id: h._id || h.id || crypto.randomUUID(),
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
      
      set({ trackerHistory: mapped, trackerHistoryLoading: false });
    } catch (err) {
      console.error('[Store] Failed to fetch tracker history:', err);
      set({ trackerHistoryLoading: false });
    }
  },

  fetchAnalytics: async () => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;
    set({ analyticsLoading: true });
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
    } finally {
      set({ analyticsLoading: false });
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
    set({ recommendationsLoading: true });
    try {
      const response = await apiRequest<{
        success: boolean;
        data: Recommendation[];
      }>('/recommendations', { token });
      set({ recommendations: response.data, recommendationsLoading: false });
    } catch (err) {
      console.error('[Store] Failed to fetch recommendations:', err);
      set({ recommendationsLoading: false });
    }
  },

  fetchRecommendationHistory: async () => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;
    set({ recommendationHistoryLoading: true });
    try {
      const response = await apiRequest<{
        success: boolean;
        data: Recommendation[];
      }>('/recommendations/history', { token });
      set({ recommendationHistory: response.data, recommendationHistoryLoading: false });
    } catch (err) {
      console.error('[Store] Failed to fetch recommendation history:', err);
      set({ recommendationHistoryLoading: false });
    }
  },

  fetchNotifications: async () => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;
    try {
      const response = await apiRequest<{
        success: boolean;
        count: number;
        unreadCount: number;
        data: Notification[];
      }>('/notifications', { token });
      set({ 
        notifications: response.data,
        unreadNotificationCount: response.unreadCount 
      });
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

  clearAIHistory: async () => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;

    // Optimistically remove messages from the frontend immediately
    set({
      chatMessages: [
        {
          id: 'm-0',
          sender: 'ai',
          text: "Hi there! I'm your Wellness Assistant. I analyze your journal entries and weekly assessments to offer suggestions and monitor burnout. How are you feeling today?",
          timestamp: Date.now(),
        },
      ],
    });

    try {
      await apiRequest('/ai/clear', { method: 'DELETE', token });
      // Re-sync with server state (will return default greeting if cleared)
      await get().fetchAIHistory();
    } catch (err) {
      console.error('[Store] Failed to clear AI history:', err);
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

  fetchAdminDashboardMetrics: async () => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;
    try {
      const response = await apiRequest<{ success: boolean; data: AdminDashboardMetrics }>('/admin/dashboard', { token });
      set({ adminDashboardMetrics: response.data });
    } catch (err) {
      console.error('[Store] Failed to fetch admin dashboard metrics:', err);
    }
  },

  fetchAdminStudents: async (page = 1, limit = 20) => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;
    try {
      const response = await apiRequest<{
        success: boolean;
        data: Array<{
          id: string;
          name: string;
          email: string;
          burnoutScore: number;
          riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
          lastAssessmentDate?: string;
        }>;
      }>(`/admin/students?page=${page}&limit=${limit}`, { token });
      
      const mapped: AdminStudent[] = response.data.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        phone: '',
        age: 0,
        gender: 'Other',
        burnoutScore: s.burnoutScore,
        riskLevel: s.riskLevel === 'HIGH' ? 'High' : s.riskLevel === 'MEDIUM' ? 'Moderate' : 'Low',
        lastAssessmentDate: s.lastAssessmentDate ? new Date(s.lastAssessmentDate).toISOString().split('T')[0] : '',
        sleepHoursAvg: 0,
        stressLevelAvg: 0,
        journalSentimentSummary: '',
      }));
      
      set({ adminStudents: mapped });
    } catch (err) {
      console.error('[Store] Failed to fetch admin students:', err);
    }
  },

  fetchAdminHighRisk: async (page = 1, limit = 20) => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;
    try {
      const response = await apiRequest<{
        success: boolean;
        data: Array<{
          id: string;
          name: string;
          email: string;
          burnoutScore: number;
          riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
          lastAssessmentDate?: string;
        }>;
      }>(`/admin/high-risk?page=${page}&limit=${limit}`, { token });
      
      const mapped: AdminStudent[] = response.data.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        phone: '',
        age: 0,
        gender: 'Other',
        burnoutScore: s.burnoutScore,
        riskLevel: 'High',
        lastAssessmentDate: s.lastAssessmentDate ? new Date(s.lastAssessmentDate).toISOString().split('T')[0] : '',
        sleepHoursAvg: 0,
        stressLevelAvg: 0,
        journalSentimentSummary: '',
      }));
      
      set({ adminHighRiskStudents: mapped });
    } catch (err) {
      console.error('[Store] Failed to fetch high-risk students:', err);
    }
  },

  fetchAdminStudentDetail: async (studentId) => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;
    set({ adminStudentLoading: true });
    try {
      const response = await apiRequest<{ success: boolean; data: any }>(`/admin/student/${studentId}`, { token });
      set({ adminStudentDetail: response.data, adminStudentLoading: false });
    } catch (err) {
      console.error('[Store] Failed to fetch student detail:', err);
      set({ adminStudentLoading: false });
    }
  },

  sendWellnessEmail: async (studentId, subject, message) => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;
    try {
      await apiRequest('/admin/send-email', {
        method: 'POST',
        token,
        body: JSON.stringify({ studentId, subject, message }),
      });
    } catch (err) {
      console.error('[Store] Failed to send wellness email:', err);
      throw err;
    }
  },

  // Actions
  login: async (email, password, forceRole) => {
    set({ authError: null });
    
    // Admin login
    if (forceRole === 'admin') {
      try {
        const data = await apiRequest<{ success: boolean; token: string; admin: { id: string; username: string } }>('/admin/login', {
          method: 'POST',
          body: JSON.stringify({ username: email, password }),
        });

        storeSession(data.token);
        set({
          user: {
            name: data.admin.username,
            email: email,
            phone: '',
            gender: 'Agnostic',
            age: 0,
            assessmentCompleted: true,
            role: 'admin',
          },
          authToken: data.token,
          isAuthenticated: true,
          otpVerified: true,
        });
        await get().fetchAdminSettings();
        return true;
      } catch (error) {
        set({ authError: error instanceof Error ? error.message : 'Admin login failed' });
        return false;
      }
    }

    // Student login
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
    set({
      user: null,
      isAuthenticated: false,
      otpVerified: false,
      authError: null,
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
    });
  },

  forgotPassword: async (email) => {
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
    set({ burnoutRiskLoading: true });
    try {
      const response = await apiRequest<{
        success: boolean;
        data: any;
      }>('/journal-ai/burnout-risk', { token });
      set({ burnoutRisk: response.data, burnoutRiskLoading: false });
    } catch (err) {
      console.error('[Store] Failed to fetch burnout risk:', err);
      set({ burnoutRiskLoading: false });
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

  deleteRecommendation: async (id) => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;

    // Optimistically remove from both lists
    const originalRecommendations = [...get().recommendations];
    const originalRecommendationHistory = [...get().recommendationHistory];

    set((state) => ({
      deletingRecommendationIds: new Set(state.deletingRecommendationIds).add(id),
      recommendations: state.recommendations.filter((rec) => rec.id !== id),
      recommendationHistory: state.recommendationHistory.filter((rec) => rec.id !== id),
    }));

    try {
      await apiRequest(`/recommendations/${id}`, {
        method: 'DELETE',
        token,
      });
    } catch (err) {
      console.error('[Store] Failed to delete recommendation:', err);
      // Revert on error
      set((state) => ({
        recommendations: originalRecommendations,
        recommendationHistory: originalRecommendationHistory,
      }));
    } finally {
      set((state) => {
        const newSet = new Set(state.deletingRecommendationIds);
        newSet.delete(id);
        return { deletingRecommendationIds: newSet };
      });
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

    const userMsg = {
      id: `m-usr-${Date.now()}`,
      sender: 'user' as const,
      text,
      timestamp: Date.now(),
    };

    const aiMsgId = `m-ai-${Date.now() + 1}`;
    const aiMessage = {
      id: aiMsgId,
      sender: 'ai' as const,
      text: '',
      timestamp: Date.now() + 1,
    };

    set((state) => ({
      chatMessages: [...state.chatMessages, userMsg, aiMessage],
    }));

    try {
      const response = await fetch(`${API_BASE_URL}/ai/chat/stream`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'AI request failed.');
        let errorMessage = 'AI request failed.';

        try {
          const parsed = JSON.parse(errorText);
          errorMessage = parsed?.message || errorMessage;
        } catch {
          if (errorText) errorMessage = errorText;
        }

        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('AI stream unavailable.');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent = 'message';
      let currentData = '';

      const flushEvent = () => {
        if (!currentData) return;
        if (currentEvent === 'message') {
          let parsed = currentData;
          try {
            parsed = JSON.parse(currentData);
          } catch {
            // keep raw string
          }

          const chunk = typeof parsed === 'string'
            ? parsed
            : parsed?.delta ?? '';

          if (typeof chunk === 'string' && chunk) {
            set((state) => ({
              chatMessages: state.chatMessages.map((msg) =>
                msg.id === aiMsgId ? { ...msg, text: msg.text + chunk } : msg,
              ),
            }));
          }
        }

        currentEvent = 'message';
        currentData = '';
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) {
            flushEvent();
            continue;
          }

          if (trimmed.startsWith('event:')) {
            currentEvent = trimmed.slice(6).trim();
            continue;
          }

          if (trimmed.startsWith('data:')) {
            const content = trimmed.slice(5).trim();
            if (content === '[DONE]') {
              flushEvent();
              continue;
            }
            currentData += content;
          }
        }
      }

      flushEvent();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unable to reach the assistant.';
      set((state) => ({
        chatMessages: state.chatMessages.map((msg) =>
          msg.id === aiMsgId ? { ...msg, text: `⚠️ ${errorMessage}` } : msg,
        ),
      }));
      console.error('[Store] Failed to send chat message:', err);
    }
  },

  // Admin Actions
  adminSendNotification: async (studentId, message, _category) => {
    const token = get().authToken ?? getStoredAuthToken();
    if (!token) return;
    if (studentId === 'all') {
      const students = get().adminStudents;
      if (students.length === 0) {
        throw new Error('No students are loaded for bulk dispatch');
      }
      await Promise.all(
        students.map((student) =>
          get().sendWellnessEmail(student.id, 'Platform Notification', message),
        ),
      );
    } else {
      await get().sendWellnessEmail(studentId, 'Platform Notification', message);
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
