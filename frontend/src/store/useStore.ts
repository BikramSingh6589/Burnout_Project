import { create } from 'zustand';
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
  academicLoadScore: data.stressLevel * 10,
  stressScore: data.stressLevel * 10,
  sleepHoursAverage: data.sleepHours,
  sleepQualityScore: Math.min(100, Math.round((data.sleepHours / 8) * 100)),
  moodScore: data.energyLevel * 10,
  motivationScore: data.motivationLevel * 10,
  concentrationScore: data.academicSatisfaction * 10,
  physicalFatigueScore: (10 - data.energyLevel) * 10,
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

export interface TrackerHistory {
  date: string; // YYYY-MM-DD
  burnoutScore: number;
  sleepHours: number;
  studyHours: number;
  screenTime: number;
  stressLevel: number;
  procrastination: number;
}

export interface Recommendation {
  id: string;
  title: string;
  reason: string;
  priority: 'High' | 'Medium' | 'Low';
  followedStatus: 'none' | 'followed' | 'partially' | 'not';
  rating: number; // 0 to 5
  feedbackText: string;
  dateGenerated: string;
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
  maxWeeklyAssessmentsPerStudent: number;
  emailNotificationsEnabled: boolean;
  inAppNotificationsEnabled: boolean;
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
  trackerHistory: TrackerHistory[];
  recommendations: Recommendation[];
  notifications: Notification[];

  // Chat Widget State
  chatMessages: { id: string; sender: 'user' | 'ai'; text: string; timestamp: number }[];

  // Admin Portal State
  adminStudents: AdminStudent[];
  adminSettings: AdminSettings;

  // Fetch actions
  fetchTrackerHistory: () => Promise<void>;
  fetchJournalEntries: () => Promise<void>;
  fetchRecommendations: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchAIHistory: () => Promise<void>;

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
  trackerHistory: [],
  recommendations: [],
  notifications: [],

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
    maxWeeklyAssessmentsPerStudent: 1,
    emailNotificationsEnabled: true,
    inAppNotificationsEnabled: true,
  },

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
        sleepHours: h.sleepHoursAverage ?? 0,
        studyHours: h.academicLoadScore ? Math.round(h.academicLoadScore / 10) : 0,
        screenTime: 0,
        stressLevel: h.stressScore ? Math.round(h.stressScore / 10) : 0,
        procrastination: 0,
      }));

      const mapped = [...initialHistory, ...weeklyHistory]
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(({ timestamp: _timestamp, ...item }) => item);

      set({ trackerHistory: mapped });
    } catch (err) {
      console.error('[Store] Failed to fetch tracker history:', err);
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

  // Actions
  login: async (email, password, forceRole) => {
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
        get().fetchTrackerHistory();
        get().fetchJournalEntries();
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
        get().fetchTrackerHistory();
        get().fetchJournalEntries();
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
        get().fetchTrackerHistory();
        get().fetchJournalEntries();
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
      trackerHistory: [],
      recommendations: [],
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
          get().fetchTrackerHistory();
          get().fetchJournalEntries();
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
        get().fetchTrackerHistory();
        get().fetchJournalEntries();
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
          get().fetchTrackerHistory();
          get().fetchJournalEntries();
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
    const userMsg = {
      id: `m-usr-${Date.now()}`,
      sender: 'user' as const,
      text,
      timestamp: Date.now(),
    };
    set((state) => ({
      chatMessages: [...state.chatMessages, userMsg],
    }));

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
  }
}));


