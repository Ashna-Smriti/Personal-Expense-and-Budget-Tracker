import { Component } from 'react';
import { Link } from 'react-router-dom';

const isAuthError = (error) => {
  const msg = error?.message || '';
  return msg.includes('GoogleOAuthProvider') || msg.includes('Google') || msg.includes('auth');
};

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error?.message, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const isAuth = isAuthError(this.state.error);

      return (
        <div className="min-h-dvh min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-500/10 mb-4">
              <span className="text-2xl">!</span>
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              {isAuth ? 'Authentication service unavailable' : 'Something went wrong'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {isAuth
                ? 'There was a problem with the authentication service. Please try again.'
                : this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/login"
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-xl hover:opacity-90 transition-all"
              >
                {isAuth ? 'Return to Login' : 'Go to Login'}
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.08] rounded-xl transition-all border border-slate-200 dark:border-white/10"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
