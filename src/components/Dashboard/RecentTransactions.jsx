import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { ALL_CATEGORIES } from '../../utils/constants';
import TransactionForm from '../Transactions/TransactionForm';
import Modal from '../Common/Modal';
import ConfirmDialog from '../Common/ConfirmDialog';
import EmptyState from '../Common/EmptyState';
import { ArrowUpRight, ArrowDownRight, Pencil, Trash2 } from 'lucide-react';

function TransactionItem({ transaction, onEdit, onDelete }) {
  const { currency } = useApp();
  const cat = ALL_CATEGORIES.find((c) => c.name === transaction.category);
  const isExpense = transaction.type === 'Expense';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all duration-200 group"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0 shadow-sm"
        style={{ backgroundColor: isExpense ? `${cat?.color}15` : '#10b98115' }}
      >
        {isExpense ? <ArrowDownRight className="w-4 h-4" style={{ color: cat?.color || '#ef4444' }} /> : <ArrowUpRight className="w-4 h-4 text-emerald-500" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-slate-700 dark:text-slate-200 truncate">{transaction.description}</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          {cat?.icon} {cat?.name || transaction.category} &middot; {formatDate(transaction.date)}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`font-bold text-sm font-mono ${isExpense ? 'text-red-500' : 'text-emerald-500'}`}>
          {isExpense ? '-' : '+'}{formatCurrency(currency, transaction.amount)}
        </p>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(transaction)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(transaction.id)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

export default function RecentTransactions() {
  const { transactions, updateTransaction, deleteTransaction } = useApp();
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const recent = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <div className="glass-card dark:glass-dark rounded-2xl overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-200/30 dark:border-white/5">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">Recent Transactions</h3>
      </div>
      <div className="p-2">
        {recent.length === 0 ? (
          <EmptyState icon="📄" title="No transactions yet" description="Your recent transactions will appear here" />
        ) : (
          recent.map((t) => (
            <TransactionItem key={t.id} transaction={t} onEdit={setEditing} onDelete={(id) => setDeleteId(id)} />
          ))
        )}
      </div>
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Edit Transaction">
        <TransactionForm onSubmit={(data) => { updateTransaction(editing.id, data); setEditing(null); }} onCancel={() => setEditing(null)} initialData={editing} />
      </Modal>
      <ConfirmDialog
        isOpen={!!deleteId}
        onConfirm={() => { deleteTransaction(deleteId); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction?"
      />
    </div>
  );
}
