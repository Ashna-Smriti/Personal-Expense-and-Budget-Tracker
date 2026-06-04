import { useApp } from '../../context/AppContext';

export default function AIInsightsWidget({ compact = false }) {
  const { aiInsights } = useApp();

  if (!aiInsights || aiInsights.length === 0) return null;

  const displayed = compact ? aiInsights.slice(0, 3) : aiInsights;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">AI</span>
        <h3 className="font-semibold text-slate-800 dark:text-white text-sm">AI Insights</h3>
      </div>
      <div className="space-y-2">
        {displayed.map((insight, idx) => (
          <div key={idx} className={`flex items-start gap-2 p-2 rounded-lg ${
            insight.type === 'danger' ? 'bg-red-50 dark:bg-red-900/20' :
            insight.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20' :
            insight.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20' :
            'bg-white/50 dark:bg-slate-800/50'
          }`}>
            <span className="text-base flex-shrink-0">{insight.icon}</span>
            <div className="min-w-0">
              <p className={`text-xs font-medium ${
                insight.type === 'danger' ? 'text-red-600 dark:text-red-400' :
                insight.type === 'warning' ? 'text-amber-600 dark:text-amber-400' :
                insight.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' :
                'text-slate-600 dark:text-slate-300'
              }`}>{insight.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{insight.message}</p>
            </div>
          </div>
        ))}
      </div>
      {compact && aiInsights.length > 3 && (
        <p className="text-xs text-primary mt-2 font-medium">+{aiInsights.length - 3} more insights</p>
      )}
    </div>
  );
}
