import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../utils/constants';

const INCOME_KEYWORDS = ['received', 'got', 'earned', 'salary', 'stipend', 'scholarship', 'income', 'refund', 'bonus', 'freelancing', 'pocket money'];
const EXPENSE_KEYWORDS = ['spent', 'paid', 'bought', 'purchased', 'ordered', 'invested', 'gave', 'donated'];

export default function VoiceEntry({ onClose }) {
  const { addTransaction, studentMode } = useApp();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsed, setParsed] = useState(null);
  const [step, setStep] = useState('listen');
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);

  const studentModeRef = useRef(studentMode);
  studentModeRef.current = studentMode;

  const incomeCats = INCOME_CATEGORIES;
  const expenseCats = EXPENSE_CATEGORIES;

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Voice recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      parseVoiceCommand(text);
    };

    recognition.onerror = (event) => {
      setError(`Error: ${event.error}. Please try again.`);
      setListening(false);
    };

    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
  }, []);

  function hasIncomeKeywords(text) {
    return INCOME_KEYWORDS.some(kw => text.includes(kw));
  }

  function hasExpenseKeywords(text) {
    return EXPENSE_KEYWORDS.some(kw => text.includes(kw));
  }

  const parseVoiceCommand = (text) => {
    const lower = text.toLowerCase();
    let amount = null;
    let type = 'Expense';
    let category = 'Other';
    let description = text;

    const amountMatch = lower.match(/(?:rs|₹|inr|rupees?|rs\.?)\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/i)
      || lower.match(/(\d+(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)\s*(?:rupees?|rs|inr)/i)
      || lower.match(/(\d+(?:\.\d{1,2})?)\s*dollars?/i)
      || lower.match(/(\d+(?:\.\d{1,2})?)/);
    if (amountMatch) {
      amount = parseFloat(amountMatch[1]?.replace(/,/g, '') || amountMatch[0]);
    }

    const hasIncome = hasIncomeKeywords(lower);
    const hasExpense = hasExpenseKeywords(lower);

    if (hasIncome && !hasExpense) {
      type = 'Income';
      if (/salary/i.test(lower)) category = 'Salary';
      else if (/freelanc/i.test(lower)) category = 'Freelancing';
      else if (/busines/i.test(lower)) category = 'Business';
      else if (/scholarship/i.test(lower)) category = 'Scholarship';
      else if (/internship|stipend/i.test(lower)) category = studentModeRef.current ? 'Internship' : 'Freelancing';
      else if (/gift|pocket money/i.test(lower)) category = 'Gift';
      else if (/refund/i.test(lower)) category = 'Other';
      else if (/bonus/i.test(lower)) category = 'Salary';
      else if (/earned|received|got|income/i.test(lower)) category = 'Other';
    } else {
      type = 'Expense';
      if (/food|lunch|dinner|breakfast|eat|restaurant|grocer/i.test(lower)) category = 'Food';
      else if (/transport|uber|ola|cab|bus|train|fuel|petrol/i.test(lower)) category = 'Transport';
      else if (/shop|amazon|flipkart|clothes|online/i.test(lower)) category = 'Shopping';
      else if (/education|course|book|class|tuit|fee|hostel/i.test(lower)) category = 'Education';
      else if (/movie|netflix|game|entertain/i.test(lower)) category = 'Entertainment';
      else if (/bill|electricit|water|internet|phone/i.test(lower)) category = 'Bills';
      else if (/doctor|hospital|medic|health/i.test(lower)) category = 'Healthcare';
      else if (/travel|trip|hotel|flight|vacation/i.test(lower)) category = 'Travel';
    }

    if (amount) {
      setParsed({ amount, type, category, description: text, date: new Date().toISOString().slice(0, 10) });
      setStep('confirm');
    } else {
      setParsed(null);
      setError('Could not detect an amount. Please try again.');
    }
  };

  const toggleListening = () => {
    setError('');
    setParsed(null);
    setStep('listen');
    setTranscript('');

    if (listening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setListening(true);
      } catch (e) {
        setError('Could not start voice recognition. Please try again.');
      }
    }
  };

  const handleConfirm = () => {
    if (parsed) {
      addTransaction(parsed);
      onClose();
    }
  };

  const handleEdit = () => {
    setStep('edit');
  };

  const updateField = (field, value) => {
    setParsed(prev => ({ ...prev, [field]: value }));
  };

  if (step === 'edit' && parsed) {
    const cats = parsed.type === 'Income' ? incomeCats : expenseCats;
    return (
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-white mb-1">Edit Transaction</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Review and correct the detected details</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Type</label>
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
              {['Expense', 'Income'].map(t => (
                <button key={t} type="button" onClick={() => updateField('type', t)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${parsed.type === t ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >{t}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Amount</label>
            <input type="number" value={parsed.amount} onChange={e => updateField('amount', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {cats.map(cat => (
                <button key={cat.name} type="button" onClick={() => updateField('category', cat.name)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all ${parsed.category === cat.name ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary' : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400'}`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="font-medium">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Description</label>
            <input type="text" value={parsed.description} onChange={e => updateField('description', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Date</label>
            <input type="date" value={parsed.date} onChange={e => updateField('date', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={() => setStep('confirm')}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Back</button>
          <button onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors">Confirm & Add</button>
        </div>
      </div>
    );
  }

  if (step === 'confirm' && parsed) {
    const catItem = (parsed.type === 'Income' ? incomeCats : expenseCats).find(c => c.name === parsed.category);
    return (
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-white mb-1">Confirm Transaction</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Please review the detected details</p>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 border border-slate-200 dark:border-slate-600">
          <div className="text-center mb-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              parsed.type === 'Income' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
            }`}>
              {parsed.type === 'Income' ? '💰' : '💳'} {parsed.type}
            </span>
          </div>

          <div className="text-center mb-4">
            <span className="text-3xl font-bold text-slate-800 dark:text-white">
              ₹{parsed.amount}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-center p-2 rounded-lg bg-white/50 dark:bg-slate-800/50">
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Category</p>
              <p className="font-semibold text-slate-700 dark:text-slate-200">{catItem?.icon || '📌'} {parsed.category}</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/50 dark:bg-slate-800/50">
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Date</p>
              <p className="font-semibold text-slate-700 dark:text-slate-200">{new Date(parsed.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="mt-3 p-2 rounded-lg bg-white/50 dark:bg-slate-800/50 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Description</p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{parsed.description}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={toggleListening}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Try Again</button>
          <button onClick={handleEdit}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors">Edit</button>
          <button onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors">Confirm</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-slate-800 dark:text-white mb-1">Voice Entry</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Say something like "Spent ₹500 on food" or "Received ₹10000 salary"</p>
      </div>

      <div className="flex flex-col items-center py-4">
        <button
          onClick={toggleListening}
          className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all ${
            listening ? 'bg-red-100 dark:bg-red-900/30 animate-pulse scale-110' : 'bg-primary/10 hover:bg-primary/20'
          }`}
        >
          🎤
        </button>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{listening ? 'Listening...' : 'Tap to speak'}</p>
      </div>

      {transcript && step === 'listen' && (
        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">You said:</p>
          <p className="text-sm text-slate-700 dark:text-slate-200">{transcript}</p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-sm text-red-600 dark:text-red-400 rounded-lg">{error}</div>
      )}
    </div>
  );
}
