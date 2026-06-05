import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { formatCurrency, getMonthYear } from '../../utils/helpers';
import { STUDENT_INCOME_CATEGORIES, STUDENT_EXPENSE_CATEGORIES } from '../../utils/constants';
import { calculateStudentHealthScore, generateStudentInsights, calculateSemesterBudget, getSemesterMonths } from '../../utils/studentUtils';
import Modal from '../Common/Modal';
import TransactionForm from '../Transactions/TransactionForm';
import StudentSavings from './StudentSavings';
import QuickAddButton from '../Premium/QuickAddButton';
import AIAssistant from '../Premium/AIAssistant';
import { CalendarDays, PiggyBank, TrendingUp, BookOpen, GraduationCap, Wallet } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemAnim = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

export default function StudentDashboard() {
  const {
    transactions, budget, currentMonth, currency, totalIncome, totalExpenses,
    monthlyIncome, monthlyExpenses, addTransaction, studentMode,
  } = useApp();

  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const monthlyTxns = useMemo(() =>
    transactions.filter(t => getMonthYear(t.date) === currentMonth),
    [transactions, currentMonth]
  );

  const studentIncome = useMemo(() =>
    monthlyTxns.filter(t => t.type === 'Income'),
    [monthlyTxns]
  );

  const studentExpenses = useMemo(() =>
    monthlyTxns.filter(t => t.type === 'Expense'),
    [monthlyTxns]
  );

  const incomeByCategory = useMemo(() => {
    const map = {};
    studentIncome.forEach(t => { map[t.category] = (map[t.category] || 0) + Number(t.amount); });
    return STUDENT_INCOME_CATEGORIES.map(c => ({ ...c, amount: map[c.name] || 0 }));
  }, [studentIncome]);

  const expensesByCategory = useMemo(() => {
    const map = {};
    studentExpenses.forEach(t => { map[t.category] = (map[t.category] || 0) + Number(t.amount); });
    return STUDENT_EXPENSE_CATEGORIES.map(c => ({ ...c, amount: map[c.name] || 0 }));
  }, [studentExpenses]);

  const activeIncomeCats = incomeByCategory.filter(c => c.amount > 0);
  const activeExpenseCats = expensesByCategory.filter(c => c.amount > 0);

  const totalStudentIncome = activeIncomeCats.reduce((s, c) => s + c.amount, 0);
  const totalStudentExpenses = activeExpenseCats.reduce((s, c) => s + c.amount, 0);
  const studentSavings = totalStudentIncome - totalStudentExpenses;

  const healthScore = calculateStudentHealthScore(transactions, budget, currentMonth);
  const insights = generateStudentInsights(transactions, budget, currentMonth, currency);
  const semester = getSemesterMonths();
  const semesterBudget = calculateSemesterBudget(transactions, budget['semester'] || 0, semester, currentMonth);

  const today = new Date();
  const nextFeeDate = useMemo(() => {
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 15);
    return nextMonth;
  }, []);

  const daysUntilFee = Math.ceil((nextFeeDate - today) / (1000 * 60 * 60 * 24));

  const pocketMoneyRemaining = useMemo(() => {
    const pocketReceived = studentIncome.filter(t => t.category === 'Pocket Money')
      .reduce((s, t) => s + Number(t.amount), 0);
    const essentialsExpenses = studentExpenses.filter(t =>
      ['Food', 'Mess Fee', 'Transportation', 'Stationery'].includes(t.category)
    ).reduce((s, t) => s + Number(t.amount), 0);
    return pocketReceived - essentialsExpenses;
  }, [studentIncome, studentExpenses]);

  const topExpense = activeExpenseCats.sort((a, b) => b.amount - a.amount)[0];

  const educationTotal = activeExpenseCats.filter(c =>
    ['Tuition Fee', 'Books', 'Online Courses', 'Stationery'].includes(c.name)
  ).reduce((s, c) => s + c.amount, 0);

  const entertainmentTotal = activeExpenseCats.filter(c =>
    ['Entertainment', 'Food'].includes(c.name)
  ).reduce((s, c) => s + c.amount, 0);

  return (
    <div className="w-full">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 sm:space-y-6">
        <motion.div variants={itemAnim} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <motion.h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg shadow-lg">🎓</span>
              Student Dashboard
            </motion.h1>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              {studentSavings > 0
                ? `You saved ${formatCurrency(currency, studentSavings)} this month as a student 🎉`
                : 'Track your student income and expenses'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-500/10 dark:to-pink-500/10 border border-purple-200 dark:border-purple-500/20">
              <GraduationCap className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">Student Mode</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemAnim} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Pocket Money', value: incomeByCategory.find(c => c.name === 'Pocket Money')?.amount || 0, icon: '💵', color: '#10b981' },
            { label: 'Scholarship', value: incomeByCategory.find(c => c.name === 'Scholarship')?.amount || 0, icon: '🎓', color: '#6366f1' },
            { label: 'Internship', value: incomeByCategory.find(c => c.name === 'Internship')?.amount || 0, icon: '💼', color: '#f59e0b' },
            { label: 'Part-Time', value: incomeByCategory.find(c => c.name === 'Part-Time Job')?.amount || 0, icon: '👷', color: '#8b5cf6' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card dark:glass-dark rounded-2xl p-4 card-hover"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shadow-sm" style={{ backgroundColor: `${item.color}18` }}>
                  <span>{item.icon}</span>
                </div>
              </div>
              <p className="text-lg font-bold text-slate-800 dark:text-white font-mono">{formatCurrency(currency, item.value)}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">{item.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={itemAnim} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="lg:col-span-2 glass-card dark:glass-dark rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-bold">📊</div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Student Financial Score</h3>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative flex-shrink-0">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-200 dark:text-slate-700" />
                  <motion.circle
                    cx="18" cy="18" r="15.5" fill="none"
                    stroke={healthScore.color} strokeWidth="2.5" strokeLinecap="round"
                    initial={{ strokeDasharray: '0 97' }}
                    animate={{ strokeDasharray: `${healthScore.score * 0.97} 97` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold" style={{ color: healthScore.color }}>{healthScore.score}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-sm font-semibold" style={{ color: healthScore.color }}>{healthScore.label}</p>
                <div className="space-y-1.5">
                  {[
                    { label: 'Savings Rate', value: Math.round(healthScore.savingsRate), max: 100, color: '#10b981' },
                    { label: 'Education Focus', value: Math.round(healthScore.educationRatio), max: 100, color: '#6366f1' },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span className="text-slate-500 dark:text-slate-400">{s.label}</span>
                        <span className="text-slate-600 dark:text-slate-300 font-medium">{s.value}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: s.color, width: `${Math.min(s.value, 100)}%` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(s.value, 100)}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card dark:glass-dark rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Next Fee Due</h3>
            </div>
            <p className="text-2xl font-bold text-amber-500 font-mono">{daysUntilFee} days</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{nextFeeDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
            <div className="mt-3 p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10">
              <p className="text-[10px] text-amber-600 dark:text-amber-400">Plan ahead for next tuition payment</p>
            </div>
          </div>

          <div className="glass-card dark:glass-dark rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Pocket Money Left</h3>
            </div>
            <p className={`text-2xl font-bold font-mono ${pocketMoneyRemaining >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {formatCurrency(currency, Math.max(0, pocketMoneyRemaining))}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">After essentials</p>
            <div className="mt-3 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Keep track of daily expenses</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemAnim} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="lg:col-span-2 glass-card dark:glass-dark rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Monthly Income Breakdown
              </h3>
            </div>
            <div className="space-y-2.5">
              {activeIncomeCats.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No income recorded this month</p>
              ) : activeIncomeCats.map((cat, i) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-base w-6 text-center flex-shrink-0">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-300">{cat.name}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-medium">{formatCurrency(currency, cat.amount)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: cat.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(cat.amount / totalStudentIncome) * 100}%` }}
                        transition={{ duration: 0.8, delay: i * 0.05 }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 glass-card dark:glass-dark rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-500" />
                Expense Breakdown
              </h3>
            </div>
            <div className="space-y-2.5">
              {activeExpenseCats.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No expenses recorded this month</p>
              ) : activeExpenseCats.sort((a, b) => b.amount - a.amount).map((cat, i) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-base w-6 text-center flex-shrink-0">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-300">{cat.name}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-medium">{formatCurrency(currency, cat.amount)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: cat.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(cat.amount / totalStudentExpenses) * 100}%` }}
                        transition={{ duration: 0.8, delay: i * 0.04 }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemAnim} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="lg:col-span-2 glass-card dark:glass-dark rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <PiggyBank className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Semester Budget Planner</h3>
              <span className="text-[10px] text-slate-400 ml-auto">{semester.label}</span>
            </div>
            {budget['semester'] ? (
              <div className="space-y-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400">Spent: {formatCurrency(currency, semesterBudget.totalSpent)}</span>
                  <span className="text-slate-500 dark:text-slate-400">Budget: {formatCurrency(currency, budget['semester'])}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${semesterBudget.percentUsed > 90 ? 'bg-red-500' : semesterBudget.percentUsed > 70 ? 'bg-amber-500' : 'bg-primary'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(semesterBudget.percentUsed, 100)}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5">
                    <span className="text-slate-400">Remaining</span>
                    <p className="font-bold text-slate-700 dark:text-slate-200">{formatCurrency(currency, semesterBudget.remaining)}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5">
                    <span className="text-slate-400">Predicted End</span>
                    <p className="font-bold text-slate-700 dark:text-slate-200">{formatCurrency(currency, semesterBudget.predictedTotal)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-slate-400 mb-2">Set your semester budget in the Budget section</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 glass-card dark:glass-dark rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Study Expense Analytics</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 border border-indigo-200 dark:border-indigo-500/20">
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">Education</p>
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 font-mono">{formatCurrency(currency, educationTotal)}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-500/10 dark:to-red-500/10 border border-orange-200 dark:border-orange-500/20">
                <p className="text-[10px] text-orange-600 dark:text-orange-400 font-medium">Entertainment</p>
                <p className="text-lg font-bold text-orange-600 dark:text-orange-400 font-mono">{formatCurrency(currency, entertainmentTotal)}</p>
              </div>
            </div>
            {totalStudentExpenses > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden flex">
                  <motion.div
                    className="h-full rounded-l-full"
                    style={{ backgroundColor: '#6366f1', width: `${(educationTotal / totalStudentExpenses) * 100}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(educationTotal / totalStudentExpenses) * 100}%` }}
                    transition={{ duration: 1 }}
                  />
                  <motion.div
                    className="h-full rounded-r-full"
                    style={{ backgroundColor: '#f97316', width: `${(entertainmentTotal / totalStudentExpenses) * 100}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(entertainmentTotal / totalStudentExpenses) * 100}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
                <div className="flex gap-2 text-[10px] flex-shrink-0">
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Edu</div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500" /> Fun</div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemAnim} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="lg:col-span-2">
            <StudentSavings />
          </div>
          <div className="lg:col-span-2">
            <div className="glass-card dark:glass-dark rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-[10px] font-bold">💡</div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Smart Insights</h3>
              </div>
              <div className="space-y-2">
                {insights.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">Add transactions to see insights</p>
                ) : insights.map((insight, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl ${
                      insight.type === 'danger' ? 'bg-red-50 dark:bg-red-500/10' :
                      insight.type === 'warning' ? 'bg-amber-50 dark:bg-amber-500/10' :
                      insight.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10' :
                      'bg-slate-50 dark:bg-white/5'
                    }`}
                  >
                    <span className="text-base flex-shrink-0">{insight.icon}</span>
                    <div>
                      <p className={`text-xs font-semibold ${
                        insight.type === 'danger' ? 'text-red-600 dark:text-red-400' :
                        insight.type === 'warning' ? 'text-amber-600 dark:text-amber-400' :
                        insight.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' :
                        'text-slate-600 dark:text-slate-300'
                      }`}>{insight.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{insight.message}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <QuickAddButton onClick={() => setShowQuickAdd(true)} />
      <AIAssistant />

      <Modal
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        title="Add Student Transaction"
        footer={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowQuickAdd(false)}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="student-add-form"
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
            >
              Add Transaction
            </button>
          </div>
        }
      >
        <TransactionForm
          id="student-add-form"
          onSubmit={(data) => {
            addTransaction(data);
            setShowQuickAdd(false);
          }}
          onCancel={() => setShowQuickAdd(false)}
        />
      </Modal>
    </div>
  );
}
