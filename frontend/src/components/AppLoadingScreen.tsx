import React, { useState, useEffect } from 'react';

export const AppLoadingScreen: React.FC<{ onLoadingComplete: () => void }> = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsTransitioning(true);
            setScale(12);
            setOpacity(0);
            setTimeout(onLoadingComplete, 500);
          }, 300);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background dark:bg-[#0F172A] overflow-hidden">
      <div 
        className="relative transition-all duration-500 ease-out"
        style={{ transform: `scale(${scale})`, opacity: opacity }}
      >
        <div className="relative inline-block">
          {/* Background muted text */}
          <span className="text-6xl sm:text-8xl font-display font-extrabold tracking-tighter relative" style={{ color: 'var(--text-muted)' }}>
            BurnoutGuard
          </span>
          {/* Gradient text that fills from bottom */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden" style={{ height: `${Math.min(progress, 100)}%` }}>
            <span className="text-6xl sm:text-8xl font-display font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary absolute bottom-0 left-0">
              BurnoutGuard
            </span>
          </div>
        </div>
      </div>

      {!isTransitioning && (
        <div className="mt-8 flex items-center space-x-2 text-text-muted text-xs sm:text-sm transition-opacity duration-300">
          <span>loading...</span>
          <span className="font-bold text-text-primary">{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  );
};
