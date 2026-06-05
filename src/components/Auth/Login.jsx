import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../Common/ThemeToggle';
import { Eye, EyeOff, AlertCircle, ArrowRight, Settings, WifiOff } from 'lucide-react';

const HAS_GOOGLE_CLIENT = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_URL = import.meta.env.VITE_API_URL;
const IS_LOCALHOST_FALLBACK = !API_URL || API_URL.includes('localhost');

export default function Login() {
  const navigate = useNavigate();
  const { login, googleLogin, authError, setAuthError } = useAuth();
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
    <div className="min-h-screen flex relative overflow-hidden bg-slate-50 dark:bg-slate-900">
      <div className="absolute inset-0 bg-dot-pattern text-primary/30 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-secondary/10 to-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex items-center justify-center w-full p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>

          <div className="glass-card dark:glass-dark rounded-3xl shadow-2xl p-8 sm:p-10">
            {import.meta.env.PROD && IS_LOCALHOST_FALLBACK && (
              <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl text-xs text-amber-600 dark:text-amber-400 flex items-start gap-2">
                <Settings className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Backend not configured.</strong> Set{' '}
                  <code className="text-[10px] bg-amber-100 dark:bg-amber-900/30 px-1 rounded">VITE_API_URL</code>
                  {' '}in Vercel dashboard → Environment Variables to your deployed backend URL.
                </div>
              </div>
            )}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.6 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4 shadow-lg"
                style={{ boxShadow: '0 8px 24px var(--theme-glow)' }}
              >
                <span className="text-3xl font-bold text-white">$</span>
              </motion.div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Welcome Back</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sign in to your account</p>
            </div>

            {authError && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {authError}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email / Username</label>
                <input
                  type="text"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 text-sm rounded-xl border bg-white/50 dark:bg-white/[0.03] backdrop-blur-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder:text-slate-400 ${errors.email ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-white/10'}`}
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
                    className={`w-full px-4 py-3 pr-12 text-sm rounded-xl border bg-white/50 dark:bg-white/[0.03] backdrop-blur-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder:text-slate-400 ${errors.password ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-white/10'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3 px-4 text-sm font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                style={{ boxShadow: '0 8px 24px var(--theme-glow)' }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Sign In <ArrowRight className="w-4 h-4" /></>
                )}
              </motion.button>
            </form>

            {HAS_GOOGLE_CLIENT ? (
              <>
                <div className="mt-6 relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 dark:text-slate-500">or continue with</span>
                  </div>
                </div>

                <div className="mt-4">
                  <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                      setAuthError('');
                      const success = await googleLogin(credentialResponse.credential);
                      if (success) navigate('/');
                    }}
                    onError={() => setAuthError('Google Sign-In failed. Please try again.')}
                    theme="outline"
                    size="large"
                    text="continue_with"
                    shape="pill"
                    width="100%"
                    containerProps={{ className: 'w-full [&>div]:w-full' }}
                  />
                </div>
              </>
            ) : (
              <div className="mt-4 p-3 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl text-center">
                <p className="text-xs text-slate-400 dark:text-slate-500">Google Sign-In not configured</p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
              <p className="text-center text-xs text-slate-400 dark:text-slate-500 mb-3">Can't sign in? Use offline mode</p>
              <motion.button
                type="button"
                onClick={() => {
                  const guest = { id: 'guest', fullName: 'Guest User', email: 'guest@local', username: 'guest' };
                  localStorage.setItem('token', 'offline-token');
                  localStorage.setItem('user', JSON.stringify(guest));
                  window.location.href = '/';
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-2.5 px-4 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.08] rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-white/10"
              >
                <WifiOff className="w-4 h-4" />
                Continue Offline (Demo)
              </motion.button>
            </div>

            <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary hover:text-primary-dark transition-colors">Create one</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
