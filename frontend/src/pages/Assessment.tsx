import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { apiRequest } from '../lib/api';
import { hasReachedWeeklyAssessmentLimit, type WeeklyAssessmentRecord } from '../lib/weeklyAssessment';
import { CheckCircle2, ArrowRight, ArrowLeft, ClipboardList } from 'lucide-react';
import { InfoPopover } from '../components/ui/InfoPopover';

export const Assessment: React.FC = () => {
  const { submitAssessment, isAuthenticated, authToken, fetchAdminSettings } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isWeekly = location.pathname.includes('weekly');
  const showDashboardRedirectMessage = !isWeekly && new URLSearchParams(location.search).get('from') === 'dashboard';

  useEffect(() => {
    if (!isWeekly || !isAuthenticated || !authToken) return;

    let cancelled = false;

    const enforceWeeklyLimit = async () => {
      try {
        await fetchAdminSettings();
        const { adminSettings: settings } = useStore.getState();
        const historyResponse = await apiRequest<{
          success: boolean;
          data: { history: WeeklyAssessmentRecord[] };
        }>('/weekly-assessment/history', { token: authToken });

        if (cancelled) return;

        if (hasReachedWeeklyAssessmentLimit(historyResponse.data.history, settings.maxWeeklyAssessmentsPerStudent)) {
          navigate('/dashboard', { replace: true });
        }
      } catch {
        // Backend still enforces the limit on submit if this check fails.
      }
    };

    void enforceWeeklyLimit();

    return () => {
      cancelled = true;
    };
  }, [isWeekly, isAuthenticated, authToken, fetchAdminSettings, navigate]);

  // Guard: Must be logged in
  if (!isAuthenticated) {
    navigate('/auth/login');
  }

  // Local state for wizard steps: 1 = Academic, 2 = Personal, 3 = Success
  const [step, setStep] = useState(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<{
    // Step 1: Academic
    stressLevel: number;
    academicSatisfaction: number;
    studyHours: number | '';
    assignmentBacklog: number | '';
    procrastination: number;
    // Step 2: Personal
    motivationLevel: number;
    energyLevel: number;
    sleepHours: number | '';
    screenTime: number | '';
  }>({
    // Step 1: Academic
    stressLevel: 5,
    academicSatisfaction: 7,
    studyHours: 6,
    assignmentBacklog: 2,
    procrastination: 4,
    // Step 2: Personal
    motivationLevel: 6,
    energyLevel: 6,
    sleepHours: 7,
    screenTime: 4,
  });



  const handleNext = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    // Convert any empty strings to 0 for submission
    const submissionData = {
      ...formData,
      studyHours: formData.studyHours === '' ? 0 : formData.studyHours,
      assignmentBacklog: formData.assignmentBacklog === '' ? 0 : formData.assignmentBacklog,
      sleepHours: formData.sleepHours === '' ? 0 : formData.sleepHours,
      screenTime: formData.screenTime === '' ? 0 : formData.screenTime,
    };
    const errorMsg = await submitAssessment(submissionData, isWeekly);
    setSubmitting(false);

    if (errorMsg !== null) {
      setSubmitError(errorMsg);
      return;
    }

    setStep(3);
  };

  const handleViewDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Card Wrapper */}
      <div className="bg-surface rounded-2xl border border-border shadow-level2 p-8">
        {showDashboardRedirectMessage && step < 3 && (
          <div className="mb-6 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-xs font-semibold text-error">
            Before accessing your dashboard, please complete the initial assessment so we can generate your baseline burnout score.
          </div>
        )}
        
        {/* Step 1 & 2 Headers */}
        {step < 3 && (
          <div className="space-y-6 mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-extrabold text-text-primary">
                  {isWeekly ? 'Weekly Wellness Reassessment' : 'Initial Burnout Assessment'}
                </h2>
                <p className="text-xs text-text-secondary">
                  {isWeekly ? 'Track changes from your baseline wellness' : 'Complete to generate your first burnout score'}
                </p>
              </div>
            </div>

            {/* Progress Bar indicator */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-text-primary">
                <span className={step === 1 ? 'text-primary' : 'text-text-secondary'}>1. Academic Profile</span>
                <span className={step === 2 ? 'text-primary' : 'text-text-secondary'}>2. Behavioral Profile</span>
              </div>
              <div className="h-2 w-full bg-surface-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: step === 1 ? '50%' : '100%' }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider pb-2 border-b border-border">
                Academic Assessment
              </h3>

              {/* Stress Level Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <label className="flex items-center gap-2 text-text-primary" htmlFor="stress-slider">
                    <span>Stress Level (1–10)</span>
                    <InfoPopover
                      title="Stress Level"
                      description={`Measures how stressed you felt during the last week.\n\n1 = Very Relaxed\n\n10 = Extremely Stressed`}
                    />
                  </label>
                  <span className="text-primary">{formData.stressLevel} / 10</span>
                </div>
                <input
                  id="stress-slider"
                  type="range"
                  min="1"
                  max="10"
                  value={formData.stressLevel}
                  onChange={(e) => setFormData({ ...formData, stressLevel: Number(e.target.value) })}
                  className="w-full h-2 bg-surface-elevated rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Academic Satisfaction Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <label className="flex items-center gap-2 text-text-primary" htmlFor="satisfaction-slider">
                    <span>Academic Satisfaction (1–10)</span>
                    <InfoPopover
                      title="Academic Satisfaction"
                      description={`Measures how satisfied you are with your academic performance and progress.\n\n1 = Very Unsatisfied\n\n10 = Very Satisfied`}
                    />
                  </label>
                  <span className="text-primary">{formData.academicSatisfaction} / 10</span>
                </div>
                <input
                  id="satisfaction-slider"
                  type="range"
                  min="1"
                  max="10"
                  value={formData.academicSatisfaction}
                  onChange={(e) => setFormData({ ...formData, academicSatisfaction: Number(e.target.value) })}
                  className="w-full h-2 bg-surface-elevated rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Procrastination Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <label className="flex items-center gap-2 text-text-primary" htmlFor="procrastination-slider">
                    <span>Procrastination Level (1–10)</span>
                    <InfoPopover
                      title="Procrastination Level"
                      description={`Measures how often you delay important academic tasks.\n\n1 = Rarely Procrastinate\n\n10 = Procrastinate Frequently`}
                    />
                  </label>
                  <span className="text-primary">{formData.procrastination} / 10</span>
                </div>
                <input
                  id="procrastination-slider"
                  type="range"
                  min="1"
                  max="10"
                  value={formData.procrastination}
                  onChange={(e) => setFormData({ ...formData, procrastination: Number(e.target.value) })}
                  className="w-full h-2 bg-surface-elevated rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Study Hours Input */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold text-text-primary" htmlFor="study-hours-input">
                    <span>Average Study Hours / Day</span>
                    <InfoPopover
                      title="Average Study Hours Per Day"
                      description="Enter the average number of hours you spend studying each day. Include lectures, self-study, revision, and academic work."
                    />
                  </label>
                  <input
                    id="study-hours-input"
                    type="number"
                    min="0"
                    max="24"
                    value={formData.studyHours || ''}
                    onChange={(e) => setFormData({ ...formData, studyHours: e.target.value === '' ? '' : Math.min(24, Math.max(0, Number(e.target.value))) })}
                    className="w-full border border-border dark:border-[#334155] bg-white dark:bg-[#111827] text-text-primary dark:text-[#F8FAFC] placeholder:text-neutral-outline dark:placeholder:text-[#94A3B8] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary dark:focus:border-[#8B5CF6] focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                {/* Assignment Backlog Input */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold text-text-primary" htmlFor="backlog-input">
                    <span>Assignment Backlog (Count)</span>
                    <InfoPopover
                      title="Assignment Backlog"
                      description="Enter the number of unfinished assignments, projects, or academic tasks currently pending."
                    />
                  </label>
                  <input
                    id="backlog-input"
                    type="number"
                    min="0"
                    max="50"
                    value={formData.assignmentBacklog || ''}
                    onChange={(e) => setFormData({ ...formData, assignmentBacklog: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)) })}
                    className="w-full border border-border dark:border-[#334155] bg-white dark:bg-[#111827] text-text-primary dark:text-[#F8FAFC] placeholder:text-neutral-outline dark:placeholder:text-[#94A3B8] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary dark:focus:border-[#8B5CF6] focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-primary text-white font-semibold px-5 py-2.5 rounded-lg flex items-center space-x-2 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 text-xs"
                >
                  <span>Next Step</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider pb-2 border-b border-border">
                Behavioral & Lifestyle Profile
              </h3>

              {/* Motivation Level Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <label className="flex items-center gap-2 text-text-primary" htmlFor="motivation-slider">
                    <span>Motivation Level (1–10)</span>
                    <InfoPopover
                      title="Motivation Level"
                      description="Measures how motivated you feel to begin and complete your academic tasks."
                    />
                  </label>
                  <span className="text-primary">{formData.motivationLevel} / 10</span>
                </div>
                <input
                  id="motivation-slider"
                  type="range"
                  min="1"
                  max="10"
                  value={formData.motivationLevel}
                  onChange={(e) => setFormData({ ...formData, motivationLevel: Number(e.target.value) })}
                  className="w-full h-2 bg-surface-elevated rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Energy Level Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <label className="flex items-center gap-2 text-text-primary" htmlFor="energy-slider">
                    <span>Energy Level (1–10)</span>
                    <InfoPopover
                      title="Energy Level"
                      description="Measures how energetic and alert you felt during the last week."
                    />
                  </label>
                  <span className="text-primary">{formData.energyLevel} / 10</span>
                </div>
                <input
                  id="energy-slider"
                  type="range"
                  min="1"
                  max="10"
                  value={formData.energyLevel}
                  onChange={(e) => setFormData({ ...formData, energyLevel: Number(e.target.value) })}
                  className="w-full h-2 bg-surface-elevated rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Sleep Hours Input */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold text-text-primary" htmlFor="sleep-hours-input">
                    <span>Average Sleep Hours / Night</span>
                    <InfoPopover
                      title="Sleep Hours"
                      description="Enter the average number of hours you slept each night during the last week."
                    />
                  </label>
                  <input
                    id="sleep-hours-input"
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={formData.sleepHours || ''}
                    onChange={(e) => setFormData({ ...formData, sleepHours: e.target.value === '' ? '' : Math.min(24, Math.max(0, Number(e.target.value))) })}
                    className="w-full border border-border dark:border-[#334155] bg-white dark:bg-[#111827] text-text-primary dark:text-[#F8FAFC] placeholder:text-neutral-outline dark:placeholder:text-[#94A3B8] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary dark:focus:border-[#8B5CF6] focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                {/* Screen Time Input */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold text-text-primary" htmlFor="screen-time-input">
                    <span>Daily Screen Time (Hours)</span>
                    <InfoPopover
                      title="Screen Time"
                      description="Enter how many hours per day you typically spend using screens for study, social apps, and entertainment."
                    />
                  </label>
                  <input
                    id="screen-time-input"
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={formData.screenTime || ''}
                    onChange={(e) => setFormData({ ...formData, screenTime: e.target.value === '' ? '' : Math.min(24, Math.max(0, Number(e.target.value))) })}
                    className="w-full border border-border dark:border-[#334155] bg-white dark:bg-[#111827] text-text-primary dark:text-[#F8FAFC] placeholder:text-neutral-outline dark:placeholder:text-[#94A3B8] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary dark:focus:border-[#8B5CF6] focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>

              {submitError && (
                <div className="bg-error/10 border border-error/20 text-error p-3 rounded-lg text-xs font-semibold text-center space-y-2">
                  <p>{submitError}</p>
                  {submitError.toLowerCase().includes('already submitted') && (
                    <button
                      type="button"
                      onClick={handleViewDashboard}
                      className="underline text-primary font-bold"
                    >
                      Go to Dashboard →
                    </button>
                  )}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="bg-surface dark:bg-[#111827] hover:bg-surface-elevated dark:hover:bg-slate-800 text-text-primary dark:text-[#E2E8F0] border border-border dark:border-[#334155] font-semibold px-5 py-2.5 rounded-lg flex items-center space-x-2 text-xs transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary text-white font-semibold px-5 py-2.5 rounded-lg flex items-center space-x-2 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 text-xs disabled:opacity-60"
                >
                  <span>{submitting ? 'Saving...' : 'Submit Assessment'}</span>
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-10 space-y-6 animate-in zoom-in-95 duration-300">
              <div className="flex justify-center">
                <div className="p-4 bg-success/10 text-success rounded-full animate-bounce">
                  <CheckCircle2 className="h-16 w-16" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-extrabold text-text-primary">
                  Assessment Submitted Successfully
                </h3>
                <p className="text-sm text-text-secondary max-w-sm mx-auto">
                  Your burnout index has been calculated and personal recommendations have been generated.
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleViewDashboard}
                  className="bg-primary text-white font-semibold px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto hover:bg-primary/95 transition-all text-sm shadow-sm"
                >
                  <span>View Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
