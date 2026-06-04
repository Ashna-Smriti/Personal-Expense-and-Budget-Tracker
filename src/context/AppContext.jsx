import { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getMonthYear } from '../utils/helpers';
import { generateAIInsights } from '../utils/aiInsights';
import { calculateHealthScore } from '../utils/healthScore';
import { predictExpenses } from '../utils/predictions';
import { checkAchievements } from '../utils/achievements';
import { getUpcomingRenewals } from '../utils/subscriptions';
import { analyzeMoodSpending } from '../utils/moodTracker';
import { createNotification, checkBudgetAlert, checkSavingsGoalAlert, checkUnusualSpendingAlert } from '../utils/notifications';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [transactions, setTransactions] = useLocalStorage('bt_transactions', []);
  const [budget, setBudget] = useLocalStorage('bt_budget', {});
  const [savingsGoals, setSavingsGoals] = useLocalStorage('bt_savings_goals', []);
  const [theme, setTheme] = useLocalStorage('bt_theme', 'light');
  const [currency, setCurrency] = useLocalStorage('bt_currency', 'INR');
  const [subscriptions, setSubscriptions] = useLocalStorage('bt_subscriptions', []);
  const [challenges, setChallenges] = useLocalStorage('bt_challenges', []);
  const [earnedAchievements, setEarnedAchievements] = useLocalStorage('bt_achievements', []);
  const [notifications, setNotifications] = useLocalStorage('bt_notifications', []);
  const [studentMode, setStudentMode] = useLocalStorage('bt_student_mode', false);

  const currentMonth = getMonthYear(new Date().toISOString());
  const currentBudget = budget[currentMonth] || 0;

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

  const moodAnalysis = useMemo(() => analyzeMoodSpending(transactions), [transactions]);

  const addTransaction = useCallback((transaction) => {
    setTransactions((prev) => [...prev, { ...transaction, id: Date.now().toString() }]);
  }, [setTransactions]);

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
  }, [setSavingsGoals]);

  const updateSavingsGoal = useCallback((id, data) => {
    setSavingsGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...data } : g)));
  }, [setSavingsGoals]);

  const deleteSavingsGoal = useCallback((id) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
  }, [setSavingsGoals]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, [setTheme]);

  const addSubscription = useCallback((sub) => {
    setSubscriptions((prev) => [...prev, { ...sub, id: Date.now().toString(), createdAt: new Date().toISOString() }]);
  }, [setSubscriptions]);

  const updateSubscription = useCallback((id, data) => {
    setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  }, [setSubscriptions]);

  const deleteSubscription = useCallback((id) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  }, [setSubscriptions]);

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
    monthlyExpenses, monthlyIncome, budgetSpentPercent, savingsGoals, theme, currency,
    subscriptions, challenges, earnedAchievements, notifications, studentMode,
    aiInsights, healthScore, predictions, upcomingRenewals, moodAnalysis,
    setCurrency, addTransaction, updateTransaction, deleteTransaction,
    setMonthlyBudget, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal,
    toggleTheme, addSubscription, updateSubscription, deleteSubscription,
    addChallenge, updateChallenge, deleteChallenge,
    setEarnedAchievements, addNotification, markNotificationRead, clearNotifications,
    setStudentMode, setSubscriptions, setChallenges, setNotifications,
  }), [
    transactions, budget, currentBudget, currentMonth, totalIncome, totalExpenses,
    monthlyExpenses, monthlyIncome, budgetSpentPercent, savingsGoals, theme, currency,
    subscriptions, challenges, earnedAchievements, notifications, studentMode,
    aiInsights, healthScore, predictions, upcomingRenewals, moodAnalysis,
    setCurrency, addTransaction, updateTransaction, deleteTransaction,
    setMonthlyBudget, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal,
    toggleTheme, addSubscription, updateSubscription, deleteSubscription,
    addChallenge, updateChallenge, deleteChallenge,
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
