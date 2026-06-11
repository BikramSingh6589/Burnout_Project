import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Sparkles, Trash2, Calendar, Smile, AlertCircle } from 'lucide-react';

export const Journal: React.FC = () => {
  const { journalEntries, addJournalEntry, deleteJournalEntry, fetchJournalEntries } = useStore();

  useEffect(() => {
    fetchJournalEntries();
  }, [fetchJournalEntries]);
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError('Please write something in your journal before saving.');
      return;
    }

    addJournalEntry(content.trim());
    setContent('');
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return 'bg-success/10 text-success border-success/20';
      case 'Negative':
        return 'bg-error/10 text-error border-error/20';
      default:
        return 'bg-slate-100 dark:bg-[#334155] text-slate-600 dark:text-[#CBD5E1] border-slate-200 dark:border-[#334155]';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header Block */}
      <div className="pb-4 border-b border-slate-200 dark:border-[#334155] flex items-center space-x-3">
        <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
          <Smile className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-extrabold text-neutral-slate dark:text-[#F8FAFC]">Mood Reflection Journal</h1>
          <p className="text-xs text-neutral-outline dark:text-[#CBD5E1]">Write daily reflections. Our AI extracts cognitive sentiment markers to gauge burnout risks.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Input reflection section */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-slate-100 dark:border-[#334155] p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-neutral-slate dark:text-[#F8FAFC]">Express Your Thoughts</h3>
            
            {error && (
              <div className="bg-error/10 border border-error/20 text-error p-3 rounded-lg text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <textarea
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="How are you feeling today? e.g., I feel exhausted and stressed about upcoming physics practical exams..."
                  className="w-full border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] text-neutral-slate dark:text-[#F8FAFC] placeholder:text-neutral-outline dark:placeholder:text-[#CBD5E1] rounded-lg px-3 py-3 text-xs leading-relaxed focus:outline-none focus:border-primary dark:focus:border-[#4F46E5] focus:ring-4 focus:ring-primary/10 dark:focus:ring-[#4F46E5]/10 transition-all"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-neutral-outline dark:text-[#CBD5E1] flex items-center">
                  <Sparkles className="h-3.5 w-3.5 mr-1 text-secondary" />
                  AI sentiment analysis will run instantly
                </span>
                
                <button
                  type="submit"
                  className="bg-primary dark:bg-[#4F46E5] text-white font-semibold px-5 py-2 rounded-lg text-xs hover:bg-primary/95 dark:hover:bg-[#4338CA] transition-all shadow-sm"
                >
                  Save Journal Entry
                </button>
              </div>
            </form>
          </div>

          {/* Privacy Protocol Banner */}
          <div className="bg-primary/5 dark:bg-[#4F46E5]/10 border border-primary/10 dark:border-[#4F46E5]/20 rounded-xl p-4 flex items-start space-x-3 text-primary dark:text-[#A5B4FC]">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold block">Privacy Layer Enabled</span>
              <span className="block text-[11px] text-primary/85 dark:text-[#A5B4FC]/85 leading-relaxed mt-0.5">
                Administrators can only view aggregate mood totals (e.g. "Mostly Positive" or "Balanced") and never your actual text entries. Your secrets are safe.
              </span>
            </div>
          </div>
        </div>

        {/* Right: History Timeline reflections */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-sm font-bold text-neutral-slate dark:text-[#F8FAFC] flex items-center">
            <Calendar className="h-4 w-4 mr-1.5 text-neutral-outline dark:text-[#CBD5E1]" />
            <span>Journal Timeline History</span>
          </h3>

          <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
            {journalEntries.length === 0 ? (
              <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-slate-100 dark:border-[#334155] p-6 text-center text-xs text-neutral-outline dark:text-[#CBD5E1]">
                No entries saved yet. Share your first wellness thought above!
              </div>
            ) : (
              journalEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white dark:bg-[#1E293B] rounded-xl border border-slate-100 dark:border-[#334155] p-5 shadow-sm space-y-3 relative group animate-in slide-in-from-bottom-3 duration-200 hover:shadow-md dark:hover:shadow-xl transition-all"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-neutral-outline dark:text-[#CBD5E1] font-semibold flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {entry.date}
                    </span>
                    
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getSentimentBadge(entry.sentiment)}`}>
                      {entry.sentiment}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-slate/90 dark:text-[#CBD5E1] leading-relaxed whitespace-pre-wrap">
                    {entry.content}
                  </p>

                  <div className="flex justify-end pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => deleteJournalEntry(entry.id)}
                      className="text-error hover:bg-error/5 dark:hover:bg-error/10 p-1 rounded-md transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
