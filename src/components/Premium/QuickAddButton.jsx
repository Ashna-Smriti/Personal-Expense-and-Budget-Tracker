import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Mic, Camera } from 'lucide-react';

const actions = [
  { icon: Plus, label: 'Transaction', color: 'from-primary to-accent' },
  { icon: Mic, label: 'Voice', color: 'from-indigo-500 to-purple-500' },
  { icon: Camera, label: 'Scan', color: 'from-emerald-500 to-teal-500' },
];

export default function QuickAddButton({ onClick, onVoice, onScan }) {
  const [open, setOpen] = useState(false);

  const handleAction = (index) => {
    setOpen(false);
    if (index === 0) onClick?.();
    else if (index === 1) onVoice?.();
    else if (index === 2) onScan?.();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && actions.slice(1).map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => handleAction(i + 1)}
            className={`w-12 h-12 rounded-full bg-gradient-to-br ${action.color} text-white shadow-lg flex items-center justify-center cursor-pointer`}
            title={action.label}
          >
            <action.icon className="w-5 h-5" />
          </motion.button>
        ))}
      </AnimatePresence>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          if (open) {
            setOpen(false);
          } else {
            setOpen(true);
          }
        }}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent text-white shadow-xl flex items-center justify-center cursor-pointer"
        style={{ boxShadow: '0 8px 32px var(--theme-glow)' }}
      >
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
          <Plus className="w-7 h-7" />
        </motion.div>
      </motion.button>
    </div>
  );
}
