import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { ALL_CATEGORIES } from '../../utils/constants';

export default function TransactionItem({ transaction, onEdit, onDelete }) {
  const { currency } = useApp();
  const cat = ALL_CATEGORIES.find((c) => c.name === transaction.category);
  const isExpense = transaction.type === 'Expense';

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group transaction-enter">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
        style={{ backgroundColor: isExpense ? `${cat?.color}15` : '#10b98115' }}
      >
        {cat?.icon || (isExpense ? '💳' : '💰')}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-slate-800 dark:text-slate-200 truncate">{transaction.description}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {cat?.name || transaction.category} &middot; {formatDate(transaction.date)}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`font-semibold text-sm ${isExpense ? 'text-red-500' : 'text-emerald-500'}`}>
          {isExpense ? '-' : '+'}{formatCurrency(currency, transaction.amount)}
        </p>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(transaction)}
          className="p-1.5 rounded-md text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
          title="Edit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(transaction.id)}
          className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          title="Delete"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
