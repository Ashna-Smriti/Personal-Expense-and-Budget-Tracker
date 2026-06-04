import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, calculateFinancialHealth } from '../../utils/helpers';
import StatsCard from './StatsCard';
import RecentTransactions from './RecentTransactions';
import BudgetProgress from './BudgetProgress';
import AIInsightsWidget from './AIInsightsWidget';
import HealthScoreCard from '../Insights/HealthScoreCard';
import PredictionsCard from '../Insights/PredictionsCard';
import Modal from '../Common/Modal';
import ReceiptScanner from '../Scanner/ReceiptScanner';
import VoiceEntry from '../Voice/VoiceEntry';

export default function Dashboard() {
  const { totalIncome, totalExpenses, monthlyExpenses, monthlyIncome, currentBudget, currency, transactions, predictions } = useApp();
  const balance = totalIncome - totalExpenses;
  const { score, label, color } = calculateFinancialHealth(monthlyIncome, monthlyExpenses, currentBudget);
  const [showScanner, setShowScanner] = useState(false);
  const [showVoice, setShowVoice] = useState(false);

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowVoice(true)}
            className="px-3 py-1.5 text-xs font-medium text-white bg-primary/80 hover:bg-primary rounded-lg transition-colors flex items-center gap-1.5">
            🎤 Voice
          </button>
          <button onClick={() => setShowScanner(true)}
            className="px-3 py-1.5 text-xs font-medium text-white bg-primary/80 hover:bg-primary rounded-lg transition-colors flex items-center gap-1.5">
            📄 Scan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard title="Total Income" value={formatCurrency(currency, totalIncome)} icon="💰" color="#10b981" />
        <StatsCard title="Total Expenses" value={formatCurrency(currency, totalExpenses)} icon="💳" color="#ef4444" />
        <StatsCard title="Remaining Balance" value={formatCurrency(currency, balance)} icon="🏦" color={balance >= 0 ? '#6366f1' : '#ef4444'} />
        <StatsCard title="Financial Health" value={label} icon="📈" color={color} subtitle={`Score: ${score}/100`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2">
          <AIInsightsWidget compact />
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800 shadow-sm">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">📊 Predicted Month End</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(currency, predictions.predictedEndOfMonth)}</p>
          <p className="text-xs text-emerald-500 dark:text-emerald-500 mt-1">
            {predictions.daysLeft > 0
              ? `${predictions.daysLeft} days left · ${formatCurrency(currency, predictions.dailyAverage)}/day avg`
              : 'Month ending'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>
        <div className="space-y-3">
          <BudgetProgress />
        </div>
      </div>

      <Modal isOpen={showScanner} onClose={() => setShowScanner(false)} title="Scan Receipt">
        <ReceiptScanner onClose={() => setShowScanner(false)} />
      </Modal>
      <Modal isOpen={showVoice} onClose={() => setShowVoice(false)} title="Voice Entry">
        <VoiceEntry onClose={() => setShowVoice(false)} />
      </Modal>
    </div>
  );
}
