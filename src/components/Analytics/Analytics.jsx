import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  AreaChart, Area, ResponsiveContainer, Legend,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { ALL_CATEGORIES, MONTHS } from '../../utils/constants';
import { formatCurrency, getCurrencySymbol, getMonthYear } from '../../utils/helpers';
import Filters from '../Filters/Filters';

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card !p-3 !bg-white/90 dark:!bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl">
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(currency, entry.value)}
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { transactions, currency, predictions } = useApp();
  const [filters, setFilters] = useState({ month: '', category: '', startDate: '', endDate: '', search: '' });

  const filtered = useMemo(() => {
    let f = [...transactions];
    if (filters.month) f = f.filter((t) => getMonthYear(t.date) === filters.month);
    if (filters.category) f = f.filter((t) => t.category === filters.category);
    if (filters.startDate) f = f.filter((t) => new Date(t.date) >= new Date(filters.startDate));
    if (filters.endDate) f = f.filter((t) => new Date(t.date) <= new Date(filters.endDate));
    return f;
  }, [transactions, filters]);

  const allExpenses = filtered.filter((t) => t.type === 'Expense');
  const allIncome = filtered.filter((t) => t.type === 'Income');
  const totalExp = allExpenses.reduce((s, t) => s + Number(t.amount), 0);

  const avgMonthlySpending = useMemo(() => {
    const monthlyTotals = {};
    allExpenses.forEach((t) => {
      const key = getMonthYear(t.date);
      monthlyTotals[key] = (monthlyTotals[key] || 0) + Number(t.amount);
    });
    const months = Object.keys(monthlyTotals);
    return months.length === 0 ? 0 : months.reduce((s, m) => s + monthlyTotals[m], 0) / months.length;
  }, [allExpenses]);

  const mostExpensive = useMemo(() => {
    if (allExpenses.length === 0) return null;
    return allExpenses.reduce((max, t) => (Number(t.amount) > Number(max.amount) ? t : max), allExpenses[0]);
  }, [allExpenses]);

  const highestCat = useMemo(() => {
    const map = {};
    allExpenses.forEach((t) => { map[t.category] = (map[t.category] || 0) + Number(t.amount); });
    const sorted = Object.entries(map).sort(([, a], [, b]) => b - a);
    return sorted.length > 0 ? sorted[0] : null;
  }, [allExpenses]);

  const expenseByCategory = useMemo(() => {
    const map = {};
    filtered.filter((t) => t.type === 'Expense').forEach((t) => {
      map[t.category] = (map[t.category] || 0) + Number(t.amount);
    });
    return map;
  }, [filtered]);

  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name,
    value,
    color: ALL_CATEGORIES.find((c) => c.name === name)?.color || '#64748b',
  }));

  const monthlyData = useMemo(() => {
    const incomeMap = {};
    const expenseMap = {};
    transactions.forEach((t) => {
      const key = getMonthYear(t.date);
      if (t.type === 'Income') incomeMap[key] = (incomeMap[key] || 0) + Number(t.amount);
      else expenseMap[key] = (expenseMap[key] || 0) + Number(t.amount);
    });
    const allKeys = [...new Set([...Object.keys(incomeMap), ...Object.keys(expenseMap)])].sort();
    return allKeys.map((key) => ({
      month: key,
      label: (() => { const [y, m] = key.split('-'); return `${MONTHS[parseInt(m) - 1].slice(0, 3)} ${y}`; })(),
      Income: incomeMap[key] || 0,
      Expenses: expenseMap[key] || 0,
    }));
  }, [transactions]);

  const spendingTrend = useMemo(() => {
    const daily = {};
    transactions.filter((t) => t.type === 'Expense').sort((a, b) => new Date(a.date) - new Date(b.date))
      .forEach((t) => { daily[t.date] = (daily[t.date] || 0) + Number(t.amount); });
    return Object.entries(daily).slice(-30).map(([date, amount]) => {
      const d = new Date(date);
      return { date: `${d.getMonth() + 1}/${d.getDate()}`, amount };
    });
  }, [transactions]);

  const statCards = [
    { label: 'Total Expenses', value: totalExp, color: '#ef4444' },
    { label: 'Transactions', value: filtered.length, color: '#6366f1' },
    { label: 'Avg Monthly', value: avgMonthlySpending, color: '#f59e0b' },
    { label: 'Top Category', value: highestCat ? formatCurrency(currency, highestCat[1]) : `${getCurrencySymbol(currency)}0`, sub: highestCat?.[0], color: '#10b981' },
  ];

  const trendIcon = predictions?.trend === 'increasing' ? '📈' : predictions?.trend === 'decreasing' ? '📉' : '📊';
  const riskColor = predictions?.riskColor || '#10b981';

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Analytics</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Visualize your spending patterns</p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card rounded-xl p-4 border border-slate-200 dark:border-slate-700"
          >
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">{card.label}</p>
            <p className="text-xl font-bold mt-1" style={{ color: card.color }}>
              {typeof card.value === 'number' ? formatCurrency(currency, card.value) : card.value}
            </p>
            {card.sub && <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{card.sub}</p>}
          </motion.div>
        ))}
      </div>

      {predictions && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-xl p-5 border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 dark:text-white">📊 Spending Predictions</h3>
            <span className="text-sm text-slate-400 dark:text-slate-500">{predictions.daysLeft} days left this month</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Predicted EOM</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white">{formatCurrency(currency, predictions.predictedEndOfMonth)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Daily Average</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white">{formatCurrency(currency, predictions.dailyAverage)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Trend</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white">{trendIcon} {predictions.trend.charAt(0).toUpperCase() + predictions.trend.slice(1)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Budget Risk</p>
              <p className="text-lg font-bold" style={{ color: riskColor }}>
                {predictions.riskLevel.charAt(0).toUpperCase() + predictions.riskLevel.slice(1)}
              </p>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(predictions.budgetRisk, 100)}%`, backgroundColor: riskColor }} />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="glass-card rounded-xl p-4 border border-slate-200 dark:border-slate-700">
        <Filters filters={filters} setFilters={setFilters} showCategory={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-xl p-5 border border-slate-200 dark:border-slate-700"
        >
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Category-wise Expenses</h3>
          <div className="h-[300px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    animationBegin={200}
                    animationDuration={1200}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip currency={currency} />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-xs text-slate-600 dark:text-slate-300">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 dark:text-slate-500 text-sm text-center pt-20">No expense data available</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-xl p-5 border border-slate-200 dark:border-slate-700"
        >
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Monthly Income vs Expenses</h3>
          <div className="h-[300px]">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip currency={currency} />} />
                  <Legend
                    verticalAlign="top"
                    height={30}
                    formatter={(value) => <span className="text-xs text-slate-600 dark:text-slate-300">{value}</span>}
                  />
                  <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} animationBegin={300} animationDuration={1000} />
                  <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} animationBegin={500} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 dark:text-slate-500 text-sm text-center pt-20">No monthly data available</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass-card rounded-xl p-5 border border-slate-200 dark:border-slate-700"
        >
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Spending Trends (Last 30 Days)</h3>
          <div className="h-[300px]">
            {spendingTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spendingTrend}>
                  <defs>
                    <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip currency={currency} />} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#spendingGradient)"
                    dot={false}
                    activeDot={{ r: 5, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                    animationBegin={400}
                    animationDuration={1200}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 dark:text-slate-500 text-sm text-center pt-20">No spending data available</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
