import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

export default function NotificationsBell() {
  const { notifications, markNotificationRead, clearNotifications } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
        <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50">
          <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Notifications</h3>
            {notifications.length > 0 && (
              <button onClick={clearNotifications} className="text-xs text-primary hover:text-primary-dark font-medium">Clear all</button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">No notifications</p>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <div
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={`p-3 border-b border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base flex-shrink-0">{n.icon || '🔔'}</span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${!n.read ? 'font-semibold text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>{n.title}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{new Date(n.timestamp).toLocaleDateString()}</p>
                    </div>
                    {!n.read && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
