import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
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

function AppContent() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, studentMode } = useApp();
  const { user, logout } = useAuth();

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
  }, [theme]);

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0">
        <Header onMenuClick={() => setMobileOpen((prev) => !prev)} user={user} onLogout={logout} />
        <main className="flex-1 px-4 lg:px-6 py-4 lg:py-6">
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
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function WrappedAppContent() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
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
