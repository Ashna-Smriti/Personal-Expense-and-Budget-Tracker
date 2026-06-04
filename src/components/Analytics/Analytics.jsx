import { useState, useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { useApp } from '../../context/AppContext';
import { ALL_CATEGORIES, MONTHS } from '../../utils/constants';
import { formatCurrency, getCurrencySymbol, getMonthYear, getMonthLabel } from '../../utils/helpers';
import Filters from '../Filters/Filters';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler);

export default function Analytics() {
  const { transactions, currency } = useApp();
  const [filters, setFilters] = useState({ month: '', category: '', startDate: '', endDate: '', search: '' });

  const filtered = useMemo(() => {
    let filtered = [...transactions];
    if (filters.month) {
      filtered = filtered.filter((t) => getMonthYear(t.date) === filters.month);
    }
    if (filters.category) {
      filtered = filtered.filter((t) => t.category === filters.category);
    }
    if (filters.startDate) {
      filtered = filtered.filter((t) => new Date(t.date) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter((t) => new Date(t.date) <= new Date(filters.endDate));
    }
    return filtered;
  }, [transactions, filters]);

  const allExpenses = filtered.filter((t) => t.type === 'Expense');
  const allIncome = filtered.filter((t) => t.type === 'Income');
  const totalExp = allExpenses.reduce((s, t) => s + Number(t.amount), 0);
  const totalInc = allIncome.reduce((s, t) => s + Number(t.amount), 0);

  const highestCat = useMemo(() => {
    const map = {};
    allExpenses.forEach((t) => { map[t.category] = (map[t.category] || 0) + Number(t.amount); });
    const sorted = Object.entries(map).sort(([, a], [, b]) => b - a);
    return sorted.length > 0 ? sorted[0] : null;
  }, [allExpenses]);

  const lowestCat = useMemo(() => {
    const map = {};
    allExpenses.forEach((t) => { map[t.category] = (map[t.category] || 0) + Number(t.amount); });
    const sorted = Object.entries(map).sort(([, a], [, b]) => a - b);
    return sorted.length > 0 ? sorted[0] : null;
  }, [allExpenses]);

  const avgMonthlySpending = useMemo(() => {
    const monthlyTotals = {};
    allExpenses.forEach((t) => {
      const key = getMonthYear(t.date);
      monthlyTotals[key] = (monthlyTotals[key] || 0) + Number(t.amount);
    });
    const months = Object.keys(monthlyTotals);
    if (months.length === 0) return 0;
    return months.reduce((s, m) => s + monthlyTotals[m], 0) / months.length;
  }, [allExpenses]);

  const mostExpensive = useMemo(() => {
    if (allExpenses.length === 0) return null;
    return allExpenses.reduce((max, t) => (Number(t.amount) > Number(max.amount) ? t : max), allExpenses[0]);
  }, [allExpenses]);

  const expenseByCategory = useMemo(() => {
    const map = {};
    filtered.filter((t) => t.type === 'Expense').forEach((t) => {
      map[t.category] = (map[t.category] || 0) + Number(t.amount);
    });
    return map;
  }, [filtered]);

  const monthlyData = useMemo(() => {
    const incomeMap = {};
    const expenseMap = {};
    transactions.forEach((t) => {
      const key = getMonthYear(t.date);
      if (t.type === 'Income') {
        incomeMap[key] = (incomeMap[key] || 0) + Number(t.amount);
      } else {
        expenseMap[key] = (expenseMap[key] || 0) + Number(t.amount);
      }
    });
    const allKeys = [...new Set([...Object.keys(incomeMap), ...Object.keys(expenseMap)])].sort();
    return allKeys.map((key) => ({
      month: key,
      income: incomeMap[key] || 0,
      expense: expenseMap[key] || 0,
    }));
  }, [transactions]);

  const spendingTrend = useMemo(() => {
    const daily = {};
    transactions
      .filter((t) => t.type === 'Expense')
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .forEach((t) => {
        daily[t.date] = (daily[t.date] || 0) + Number(t.amount);
      });
    return Object.entries(daily).slice(-30).map(([date, amount]) => ({
      date,
      amount,
    }));
  }, [transactions]);

  const pieData = {
    labels: Object.keys(expenseByCategory),
    datasets: [{
      data: Object.values(expenseByCategory),
      backgroundColor: Object.keys(expenseByCategory).map(
        (cat) => ALL_CATEGORIES.find((c) => c.name === cat)?.color || '#64748b'
      ),
      borderWidth: 0,
    }],
  };

  const barData = {
    labels: monthlyData.map((d) => {
      const [y, m] = d.month.split('-');
      return `${MONTHS[parseInt(m) - 1].slice(0, 3)} ${y}`;
    }),
    datasets: [
      {
        label: 'Income',
        data: monthlyData.map((d) => d.income),
        backgroundColor: '#10b981',
        borderRadius: 6,
      },
      {
        label: 'Expenses',
        data: monthlyData.map((d) => d.expense),
        backgroundColor: '#ef4444',
        borderRadius: 6,
      },
    ],
  };

  const lineData = {
    labels: spendingTrend.map((d) => {
      const date = new Date(d.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [{
      label: 'Daily Spending',
      data: spendingTrend.map((d) => d.amount),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: '#6366f1',
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 12,
          usePointStyle: true,
          font: { size: 11 },
        },
      },
    },
  };

  const pieOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        ...chartOptions.plugins.legend,
        position: 'right',
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      x: { grid: { display: false } },
      y: {
        grid: { color: 'rgba(0,0,0,0.06)' },
        ticks: {
          callback: (val) => getCurrencySymbol(currency) + val.toLocaleString(),
        },
      },
    },
  };

  const lineOptions = {
    ...barOptions,
    scales: {
      ...barOptions.scales,
      x: {
        ...barOptions.scales.x,
        ticks: {
          maxTicksLimit: 10,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Analytics</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Visualize your spending patterns</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Expenses</p>
          <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">{formatCurrency(currency, totalExp)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Transactions</p>
          <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">{filtered.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Avg Monthly</p>
          <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">{formatCurrency(currency, avgMonthlySpending)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Most Expensive</p>
          <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">
            {mostExpensive ? formatCurrency(currency, mostExpensive.amount) : `${getCurrencySymbol(currency)}0`}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{mostExpensive?.description || '-'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Highest Category</p>
          <p className="text-lg font-bold text-slate-800 dark:text-white mt-1">
            {highestCat ? `${ALL_CATEGORIES.find((c) => c.name === highestCat[0])?.icon || ''} ${highestCat[0]}` : '-'}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{highestCat ? formatCurrency(currency, highestCat[1]) : `${getCurrencySymbol(currency)}0`}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Lowest Category</p>
          <p className="text-lg font-bold text-slate-800 dark:text-white mt-1">
            {lowestCat ? `${ALL_CATEGORIES.find((c) => c.name === lowestCat[0])?.icon || ''} ${lowestCat[0]}` : '-'}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{lowestCat ? formatCurrency(currency, lowestCat[1]) : `${getCurrencySymbol(currency)}0`}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Income</p>
          <p className="text-lg font-bold text-emerald-500 mt-1">{formatCurrency(currency, totalInc)}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
        <Filters filters={filters} setFilters={setFilters} showCategory={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Category-wise Expenses</h3>
          <div className="h-[300px] flex items-center justify-center">
            {Object.keys(expenseByCategory).length > 0 ? (
              <Pie data={pieData} options={pieOptions} />
            ) : (
              <p className="text-slate-400 dark:text-slate-500 text-sm">No expense data available</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Monthly Income vs Expenses</h3>
          <div className="h-[300px]">
            {monthlyData.length > 0 ? (
              <Bar data={barData} options={barOptions} />
            ) : (
              <p className="text-slate-400 dark:text-slate-500 text-sm text-center pt-20">No monthly data available</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Spending Trends (Last 30 Days)</h3>
          <div className="h-[300px]">
            {spendingTrend.length > 0 ? (
              <Line data={lineData} options={lineOptions} />
            ) : (
              <p className="text-slate-400 dark:text-slate-500 text-sm text-center pt-20">No spending data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
