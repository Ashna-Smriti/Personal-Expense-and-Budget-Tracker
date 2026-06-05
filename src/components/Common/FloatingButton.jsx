import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Mic, Camera } from 'lucide-react';

export default function FloatingButton({ onClick, onVoice, onScan }) {
  const [open, setOpen] = useState(false);

  const handleAction = (index) => {
    setOpen(false);
    if (index === 0) onClick?.();
    else if (index === 1) onVoice?.();
    else if (index === 2) onScan?.();
  };

  const actions = [
    { icon: Plus, label: 'Transaction', color: 'bg-primary hover:bg-primary-dark' },
    { icon: Mic, label: 'Voice', color: 'bg-indigo-500 hover:bg-indigo-600' },
    { icon: Camera, label: 'Scan', color: 'bg-emerald-500 hover:bg-emerald-600' },
  ];

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
            className={`w-12 h-12 ${action.color} text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95`}
            title={action.label}
          >
            <action.icon className="w-5 h-5" />
          </motion.button>
        ))}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
      >
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
          <Plus className="w-7 h-7" />
        </motion.div>
      </motion.button>
    </div>
  );
}
