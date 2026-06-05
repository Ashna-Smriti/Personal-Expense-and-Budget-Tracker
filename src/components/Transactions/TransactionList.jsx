import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { filterTransactions, formatCurrency, formatDate } from '../../utils/helpers';
import { ALL_CATEGORIES } from '../../utils/constants';
import TransactionForm from './TransactionForm';
import Filters from '../Filters/Filters';
import Modal from '../Common/Modal';
import ConfirmDialog from '../Common/ConfirmDialog';
import EmptyState from '../Common/EmptyState';
import FloatingButton from '../Common/FloatingButton';
import { X } from 'lucide-react';

export default function TransactionList() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, currency } = useApp();
  const [filters, setFilters] = useState({ month: '', category: '', startDate: '', endDate: '', search: '' });
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const filtered = useMemo(() => {
    let f = filterTransactions(transactions, filters);
    if (amountMin) f = f.filter((t) => Number(t.amount) >= Number(amountMin));
    if (amountMax) f = f.filter((t) => Number(t.amount) <= Number(amountMax));
    return f;
  }, [transactions, filters, amountMin, amountMax]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const [field, dir] = sortBy.split('-');
    const mul = dir === 'asc' ? 1 : -1;
    if (field === 'date') arr.sort((a, b) => mul * (new Date(b.date) - new Date(a.date)));
    else if (field === 'amount') arr.sort((a, b) => mul * (Number(b.amount) - Number(a.amount)));
    else if (field === 'category') arr.sort((a, b) => mul * (a.category || '').localeCompare(b.category || ''));
    return arr;
  }, [filtered, sortBy]);

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

  const clearFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: '' }));
  };

  const activeChips = [];
  if (filters.month) activeChips.push({ key: 'month', label: `Month: ${filters.month}` });
  if (filters.category) activeChips.push({ key: 'category', label: `Category: ${filters.category}` });
  if (filters.startDate) activeChips.push({ key: 'startDate', label: `From: ${filters.startDate}` });
  if (filters.endDate) activeChips.push({ key: 'endDate', label: `To: ${filters.endDate}` });
  if (filters.search) activeChips.push({ key: 'search', label: `"${filters.search}"` });
  if (amountMin) activeChips.push({ key: 'amountMin', label: `Min: ${amountMin}` });
  if (amountMax) activeChips.push({ key: 'amountMax', label: `Max: ${amountMax}` });

  return (
    <div>
      <div className="space-y-3 mb-4">
        <Filters filters={filters} setFilters={setFilters} />

        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Min Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amountMin}
              onChange={(e) => setAmountMin(e.target.value)}
              placeholder="Min"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-colors"
            />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Max Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amountMax}
              onChange={(e) => setAmountMax(e.target.value)}
              placeholder="Max"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-colors"
            />
          </div>
          <div className="flex-1 min-w-[130px]">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-colors"
            >
              <option value="date-desc">Date ↓</option>
              <option value="date-asc">Date ↑</option>
              <option value="amount-desc">Amount ↓</option>
              <option value="amount-asc">Amount ↑</option>
              <option value="category-asc">Category A-Z</option>
              <option value="category-desc">Category Z-A</option>
            </select>
          </div>
        </div>

        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary dark:bg-primary/20"
              >
                {chip.label}
                <button onClick={() => {
                  if (chip.key === 'amountMin') setAmountMin('');
                  else if (chip.key === 'amountMax') setAmountMax('');
                  else clearFilter(chip.key);
                }} className="hover:text-primary-dark transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
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
              {sorted.map((t, idx) => {
                const cat = ALL_CATEGORIES.find((c) => c.name === t.category);
                const isExpense = t.type === 'Expense';
                return (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
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
                  </motion.tr>
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
