import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { formatCurrency, getMonthYear } from '../../utils/helpers';

const quickActions = [
  { icon: '💰', label: 'Show my balance' },
  { icon: '📊', label: 'This month spending' },
  { icon: '🎯', label: 'Top spending category' },
  { icon: '💡', label: 'Savings tip' },
  { icon: '📋', label: 'Budget status' },
  { icon: '🎯', label: 'Goal progress' },
];

export default function AIAssistant({ open: controlledOpen, onClose: controlledOnClose }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnClose ? () => {} : setInternalOpen;

  const handleClose = () => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalOpen(false);
    }
  };

  const handleOpen = () => {
    if (!controlledOnClose) {
      setInternalOpen(true);
    }
  };
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState('');
  const {
    transactions, totalIncome, totalExpenses, monthlyExpenses, monthlyIncome,
    monthlySavings, currency, topCategory, streak, aiInsights, savingsGoals,
    predictions, budget, currentMonth, currentBudget, healthScore, subscriptions,
  } = useApp();
  const balance = totalIncome - totalExpenses;

  const categorySpending = useMemo(() => {
    const map = {};
    transactions.filter((t) => t.type === 'Expense' && getMonthYear(t.date) === currentMonth)
      .forEach((t) => { map[t.category] = (map[t.category] || 0) + Number(t.amount); });
    return map;
  }, [transactions, currentMonth]);

  const getResponse = (query) => {
    const q = query.toLowerCase();

    if (q.includes('balance') || q.includes('net worth') || q.includes('networth')) {
      return `Your net balance is ${formatCurrency(currency, balance)}. ${
        balance >= 0
          ? "You're in the green! 🎉 Keep it up."
          : "You're in the red. Consider reducing expenses or finding additional income sources."
      } Total income: ${formatCurrency(currency, totalIncome)}. Total expenses: ${formatCurrency(currency, totalExpenses)}.`;
    }

    if (q.includes('afford') || q.includes('can i buy') || q.includes('can i get')) {
      const amountMatch = q.match(/[\d,]+(?:\.\d+)?/);
      if (amountMatch) {
        const cost = parseFloat(amountMatch[0].replace(/,/g, ''));
        const item = q.replace(/.*(?:afford|buy|get)\s*(?:a|an|the|new)?\s*/i, '').replace(/.*?worth\s*[\d,]+\s*/i, '').trim() || 'this item';
        if (balance >= cost) {
          return `Yes! You can afford ${item} worth ${formatCurrency(currency, cost)}. Your current balance is ${formatCurrency(currency, balance)}. However, consider if this aligns with your savings goals.`;
        } else {
          const shortfall = cost - balance;
          return `You're ${formatCurrency(currency, shortfall)} short to afford ${item}. ${
            monthlySavings > 0
              ? `At your current savings rate (${formatCurrency(currency, monthlySavings)}/month), you could afford it in ${Math.ceil(cost / monthlySavings)} months.`
              : "Consider reducing expenses to build up your savings."
          }`;
        }
      }
      return `Your balance is ${formatCurrency(currency, balance)}. What are you looking to buy? Tell me the amount!`;
    }

    if (q.includes('spending') || q.includes('this month') || q.includes('monthly')) {
      let resp = `This month you've spent ${formatCurrency(currency, monthlyExpenses)} across ${Object.keys(categorySpending).length} categories.`;
      if (streak > 0) resp += ` You've been tracking for ${streak} days straight! 🔥`;
      if (topCategory) resp += ` Most spent on: ${topCategory[0]} (${formatCurrency(currency, topCategory[1])}).`;
      if (predictions) resp += ` Estimated EOM: ${formatCurrency(currency, predictions.predictedEndOfMonth)}.`;
      return resp;
    }

    if (q.includes('category') || q.includes('top') || q.includes('biggest') || q.includes('most')) {
      if (topCategory) {
        const sorted = Object.entries(categorySpending).sort(([, a], [, b]) => b - a);
        return `Your top spending category is ${topCategory[0]} at ${formatCurrency(currency, topCategory[1])} this month. ${
          sorted.length > 1
            ? `Followed by ${sorted[1][0]} (${formatCurrency(currency, sorted[1][1])}) and ${sorted[2]?.[0] || ''} (${formatCurrency(currency, sorted[2]?.[1] || 0)}).`
            : ''
        } ${topCategory[1] > monthlyIncome * 0.3 ? `⚠️ ${topCategory[0]} is over 30% of your income. Consider reducing it.` : ''}`;
      }
      return "You haven't spent much this month yet!";
    }

    if (q.includes('savings') || q.includes('tip') || q.includes('advice') || q.includes('how can i save')) {
      const tips = aiInsights.filter(i => i.type === 'success' || i.type === 'warning' || i.type === 'info');
      if (tips.length > 0) {
        const relevant = tips.slice(0, 2);
        return `Here are some personalized tips:\n${relevant.map((t, i) => `${i + 1}. ${t.message}`).join('\n')}`;
      }
      const topExpense = Object.entries(categorySpending).sort(([, a], [, b]) => b - a)[0];
      if (topExpense) {
        const suggestedCut = Math.round(topExpense[1] * 0.15);
        return `Try reducing your ${topExpense[0]} expenses by ${formatCurrency(currency, suggestedCut)}/month (15%). That's ${formatCurrency(currency, suggestedCut * 12)} saved annually! 💰`;
      }
      return 'Try to save at least 20% of your income each month. Set up automatic transfers to a savings account.';
    }

    if (q.includes('income') || q.includes('earn') || q.includes('salary')) {
      return `Your total income is ${formatCurrency(currency, totalIncome)}. This month: ${formatCurrency(currency, monthlyIncome)}. ${
        monthlySavings > 0
          ? `You're saving ${Math.round((monthlySavings / monthlyIncome) * 100)}% of your income.`
          : "Consider increasing your savings rate."
      }`;
    }

    if (q.includes('budget') || q.includes('overspend') || q.includes('exceed')) {
      if (currentBudget > 0) {
        const pct = (monthlyExpenses / currentBudget) * 100;
        return `Your monthly budget is ${formatCurrency(currency, currentBudget)}. You've used ${Math.round(pct)}%. ${
          pct > 100
            ? `⚠️ Overspent by ${formatCurrency(currency, monthlyExpenses - currentBudget)}!`
            : pct > 80
              ? `⚠️ Approaching limit (${Math.round(pct)}%). Consider reducing expenses.`
              : `✅ On track with ${formatCurrency(currency, currentBudget - monthlyExpenses)} remaining.`
        }${predictions ? ` Projected EOM: ${Math.round(predictions.budgetRisk)}% of budget.` : ''}`;
      }
      return "You haven't set a monthly budget yet. Go to Budget Manager to set one!";
    }

    if (q.includes('goal') || q.includes('saving for') || q.includes('progress')) {
      if (savingsGoals.length === 0) return "You haven't set any savings goals yet. Create one in the Savings page!";
      const totalTarget = savingsGoals.reduce((s, g) => s + g.target, 0);
      const totalSaved = savingsGoals.reduce((s, g) => s + (g.saved || 0), 0);
      const pct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
      return `You have ${savingsGoals.length} savings goal${savingsGoals.length > 1 ? 's' : ''}. Total progress: ${formatCurrency(currency, totalSaved)} of ${formatCurrency(currency, totalTarget)} (${pct}%). ${
        savingsGoals.filter((g) => g.saved >= g.target).length > 0
          ? `🎉 ${savingsGoals.filter((g) => g.saved >= g.target).length} goal${savingsGoals.filter((g) => g.saved >= g.target).length > 1 ? 's' : ''} completed!`
          : savingsGoals.length > 0
            ? `Your closest goal: ${[...savingsGoals].sort((a, b) => (b.saved / b.target) - (a.saved / a.target))[0].name}`
            : ''
      }`;
    }

    if (q.includes('subscription') || q.includes('recurring') || q.includes('monthly cost')) {
      if (subscriptions.length === 0) return "You haven't added any subscriptions yet.";
      const total = subscriptions.reduce((s, sub) => s + (sub.monthlyCost || 0), 0);
      return `You have ${subscriptions.length} subscription${subscriptions.length > 1 ? 's' : ''} totaling ${formatCurrency(currency, total)}/month. That's ${formatCurrency(currency, total * 12)}/year! ${
        subscriptions.filter((s) => s.nextRenewal && new Date(s.nextRenewal) <= new Date(Date.now() + 3 * 86400000)).length > 0
          ? ' Some renewals coming up soon!'
          : ''
      }`;
    }

    if (q.includes('health') || q.includes('score') || q.includes('rating')) {
      return `Your financial health score is ${healthScore.score}/100 (${healthScore.label}). ${
        healthScore.suggestions?.length > 0
          ? `Tip: ${healthScore.suggestions[0]}`
          : "You're doing great! Keep it up."
      }`;
    }

    if (q.includes('trend') || q.includes('increasing') || q.includes('decreasing')) {
      const trend = predictions?.trend || 'stable';
      return `Your spending trend is ${trend}. ${
        trend === 'increasing'
          ? '📈 Spending has been rising. Review your budget to get back on track.'
          : trend === 'decreasing'
            ? '📉 Great job! Your spending is trending downward.'
            : '📊 Your spending is stable. Keep maintaining good habits.'
      }`;
    }

    if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('namaste')) {
      const topGoal = savingsGoals.filter((g) => g.saved < g.target).sort((a, b) => b.saved / b.target - a.saved / a.target)[0];
      return `Hey there! 👋 I'm your FinanceFlow AI assistant. ${
        topGoal ? `I see you're saving for "${topGoal.name}" — ${formatCurrency(currency, topGoal.saved)} of ${formatCurrency(currency, topGoal.target)}. Keep going! 🎯` : ''
      } Ask me about your balance, spending, budget, goals, or how to save more!`;
    }

    const catMatch = Object.keys(categorySpending).find((cat) => q.includes(cat.toLowerCase()));
    if (catMatch) {
      return `You've spent ${formatCurrency(currency, categorySpending[catMatch])} on ${catMatch} this month. ${
        monthlyIncome > 0
          ? `That's ${Math.round((categorySpending[catMatch] / monthlyIncome) * 100)}% of your income.`
          : ''
      }`;
    }

    return "I'm not sure about that. Try asking about:\n💰 Balance\n📊 Monthly spending\n🎯 Top category\n💡 Savings tips\n📋 Budget status\n🎯 Goal progress\n🏥 Health score";
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
      {controlledOpen === undefined && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleOpen}
          className="fixed bottom-20 right-6 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent text-white shadow-xl flex items-center justify-center cursor-pointer"
          style={{ boxShadow: '0 4px 20px var(--theme-glow)' }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </motion.button>
      )}

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-50"
              onClick={handleClose}
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
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">FinanceFlow AI</p>
                    <p className="text-xs text-emerald-500">Analyzing your data...</p>
                  </div>
                </div>
                <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-3 h-72 overflow-y-auto space-y-3">
                {chat.length === 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-2">Ask me anything about your finances 💬</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {quickActions.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setChat(prev => [...prev, { role: 'user', text: item.label }]);
                            setTimeout(() => {
                              setChat(prev => [...prev, { role: 'assistant', text: getResponse(item.label) }]);
                            }, 500);
                          }}
                          className="text-left p-2 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-xs flex items-center gap-1.5 text-slate-600 dark:text-slate-300"
                        >
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {chat.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[90%] p-3 rounded-2xl text-sm whitespace-pre-line ${
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
