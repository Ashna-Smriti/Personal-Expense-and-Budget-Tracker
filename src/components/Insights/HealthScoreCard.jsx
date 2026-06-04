import { useApp } from '../../context/AppContext';
import { formatCurrency, getCurrencySymbol } from '../../utils/helpers';
import ProgressRing from '../Common/ProgressRing';

export default function HealthScoreCard() {
  const { healthScore, currency } = useApp();
  const { score, label, color, breakdown, suggestions } = healthScore;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
      <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Financial Health</h3>
      <div className="flex flex-col items-center mb-4">
        <ProgressRing score={score} size={130} strokeWidth={10} color={color} label={label} />
      </div>
      <div className="space-y-2 mb-4">
        {breakdown.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">{item.label}</span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(item.score / item.max) * 100}%`, backgroundColor: color }} />
              </div>
              <span className="text-slate-600 dark:text-slate-300 font-medium w-16 text-right">{item.score}/{item.max}</span>
            </div>
          </div>
        ))}
      </div>
      {suggestions.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Suggestions</p>
          <ul className="space-y-1.5">
            {suggestions.map((s, i) => (
              <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                <span className="text-primary flex-shrink-0 mt-0.5">•</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
