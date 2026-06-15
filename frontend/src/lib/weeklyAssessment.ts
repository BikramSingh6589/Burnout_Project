export type WeeklyAssessmentRecord = {
  weekStartDate: string | Date;
};

export const getWeekStartDate = (): Date => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(now);
  weekStart.setDate(diff);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
};

export const countWeeklyAssessmentsInCurrentWeek = (
  history: WeeklyAssessmentRecord[],
): number => {
  const weekStart = getWeekStartDate().getTime();
  const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000;

  return history.filter((assessment) => {
    const assessmentWeekStart = new Date(assessment.weekStartDate).getTime();
    return assessmentWeekStart >= weekStart && assessmentWeekStart < weekEnd;
  }).length;
};

export const hasReachedWeeklyAssessmentLimit = (
  history: WeeklyAssessmentRecord[],
  maxWeeklyAssessments: number,
): boolean => {
  const limit = Math.max(1, Math.floor(maxWeeklyAssessments));
  return countWeeklyAssessmentsInCurrentWeek(history) >= limit;
};
