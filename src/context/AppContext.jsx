import { createContext, useContext, useMemo, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getMonthYear } from '../utils/helpers';
import { generateAIInsights } from '../utils/aiInsights';
import { calculateHealthScore } from '../utils/healthScore';
import { predictExpenses } from '../utils/predictions';

import { getUpcomingRenewals } from '../utils/subscriptions';
import { analyzeMoodSpending } from '../utils/moodTracker';
import { createNotification, checkBudgetAlert, checkSavingsGoalAlert, checkUnusualSpendingAlert, checkBillReminders } from '../utils/notifications';
import { ACHIEVEMENTS, checkAchievements } from '../utils/achievements';
const achievements = ACHIEVEMENTS;

const THEMES = ['dark', 'light', 'purple', 'emerald', 'blue'];

const FINANCIAL_QUOTES = [
  { text: "The habit of saving is itself an education.", author: "John Doe" },
  { text: "Do not save what is left after spending, but spend what is left after saving.", author: "Warren Buffett" },
  { text: "Financial freedom is available to those who learn about it and work for it.", author: "Robert Kiyosaki" },
  { text: "It's not about how much money you make, but how much you keep.", author: "Robert Kiyosaki" },
  { text: "A budget is telling your money where to go instead of wondering where it went.", author: "Dave Ramsey" },
  { text: "The stock market is filled with individuals who know the price of everything, but the value of nothing.", author: "Philip Fisher" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "The art is not in making money, but in keeping it.", author: "Proverb" },
  { text: "Money is a terrible master but an excellent servant.", author: "P.T. Barnum" },
  { text: "Rich people have small TVs and big libraries, poor people have small libraries and big TVs.", author: "Robert Kiyosaki" },
  { text: "Never depend on a single income. Make investments to create a second source.", author: "Warren Buffett" },
  { text: "The best time to start saving was yesterday. The next best time is now.", author: "Anonymous" },
  { text: "Money grows on the tree of patience.", author: "Japanese Proverb" },
  { text: "Every penny saved is a penny earned.", author: "Benjamin Franklin" },
  { text: "Don't tell me what you value, show me your budget and I'll tell you what you value.", author: "Joe Biden" },
];

function calculateStreak(transactions) {
  const dates = [...new Set(transactions.map(t => t.date.split('T')[0]))].sort();
  if (dates.length === 0) return 0;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dates[dates.length - 1] !== today && dates[dates.length - 1] !== yesterday) return 0;
  let streak = 1;
  for (let i = dates.length - 1; i > 0; i--) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (curr - prev) / 86400000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

function calculateLevel(xp) {
  if (xp >= 5000) return { level: 'Finance Pro', icon: '💎', min: 5000, nextMin: null, xp, color: '#6366f1' };
  if (xp >= 2000) return { level: 'Budget Master', icon: '🥇', min: 2000, nextMin: 5000, xp, color: '#f59e0b' };
  if (xp >= 500) return { level: 'Smart Spender', icon: '🥈', min: 500, nextMin: 2000, xp, color: '#94a3b8' };
  return { level: 'Beginner Saver', icon: '🥉', min: 0, nextMin: 500, xp, color: '#cd7f32' };
}

function getDailyQuote() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return FINANCIAL_QUOTES[dayOfYear % FINANCIAL_QUOTES.length];
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [transactions, setTransactions] = useLocalStorage('bt_transactions', []);
  const [budget, setBudget] = useLocalStorage('bt_budget', {});
  const [savingsGoals, setSavingsGoals] = useLocalStorage('bt_savings_goals', []);
  const [theme, setTheme] = useLocalStorage('bt_theme', 'dark');
  const [currency, setCurrency] = useLocalStorage('bt_currency', 'INR');
  const [subscriptions, setSubscriptions] = useLocalStorage('bt_subscriptions', []);
  const [challenges, setChallenges] = useLocalStorage('bt_challenges', []);
  const [earnedAchievements, setEarnedAchievements] = useLocalStorage('bt_achievements', []);
  const [notifications, setNotifications] = useLocalStorage('bt_notifications', []);
  const [studentMode, setStudentMode] = useLocalStorage('bt_student_mode', false);
  const [bills, setBills] = useLocalStorage('bt_bills', []);
  const [xp, setXpRaw] = useLocalStorage('bt_xp', 0);

  const currentMonth = getMonthYear(new Date().toISOString());
  const currentBudget = budget[currentMonth] || 0;

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
  }, [theme]);

  const totalIncome = useMemo(() =>
    transactions.filter((t) => t.type === 'Income').reduce((sum, t) => sum + Number(t.amount), 0),
    [transactions]
  );

  const totalExpenses = useMemo(() =>
    transactions.filter((t) => t.type === 'Expense').reduce((sum, t) => sum + Number(t.amount), 0),
    [transactions]
  );

  const monthlyExpenses = useMemo(() =>
    transactions.filter((t) => t.type === 'Expense' && getMonthYear(t.date) === currentMonth)
      .reduce((sum, t) => sum + Number(t.amount), 0),
    [transactions, currentMonth]
  );

  const monthlyIncome = useMemo(() =>
    transactions.filter((t) => t.type === 'Income' && getMonthYear(t.date) === currentMonth)
      .reduce((sum, t) => sum + Number(t.amount), 0),
    [transactions, currentMonth]
  );

  const monthlySavings = monthlyIncome - monthlyExpenses;

  const budgetSpentPercent = useMemo(() =>
    currentBudget > 0 ? Math.min((monthlyExpenses / currentBudget) * 100, 100) : 0,
    [monthlyExpenses, currentBudget]
  );

  const aiInsights = useMemo(() =>
    generateAIInsights(transactions, budget, currentMonth, savingsGoals, currency),
    [transactions, budget, currentMonth, savingsGoals, currency]
  );

  const healthScore = useMemo(() =>
    calculateHealthScore(transactions, budget, currentMonth),
    [transactions, budget, currentMonth]
  );

  const predictions = useMemo(() =>
    predictExpenses(transactions, budget, currentMonth),
    [transactions, budget, currentMonth]
  );

  const upcomingRenewals = useMemo(() => getUpcomingRenewals(subscriptions), [subscriptions]);

  const upcomingBills = useMemo(() => {
    const today = new Date().getDate();
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    return bills
      .filter((b) => !b.paid)
      .map((b) => {
        let dueDay = b.dueDay;
        if (dueDay < today) dueDay += daysInMonth;
        return { ...b, daysUntil: dueDay - today };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [bills]);

  const moodAnalysis = useMemo(() => analyzeMoodSpending(transactions), [transactions]);

  const effectiveXp = useMemo(() => Math.max(xp, transactions.length * 10 + earnedAchievements.length * 100), [xp, transactions.length, earnedAchievements.length]);
  const addXp = useCallback((amount) => {
    setXpRaw((prev) => prev + amount);
  }, [setXpRaw]);

  const streak = useMemo(() => calculateStreak(transactions), [transactions]);
  const userLevel = useMemo(() => calculateLevel(effectiveXp), [effectiveXp]);
  const dailyQuote = useMemo(() => getDailyQuote(), []);
  const greeting = useMemo(() => getGreeting(), []);

  const todaySpending = useMemo(() =>
    transactions.filter(t => {
      const today = new Date().toISOString().split('T')[0];
      return t.type === 'Expense' && t.date.split('T')[0] === today;
    }).reduce((s, t) => s + Number(t.amount), 0),
    [transactions]
  );

  const weekSpending = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86400000;
    return transactions.filter(t => t.type === 'Expense' && new Date(t.date).getTime() >= weekAgo)
      .reduce((s, t) => s + Number(t.amount), 0);
  }, [transactions]);

  const topCategory = useMemo(() => {
    const catMap = {};
    transactions.filter(t => t.type === 'Expense' && getMonthYear(t.date) === currentMonth)
      .forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + Number(t.amount); });
    const entries = Object.entries(catMap);
    if (entries.length === 0) return null;
    return entries.sort(([, a], [, b]) => b - a)[0];
  }, [transactions, currentMonth]);

  const addTransaction = useCallback((transaction) => {
    setTransactions((prev) => [...prev, { ...transaction, id: Date.now().toString() }]);
    addXp(10);
  }, [setTransactions, addXp]);

  const updateTransaction = useCallback((id, updated) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
  }, [setTransactions]);

  const deleteTransaction = useCallback((id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, [setTransactions]);

  const setMonthlyBudget = useCallback((month, amount) => {
    setBudget((prev) => ({ ...prev, [month]: amount }));
  }, [setBudget]);

  const addSavingsGoal = useCallback((goal) => {
    setSavingsGoals((prev) => [...prev, { ...goal, id: Date.now().toString(), saved: 0, createdAt: new Date().toISOString() }]);
    addXp(50);
  }, [setSavingsGoals, addXp]);

  const updateSavingsGoal = useCallback((id, data) => {
    setSavingsGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...data } : g)));
  }, [setSavingsGoals]);

  const deleteSavingsGoal = useCallback((id) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
  }, [setSavingsGoals]);

  const setThemeValue = useCallback((t) => {
    if (THEMES.includes(t)) setTheme(t);
  }, [setTheme]);

  const addSubscription = useCallback((sub) => {
    setSubscriptions((prev) => [...prev, { ...sub, id: Date.now().toString(), createdAt: new Date().toISOString() }]);
    addXp(15);
  }, [setSubscriptions, addXp]);

  const updateSubscription = useCallback((id, data) => {
    setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  }, [setSubscriptions]);

  const deleteSubscription = useCallback((id) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  }, [setSubscriptions]);

  const addBill = useCallback((bill) => {
    setBills((prev) => [...prev, { ...bill, id: Date.now().toString(), paid: false, createdAt: new Date().toISOString() }]);
    addXp(20);
  }, [setBills, addXp]);

  const updateBill = useCallback((id, data) => {
    setBills((prev) => prev.map((b) => (b.id === id ? { ...b, ...data } : b)));
  }, [setBills]);

  const deleteBill = useCallback((id) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
  }, [setBills]);

  const addChallenge = useCallback((challenge) => {
    setChallenges((prev) => [...prev, {
      ...challenge,
      id: Date.now().toString(),
      startedAt: new Date().toISOString(),
      completed: false,
    }]);
  }, [setChallenges]);

  const updateChallenge = useCallback((id, data) => {
    setChallenges((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  }, [setChallenges]);

  const deleteChallenge = useCallback((id) => {
    setChallenges((prev) => prev.filter((c) => c.id !== id));
  }, [setChallenges]);

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev].slice(0, 50));
  }, [setNotifications]);

  const markNotificationRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, [setNotifications]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, [setNotifications]);

  useEffect(() => {
    if (currentBudget > 0) {
      const alert = checkBudgetAlert(monthlyExpenses, currentBudget, currentMonth);
      if (alert) {
        setNotifications((prev) => {
          if (prev.some((n) => n.title === alert.title && n.message === alert.message)) return prev;
          return [alert, ...prev].slice(0, 50);
        });
      }
    }
  }, [monthlyExpenses, currentBudget, currentMonth, setNotifications]);

  useEffect(() => {
    const alert = checkSavingsGoalAlert(savingsGoals);
    if (alert) {
      setNotifications((prev) => {
        if (prev.some((n) => n.message === alert.message)) return prev;
        return [alert, ...prev].slice(0, 50);
      });
    }
  }, [savingsGoals, setNotifications]);

  useEffect(() => {
    const alert = checkUnusualSpendingAlert(transactions, currentMonth);
    if (alert) {
      setNotifications((prev) => {
        if (prev.some((n) => n.message === alert.message)) return prev;
        return [alert, ...prev].slice(0, 50);
      });
    }
  }, [transactions, currentMonth, setNotifications]);

  useEffect(() => {
    checkBillReminders(bills, setNotifications);
  }, [bills, setNotifications]);

  useEffect(() => {
    const current = checkAchievements(transactions, savingsGoals, budget, monthlyExpenses, currentMonth, bills);
    setEarnedAchievements((prev) => {
      const merged = new Set([...prev, ...current]);
      if (merged.size !== prev.length) {
        const newOnes = current.filter((id) => !prev.includes(id));
        for (const id of newOnes) {
          addXp(100);
          const a = achievements.find((x) => x.id === id);
          if (a) {
            setNotifications((n) => {
              if (n.some((x) => x.title === 'Achievement Unlocked!')) return n;
              return [createNotification('Achievement Unlocked!', `🏅 ${a.title} — ${a.desc}`, 'success', '🏅'), ...n].slice(0, 50);
            });
          }
        }
        return [...merged];
      }
      return prev;
    });
  }, [transactions.length, savingsGoals.map((g) => g.saved).join(','), monthlyExpenses, currentMonth]);

  useEffect(() => {
    const now = new Date().toISOString();
    for (const sub of subscriptions) {
      if (sub.nextRenewal && sub.nextRenewal <= now) {
        const renewedDate = new Date(sub.nextRenewal);
        renewedDate.setMonth(renewedDate.getMonth() + 1);
        const notification = createNotification(
          'Subscription Renewed',
          `${sub.name} has been renewed. Next billing: ${renewedDate.toLocaleDateString()}`,
          'info', '🔄'
        );
        setNotifications((prev) => {
          if (prev.some((n) => n.message === notification.message)) return prev;
          return [notification, ...prev].slice(0, 50);
        });
        setSubscriptions((prev) => prev.map((s) =>
          s.id === sub.id ? { ...s, nextRenewal: renewedDate.toISOString() } : s
        ));
      }
    }
  }, [subscriptions, setNotifications, setSubscriptions]);

  const value = useMemo(() => ({
    transactions, budget, currentBudget, currentMonth, totalIncome, totalExpenses,
    monthlyExpenses, monthlyIncome, monthlySavings, budgetSpentPercent, savingsGoals,
    theme, currency, subscriptions, challenges, earnedAchievements, notifications,
    studentMode, aiInsights, healthScore, predictions, upcomingRenewals, moodAnalysis,
    streak, userLevel, dailyQuote, greeting, todaySpending, weekSpending, topCategory,
    bills, upcomingBills, effectiveXp, addXp,
    setCurrency, addTransaction, updateTransaction, deleteTransaction,
    setMonthlyBudget, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal,
    setTheme: setThemeValue, addSubscription, updateSubscription, deleteSubscription,
    addChallenge, updateChallenge, deleteChallenge,
    addBill, updateBill, deleteBill,
    setEarnedAchievements, addNotification, markNotificationRead, clearNotifications,
    setStudentMode, setSubscriptions, setChallenges, setNotifications,
  }), [
    transactions, budget, currentBudget, currentMonth, totalIncome, totalExpenses,
    monthlyExpenses, monthlyIncome, monthlySavings, budgetSpentPercent, savingsGoals,
    theme, currency, subscriptions, challenges, earnedAchievements, notifications,
    studentMode, aiInsights, healthScore, predictions, upcomingRenewals, moodAnalysis,
    streak, userLevel, dailyQuote, greeting, todaySpending, weekSpending, topCategory,
    bills, upcomingBills, effectiveXp, addXp,
    setCurrency, addTransaction, updateTransaction, deleteTransaction,
    setMonthlyBudget, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal,
    setThemeValue, addSubscription, updateSubscription, deleteSubscription,
    addChallenge, updateChallenge, deleteChallenge,
    addBill, updateBill, deleteBill,
    setEarnedAchievements, addNotification, markNotificationRead, clearNotifications,
    setStudentMode, setSubscriptions, setChallenges, setNotifications,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export { THEMES };
