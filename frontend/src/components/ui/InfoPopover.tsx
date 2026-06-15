import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface InfoPopoverProps {
  title: string;
  description: string;
}

export const InfoPopover: React.FC<InfoPopoverProps> = ({ title, description }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-label={`More info about ${title}`}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-surface text-text-secondary transition hover:text-primary focus:outline-none"
      >
        <Info className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(250px,calc(100vw-2rem))] rounded-2xl bg-surface border border-border p-4 text-xs text-text-primary shadow-level2 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          <p className="font-semibold uppercase tracking-[0.18em] text-text-secondary">{title}</p>
          <p className="mt-2 whitespace-pre-line leading-5 text-[13px] text-text-primary">{description}</p>
        </div>
      )}
    </div>
  );
};
