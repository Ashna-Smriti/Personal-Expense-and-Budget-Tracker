import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { formatCurrency, calculateFinancialHealth } from '../../utils/helpers';
import { EXPENSE_CATEGORIES } from '../../utils/constants';
import StatsCard from './StatsCard';
import RecentTransactions from './RecentTransactions';
import BudgetProgress from './BudgetProgress';
import AIInsightsWidget from './AIInsightsWidget';
import UpcomingBills from './UpcomingBills';
import Modal from '../Common/Modal';
import TransactionForm from '../Transactions/TransactionForm';
import ReceiptScanner from '../Scanner/ReceiptScanner';
import VoiceEntry from '../Voice/VoiceEntry';
import QuickAddButton from '../Premium/QuickAddButton';
import AIAssistant from '../Premium/AIAssistant';
import ConfettiEffect from '../Premium/ConfettiEffect';
import QuickActions from '../Common/QuickActions';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const {
    monthlyExpenses, monthlyIncome, monthlySavings,
    currentBudget, currency, transactions, streak, userLevel,
    dailyQuote, greeting, todaySpending, weekSpending, effectiveXp,
    addTransaction,
  } = useApp();

  const { score, label, color } = calculateFinancialHealth(monthlyIncome, monthlyExpenses, currentBudget);
  const userName = 'Ashna';

  const [showScanner, setShowScanner] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);

  const spendingByCategory = useMemo(() => {
    const map = {};
    transactions.filter(t => t.type === 'Expense')
      .forEach(t => {
        map[t.category] = (map[t.category] || 0) + Number(t.amount);
      });
    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        value,
        color: EXPENSE_CATEGORIES.find(c => c.name === name)?.color || '#64748b',
        icon: EXPENSE_CATEGORIES.find(c => c.name === name)?.icon || '📌',
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const xpProgress = userLevel.nextMin
    ? ((effectiveXp - userLevel.min) / (userLevel.nextMin - userLevel.min)) * 100
    : 100;

  return (
    <div className="w-full">
      <ConfettiEffect active={showConfetti} />

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 sm:space-y-6">

        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white"
            >
              {greeting}, {userName} <span className="inline-block">👋</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-slate-400 dark:text-slate-500 mt-1"
            >
              {monthlySavings > 0
                ? `You saved ${formatCurrency(currency, monthlySavings)} this month 🎉`
                : monthlySavings < 0
                  ? `You're ${formatCurrency(currency, Math.abs(monthlySavings))} over this month`
                  : 'Track your expenses to stay on budget'}
            </motion.p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
              <span className="text-sm">{userLevel.icon}</span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{userLevel.level}</span>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-500/10 dark:to-red-500/10 border border-orange-200 dark:border-orange-500/20">
                <span className="text-sm">🔥</span>
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400">{streak} day streak</span>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={item} className="flex justify-start">
          <QuickActions
            onVoice={() => setShowVoice(true)}
            onScan={() => setShowScanner(true)}
          />
        </motion.div>

        <motion.div variants={item} className="glass-card dark:glass-dark rounded-2xl p-3 px-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-sm">{userLevel.icon}</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{userLevel.level}</span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {effectiveXp} XP {userLevel.nextMin ? `/ ${userLevel.nextMin} XP` : '— MAX LEVEL'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: userLevel.color }}
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatsCard
            title="Today's Spending"
            value={formatCurrency(currency, todaySpending)}
            icon="📊"
            color="#6366f1"
          />
          <StatsCard
            title="This Week"
            value={formatCurrency(currency, weekSpending)}
            icon="📈"
            color="#10b981"
          />
          <StatsCard
            title="Monthly Savings"
            value={formatCurrency(currency, monthlySavings)}
            icon="💰"
            color={monthlySavings >= 0 ? '#10b981' : '#ef4444'}
          />
          <StatsCard
            title="Financial Health"
            value={label}
            icon="💎"
            color={color}
            subtitle={`Score: ${score}/100`}
          />
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="lg:col-span-3">
            <div className="glass-card dark:glass-dark rounded-2xl p-4 sm:p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">💡</div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Daily Inspiration</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 italic">"{dailyQuote.text}"</p>
                  {dailyQuote.author && (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">— {dailyQuote.author}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="glass-card dark:glass-dark rounded-2xl p-4 sm:p-5 flex items-center gap-3 gradient-border">
            <div className="relative">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-200 dark:text-slate-700" />
                <motion.circle
                  cx="18" cy="18" r="15.5" fill="none"
                  stroke={color} strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={`${score * 0.97} 97`}
                  initial={{ strokeDasharray: '0 97' }}
                  animate={{ strokeDasharray: `${score * 0.97} 97` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold" style={{ color }}>{score}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Health Score</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200" style={{ color }}>{label}</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="lg:col-span-2 glass-card dark:glass-dark rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Spending by Category</h3>
              <span className="text-[10px] text-slate-400">Top categories</span>
            </div>
            <div className="space-y-2.5">
              {spendingByCategory.slice(0, 5).map((cat, i) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-base w-6 text-center flex-shrink-0">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-300">{cat.name}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-medium">{formatCurrency(currency, cat.value)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: cat.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(cat.value / spendingByCategory[0].value) * 100}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
              {spendingByCategory.length === 0 && (
                <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">No spending data yet</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="glass-card dark:glass-dark rounded-2xl p-4 sm:p-5 h-full">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Income vs Expenses</h3>
              <div className="flex items-center justify-center h-32">
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-200 dark:text-emerald-900" />
                    <motion.circle
                      cx="18" cy="18" r="15.5" fill="none"
                      stroke="#10b981" strokeWidth="2.5"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: '0 97' }}
                      animate={{ strokeDasharray: `${monthlyIncome > 0 ? 97 : 0} 97` }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                    <motion.circle
                      cx="18" cy="18" r="12.5" fill="none"
                      stroke="#ef4444" strokeWidth="2.5"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: '0 78.5' }}
                      animate={{ strokeDasharray: `${monthlyExpenses > 0 ? 78.5 : 0} 78.5` }}
                      transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-emerald-500">₹</span>
                    <span className="text-[10px] text-slate-400">Income</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-4 text-xs mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-500 dark:text-slate-400">Income</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-slate-500 dark:text-slate-400">Expenses</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <BudgetProgress />
          </div>
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="lg:col-span-2">
            <RecentTransactions />
          </div>
          <div className="space-y-3">
            <UpcomingBills />
            <AIInsightsWidget compact />
          </div>
        </motion.div>
      </motion.div>

      <QuickAddButton
        onClick={() => setShowQuickAdd(true)}
        onVoice={() => setShowVoice(true)}
        onScan={() => setShowScanner(true)}
        onAssistant={() => setShowAssistant(true)}
      />
      <AIAssistant open={showAssistant} onClose={() => setShowAssistant(false)} />

      <Modal isOpen={showQuickAdd} onClose={() => setShowQuickAdd(false)} title="Add Transaction">
        <TransactionForm
          onSubmit={(data) => {
            addTransaction(data);
            setShowQuickAdd(false);
          }}
          onCancel={() => setShowQuickAdd(false)}
        />
      </Modal>
      <Modal isOpen={showScanner} onClose={() => setShowScanner(false)} title="Scan Receipt">
        <ReceiptScanner onClose={() => setShowScanner(false)} />
      </Modal>
      <Modal isOpen={showVoice} onClose={() => setShowVoice(false)} title="Voice Entry">
        <VoiceEntry onClose={() => setShowVoice(false)} />
      </Modal>
    </div>
  );
}
