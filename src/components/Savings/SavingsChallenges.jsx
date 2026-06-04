import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CHALLENGES_TEMPLATES, checkChallengeProgress } from '../../utils/challenges';
import { formatCurrency } from '../../utils/helpers';
import EmptyState from '../Common/EmptyState';

export default function SavingsChallenges() {
  const { challenges, addChallenge, updateChallenge, deleteChallenge, transactions, currency } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleStartChallenge = (template) => {
    addChallenge({
      ...template,
      completed: false,
      progress: 0,
    });
    setShowForm(false);
    setSelectedTemplate(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Savings Challenges</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Take on challenges and build better financial habits</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors">+ New Challenge</button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Choose a Challenge</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CHALLENGES_TEMPLATES.map((template, idx) => (
              <button key={idx} onClick={() => handleStartChallenge(template)}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-primary hover:bg-primary/5 transition-all text-left">
                <span className="text-2xl">{template.icon}</span>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-white">{template.name}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{template.days} days</p>
                </div>
              </button>
            ))}
          </div>
          <button onClick={() => setShowForm(false)} className="mt-3 text-sm text-primary font-medium">Cancel</button>
        </div>
      )}

      {challenges.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <EmptyState icon="🏋️" title="No challenges" description="Start a challenge to build better financial habits" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((challenge) => {
            const progress = checkChallengeProgress(challenge, transactions);
            const daysSinceStart = Math.ceil((new Date() - new Date(challenge.startedAt)) / (1000 * 60 * 60 * 24));
            const daysLeft = Math.max(0, (challenge.days || 30) - daysSinceStart);
            return (
              <div key={challenge.id} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm card-hover">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{challenge.icon}</span>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-white">{challenge.name}</h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{daysLeft > 0 ? `${daysLeft} days remaining` : 'Time expired'}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteChallenge(challenge.id)} className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                <div className="mb-2">
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: progress >= 100 ? '#10b981' : '#6366f1' }} />
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Progress</span>
                  <span className={`font-medium ${progress >= 100 ? 'text-emerald-500' : 'text-primary'}`}>{progress.toFixed(0)}%</span>
                </div>
                {progress >= 100 && (
                  <p className="mt-2 text-xs text-emerald-500 font-medium bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg text-center">🎉 Challenge completed!</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
