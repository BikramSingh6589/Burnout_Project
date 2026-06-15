import React, { useState, useRef, useEffect } from 'react';
import { FileText, X } from 'lucide-react';

export const HelpPopover: React.FC = () => {
  const [hoverTooltip, setHoverTooltip] = useState(false);
  const [detailedOpen, setDetailedOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!detailedOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setDetailedOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [detailedOpen]);

  return (
    <div ref={ref} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setDetailedOpen(!detailedOpen)}
        onMouseEnter={() => setHoverTooltip(true)}
        onMouseLeave={() => setHoverTooltip(false)}
        aria-expanded={detailedOpen}
        aria-label="Assessment guidelines help"
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-primary transition hover:text-primary focus:outline-none"
      >
        <FileText className="h-5 w-5" />
      </button>

      {/* Hover tooltip */}
      {hoverTooltip && !detailedOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full z-50 mb-1 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-text-primary shadow-md animate-in fade-in zoom-in-95 duration-150 whitespace-nowrap">
          Click for Help
        </div>
      )}

      {/* Detailed popup */}
      {detailedOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(450px,calc(100vw-2rem))] max-h-[60vh] overflow-y-auto rounded-2xl bg-surface border border-border p-6 text-xs text-text-primary shadow-level2 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold uppercase tracking-[0.18em] text-text-secondary">
              How to Fill the Fields Correctly
            </h3>
            <button
              onClick={() => setDetailedOpen(false)}
              className="text-text-secondary hover:text-text-primary transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-5">
            {/* Stress Level */}
            <div>
              <h4 className="font-bold text-primary mb-2">Stress Level (1–10)</h4>
              <ul className="space-y-1.5 text-[12px]">
                <li><span className="font-semibold text-text-secondary">1–3:</span> Rarely feel pressured or overwhelmed. Academic responsibilities feel manageable.</li>
                <li><span className="font-semibold text-text-secondary">4–6:</span> Occasionally feel stressed during deadlines, exams, or heavy workloads.</li>
                <li><span className="font-semibold text-text-secondary">7–8:</span> Frequently feel overwhelmed, anxious, or mentally exhausted because of academic demands.</li>
                <li><span className="font-semibold text-text-secondary">9–10:</span> Feel constantly stressed, unable to relax, and academic pressure affects daily functioning.</li>
              </ul>
            </div>

            {/* Motivation Level */}
            <div>
              <h4 className="font-bold text-primary mb-2">Motivation Level (1–10)</h4>
              <ul className="space-y-1.5 text-[12px]">
                <li><span className="font-semibold text-text-secondary">1–3:</span> Frequently avoid studying and struggle to find interest in academic work.</li>
                <li><span className="font-semibold text-text-secondary">4–6:</span> Motivation varies depending on workload, deadlines, or subjects.</li>
                <li><span className="font-semibold text-text-secondary">7–8:</span> Usually willing to study and complete academic tasks without much resistance.</li>
                <li><span className="font-semibold text-text-secondary">9–10:</span> Highly driven, enthusiastic, and consistently engaged in learning activities.</li>
              </ul>
            </div>

            {/* Energy Level */}
            <div>
              <h4 className="font-bold text-primary mb-2">Energy Level (1–10)</h4>
              <ul className="space-y-1.5 text-[12px]">
                <li><span className="font-semibold text-text-secondary">1–3:</span> Often feel tired, drained, or lack energy throughout the day.</li>
                <li><span className="font-semibold text-text-secondary">4–6:</span> Energy levels are moderate but fluctuate during the week.</li>
                <li><span className="font-semibold text-text-secondary">7–8:</span> Generally feel active, alert, and capable of handling daily responsibilities.</li>
                <li><span className="font-semibold text-text-secondary">9–10:</span> Feel consistently energetic, productive, and physically and mentally refreshed.</li>
              </ul>
            </div>

            {/* Academic Satisfaction */}
            <div>
              <h4 className="font-bold text-primary mb-2">Academic Satisfaction (1–10)</h4>
              <ul className="space-y-1.5 text-[12px]">
                <li><span className="font-semibold text-text-secondary">1–3:</span> Very dissatisfied with academic performance, progress, or learning experience.</li>
                <li><span className="font-semibold text-text-secondary">4–6:</span> Some aspects are satisfying while others need improvement.</li>
                <li><span className="font-semibold text-text-secondary">7–8:</span> Mostly satisfied with academic achievements and progress.</li>
                <li><span className="font-semibold text-text-secondary">9–10:</span> Extremely satisfied with academic growth, performance, and learning outcomes.</li>
              </ul>
            </div>

            {/* Procrastination Level */}
            <div>
              <h4 className="font-bold text-primary mb-2">Procrastination Level (1–10)</h4>
              <ul className="space-y-1.5 text-[12px]">
                <li><span className="font-semibold text-text-secondary">1–3:</span> Rarely postpone assignments or study tasks.</li>
                <li><span className="font-semibold text-text-secondary">4–6:</span> Occasionally delay tasks but usually complete them on time.</li>
                <li><span className="font-semibold text-text-secondary">7–8:</span> Frequently postpone important academic responsibilities.</li>
                <li><span className="font-semibold text-text-secondary">9–10:</span> Regularly avoid tasks until deadlines become urgent or are missed.</li>
              </ul>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
