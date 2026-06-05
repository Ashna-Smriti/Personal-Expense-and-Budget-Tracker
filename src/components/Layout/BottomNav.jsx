import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowRightLeft, PiggyBank, BarChart3, Ellipsis } from 'lucide-react';

const tabs = [
  { path: '/', icon: LayoutDashboard, label: 'Home' },
  { path: '/transactions', icon: ArrowRightLeft, label: 'Transactions' },
  { path: '/budget', icon: PiggyBank, label: 'Budget' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/profile', icon: Ellipsis, label: 'More' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-card dark:glass-dark border-t border-slate-200/30 dark:border-white/5 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-0 flex-1 ${
                isActive
                  ? 'text-primary'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-lg transition-all ${isActive ? 'bg-primary/10' : ''}`}>
                  <tab.icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-medium truncate ${isActive ? 'font-bold' : ''}`}>
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
