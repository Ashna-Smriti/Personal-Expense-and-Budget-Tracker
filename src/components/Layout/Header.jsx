import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Palette, LogOut, Menu, ChevronDown, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CURRENCIES } from '../../utils/constants';
import NotificationsBell from '../Notifications/NotificationsBell';
import ThemeSelector from '../Premium/ThemeSelector';

export default function Header({ onMenuClick, user, onLogout }) {
  const { currency, setCurrency } = useApp();
  const [showTheme, setShowTheme] = useState(false);
  const [showCurrency, setShowCurrency] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 glass-card dark:glass-dark border-b border-slate-200/30 dark:border-white/5">
        <div className="flex items-center justify-between px-4 lg:px-6 h-16">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 dark:text-slate-500 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden lg:flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                placeholder="Search transactions..."
                className="w-64 pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTheme(true)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 dark:text-slate-500 transition-colors"
              title="Change Theme"
            >
              <Palette className="w-5 h-5" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowCurrency(!showCurrency)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors"
              >
                <span>{CURRENCIES.find(c => c.code === currency)?.symbol}</span>
                <span className="hidden sm:inline">{currency}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              <AnimatePresence>
                {showCurrency && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowCurrency(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 top-full mt-1 z-50 w-40 glass-card dark:glass-dark rounded-xl p-1 shadow-xl"
                    >
                      {CURRENCIES.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => { setCurrency(c.code); setShowCurrency(false); }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                            currency === c.code
                              ? 'bg-primary/10 text-primary'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                          }`}
                        >
                          <span>{c.symbol}</span>
                          <span className="flex-1 text-left">{c.code}</span>
                          <span className="text-[10px] text-slate-400">{c.flag}</span>
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <NotificationsBell />

            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-white shadow-sm">
                    {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300 hidden sm:block">{user.fullName?.split(' ')[0]}</span>
                </button>
                <AnimatePresence>
                  {showProfile && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute right-0 top-full mt-1 z-50 w-48 glass-card dark:glass-dark rounded-xl p-1 shadow-xl"
                      >
                        <Link
                          to="/profile"
                          onClick={() => setShowProfile(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </Link>
                        <button
                          onClick={() => { onLogout(); setShowProfile(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </header>

      <ThemeSelector open={showTheme} onClose={() => setShowTheme(false)} />
    </>
  );
}
