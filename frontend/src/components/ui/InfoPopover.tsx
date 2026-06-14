import React, { useState, useEffect, useRef } from 'react';

interface InfoPopoverProps {
  title: string;
  description: string;
}

export const InfoPopover: React.FC<InfoPopoverProps> = ({ title, description }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label={`More info about ${title}`}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border/80 bg-surface text-[11px] text-text-secondary shadow-sm transition hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        ⓘ
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(280px,calc(100vw-2rem))] rounded-2xl border border-border/80 bg-white/95 dark:bg-slate-950/95 p-4 text-xs text-text-primary shadow-2xl backdrop-blur-md">
          <p className="font-semibold uppercase tracking-[0.18em] text-text-secondary">{title}</p>
          <p className="mt-2 whitespace-pre-line leading-5 text-[13px] text-text-primary">{description}</p>
        </div>
      )}
    </div>
  );
};
