import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { THEMES } from '../../context/AppContext';

const themeData = {
  dark: { label: 'Dark', icon: '🌙', prev: 'bg-slate-900' },
  light: { label: 'Light', icon: '☀️', prev: 'bg-white border border-slate-200' },
  purple: { label: 'Purple Neon', icon: '💜', prev: 'bg-gradient-to-br from-purple-900 to-pink-900' },
  emerald: { label: 'Emerald Green', icon: '🌿', prev: 'bg-gradient-to-br from-emerald-900 to-teal-900' },
  blue: { label: 'Royal Blue', icon: '💙', prev: 'bg-gradient-to-br from-blue-900 to-indigo-900' },
};

export default function ThemeSelector({ open, onClose }) {
  const { theme, setTheme } = useApp();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 sm:w-96 glass-card dark:glass-dark rounded-2xl p-6 shadow-2xl overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Choose Theme</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {THEMES.map((t) => (
                <motion.button
                  key={t}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setTheme(t); onClose(); }}
                  className={`p-4 rounded-xl text-left transition-all ${
                    theme === t
                      ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-800'
                      : ''
                  }`}
                >
                  <div className={`h-16 rounded-lg mb-2 ${themeData[t].prev} flex items-center justify-center`}>
                    <span className="text-2xl">{themeData[t].icon}</span>
                  </div>
                  <p className={`text-sm font-semibold ${theme === t ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>
                    {themeData[t].label}
                  </p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
