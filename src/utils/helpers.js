import { MONTHS, CURRENCIES, DEFAULT_CURRENCY } from './constants';

export const formatCurrency = (code, amount) => {
  const currency = CURRENCIES.find((c) => c.code === code) || CURRENCIES.find((c) => c.code === DEFAULT_CURRENCY);
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      currencyDisplay: 'narrowSymbol',
    }).format(amount);
  } catch {
    return `${currency.symbol}${Number(amount).toLocaleString()}`;
  }
};

export const getCurrencySymbol = (code) => {
  const currency = CURRENCIES.find((c) => c.code === code) || CURRENCIES.find((c) => c.code === DEFAULT_CURRENCY);
  return currency.symbol;
};

export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const getMonthLabel = (monthStr) => {
  const [year, month] = monthStr.split('-');
  return `${MONTHS[parseInt(month) - 1]} ${year}`;
};

export const getMonthYear = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const filterTransactions = (transactions, filters) => {
  return transactions.filter((t) => {
    if (filters.month && getMonthYear(t.date) !== filters.month) return false;
    if (filters.category && t.category !== filters.category) return false;
    if (filters.startDate && new Date(t.date) < new Date(filters.startDate)) return false;
    if (filters.endDate && new Date(t.date) > new Date(filters.endDate)) return false;
    if (filters.search && !t.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });
};

export const calculateFinancialHealth = (income, expenses, budget) => {
  if (income === 0) return { score: 0, label: 'No Income', color: '#64748b' };
  const savingsRate = ((income - expenses) / income) * 100;
  const budgetUtilization = budget > 0 ? Math.min(expenses / budget, 1) : 0;
  const expenseRatio = expenses / income;
  let score = 0;
  if (savingsRate >= 30) score += 40;
  else if (savingsRate >= 20) score += 30;
  else if (savingsRate >= 10) score += 20;
  else if (savingsRate >= 0) score += 10;
  if (budgetUtilization <= 0.7) score += 30;
  else if (budgetUtilization <= 0.9) score += 20;
  else if (budgetUtilization <= 1) score += 10;
  if (expenseRatio <= 0.5) score += 30;
  else if (expenseRatio <= 0.7) score += 20;
  else if (expenseRatio <= 0.9) score += 10;
  let label = 'Poor';
  let color = '#ef4444';
  if (score >= 80) { label = 'Excellent'; color = '#10b981'; }
  else if (score >= 60) { label = 'Good'; color = '#6366f1'; }
  else if (score >= 40) { label = 'Fair'; color = '#f59e0b'; }
  return { score, label, color };
};
