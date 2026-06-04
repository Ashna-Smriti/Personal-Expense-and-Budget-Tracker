import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { CURRENCIES } from '../../utils/constants';

export default function Profile() {
  const { user, updateProfile, changePassword, uploadAvatar, logout, authError, setAuthError } = useAuth();
  const { currency, setCurrency } = useApp();
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account settings</p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
          <div className="relative inline-block">
            <div
              onClick={handleAvatarClick}
              className="w-24 h-24 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-4xl cursor-pointer hover:opacity-80 transition-opacity overflow-hidden mx-auto border-4 border-white dark:border-slate-700 shadow-lg"
            >
              {user?.avatar ? (
                <img src={`http://localhost:5001${user.avatar}`} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary font-bold">
                  {user?.fullName?.charAt(0)?.toUpperCase() || '?'}
                </span>
              )}
            </div>
            <button
              onClick={handleAvatarClick}
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-dark transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <h3 className="mt-4 font-semibold text-slate-800 dark:text-white">{user?.fullName}</h3>
          <p className="text-sm text-slate-400 dark:text-slate-500">@{user?.username}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{user?.email}</p>
        </div>

        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 dark:text-white">Profile Information</h3>
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
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">{authError}</div>
            )}

            {editing ? (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text" value={profile.fullName}
                    onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label>
                  <input
                    type="text" value={profile.username}
                    onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email" value={user?.email || ''} disabled
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setEditing(false); setProfile({ fullName: user?.fullName || '', username: user?.username || '' }); setAuthError(''); }} className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancel</button>
                  <button type="submit" disabled={loading} className="px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors disabled:opacity-60">
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Full Name</span>
                  <span className="text-sm font-medium text-slate-800 dark:text-white">{user?.fullName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Username</span>
                  <span className="text-sm font-medium text-slate-800 dark:text-white">@{user?.username}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Email</span>
                  <span className="text-sm font-medium text-slate-800 dark:text-white">{user?.email}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Member Since</span>
                  <span className="text-sm font-medium text-slate-800 dark:text-white">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Change Password */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 dark:text-white">Security</h3>
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
                  <input type="password" value={passwords.current} onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))} required className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                  <input type="password" value={passwords.new} onChange={(e) => setPasswords((p) => ({ ...p, new: e.target.value }))} required className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                  <input type="password" value={passwords.confirm} onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))} required className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setChangingPassword(false); setPasswords({ current: '', new: '', confirm: '' }); setAuthError(''); }} className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancel</button>
                  <button type="submit" disabled={loading} className="px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors disabled:opacity-60">
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500">Your password was last changed recently. You can update it anytime.</p>
            )}
          </div>

          {/* Currency Preference */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Currency Preference</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Select your preferred currency for displaying amounts</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCurrency(c.code)}
                  className={`flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg border transition-all ${
                    currency === c.code
                      ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary font-medium'
                      : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500'
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
    </div>
  );
}
