import { useState } from 'react';
import { MOODS } from '../../utils/moodTracker';

export default function MoodSelector({ selected, onSelect }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">How are you feeling?</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-primary transition-colors w-full"
      >
        {selected ? (
          <>
            <span>{MOODS.find((m) => m.value === selected)?.icon}</span>
            <span>{MOODS.find((m) => m.value === selected)?.label}</span>
          </>
        ) : (
          <span className="text-slate-400">Select mood (optional)</span>
        )}
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-10 p-1">
          {MOODS.map((mood) => (
            <button
              key={mood.value}
              type="button"
              onClick={() => { onSelect(mood.value); setOpen(false); }}
              className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md transition-colors ${
                selected === mood.value ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <span>{mood.icon}</span>
              <span>{mood.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
