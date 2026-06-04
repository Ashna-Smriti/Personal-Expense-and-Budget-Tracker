import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import TransactionItem from '../Transactions/TransactionItem';
import TransactionForm from '../Transactions/TransactionForm';
import Modal from '../Common/Modal';
import ConfirmDialog from '../Common/ConfirmDialog';
import EmptyState from '../Common/EmptyState';

export default function RecentTransactions() {
  const { transactions, updateTransaction, deleteTransaction } = useApp();
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const recent = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  const handleEdit = (t) => setEditing(t);
  const handleSubmit = (data) => {
    updateTransaction(editing.id, data);
    setEditing(null);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-slate-800 dark:text-white">Recent Transactions</h3>
      </div>
      <div className="p-2">
        {recent.length === 0 ? (
          <EmptyState icon="📄" title="No transactions yet" description="Your recent transactions will appear here" />
        ) : (
          recent.map((t) => (
            <TransactionItem key={t.id} transaction={t} onEdit={handleEdit} onDelete={(id) => setDeleteId(id)} />
          ))
        )}
      </div>
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Edit Transaction">
        <TransactionForm onSubmit={handleSubmit} onCancel={() => setEditing(null)} initialData={editing} />
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
