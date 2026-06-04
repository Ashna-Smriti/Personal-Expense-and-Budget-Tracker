import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/helpers';
import StatsCard from '../Dashboard/StatsCard';
import TransactionList from './TransactionList';

export default function TransactionsPage() {
  const { totalIncome, totalExpenses, currency } = useApp();
  const balance = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Transactions</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your income and expenses</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Total Income" value={formatCurrency(currency, totalIncome)} icon="💰" color="#10b981" />
        <StatsCard title="Total Expenses" value={formatCurrency(currency, totalExpenses)} icon="💳" color="#ef4444" />
        <StatsCard title="Balance" value={formatCurrency(currency, balance)} icon="🏦" color={balance >= 0 ? '#6366f1' : '#ef4444'} />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
        <TransactionList />
      </div>
    </div>
  );
}
