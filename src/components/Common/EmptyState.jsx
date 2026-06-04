export default function EmptyState({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-5xl mb-4 opacity-60">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-500 dark:text-slate-400 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 dark:text-slate-500 text-center max-w-xs">{description}</p>
    </div>
  );
}
