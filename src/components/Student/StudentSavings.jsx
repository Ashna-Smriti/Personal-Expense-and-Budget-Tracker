import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/helpers';
import { STUDENT_SAVINGS_GOALS } from '../../utils/constants';
import { Plus, Target, Trash2 } from 'lucide-react';

export default function StudentSavings() {
  const { savingsGoals, addSavingsGoal, deleteSavingsGoal, currency } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', target: '', icon: '🎯' });

  const studentGoals = savingsGoals.filter(g =>
    STUDENT_SAVINGS_GOALS.some(sg => sg.name === g.name) || g.isStudentGoal
  );

  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.target) return;
    addSavingsGoal({ name: newGoal.name, target: parseFloat(newGoal.target), icon: newGoal.icon, isStudentGoal: true });
    setNewGoal({ name: '', target: '', icon: '🎯' });
    setShowAdd(false);
  };

  const addTemplate = (template) => {
    addSavingsGoal({ name: template.name, target: template.target, icon: template.icon, isStudentGoal: true });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Student Savings Goals
        </h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Goal
        </button>
      </div>

      {showAdd && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3"
        >
          <div className="grid grid-cols-2 gap-2">
            <input
              value={newGoal.name}
              onChange={(e) => setNewGoal(g => ({ ...g, name: e.target.value }))}
              placeholder="Goal name"
              className="px-3 py-2 text-sm rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              type="number"
              value={newGoal.target}
              onChange={(e) => setNewGoal(g => ({ ...g, target: e.target.value }))}
              placeholder="Target amount"
              className="px-3 py-2 text-sm rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(false)} className="flex-1 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">Cancel</button>
            <button onClick={handleAddGoal} className="flex-1 px-3 py-2 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors">Save Goal</button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {STUDENT_SAVINGS_GOALS.map((template) => {
          const existing = studentGoals.find(g => g.name === template.name);
          const progress = existing ? Math.min((existing.saved / existing.target) * 100, 100) : 0;
          return (
            <motion.div
              key={template.name}
              whileHover={{ scale: 1.02 }}
              className="p-3 rounded-xl glass-card dark:glass-dark cursor-pointer"
              onClick={() => !existing && addTemplate(template)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{template.icon}</span>
                {existing && (
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSavingsGoal(existing.id); }}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{template.name}</p>
              {existing ? (
                <div className="mt-2">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-primary font-medium">{formatCurrency(currency, existing.saved)}</span>
                    <span className="text-slate-400">{formatCurrency(currency, existing.target)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{Math.round(progress)}% saved</p>
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 mt-1">{formatCurrency(currency, template.target)}</p>
              )}
            </motion.div>
          );
        })}
      </div>

      {studentGoals.filter(g => !STUDENT_SAVINGS_GOALS.some(sg => sg.name === g.name)).length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Custom Goals</p>
          {studentGoals.filter(g => !STUDENT_SAVINGS_GOALS.some(sg => sg.name === g.name)).map((goal) => {
            const progress = Math.min((goal.saved / goal.target) * 100, 100);
            return (
              <div key={goal.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                <span className="text-lg">{goal.icon || '🎯'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{goal.name}</p>
                  <div className="flex justify-between text-[10px] mt-1">
                    <span className="text-primary">{formatCurrency(currency, goal.saved)}</span>
                    <span className="text-slate-400">{formatCurrency(currency, goal.target)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden mt-1">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => deleteSavingsGoal(goal.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
