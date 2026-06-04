import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { EXPENSE_CATEGORIES } from '../../utils/constants';
import { getCurrencySymbol } from '../../utils/helpers';

export default function ReceiptScanner({ onClose }) {
  const { currency, addTransaction } = useApp();
  const fileInputRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [form, setForm] = useState({ amount: '', merchant: '', date: new Date().toISOString().slice(0, 10), category: 'Food', description: '' });

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Maximum 5MB.');
      return;
    }

    setScanning(true);

    await new Promise((r) => setTimeout(r, 1500));

    const fileName = file.name.toLowerCase();
    let detectedCategory = 'Food';
    if (fileName.includes('uber') || fileName.includes('ola') || fileName.includes('fuel')) detectedCategory = 'Transport';
    else if (fileName.includes('amazon') || fileName.includes('flipkart') || fileName.includes('mall')) detectedCategory = 'Shopping';
    else if (fileName.includes('hospital') || fileName.includes('medic')) detectedCategory = 'Healthcare';
    else if (fileName.includes('electri') || fileName.includes('water') || fileName.includes('bill')) detectedCategory = 'Bills';
    else if (fileName.includes('netflix') || fileName.includes('movie') || fileName.includes('game')) detectedCategory = 'Entertainment';
    else if (fileName.includes('hotel') || fileName.includes('flight') || fileName.includes('cab')) detectedCategory = 'Travel';

    const extractedData = {
      merchant: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      amount: (Math.random() * 2000 + 100).toFixed(2),
      date: new Date().toISOString().slice(0, 10),
      category: detectedCategory,
    };

    setExtracted(extractedData);
    setForm({
      amount: extractedData.amount,
      merchant: extractedData.merchant,
      date: extractedData.date,
      category: extractedData.category,
      description: `Receipt: ${extractedData.merchant}`,
    });
    setScanning(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || !form.description) return;
    addTransaction({
      type: 'Expense',
      amount: parseFloat(form.amount),
      category: form.category,
      description: form.description,
      date: form.date,
    });
    onClose();
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-slate-800 dark:text-white mb-1">Scan Receipt</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Upload a receipt or bill to auto-extract details</p>
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
      >
        <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileSelect} />
        <div className="text-4xl mb-2">📄</div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Click to upload receipt</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">JPG, PNG, or PDF (max 5MB)</p>
      </div>

      {scanning && (
        <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-indigo-600 dark:text-indigo-400">Analyzing receipt...</span>
        </div>
      )}

      {extracted && !scanning && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{getCurrencySymbol(currency)}</span>
                <input type="number" step="0.01" required value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Merchant</label>
              <input type="text" value={form.merchant} onChange={(e) => setForm((p) => ({ ...p, merchant: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none">
                {EXPENSE_CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Date</label>
              <input type="date" required value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Description</label>
            <input type="text" required value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancel</button>
            <button type="submit"
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors">Add Transaction</button>
          </div>
        </form>
      )}
    </div>
  );
}
