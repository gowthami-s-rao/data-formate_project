import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  UserPlus, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ArrowRight, 
  Mail,
  KeyRound
} from 'lucide-react';
import { User } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onContinueAsGuest: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onContinueAsGuest }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('a.wright@securesaas.io');
  const [loginPassword, setLoginPassword] = useState('SuperSecretPass2026!');

  // Signup form state (ONLY Mail ID and Password)
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setErrorMsg('Please enter both Mail ID and Password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg('Login successful! Redirecting to secure vault...');
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 500);
      } else {
        setErrorMsg(data.message || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      setErrorMsg('Network error connecting to Auth Service.');
    } finally {
      setLoading(false);
    }
  };

  // Quick preset login helper
  const handleQuickPreset = async (email: string) => {
    setLoginEmail(email);
    setLoginPassword('SuperSecretPass2026!');
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'SuperSecretPass2026!' })
      });
      const data = await res.json();

      if (data.success) {
        onLoginSuccess(data.user);
      } else {
        setErrorMsg('Preset login failed.');
      }
    } catch (err) {
      setErrorMsg('Error triggering quick login.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Account Signup submission (ONLY Mail ID & Password)
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail || !signupPassword) {
      setErrorMsg('Please enter both Mail ID and Password.');
      return;
    }

    if (signupPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupEmail,
          password: signupPassword
        })
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg(`Account created successfully for ${data.user.email}!`);
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 600);
      } else {
        setErrorMsg(data.message || 'Account registration failed.');
      }
    } catch (err) {
      setErrorMsg('Server error registering account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0A0C10] text-slate-100 font-sans flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-blue-500 selection:text-white">
      
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header branding bar */}
      <header className="flex items-center justify-between max-w-5xl w-full mx-auto relative z-10 pb-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-lg tracking-tight block">
              AEGIS<span className="text-blue-500">VAULT</span> PRO
            </span>
            <span className="text-[10px] font-mono text-slate-400">Enterprise Cloud Security Platform</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded bg-white/5 border border-white/10 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Secure Encryption Active</span>
          </div>
          <button
            onClick={onContinueAsGuest}
            className="text-xs font-mono text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1.5 transition-all"
          >
            <span>Explore as Guest</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content Box */}
      <main className="max-w-md w-full mx-auto my-auto py-8 relative z-10">
        
        <div className="bg-[#0D1117] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative">
          
          {/* Header Title */}
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold text-white tracking-tight">
              {activeTab === 'login' ? 'Welcome Back' : 'Create New Account'}
            </h1>
            <p className="text-xs text-slate-400">
              {activeTab === 'login' 
                ? 'Sign in with your Mail ID and Password to access your vault.' 
                : 'Enter your Mail ID and Password to register a new account.'}
            </p>
          </div>

          {/* Tab Switcher: Log In vs Create Account */}
          <div className="grid grid-cols-2 p-1 bg-white/5 rounded-xl border border-white/10 text-xs font-mono font-bold">
            <button
              onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'login' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Log In</span>
            </button>

            <button
              onClick={() => { setActiveTab('signup'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'signup' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Feedback Banners */}
          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 font-mono">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 font-mono">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOG IN FORM (Mail ID & Password Only) */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1.5 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span>Mail ID / Email Address</span>
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  placeholder="e.g. user@enterprise.com"
                  className="w-full bg-[#0A0C10] border border-white/10 rounded-lg py-3 px-3.5 text-white outline-none focus:border-blue-500 font-mono text-xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                  <span>Password</span>
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#0A0C10] border border-white/10 rounded-lg py-3 px-3.5 text-white outline-none focus:border-blue-500 font-mono text-xs transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all uppercase tracking-wider font-mono mt-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                <span>Log In</span>
              </button>

              {/* Fast Demo Accounts */}
              <div className="pt-3 border-t border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <span>Demo Mail Accounts:</span>
                  <span>1-Click Test Login</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickPreset('a.wright@securesaas.io')}
                    className="p-2 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-purple-300 text-left transition-colors truncate"
                  >
                    ⚡ Alex Wright
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPreset('e.rostova@securesaas.io')}
                    className="p-2 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-rose-300 text-left transition-colors truncate"
                  >
                    ⚡ Elena Rostova
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: CREATE ACCOUNT FORM (Mail ID & Password Only) */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1.5 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span>Mail ID / Email Address</span>
                </label>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                  placeholder="e.g. newuser@domain.com"
                  className="w-full bg-[#0A0C10] border border-white/10 rounded-lg py-3 px-3.5 text-white outline-none focus:border-blue-500 font-mono text-xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                  <span>Password</span>
                </label>
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                  placeholder="At least 6 characters"
                  className="w-full bg-[#0A0C10] border border-white/10 rounded-lg py-3 px-3.5 text-white outline-none focus:border-blue-500 font-mono text-xs transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all uppercase tracking-wider font-mono mt-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                <span>Create Account</span>
              </button>
            </form>
          )}

        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500 gap-2 relative z-10">
        <div>© 2026 AegisVault Systems. All Rights Reserved.</div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Encrypted Auth Engine</span>
          <span>●</span>
          <span>AES-256</span>
        </div>
      </footer>

    </div>
  );
};
