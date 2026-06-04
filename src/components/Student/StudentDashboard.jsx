import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/helpers';
import { calculateFinancialHealth } from '../../utils/helpers';
import StatsCard from '../Dashboard/StatsCard';
import ProgressRing from '../Common/ProgressRing';

export default function StudentDashboard() {
  const { transactions, totalIncome, totalExpenses, monthlyIncome, monthlyExpenses, currentBudget, currency } = useApp();
  const balance = totalIncome - totalExpenses;

  const studentExpenses = transactions.filter((t) => t.type === 'Expense');
  const studentIncome = transactions.filter((t) => t.type === 'Income');

  const hostelFees = studentExpenses.filter((t) => t.category === 'Bills').reduce((s, t) => s + Number(t.amount), 0);
  const tuition = studentExpenses.filter((t) => t.category === 'Education').reduce((s, t) => s + Number(t.amount), 0);
  const books = studentExpenses.filter((t) => t.description.toLowerCase().includes('book')).reduce((s, t) => s + Number(t.amount), 0);
  const courses = studentExpenses.filter((t) => t.description.toLowerCase().includes('course')).reduce((s, t) => s + Number(t.amount), 0);
  const pocketMoney = studentIncome.filter((t) => t.category === 'Other' || t.description.toLowerCase().includes('pocket')).reduce((s, t) => s + Number(t.amount), 0);
  const internshipIncome = studentIncome.filter((t) => t.category === 'Salary').reduce((s, t) => s + Number(t.amount), 0);

  const { score, label, color } = calculateFinancialHealth(monthlyIncome, monthlyExpenses, currentBudget);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🎓</span>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Student Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track your student finances</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatsCard title="Pocket Money" value={formatCurrency(currency, pocketMoney)} icon="💵" color="#10b981" />
        <StatsCard title="Internship" value={formatCurrency(currency, internshipIncome)} icon="💼" color="#6366f1" />
        <StatsCard title="Tuition" value={formatCurrency(currency, tuition)} icon="📚" color="#f59e0b" />
        <StatsCard title="Hostel" value={formatCurrency(currency, hostelFees)} icon="🏠" color="#ef4444" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Student Health Score</h3>
          <div className="flex flex-col items-center">
            <ProgressRing score={score} size={100} strokeWidth={8} color={color} />
            <p className="text-sm font-medium mt-2" style={{ color }}>{label}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm lg:col-span-2">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: 'Hostel Fees', amount: hostelFees, icon: '🏠', color: '#ef4444' },
              { label: 'Tuition Fees', amount: tuition, icon: '📚', color: '#f59e0b' },
              { label: 'Books', amount: books, icon: '📖', color: '#6366f1' },
              { label: 'Courses', amount: courses, icon: '💻', color: '#8b5cf6' },
              { label: 'Internship Income', amount: internshipIncome, icon: '💼', color: '#10b981' },
              { label: 'Pocket Money', amount: pocketMoney, icon: '💵', color: '#06b6d4' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span className="text-sm text-slate-600 dark:text-slate-300">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-slate-800 dark:text-white">{formatCurrency(currency, item.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
