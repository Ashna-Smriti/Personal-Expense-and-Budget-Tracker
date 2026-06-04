import { Link } from 'react-router-dom';
import ThemeToggle from '../Common/ThemeToggle';
import NotificationsBell from './NotificationsBell';

export default function Header({ onMenuClick, user, onLogout }) {
  return (
    <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="hidden lg:block" />
        <div className="flex items-center gap-3">
          <NotificationsBell />
          {user && (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 hidden sm:block">{user.fullName}</span>
              </Link>
              <button
                onClick={onLogout}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
