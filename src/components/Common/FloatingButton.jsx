import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Mic, Camera, Bot } from 'lucide-react';

const actions = [
  { icon: Bot, label: 'AI Assistant', action: 'assistant', color: 'bg-gradient-to-br from-amber-500 to-orange-500' },
  { icon: Camera, label: 'Scan Receipt', action: 'scan', color: 'bg-gradient-to-br from-emerald-500 to-teal-500' },
  { icon: Mic, label: 'Voice Entry', action: 'voice', color: 'bg-gradient-to-br from-indigo-500 to-purple-500' },
  { icon: Plus, label: 'Add Transaction', action: 'transaction', color: 'bg-primary hover:bg-primary-dark' },
];

export default function FloatingButton({ onClick, onVoice, onScan, onAssistant }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleAction = (action) => {
    setOpen(false);
    if (action === 'transaction') onClick?.();
    else if (action === 'voice') onVoice?.();
    else if (action === 'scan') onScan?.();
    else if (action === 'assistant') onAssistant?.();
  };

  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <div className="flex flex-col items-end gap-3 mb-4 relative z-[9999]">
            {actions.map((action, i) => (
              <motion.button
                key={action.action}
                initial={{ opacity: 0, scale: 0.5, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.5, x: 20 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
                onClick={() => handleAction(action.action)}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <span className="px-3 py-1.5 text-xs font-medium text-white bg-slate-800/90 dark:bg-white/90 dark:text-slate-800 rounded-lg shadow-lg backdrop-blur-sm whitespace-nowrap">
                  {action.label}
                </span>
                <div className={`w-12 h-12 rounded-full ${action.color} text-white shadow-xl flex items-center justify-center flex-shrink-0 hover:scale-110 active:scale-95 transition-transform`}>
                  <action.icon className="w-5 h-5" />
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        className="relative z-[9999] w-14 h-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
      >
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
          <Plus className="w-7 h-7" />
        </motion.div>
      </motion.button>
    </div>
  );
}
