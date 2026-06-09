import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { getGoogleClientId, loadGoogleScript } from '@/lib/googleAuth';

interface GoogleSignInButtonProps {
  onSuccess: (idToken: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
}

export const GoogleSignInButton = ({
  onSuccess,
  onError,
  disabled = false,
  loading = false,
  label = 'Continue with Google',
}: GoogleSignInButtonProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;

  const clientId = getGoogleClientId();

  useEffect(() => {
    if (!clientId || !overlayRef.current) return;

    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !overlayRef.current || !window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response.credential) {
              onSuccessRef.current(response.credential);
            } else {
              onErrorRef.current?.('Google sign-in was cancelled');
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        const width = overlayRef.current.offsetWidth || 360;
        overlayRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(overlayRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          width,
        });
      })
      .catch(() => {
        onErrorRef.current?.('Failed to load Google Sign-In');
      });

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  if (!clientId) {
    return (
      <button
        type="button"
        disabled
        className="w-full border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] py-2.5 rounded-lg font-semibold text-neutral-outline dark:text-[#64748B] text-xs cursor-not-allowed opacity-70"
      >
        Google Sign-In is not configured
      </button>
    );
  }

  return (
    <div className="relative w-full h-[42px]">
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 flex items-center justify-center space-x-2 rounded-lg border border-slate-200 bg-white py-2.5 text-xs font-semibold text-neutral-slate dark:border-[#334155] dark:bg-[#111827] dark:text-[#E2E8F0] pointer-events-none"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
        )}
        <span>{loading ? 'Signing in...' : label}</span>
      </div>

      <div
        ref={overlayRef}
        className={`absolute inset-0 z-10 overflow-hidden opacity-[0.01] ${
          disabled || loading ? 'pointer-events-none' : 'cursor-pointer'
        }`}
        aria-label={label}
      />
    </div>
  );
};
