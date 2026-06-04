import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../Common/ThemeToggle';

export default function Login() {
  const navigate = useNavigate();
  const { login, authError, setAuthError } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email or username is required';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    const success = await login(form.email, form.password, form.rememberMe);
    setLoading(false);
    if (success) navigate('/');
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-60 h-60 bg-purple-300/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex items-center justify-center w-full p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>

          <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-800/60 rounded-3xl shadow-2xl shadow-primary/5 border border-white/40 dark:border-slate-700/50 p-8 sm:p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-2xl mb-4">
                <span className="text-3xl font-bold text-primary">$</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Welcome Back</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sign in to your account</p>
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {authError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email / Username</label>
                <input
                  type="text"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 text-sm rounded-xl border bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 ${errors.email ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-600'}`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    placeholder="Enter your password"
                    className={`w-full px-4 py-3 pr-12 text-sm rounded-xl border bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 ${errors.password ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-600'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.rememberMe}
                    onChange={(e) => setForm((p) => ({ ...p, rememberMe: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary/30"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : 'Sign In'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary hover:text-primary-dark transition-colors">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
