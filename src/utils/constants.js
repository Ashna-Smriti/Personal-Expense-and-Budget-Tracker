export const EXPENSE_CATEGORIES = [
  { name: 'Food', icon: '🍔', color: '#ef4444' },
  { name: 'Transport', icon: '🚗', color: '#f59e0b' },
  { name: 'Shopping', icon: '🛍️', color: '#ec4899' },
  { name: 'Education', icon: '📚', color: '#6366f1' },
  { name: 'Entertainment', icon: '🎬', color: '#8b5cf6' },
  { name: 'Bills', icon: '📄', color: '#14b8a6' },
  { name: 'Healthcare', icon: '🏥', color: '#f97316' },
  { name: 'Travel', icon: '✈️', color: '#06b6d4' },
  { name: 'Other', icon: '📌', color: '#64748b' },
];

export const INCOME_CATEGORIES = [
  { name: 'Salary', icon: '💼', color: '#10b981' },
  { name: 'Freelancing', icon: '💻', color: '#6366f1' },
  { name: 'Business', icon: '🏢', color: '#f59e0b' },
  { name: 'Scholarship', icon: '🎓', color: '#8b5cf6' },
  { name: 'Gift', icon: '🎁', color: '#ec4899' },
  { name: 'Other', icon: '📌', color: '#64748b' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', locale: 'en-IN', flag: '🇮🇳', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', locale: 'en-US', flag: '🇺🇸', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', locale: 'de-DE', flag: '🇪🇺', name: 'Euro' },
  { code: 'GBP', symbol: '£', locale: 'en-GB', flag: '🇬🇧', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', locale: 'ja-JP', flag: '🇯🇵', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', locale: 'en-AU', flag: '🇦🇺', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', locale: 'en-CA', flag: '🇨🇦', name: 'Canadian Dollar' },
  { code: 'SGD', symbol: 'S$', locale: 'en-SG', flag: '🇸🇬', name: 'Singapore Dollar' },
];

export const DEFAULT_CURRENCY = 'INR';

export const COLORS = {
  primary: '#6366f1',
  secondary: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
};
