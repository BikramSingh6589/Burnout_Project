const clamp = (value, min = 0, max = 100) => Math.min(Math.max(Number(value) || 0, min), max);
export function calculateBurnoutScore({ assessment, academic, journalScore }) {
  const stressScore = clamp((assessment.stress / 10) * 100);
  const sleepScore = clamp(100 - (assessment.sleepQuality / 10) * 100);
  const motivationScore = clamp(100 - (assessment.motivation / 10) * 100);
  const attendanceScore = clamp(100 - academic.attendance);
  const backlogScore = clamp((academic.pendingAssignments / 10) * 100);
  const sentimentScore = clamp(100 - journalScore);
  return Math.round(
    stressScore * 0.3 +
      sleepScore * 0.2 +
      motivationScore * 0.15 +
      attendanceScore * 0.15 +
      backlogScore * 0.1 +
      sentimentScore * 0.1,
  );
}
export function getRiskLevel(score) {
  if (score <= 30) return { label: 'Low Risk', tone: 'success', range: '0-30' };
  if (score <= 60) return { label: 'Moderate Risk', tone: 'warning', range: '31-60' };
  return { label: 'High Risk', tone: 'danger', range: '61-100' };
}
export function getTrendDirection(history) {
  if (!history.length) return 'Stable';
  const first = history[0].burnout;
  const last = history[history.length - 1].burnout;
  if (last - first >= 8) return 'Increasing';
  if (first - last >= 8) return 'Decreasing';
  return 'Stable';
}
export function analyzeSentiment(text) {
  const negativeKeywords = ['tired', 'exhausted', 'overwhelmed', 'burnout', 'hopeless', 'anxious', 'stress'];
  const positiveKeywords = ['motivated', 'calm', 'focused', 'better', 'happy', 'confident', 'planned'];
  const normalized = text.toLowerCase();
  const negativeHits = negativeKeywords.filter((word) => normalized.includes(word)).length;
  const positiveHits = positiveKeywords.filter((word) => normalized.includes(word)).length;
  const score = clamp(55 + positiveHits * 14 - negativeHits * 16);
  if (score >= 67) return { label: 'Positive', score };
  if (score >= 40) return { label: 'Neutral', score };
  return { label: 'Negative', score };
}
export function buildRecommendations({ assessment, academic, lifestyle, risk }) {
  const items = [];
  if (lifestyle.sleepHours < 5) {
    items.push({ title: 'Sleep recommendation', detail: 'Improve sleep duration to at least 7 hours.' });
  }
  if (assessment.stress > 8) {
    items.push({ title: 'Stress recommendation', detail: 'Use short stress management exercises between study blocks.' });
  }
  if (assessment.motivation < 4) {
    items.push({ title: 'Motivation recommendation', detail: 'Break goals into smaller achievable tasks for today.' });
  }
  if (academic.pendingAssignments > 5) {
    items.push({ title: 'Study planning recommendation', detail: 'Create a priority-based schedule for pending assignments.' });
  }
  if (academic.attendance < 60) {
    items.push({ title: 'Attendance recommendation', detail: 'Focus on attending upcoming classes regularly.' });
  }
  if (risk.label === 'High Risk') {
    items.push({ title: 'Early action alert', detail: 'Consider speaking with a mentor, faculty advisor, or wellness support contact.' });
  }
  return items;
}
