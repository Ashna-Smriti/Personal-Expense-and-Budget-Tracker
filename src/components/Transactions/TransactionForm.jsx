import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../utils/constants';
import { getCurrencySymbol } from '../../utils/helpers';
import MoodSelector from '../Common/MoodSelector';

const SPEECH_INCOME_KEYWORDS = ['received', 'got', 'earned', 'salary', 'stipend', 'scholarship', 'income', 'refund', 'bonus', 'freelancing', 'pocket money'];
const SPEECH_EXPENSE_KEYWORDS = ['spent', 'paid', 'bought', 'purchased', 'ordered', 'invested', 'gave', 'donated'];

function parseVoiceText(text, categories) {
  const result = { description: text, amount: '', category: '', type: null };
  const amountMatch = text.match(/[\d,.]+/);
  if (amountMatch) result.amount = amountMatch[0].replace(/,/g, '');

  const lower = text.toLowerCase();
  const hasIncome = SPEECH_INCOME_KEYWORDS.some(kw => lower.includes(kw));
  const hasExpense = SPEECH_EXPENSE_KEYWORDS.some(kw => lower.includes(kw));
  if (hasIncome && !hasExpense) {
    result.type = 'Income';
  } else if (hasExpense && !hasIncome) {
    result.type = 'Expense';
  }

  for (const cat of categories) {
    if (lower.includes(cat.name.toLowerCase())) {
      result.category = cat.name;
      break;
    }
  }
  const cleaned = text.replace(/spent\s+|paid\s+|used\s+|cost\s+|\d[\d,.]*/g, '').replace(/\s+/g, ' ').trim();
  if (cleaned) result.description = cleaned;
  return result;
}

export default function TransactionForm({ onSubmit, onCancel, initialData, id }) {
  const { currency } = useApp();
  const [listening, setListening] = useState(false);
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
    <form id={id} onSubmit={handleSubmit} className="space-y-4">
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
        <div className="relative">
          <input
            type="text"
            required
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Enter description or use voice input..."
            className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-colors pr-12"
          />
          {(() => { const sr = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition); return sr; })() && (
            <button
              type="button"
              onClick={() => {
                if (listening) return;
                const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
                if (!SR) return;
                const recognition = new SR();
                recognition.lang = 'en-US';
                recognition.interimResults = false;
                setListening(true);
                recognition.onresult = (event) => {
                  const transcript = event.results[0][0].transcript;
                  const catList = form.type === 'Expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
                  const parsed = parseVoiceText(transcript, catList);
                  setForm((prev) => ({
                    ...prev,
                    description: parsed.description || prev.description,
                    amount: parsed.amount || prev.amount,
                    category: parsed.category || prev.category,
                    type: parsed.type || prev.type,
                  }));
                  setListening(false);
                };
                recognition.onerror = () => setListening(false);
                recognition.onend = () => setListening(false);
                recognition.start();
              }}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                listening
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-500 animate-pulse'
                  : 'text-slate-400 hover:text-primary hover:bg-primary/10'
              }`}
              title="Voice input"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          )}
        </div>
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
    </form>
  );
}
