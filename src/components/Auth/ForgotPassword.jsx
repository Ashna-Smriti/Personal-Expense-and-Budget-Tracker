import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../Common/ThemeToggle';

export default function ForgotPassword() {
  const { forgotPassword, authError, setAuthError } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setError('');
    if (!email.trim()) { setError('Email is required'); return; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError('Invalid email format'); return; }

    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);

    if (result) {
      setSent(true);
      setResetToken(result.resetToken || '');
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex items-center justify-center w-full p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>

          <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-800/60 rounded-3xl shadow-2xl shadow-primary/5 border border-white/40 dark:border-slate-700/50 p-8 sm:p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-2xl mb-4">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Forgot Password</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Enter your email to reset your password</p>
            </div>

            {sent ? (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Check Your Email</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  If an account exists for {email}, we've sent a password reset link.
                </p>
                {resetToken && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs text-left">
                    <p className="font-medium text-blue-600 dark:text-blue-400 mb-1">🔐 Dev Mode — Reset Token:</p>
                    <code className="text-blue-500 break-all">{resetToken}</code>
                    <p className="text-blue-400 mt-1">(In production this would be emailed)</p>
                  </div>
                )}
                <Link to="/login" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                  Back to Sign In
                </Link>
              </div>
            ) : (
              <>
                {authError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
                    {authError}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                    <input
                      type="email" value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                    />
                    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                  </div>
                  <button
                    type="submit" disabled={loading}
                    className="w-full py-3 px-4 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : 'Send Reset Link'}
                  </button>
                </form>
                <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  Remember your password?{' '}
                  <Link to="/login" className="font-semibold text-primary hover:text-primary-dark transition-colors">Sign in</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
