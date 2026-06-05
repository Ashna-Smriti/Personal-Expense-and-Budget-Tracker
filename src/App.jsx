import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/Common/ErrorBoundary';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import BottomNav from './components/Layout/BottomNav';
import Dashboard from './components/Dashboard/Dashboard';
import TransactionsPage from './components/Transactions/TransactionsPage';
import BudgetManager from './components/Budget/BudgetManager';
import Analytics from './components/Analytics/Analytics';
import SavingsGoals from './components/Savings/SavingsGoal';
import Reports from './components/Reports/Reports';
import Insights from './components/Insights/Insights';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';
import Profile from './components/Auth/Profile';
import SubscriptionTracker from './components/Subscriptions/SubscriptionTracker';
import SavingsChallenges from './components/Savings/SavingsChallenges';
import Achievements from './components/Achievements/Achievements';
import StudentDashboard from './components/Student/StudentDashboard';
import GoalSimulator from './components/Tools/GoalSimulator';
import WhatIfSimulator from './components/Tools/WhatIfSimulator';
import BillReminder from './components/Bills/BillReminder';
import ExpenseHeatmap from './components/Analytics/ExpenseHeatmap';

function AuthRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function AppContent() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { theme, studentMode } = useApp();
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
  }, [theme]);

  const handleLogout = useCallback(() => {
    setLoggingOut(true);
    logout();
    setTimeout(() => {
      navigate('/login', { replace: true });
      setLoggingOut(false);
    }, 800);
  }, [logout, navigate]);

  if (loggingOut) {
    return (
      <div className="min-h-dvh min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Signing out...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-dvh min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthRoutes />;
  }

  return (
    <div className="min-h-dvh min-h-screen flex bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0">
        <Header onMenuClick={() => setMobileOpen((prev) => !prev)} user={user} onLogout={handleLogout} />
        <main className="flex-1 px-4 lg:px-6 py-4 lg:py-6 pb-20 md:pb-4 lg:pb-6">
          <Routes>
            <Route path="/" element={studentMode ? <StudentDashboard /> : <Dashboard />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/budget" element={<BudgetManager />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/savings" element={<SavingsGoals />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/subscriptions" element={<SubscriptionTracker />} />
            <Route path="/challenges" element={<SavingsChallenges />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/heatmap" element={<ExpenseHeatmap />} />
            <Route path="/goal-simulator" element={<GoalSimulator />} />
            <Route path="/what-if" element={<WhatIfSimulator />} />
            <Route path="/bills" element={<BillReminder />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

function WrappedAppContent() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WrappedAppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
