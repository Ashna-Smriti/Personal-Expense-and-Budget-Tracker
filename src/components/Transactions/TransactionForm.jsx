import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../utils/constants';
import { getCurrencySymbol } from '../../utils/helpers';
import MoodSelector from '../Common/MoodSelector';

export default function TransactionForm({ onSubmit, onCancel, initialData }) {
  const { currency } = useApp();
  const [form, setForm] = useState({
    type: 'Expense',
    amount: '',
    category: 'Food',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    mood: '',
  });

  const categories = form.type === 'Expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  useEffect(() => {
    if (initialData) {
      setForm({
        type: initialData.type,
        amount: initialData.amount,
        category: initialData.category || (initialData.type === 'Expense' ? 'Food' : 'Salary'),
        description: initialData.description,
        date: initialData.date.slice(0, 10),
        mood: initialData.mood || '',
      });
    }
  }, [initialData]);

  const handleTypeChange = (type) => {
    const defaultCat = type === 'Expense' ? 'Food' : 'Salary';
    setForm((prev) => ({ ...prev, type, category: defaultCat }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || !form.description || !form.date) return;
    onSubmit({
      ...form,
      amount: parseFloat(form.amount),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
        {['Expense', 'Income'].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => handleTypeChange(type)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              form.type === type
                ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{getCurrencySymbol(currency)}</span>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={form.amount}
            onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, category: cat.name }))}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all ${
                form.category === cat.name
                  ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary'
                  : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500'
              }`}
            >
              <span className="text-lg">{cat.icon}</span>
              <span className="font-medium">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
        <input
          type="text"
          required
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Enter description..."
          className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
        <input
          type="date"
          required
          value={form.date}
          onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
          className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-colors"
        />
      </div>

      <MoodSelector selected={form.mood} onSelect={(mood) => setForm((prev) => ({ ...prev, mood }))} />

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
        >
          {initialData ? 'Update' : 'Add'} Transaction
        </button>
      </div>
    </form>
  );
}
