import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { DashboardLayout } from '../components/DashboardLayout';
import { Star } from 'lucide-react';

export const Recommendations: React.FC = () => {
  const { recommendations, submitRecommendationFeedback } = useStore();
  
  // Keep track of which recommendation card has its feedback form open
  const [activeFeedbackId, setActiveFeedbackId] = useState<string | null>(null);
  
  // Feedback form states
  const [status, setStatus] = useState<'followed' | 'partially' | 'not'>('followed');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitSuccessId, setSubmitSuccessId] = useState<string | null>(null);

  const handleOpenForm = (id: string, currentStatus: any, currentRating: number, currentText: string) => {
    setActiveFeedbackId(id);
    setStatus(currentStatus === 'none' ? 'followed' : currentStatus);
    setRating(currentRating === 0 ? 5 : currentRating);
    setFeedbackText(currentText);
    setSubmitSuccessId(null);
  };

  const handleSubmit = (id: string) => {
    submitRecommendationFeedback(id, status, rating, feedbackText);
    setActiveFeedbackId(null);
    setSubmitSuccessId(id);
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSubmitSuccessId(null);
    }, 3000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-300">
        
        {/* Header Block */}
        <div className="pb-4 border-b border-slate-100 dark:border-[#334155]">
          <h2 className="text-xl font-display font-extrabold text-neutral-slate dark:text-[#F8FAFC]">Personalized Wellness Recommendations</h2>
          <p className="text-xs text-neutral-outline dark:text-[#CBD5E1]">AI-suggested interventions based on your recent burnout score trends</p>
        </div>

        {/* Success Alert */}
        {submitSuccessId && (
          <div className="bg-success/10 border border-success/20 text-success p-3 rounded-lg text-xs font-semibold text-center animate-in zoom-in duration-200">
            Feedback submitted successfully! Wellness models updated.
          </div>
        )}

        {/* Recommendation Cards List */}
        <div className="space-y-6">
          {recommendations.length === 0 ? (
            <div className="text-center py-12 text-xs text-neutral-outline">
              No active recommendations. Complete your assessments to trigger new suggestions.
            </div>
          ) : (
            recommendations.map((rec) => {
              const isFormOpen = activeFeedbackId === rec.id;
              const hasFeedback = rec.followedStatus !== 'none';
              
              return (
                <div
                  key={rec.id}
                  className={`bg-white dark:bg-[#1E293B] rounded-xl border p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:hover:shadow-xl ${
                    isFormOpen ? 'border-primary ring-1 ring-primary/20 bg-surface-low/10 dark:bg-[#111827]/30 dark:border-[#4F46E5] dark:ring-[#4F46E5]/20' : 'border-slate-100 dark:border-[#334155]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                    {/* Title and details */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2.5">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          rec.priority === 'High' ? 'bg-error/10 text-error border-error/15 dark:border-error/20' :
                          rec.priority === 'Medium' ? 'bg-amber-500/10 text-amber-600 border-amber-500/15 dark:border-amber-500/20' :
                          'bg-slate-100 dark:bg-[#334155] text-slate-600 dark:text-[#CBD5E1] border-slate-200 dark:border-[#334155]'
                        }`}>
                          {rec.priority} Priority
                        </span>
                        <span className="text-[9px] text-neutral-outline dark:text-[#CBD5E1]">{rec.dateGenerated}</span>
                      </div>
                      <h3 className="font-bold text-sm text-neutral-slate dark:text-[#F8FAFC]">{rec.title}</h3>
                      <p className="text-xs text-neutral-slate/85 dark:text-[#CBD5E1] leading-relaxed">{rec.reason}</p>
                    </div>

                    {/* Action buttons */}
                    <div className="shrink-0">
                      {!isFormOpen && (
                        <button
                          onClick={() => handleOpenForm(rec.id, rec.followedStatus, rec.rating, rec.feedbackText)}
                          className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all border ${
                            hasFeedback
                              ? 'bg-success/5 text-success border-success/20 hover:bg-success/10 dark:bg-success/10 dark:hover:bg-success/20'
                              : 'bg-transparent text-primary dark:text-[#E2E8F0] border-primary/20 dark:border-[#4F46E5] hover:bg-primary/5 dark:hover:bg-[rgba(79,70,229,0.15)] hover:border-primary/45'
                          }`}
                        >
                          {hasFeedback ? 'Update Feedback Log' : 'Log Experience Feedback'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Summary of current feedback if recorded and form not open */}
                  {hasFeedback && !isFormOpen && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#334155] grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-[#111827]/50 p-3 rounded-lg text-xs">
                      <div>
                        <span className="text-neutral-outline dark:text-[#CBD5E1] block text-[9px] uppercase font-bold">Adherence Status</span>
                        <span className={`font-semibold capitalize ${
                          rec.followedStatus === 'followed' ? 'text-success' :
                          rec.followedStatus === 'partially' ? 'text-secondary dark:text-secondary' : 'text-error'
                        }`}>
                          {rec.followedStatus.replace('-', ' ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-outline dark:text-[#CBD5E1] block text-[9px] uppercase font-bold">Effectiveness</span>
                        <div className="flex text-amber-400 mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 fill-current ${i < rec.rating ? '' : 'text-slate-200 dark:text-[#334155]'}`} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-neutral-outline dark:text-[#CBD5E1] block text-[9px] uppercase font-bold">Feedback Comments</span>
                        <p className="text-neutral-slate dark:text-[#F8FAFC] truncate max-w-xs">{rec.feedbackText || 'No comments left.'}</p>
                      </div>
                    </div>
                  )}

                  {/* Stateful Feedback Form */}
                  {isFormOpen && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-[#334155] space-y-4 animate-in slide-in-from-top-3 duration-250">
                      <h4 className="text-xs font-bold text-neutral-slate dark:text-[#F8FAFC]">Intervention Feedback Form</h4>
                      
                      {/* Radio buttons for status */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-neutral-outline dark:text-[#CBD5E1] block">Have you followed this recommendation?</label>
                        <div className="flex flex-wrap gap-3">
                          <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer text-neutral-slate dark:text-[#CBD5E1]">
                            <input
                              type="radio"
                              name={`status-${rec.id}`}
                              checked={status === 'followed'}
                              onChange={() => setStatus('followed')}
                              className="text-primary dark:text-[#4F46E5] focus:ring-primary dark:focus:ring-[#4F46E5] h-3.5 w-3.5 bg-white dark:bg-[#111827] border-slate-300 dark:border-[#334155]"
                            />
                            <span>Followed Recommendation</span>
                          </label>
                          <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer text-neutral-slate dark:text-[#CBD5E1]">
                            <input
                              type="radio"
                              name={`status-${rec.id}`}
                              checked={status === 'partially'}
                              onChange={() => setStatus('partially')}
                              className="text-primary dark:text-[#4F46E5] focus:ring-primary dark:focus:ring-[#4F46E5] h-3.5 w-3.5 bg-white dark:bg-[#111827] border-slate-300 dark:border-[#334155]"
                            />
                            <span>Partially Followed</span>
                          </label>
                          <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer text-neutral-slate dark:text-[#CBD5E1]">
                            <input
                              type="radio"
                              name={`status-${rec.id}`}
                              checked={status === 'not'}
                              onChange={() => setStatus('not')}
                              className="text-primary dark:text-[#4F46E5] focus:ring-primary dark:focus:ring-[#4F46E5] h-3.5 w-3.5 bg-white dark:bg-[#111827] border-slate-300 dark:border-[#334155]"
                            />
                            <span>Did Not Follow</span>
                          </label>
                        </div>
                      </div>

                      {/* Effectiveness Rating (Stars) */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-neutral-outline dark:text-[#CBD5E1] block">Rate effectiveness (1-5 stars)</label>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(null)}
                              className="text-amber-400 hover:scale-110 active:scale-95 transition-transform"
                            >
                              <Star
                                className={`h-6 w-6 fill-current ${
                                  star <= (hoverRating ?? rating) ? '' : 'text-slate-200 dark:text-[#334155]'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Natural Language Comments */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-neutral-outline dark:text-[#CBD5E1] block" htmlFor={`comments-${rec.id}`}>Explain your experience (AI will extract wellness metrics)</label>
                        <textarea
                          id={`comments-${rec.id}`}
                          rows={3}
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder='e.g., "I started sleeping before 10 PM and feel less stressed."'
                          className="w-full border border-slate-200 dark:border-[#334155] rounded-lg px-3 py-2 text-xs bg-white dark:bg-[#111827] text-neutral-slate dark:text-[#F8FAFC] placeholder:text-neutral-outline dark:placeholder:text-[#CBD5E1] focus:outline-none focus:border-primary dark:focus:border-[#4F46E5] focus:ring-2 focus:ring-primary/10 dark:focus:ring-[#4F46E5]/10"
                        />
                      </div>

                      {/* Form Actions */}
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setActiveFeedbackId(null)}
                          className="px-4 py-2 border border-slate-200 dark:border-[#334155] text-neutral-slate dark:text-[#E2E8F0] rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-[#273449]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSubmit(rec.id)}
                          className="px-4 py-2 bg-primary dark:bg-[#4F46E5] text-white rounded-lg text-xs font-semibold hover:bg-primary/95 dark:hover:bg-[#4338CA] shadow-sm"
                        >
                          Submit Feedback
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};
