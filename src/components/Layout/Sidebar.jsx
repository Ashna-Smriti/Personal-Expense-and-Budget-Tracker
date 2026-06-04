import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/', icon: '🏠', label: 'Dashboard' },
  { path: '/transactions', icon: '💳', label: 'Transactions' },
  { path: '/budget', icon: '📋', label: 'Budget' },
  { path: '/analytics', icon: '📊', label: 'Analytics' },
  { path: '/savings', icon: '🎯', label: 'Savings' },
  { path: '/reports', icon: '📄', label: 'Reports' },
  { path: '/insights', icon: '💡', label: 'Insights' },
  { path: '/subscriptions', icon: '📺', label: 'Subscriptions' },
  { path: '/challenges', icon: '🏋️', label: 'Challenges' },
  { path: '/achievements', icon: '🏆', label: 'Achievements' },
  { path: '/student', icon: '🎓', label: 'Student Mode' },
  { path: '/profile', icon: '👤', label: 'Profile' },
];

export default function Sidebar({ mobileOpen, onClose }) {
  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={onClose} />
      )}
      <aside className={`fixed lg:static inset-y-0 left-0 z-20 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 ease-in-out ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">$</div>
            <div>
              <h2 className="font-bold text-slate-800 dark:text-white">Budget Tracker</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Personal Finance</p>
            </div>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary dark:text-primary-light'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
