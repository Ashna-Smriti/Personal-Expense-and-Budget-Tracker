import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../Common/ThemeToggle';
import { Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';

const HAS_GOOGLE_CLIENT = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

const strengthConfig = [
  { label: 'Weak', color: 'bg-red-500', textColor: 'text-red-500', min: 0 },
  { label: 'Fair', color: 'bg-orange-500', textColor: 'text-orange-500', min: 2 },
  { label: 'Good', color: 'bg-yellow-500', textColor: 'text-yellow-500', min: 3 },
  { label: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-500', min: 4 },
];

const getStrength = (pw) => {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const idx = Math.min(Math.floor(score / 2), strengthConfig.length - 1);
  return strengthConfig[idx] || strengthConfig[0];
};

export default function Register() {
  const navigate = useNavigate();
  const { register, googleLogin, authError, setAuthError } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', username: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const strength = getStrength(form.password);
  const passwordsMatch = form.password === form.confirmPassword;

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    else if (form.fullName.trim().length < 2) errs.fullName = 'Name must be at least 2 characters';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.username.trim()) errs.username = 'Username is required';
    else if (form.username.trim().length < 3) errs.username = 'Username must be at least 3 characters';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    const success = await register(form.fullName.trim(), form.email.trim(), form.username.trim(), form.password);
    setLoading(false);
    if (success) navigate('/');
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-slate-50 dark:bg-slate-900">
      <div className="absolute inset-0 bg-dot-pattern text-primary/30 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-secondary/10 to-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-60 h-60 bg-purple-300/10 rounded-full blur-3xl" />
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
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Create Account</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Start tracking your finances</p>
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text" value={form.fullName}
                  onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                  placeholder="John Doe"
                  className={`w-full px-4 py-3 text-sm rounded-xl border bg-white/50 dark:bg-white/[0.03] backdrop-blur-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder:text-slate-400 ${errors.fullName ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-white/10'}`}
                />
                {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email" value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="email@example.com"
                    className={`w-full px-4 py-3 text-sm rounded-xl border bg-white/50 dark:bg-white/[0.03] backdrop-blur-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder:text-slate-400 ${errors.email ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-white/10'}`}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label>
                  <input
                    type="text" value={form.username}
                    onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                    placeholder="johndoe"
                    className={`w-full px-4 py-3 text-sm rounded-xl border bg-white/50 dark:bg-white/[0.03] backdrop-blur-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder:text-slate-400 ${errors.username ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-white/10'}`}
                  />
                  {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    placeholder="Create a strong password"
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
                {form.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {strengthConfig.map((s, i) => {
                        const idx = strengthConfig.indexOf(strength);
                        return <div key={i} className={`h-1 flex-1 rounded-full ${i <= idx ? s.color : 'bg-slate-200 dark:bg-slate-600'}`} />;
                      })}
                    </div>
                    <p className={`text-xs ${strength.textColor}`}>{strength.label}</p>
                  </div>
                )}
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                <input
                  type="password" value={form.confirmPassword}
                  onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Repeat your password"
                  className={`w-full px-4 py-3 text-sm rounded-xl border bg-white/50 dark:bg-white/[0.03] backdrop-blur-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder:text-slate-400 ${errors.confirmPassword ? 'border-red-300 dark:border-red-700' : (!passwordsMatch && form.confirmPassword ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-white/10')}`}
                />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
                {!errors.confirmPassword && form.confirmPassword && !passwordsMatch && (
                  <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                )}
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
                  <>Create Account <ArrowRight className="w-4 h-4" /></>
                )}
              </motion.button>
            </form>

            {HAS_GOOGLE_CLIENT && (
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
            )}

            <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:text-primary-dark transition-colors">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
