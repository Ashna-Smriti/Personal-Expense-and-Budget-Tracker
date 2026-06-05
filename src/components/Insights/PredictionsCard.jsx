import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/helpers';

export default function PredictionsCard() {
  const { predictions, currency } = useApp();

  if (!predictions) return null;

  const { predictedEndOfMonth, dailyAverage, daysLeft, trend, budgetRisk, riskLevel, riskColor, predictedSavings } = predictions;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
      <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Expense Predictions</h3>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
          <p className="text-xs text-slate-400 dark:text-slate-500">Predicted Month End</p>
          <p className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">{formatCurrency(currency, predictedEndOfMonth)}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
          <p className="text-xs text-slate-400 dark:text-slate-500">Daily Average</p>
          <p className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">{formatCurrency(currency, dailyAverage)}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
          <p className="text-xs text-slate-400 dark:text-slate-500">Days Remaining</p>
          <p className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">{daysLeft}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
          <p className="text-xs text-slate-400 dark:text-slate-500">Estimated Savings</p>
          <p className={`text-lg font-bold mt-0.5 ${predictedSavings >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {formatCurrency(currency, predictedSavings)}
          </p>
        </div>
      </div>
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-500 dark:text-slate-400">Budget Risk</span>
          <span className="font-medium" style={{ color: riskColor }}>
            {budgetRisk > 100 ? `${budgetRisk}% (Over)` : `${budgetRisk}%`}
          </span>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(budgetRisk, 100)}%`, backgroundColor: riskColor }} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
          riskLevel === 'low' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
          riskLevel === 'medium' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
          'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
        }`}>{riskLevel.toUpperCase()} RISK</span>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {trend === 'increasing' ? '📈 Spending trend: increasing' : trend === 'decreasing' ? '📉 Spending trend: decreasing' : '➡️ Spending trend: stable'}
        </span>
      </div>
    </div>
  );
}
