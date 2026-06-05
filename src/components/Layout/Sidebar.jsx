import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ArrowRightLeft, PiggyBank, BarChart3, Target, FileText,
  Lightbulb, Repeat, Trophy, Medal, GraduationCap, User, X, Wrench, FlaskConical,
  Bell, CalendarRange,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/transactions', icon: ArrowRightLeft, label: 'Transactions' },
  { path: '/budget', icon: PiggyBank, label: 'Budget' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/heatmap', icon: CalendarRange, label: 'Heatmap' },
  { path: '/savings', icon: Target, label: 'Savings' },
  { path: '/reports', icon: FileText, label: 'Reports' },
  { path: '/insights', icon: Lightbulb, label: 'Insights' },
  { path: '/subscriptions', icon: Repeat, label: 'Subscriptions' },
  { path: '/bills', icon: Bell, label: 'Bills' },
  { path: '/achievements', icon: Trophy, label: 'Achievements' },
  { path: '/challenges', icon: Medal, label: 'Challenges' },
  { path: '/goal-simulator', icon: Wrench, label: 'Goal Sim' },
  { path: '/what-if', icon: FlaskConical, label: 'What-If' },
  { path: '/student', icon: GraduationCap, label: 'Student' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { studentMode } = useApp();
  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed md:sticky top-0 left-0 z-50 h-screen
        w-64 md:w-20 lg:w-64 flex-shrink-0
        transform transition-all duration-300 ease-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-full glass-card dark:glass-dark border-r border-slate-200/50 dark:border-white/5 flex flex-col">
          {/* Logo - full on lg, compact on md */}
          <div className="p-5 md:p-3 lg:p-5 border-b border-slate-200/30 dark:border-white/5">
            {/* Desktop full logo */}
            <div className="hidden lg:flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg" style={{ boxShadow: '0 4px 12px var(--theme-glow)' }}>
                  <span className="text-lg">$</span>
                </div>
                <div>
                  <h2 className="font-bold text-slate-800 dark:text-white text-sm">FinanceFlow</h2>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Smart Budget Tracker</p>
                </div>
              </div>
              <button onClick={onClose} className="md:hidden lg:hidden p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Tablet compact logo */}
            <div className="flex md:flex lg:hidden items-center justify-center">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg" style={{ boxShadow: '0 4px 12px var(--theme-glow)' }}>
                <span className="text-lg">$</span>
              </div>
            </div>
            {/* Mobile close button */}
            <div className="flex md:hidden items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg" style={{ boxShadow: '0 4px 12px var(--theme-glow)' }}>
                  <span className="text-lg">$</span>
                </div>
                <div>
                  <h2 className="font-bold text-slate-800 dark:text-white text-sm">FinanceFlow</h2>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Smart Budget Tracker</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <nav className="flex-1 p-3 md:p-2 lg:p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 md:px-2 lg:px-3 py-2.5 md:py-2 lg:py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-sm'
                      : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`w-8 h-8 md:w-9 md:h-9 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 group-hover:bg-primary/10 group-hover:text-primary'
                    }`}>
                      <item.icon className="w-4 h-4 md:w-5 md:h-5 lg:w-4 lg:h-4" />
                    </div>
                    <span className="hidden lg:inline">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:block p-4 border-t border-slate-200/30 dark:border-white/5 space-y-2">
            {studentMode && (
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <p className="text-[10px] font-semibold text-purple-500 flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" />
                  Student Mode Active
                </p>
              </div>
            )}
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
              <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">Premium</p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400">Track smarter, save faster</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
