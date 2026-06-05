import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, footer }) {
  const bodyRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      bodyRef.current?.scrollTo(0, 0);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 md:w-full md:max-w-lg flex flex-col glass-card dark:glass-dark shadow-2xl rounded-t-2xl md:rounded-2xl max-h-[85vh] md:max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-200/30 dark:border-white/5 flex-shrink-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white truncate pr-2">{title}</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div ref={bodyRef} className="flex-1 overflow-y-auto min-h-0 p-4 md:p-5" style={{ WebkitOverflowScrolling: 'touch' }}>
              {children}
              {footer && (
                <div className="sticky bottom-0 -mx-4 md:-mx-5 px-4 md:px-5 py-3 mt-4 -mb-4 md:-mb-5 bg-white/90 dark:bg-slate-900/90 border-t border-slate-200/30 dark:border-white/5 backdrop-blur-md">
                  {footer}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
