import { ALL_CATEGORIES, MONTHS } from '../../utils/constants';
import { useApp } from '../../context/AppContext';

export default function Filters({ filters, setFilters, showMonth = true, showCategory = true }) {
  const { transactions } = useApp();
  const availableMonths = [...new Set(transactions.map((t) => {
    const d = new Date(t.date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }))].sort();

  const clearFilters = () => {
    setFilters({ month: '', category: '', startDate: '', endDate: '', search: '' });
  };

  const hasFilters = filters.month || filters.category || filters.startDate || filters.endDate || filters.search;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {showMonth && (
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Month</label>
            <select
              value={filters.month}
              onChange={(e) => setFilters((prev) => ({ ...prev, month: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-colors"
            >
              <option value="">All Months</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {MONTHS[parseInt(m.split('-')[1]) - 1]} {m.split('-')[0]}
                </option>
              ))}
            </select>
          </div>
        )}
        {showCategory && (
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-colors"
            >
              <option value="">All Categories</option>
              {ALL_CATEGORIES.map((c) => (
                <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
        )}
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">From</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-colors"
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">To</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-colors"
          />
        </div>
        <div className="flex-[2] min-w-[200px]">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Search</label>
          <input
            type="text"
            placeholder="Search by description..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-colors placeholder:text-slate-400"
          />
        </div>
        {hasFilters && (
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
