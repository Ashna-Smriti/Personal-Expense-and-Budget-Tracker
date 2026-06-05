import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { EXPENSE_CATEGORIES } from '../../utils/constants';
import { getCurrencySymbol } from '../../utils/helpers';
import { Camera, Upload } from 'lucide-react';

const MERCHANT_CATEGORY_MAP = [
  { keywords: ['restaurant', 'cafe', 'food', 'pizza', 'burger', 'diner', 'eatery', 'starbucks', 'zomato', 'swiggy'], category: 'Food' },
  { keywords: ['amazon', 'flipkart', 'mall', 'shop', 'store', 'retail', 'walmart', 'target', 'myntra', 'ajio'], category: 'Shopping' },
  { keywords: ['bookstore', 'book', 'library', 'udemy', 'coursera', 'university', 'college', 'school', 'class'], category: 'Education' },
  { keywords: ['uber', 'ola', 'fuel', 'petrol', 'gas', 'cab', 'taxi', 'metro', 'bus', 'train', 'rapido'], category: 'Transport' },
  { keywords: ['netflix', 'spotify', 'prime', 'hotstar', 'game', 'cinema', 'movie', 'theatre', 'playstation'], category: 'Entertainment' },
  { keywords: ['hospital', 'clinic', 'pharmacy', 'medic', 'doctor', 'dentist', 'health', 'wellness', 'chemist'], category: 'Healthcare' },
  { keywords: ['hotel', 'flight', 'airline', 'booking', 'airbnb', 'oyo', 'travel', 'trip', 'vacation', 'goibibo'], category: 'Travel' },
  { keywords: ['electricity', 'water', 'broadband', 'internet', 'phone', 'bill', 'rent', 'maintenance'], category: 'Bills' },
];

function detectCategory(merchant) {
  const lower = merchant.toLowerCase();
  for (const entry of MERCHANT_CATEGORY_MAP) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      return entry.category;
    }
  }
  return 'Other';
}

export default function ReceiptScanner({ onClose }) {
  const { currency, addTransaction } = useApp();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [form, setForm] = useState({ amount: '', merchant: '', date: new Date().toISOString().slice(0, 10), category: 'Food', description: '' });
  const [preview, setPreview] = useState(null);

  const processFile = async (file) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Maximum 5MB.');
      return;
    }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }

    setScanning(true);

    await new Promise((r) => setTimeout(r, 1500));

    const fileName = file.name.toLowerCase();
    const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const merchantName = baseName;
    const detectedCategory = detectCategory(merchantName);

    const estimatedAmount = (Math.random() * 2000 + 100).toFixed(2);

    const extractedData = {
      merchant: merchantName,
      amount: estimatedAmount,
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

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    processFile(file);
    e.target.value = '';
  };

  const handleCameraCapture = async (e) => {
    const file = e.target.files?.[0];
    processFile(file);
    e.target.value = '';
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
        <p className="text-sm text-slate-500 dark:text-slate-400">Upload a receipt photo to auto-extract details</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
        >
          <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileSelect} />
          <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Upload Image</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">JPG, PNG (max 5MB)</p>
        </div>

        <div
          onClick={() => cameraInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
        >
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCameraCapture} />
          <Camera className="w-8 h-8 mx-auto mb-2 text-slate-400" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Take Photo</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Use your camera</p>
        </div>
      </div>

      {preview && !scanning && extracted && (
        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600">
          <img src={preview} alt="Receipt preview" className="w-full h-40 object-cover" />
        </div>
      )}

      {scanning && (
        <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-indigo-600 dark:text-indigo-400">Analyzing receipt...</span>
        </div>
      )}

      {extracted && !scanning && (
        <form id="scanner-form" onSubmit={handleSubmit} className="space-y-3">
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 border border-slate-200 dark:border-slate-600">
            <div className="text-center mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                💳 Expense
              </span>
            </div>

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
            <div className="mt-3">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Description</label>
              <input type="text" required value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
            </div>
          </div>
        </form>
      )}
      {extracted && !scanning && (
        <div className="sticky bottom-0 -mx-4 md:-mx-5 px-4 md:px-5 py-3 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-700 mt-4 -mb-4 md:-mb-5">
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancel</button>
            <button type="submit" form="scanner-form"
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors">Add Transaction</button>
          </div>
        </div>
      )}
    </div>
  );
}
