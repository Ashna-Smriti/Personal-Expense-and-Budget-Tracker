import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { filterTransactions, formatCurrency, formatDate } from '../../utils/helpers';
import { ALL_CATEGORIES } from '../../utils/constants';
import TransactionForm from './TransactionForm';
import Filters from '../Filters/Filters';
import Modal from '../Common/Modal';
import ConfirmDialog from '../Common/ConfirmDialog';
import EmptyState from '../Common/EmptyState';
import FloatingButton from '../Common/FloatingButton';

export default function TransactionList() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, currency } = useApp();
  const [filters, setFilters] = useState({ month: '', category: '', startDate: '', endDate: '', search: '' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const filtered = useMemo(() => filterTransactions(transactions, filters), [transactions, filters]);

  const handleSubmit = (data) => {
    if (editing) {
      updateTransaction(editing.id, data);
    } else {
      addTransaction(data);
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleEdit = (t) => {
    setEditing(t);
    setShowForm(true);
  };

  const handleDelete = () => {
    deleteTransaction(deleteId);
    setDeleteId(null);
  };

  const sorted = useMemo(() => [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date)), [filtered]);

  return (
    <div>
      <div className="mb-4">
        <Filters filters={filters} setFilters={setFilters} />
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon="📊"
          title="No transactions found"
          description={transactions.length === 0 ? 'Click the + button to add your first transaction' : 'Try adjusting your filters'}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <th className="text-left p-3 font-medium text-slate-500 dark:text-slate-400">Date</th>
                <th className="text-left p-3 font-medium text-slate-500 dark:text-slate-400">Type</th>
                <th className="text-left p-3 font-medium text-slate-500 dark:text-slate-400">Category</th>
                <th className="text-left p-3 font-medium text-slate-500 dark:text-slate-400">Description</th>
                <th className="text-right p-3 font-medium text-slate-500 dark:text-slate-400">Amount</th>
                <th className="text-center p-3 font-medium text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {sorted.map((t) => {
                const cat = ALL_CATEGORIES.find((c) => c.name === t.category);
                const isExpense = t.type === 'Expense';
                return (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">{formatDate(t.date)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        isExpense ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      <span className="mr-1">{cat?.icon || '📌'}</span>
                      {t.category}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300 max-w-[200px] truncate">{t.description}</td>
                    <td className={`p-3 text-right font-medium whitespace-nowrap ${isExpense ? 'text-red-500' : 'text-emerald-500'}`}>
                      {isExpense ? '-' : '+'}{formatCurrency(currency, t.amount)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEdit(t)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteId(t.id)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <FloatingButton onClick={() => { setEditing(null); setShowForm(true); }} />

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditing(null); }} title={editing ? 'Edit Transaction' : 'Add Transaction'}>
        <TransactionForm
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditing(null); }}
          initialData={editing}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
      />
    </div>
  );
}
