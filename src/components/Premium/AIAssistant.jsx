import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/helpers';

const insights = [
  { icon: '💰', label: 'Show my balance' },
  { icon: '📊', label: 'This month spending' },
  { icon: '🎯', label: 'Top spending category' },
  { icon: '💡', label: 'Savings tip' },
];

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState('');
  const { totalIncome, totalExpenses, monthlyExpenses, currency, topCategory, streak, aiInsights } = useApp();
  const balance = totalIncome - totalExpenses;

  const getResponse = (query) => {
    const q = query.toLowerCase();
    if (q.includes('balance') || q.includes('net worth')) {
      return `Your net balance is ${formatCurrency(currency, balance)}. ${balance >= 0 ? "You're in the green! 🎉" : "You're in the red. Time to review spending."}`;
    }
    if (q.includes('spending') || q.includes('this month') || q.includes('month')) {
      return `This month you've spent ${formatCurrency(currency, monthlyExpenses)}. ${streak > 0 ? `You've been tracking for ${streak} days straight! 🔥` : ''}`;
    }
    if (q.includes('category') || q.includes('top')) {
      if (topCategory) {
        return `Your top spending category is ${topCategory[0]} at ${formatCurrency(currency, topCategory[1])}.`;
      }
      return "You haven't spent much this month yet!";
    }
    if (q.includes('savings') || q.includes('tip') || q.includes('advice')) {
      const tips = aiInsights.filter(i => i.type === 'success' || i.type === 'warning');
      if (tips.length > 0) return tips[0].message;
      return 'Try to save at least 20% of your income each month.';
    }
    if (q.includes('income')) {
      return `Your total income is ${formatCurrency(currency, totalIncome)}.`;
    }
    if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      return `Hey there! I'm your finance assistant. Ask me about your spending, balance, or savings tips!`;
    }
    return "I'm not sure about that. Try asking about your balance, spending, top category, or savings tips!";
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setChat(prev => [...prev, { role: 'user', text: input }]);
    setTimeout(() => {
      setChat(prev => [...prev, { role: 'assistant', text: getResponse(input) }]);
    }, 500);
    setInput('');
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-6 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent text-white shadow-xl flex items-center justify-center cursor-pointer"
        style={{ boxShadow: '0 4px 20px var(--theme-glow)' }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-50"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="fixed bottom-36 right-6 z-50 w-80 sm:w-96 glass-card dark:glass-dark rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                    AI
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">Finance AI</p>
                    <p className="text-xs text-emerald-500">Online</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-3 h-60 overflow-y-auto space-y-3">
                {chat.length === 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-2">Ask me about your finances 💬</p>
                    {insights.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setChat(prev => [...prev, { role: 'user', text: item.label }]);
                          setTimeout(() => {
                            setChat(prev => [...prev, { role: 'assistant', text: getResponse(item.label) }]);
                          }, 500);
                        }}
                        className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-sm flex items-center gap-2 text-slate-600 dark:text-slate-300"
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
                {chat.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-white rounded-tr-sm'
                        : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="p-3 border-t border-slate-200/50 dark:border-white/5">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about your spending..."
                    className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button
                    onClick={handleSend}
                    className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary-dark transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
