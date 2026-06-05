import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { CURRENCIES } from '../../utils/constants';
import { Camera, User, Lock, Palette, GraduationCap, ToggleLeft, ToggleRight, CheckCircle, AlertCircle } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile, changePassword, uploadAvatar, authError, setAuthError } = useAuth();
  const { currency, setCurrency, studentMode, setStudentMode } = useApp();
  const fileInputRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profile, setProfile] = useState({ fullName: user?.fullName || '', username: user?.username || '' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setSuccess('');
    setLoading(true);
    const ok = await updateProfile(profile);
    setLoading(false);
    if (ok) { setEditing(false); setSuccess('Profile updated'); }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setSuccess('');
    if (passwords.new !== passwords.confirm) { setAuthError('Passwords do not match'); return; }
    if (passwords.new.length < 6) { setAuthError('Password must be at least 6 characters'); return; }
    setLoading(true);
    const ok = await changePassword(passwords.current, passwords.new);
    setLoading(false);
    if (ok) { setChangingPassword(false); setPasswords({ current: '', new: '', confirm: '' }); setSuccess('Password changed'); }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAuthError('');
    setSuccess('');
    const ok = await uploadAvatar(file);
    if (ok) setSuccess('Avatar updated');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account settings</p>
      </div>

      {success && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          {success}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="glass-card dark:glass-dark rounded-2xl p-6 text-center">
            <div className="relative inline-block">
              <div
                onClick={handleAvatarClick}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl cursor-pointer hover:opacity-80 transition-opacity overflow-hidden mx-auto border-4 border-white dark:border-slate-700 shadow-lg"
              >
                {user?.avatar ? (
                  <img src={user.avatar.startsWith('/') ? `${import.meta.env.VITE_API_URL || ''}${user.avatar}` : user.avatar} alt="avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-white font-bold text-3xl">
                    {user?.fullName?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                )}
              </div>
              <button
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-dark transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <h3 className="mt-4 font-semibold text-slate-800 dark:text-white">{user?.fullName}</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500">@{user?.username}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{user?.email}</p>
          </div>

          <div className="glass-card dark:glass-dark rounded-2xl p-6">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary" />
              Student Mode
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Enable student-specific categories, analytics, and budget planning for college students.
            </p>
            <button
              onClick={() => setStudentMode(!studentMode)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                studentMode
                  ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-500/10 dark:to-pink-500/10 border border-purple-200 dark:border-purple-500/20'
                  : 'bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                {studentMode ? (
                  <ToggleRight className="w-6 h-6 text-purple-500" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-slate-400" />
                )}
                <span className={`text-sm font-medium ${studentMode ? 'text-purple-600 dark:text-purple-400' : 'text-slate-600 dark:text-slate-300'}`}>
                  {studentMode ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              {studentMode && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-medium">
                  Active
                </span>
              )}
            </button>
            {studentMode && (
              <div className="mt-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-500/5 border border-purple-200 dark:border-purple-500/10">
                <p className="text-[11px] text-purple-600 dark:text-purple-400">
                  Student dashboard shows pocket money, semester budget, education analytics, and student-specific insights.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card dark:glass-dark rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Profile Information
              </h3>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                >
                  Edit
                </button>
              )}
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {authError}
              </div>
            )}

            {editing ? (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text" value={profile.fullName}
                    onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label>
                  <input
                    type="text" value={profile.username}
                    onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email" value={user?.email || ''} disabled
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setEditing(false); setProfile({ fullName: user?.fullName || '', username: user?.username || '' }); setAuthError(''); }} className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">Cancel</button>
                  <button type="submit" disabled={loading} className="px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-xl transition-colors disabled:opacity-60">
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {[
                  { label: 'Full Name', value: user?.fullName },
                  { label: 'Username', value: `@${user?.username}` },
                  { label: 'Email', value: user?.email },
                  { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-' },
                ].map(f => (
                  <div key={f.label} className="flex justify-between py-2 border-b border-slate-100 dark:border-white/5 last:border-0">
                    <span className="text-sm text-slate-500 dark:text-slate-400">{f.label}</span>
                    <span className="text-sm font-medium text-slate-800 dark:text-white">{f.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card dark:glass-dark rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                Security
              </h3>
              {!changingPassword && (
                <button
                  onClick={() => setChangingPassword(true)}
                  className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                >
                  Change Password
                </button>
              )}
            </div>

            {changingPassword ? (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                  <input type="password" value={passwords.current} onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))} required className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                  <input type="password" value={passwords.new} onChange={(e) => setPasswords((p) => ({ ...p, new: e.target.value }))} required className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                  <input type="password" value={passwords.confirm} onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))} required className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setChangingPassword(false); setPasswords({ current: '', new: '', confirm: '' }); setAuthError(''); }} className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">Cancel</button>
                  <button type="submit" disabled={loading} className="px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-xl transition-colors disabled:opacity-60">
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500">Your password was last changed recently. You can update it anytime.</p>
            )}
          </div>

          <div className="glass-card dark:glass-dark rounded-2xl p-6">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary" />
              Currency Preference
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCurrency(c.code)}
                  className={`flex items-center gap-2 px-3 py-2.5 text-sm rounded-xl border transition-all ${
                    currency === c.code
                      ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary font-medium'
                      : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500'
                  }`}
                >
                  <span className="text-base">{c.flag}</span>
                  <span>{c.code} ({c.symbol})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
