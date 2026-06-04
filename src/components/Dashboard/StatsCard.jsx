export default function StatsCard({ title, value, icon, color, subtitle, trend }) {
  return (
    <div className="card-hover bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
          style={{ backgroundColor: `${color}15` }}
        >
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            trend >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
          }`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-800 dark:text-white mb-1">{value}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
}
