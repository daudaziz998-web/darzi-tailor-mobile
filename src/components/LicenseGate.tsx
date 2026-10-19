import React, { useState } from 'react';
import { Lock, KeyRound, ShieldCheck, AlertCircle, Eye, EyeOff, CheckCircle2, Scissors, Sparkles } from 'lucide-react';

const LICENSE_STORAGE_KEY = 'swati_tailor_license_active';
const CORRECT_LICENSE_PASSWORD = '1122334455667788';

interface LicenseGateProps {
  children: React.ReactNode;
}

export const LicenseGate: React.FC<LicenseGateProps> = ({ children }) => {
  const [isActivated, setIsActivated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(LICENSE_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState(false);

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmed = password.trim();
    if (!trimmed) {
      setErrorMessage('Please enter your license password.');
      return;
    }

    setIsSubmitting(true);

    // Validate password locally - no internet connection or device code required
    if (trimmed === CORRECT_LICENSE_PASSWORD) {
      setSuccessAnimation(true);
      setTimeout(() => {
        try {
          localStorage.setItem(LICENSE_STORAGE_KEY, 'true');
          localStorage.setItem('swati_tailor_license_activated_at', new Date().toISOString());
        } catch (err) {
          console.error('Failed to save license activation to localStorage:', err);
        }
        setIsActivated(true);
        setIsSubmitting(false);
      }, 500);
    } else {
      setTimeout(() => {
        setIsSubmitting(false);
        setErrorMessage('Invalid license password. Please try again or contact Swati Software Solution.');
      }, 300);
    }
  };

  // If already activated, render the full application seamlessly
  if (isActivated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
        {/* App Branding & Icon */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-400 mb-1 shadow-inner">
            {successAnimation ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
            ) : (
              <Scissors className="w-8 h-8 rotate-45" />
            )}
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Swati Software Solution</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Enter Your License Password
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed font-medium px-2">
            Contact Swati Software Solution to obtain your license password.
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl flex items-start gap-2.5 text-xs text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">{errorMessage}</span>
              <p className="text-[11px] text-rose-300">
                برائے مہربانی درست پاس ورڈ درج کریں یا سواتی سافٹ ویئر سے رابطہ کریں۔
              </p>
            </div>
          </div>
        )}

        {/* Success Feedback */}
        {successAnimation && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex items-center gap-2.5 text-xs text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold">License activated successfully! Unlocking app...</span>
          </div>
        )}

        {/* Activation Form */}
        <form onSubmit={handleActivate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              License Password / لائسنس پاس ورڈ
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-slate-500">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                disabled={isSubmitting || successAnimation}
                placeholder="••••••••••••••••"
                autoFocus
                className="w-full text-sm font-mono ps-9 pe-10 py-2.5 bg-slate-950 border border-slate-700 focus:border-amber-400 focus:bg-slate-900 rounded-xl outline-none text-white placeholder:text-slate-600 transition-colors tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 end-0 flex items-center pe-3 text-slate-500 hover:text-slate-300"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || successAnimation}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-black rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Verifying License...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Activate License</span>
              </>
            )}
          </button>
        </form>

        {/* Informational Footer */}
        <div className="pt-4 border-t border-slate-800 text-center space-y-1 text-[11px] text-slate-500">
          <div className="flex items-center justify-center gap-1.5 font-medium text-slate-400">
            <Lock className="w-3 h-3 text-amber-500/80" />
            <span>Offline License Protection · 100% Secure</span>
          </div>
          <div>Activation persists on this device without requiring internet.</div>
        </div>
      </div>
    </div>
  );
};
