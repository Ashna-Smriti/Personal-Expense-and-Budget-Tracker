import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/helpers';
import StatsCard from '../Dashboard/StatsCard';
import TransactionList from './TransactionList';
import QuickActions from '../Common/QuickActions';
import Modal from '../Common/Modal';
import VoiceEntry from '../Voice/VoiceEntry';
import ReceiptScanner from '../Scanner/ReceiptScanner';

export default function TransactionsPage() {
  const { totalIncome, totalExpenses, currency } = useApp();
  const balance = totalIncome - totalExpenses;
  const [showVoice, setShowVoice] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

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

      <QuickActions
        onVoice={() => setShowVoice(true)}
        onScan={() => setShowScanner(true)}
      />

      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
        <TransactionList />
      </div>

      <Modal isOpen={showVoice} onClose={() => setShowVoice(false)} title="Voice Entry">
        <VoiceEntry onClose={() => setShowVoice(false)} />
      </Modal>
      <Modal isOpen={showScanner} onClose={() => setShowScanner(false)} title="Scan Receipt">
        <ReceiptScanner onClose={() => setShowScanner(false)} />
      </Modal>
    </div>
  );
}
