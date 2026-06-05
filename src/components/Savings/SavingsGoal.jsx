import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/helpers';
import Modal from '../Common/Modal';
import ConfirmDialog from '../Common/ConfirmDialog';
import EmptyState from '../Common/EmptyState';

function GoalForm({ onSubmit, onCancel, initialData, id }) {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    target: initialData?.target || '',
    saved: initialData?.saved || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.target) return;
    onSubmit({
      name: form.name,
      target: parseFloat(form.target),
      saved: parseFloat(form.saved) || 0,
    });
  };

  return (
    <form id={id} onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Goal Name</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., New Laptop"
          className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Amount</label>
        <input
          type="number"
          step="0.01"
          min="0"
          required
          value={form.target}
          onChange={(e) => setForm((prev) => ({ ...prev, target: e.target.value }))}
          placeholder="0.00"
          className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Already Saved</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={form.saved}
          onChange={(e) => setForm((prev) => ({ ...prev, saved: e.target.value }))}
          placeholder="0.00"
          className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
        />
      </div>
    </form>
  );
}

export default function SavingsGoals() {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, currency } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [addAmount, setAddAmount] = useState({});

  const handleSubmit = (data) => {
    if (editing) {
      updateSavingsGoal(editing.id, data);
    } else {
      addSavingsGoal(data);
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleAddSaved = (id, currentSaved, amount) => {
    updateSavingsGoal(id, { saved: currentSaved + parseFloat(amount) });
    setAddAmount((prev) => ({ ...prev, [id]: '' }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Savings Goals</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track your savings targets</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
        >
          + New Goal
        </button>
      </div>

      {savingsGoals.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <EmptyState icon="🎯" title="No savings goals" description="Create your first savings goal to start tracking" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savingsGoals.map((goal) => {
            const percent = Math.min((goal.saved / goal.target) * 100, 100);
            const remaining = goal.target - goal.saved;
            return (
              <div key={goal.id} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm card-hover">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-white">{goal.name}</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Target: {formatCurrency(currency, goal.target)}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(goal); setShowForm(true); }} className="p-1.5 rounded-md text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => setDeleteId(goal.id)} className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${percent >= 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-slate-500 dark:text-slate-400">{formatCurrency(currency, goal.saved)} saved</span>
                  <span className={`font-medium ${percent >= 100 ? 'text-emerald-500' : 'text-primary'}`}>{percent.toFixed(1)}%</span>
                </div>
                {percent < 100 && (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={addAmount[goal.id] || ''}
                      onChange={(e) => setAddAmount((prev) => ({ ...prev, [goal.id]: e.target.value }))}
                      placeholder="Add amount"
                      className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                    />
                    <button
                      onClick={() => {
                        const amt = addAmount[goal.id];
                        if (amt && parseFloat(amt) > 0) handleAddSaved(goal.id, goal.saved, amt);
                      }}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                )}
                {percent >= 100 && (
                  <p className="text-xs text-emerald-500 font-medium bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg text-center">🎉 Goal achieved!</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? 'Edit Goal' : 'New Savings Goal'}
        footer={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditing(null); }}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="goal-form"
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
            >
              {editing ? 'Update' : 'Create'} Goal
            </button>
          </div>
        }
      >
        <GoalForm id="goal-form" onSubmit={handleSubmit} onCancel={() => { setShowForm(false); setEditing(null); }} initialData={editing} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onConfirm={() => { deleteSavingsGoal(deleteId); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
        title="Delete Goal"
        message="Are you sure you want to delete this savings goal?"
      />
    </div>
  );
}
