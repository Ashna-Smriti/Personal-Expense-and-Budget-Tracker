import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../utils/constants';

export default function VoiceEntry({ onClose }) {
  const { addTransaction } = useApp();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);

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
      amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    }

    if (/salary|income|received|earned|freelance|business|scholarship|gift/i.test(lower)) {
      type = 'Income';
      if (/salary/i.test(lower)) category = 'Salary';
      else if (/freelanc/i.test(lower)) category = 'Freelancing';
      else if (/busines/i.test(lower)) category = 'Business';
      else if (/scholarship/i.test(lower)) category = 'Scholarship';
      else if (/gift/i.test(lower)) category = 'Gift';
    } else {
      if (/food|lunch|dinner|breakfast|eat|restaurant|grocer/i.test(lower)) category = 'Food';
      else if (/transport|uber|ola|cab|bus|train|fuel|petrol/i.test(lower)) category = 'Transport';
      else if (/shop|amazon|flipkart|clothes|online/i.test(lower)) category = 'Shopping';
      else if (/education|course|book|class|tuit/i.test(lower)) category = 'Education';
      else if (/movie|netflix|game|entertain/i.test(lower)) category = 'Entertainment';
      else if (/bill|electricit|water|internet|phone/i.test(lower)) category = 'Bills';
      else if (/doctor|hospital|medic|health/i.test(lower)) category = 'Healthcare';
      else if (/travel|trip|hotel|flight|vacation/i.test(lower)) category = 'Travel';
    }

    if (amount) {
      setParsed({ amount, type, category, description: text, date: new Date().toISOString().slice(0, 10) });
    } else {
      setParsed(null);
      setError('Could not detect an amount. Please try again.');
    }
  };

  const toggleListening = () => {
    setError('');
    setParsed(null);
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

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-slate-800 dark:text-white mb-1">Voice Expense Entry</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Say something like "Spent ₹500 on food today" or "Received ₹10000 salary"</p>
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

      {transcript && (
        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">You said:</p>
          <p className="text-sm text-slate-700 dark:text-slate-200">{transcript}</p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-sm text-red-600 dark:text-red-400 rounded-lg">{error}</div>
      )}

      {parsed && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <p className="text-xs text-slate-400 dark:text-slate-500">Amount</p>
              <p className="font-semibold text-slate-800 dark:text-white">{parsed.amount}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <p className="text-xs text-slate-400 dark:text-slate-500">Type</p>
              <p className="font-semibold text-slate-800 dark:text-white">{parsed.type}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <p className="text-xs text-slate-400 dark:text-slate-500">Category</p>
              <p className="font-semibold text-slate-800 dark:text-white">{parsed.category}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <p className="text-xs text-slate-400 dark:text-slate-500">Date</p>
              <p className="font-semibold text-slate-800 dark:text-white">{parsed.date}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancel</button>
            <button onClick={handleConfirm} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors">Confirm & Add</button>
          </div>
        </div>
      )}
    </div>
  );
}
