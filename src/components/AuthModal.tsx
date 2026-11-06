import React, { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  Mail, 
  KeyRound,
  AlertTriangle, 
  RefreshCw,
  UserPlus
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userData: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'mfa'>('login');
  
  // Login Form (Mail ID and Password)
  const [email, setEmail] = useState('a.wright@securesaas.io');
  const [password, setPassword] = useState('SuperSecretPass2026!');

  // Signup Form (ONLY Mail ID and Password)
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // MFA Form
  const [otp, setOtp] = useState('123456');
  const [tempUserId, setTempUserId] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success) {
        if (data.user.mfaEnabled && !data.user.mfaVerified) {
          setTempUserId(data.user.id);
          setMode('mfa');
        } else {
          onLoginSuccess(data.user);
          onClose();
        }
      } else {
        setErrorMsg(data.message || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      setErrorMsg('Network error communicating with Auth Service API');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword('SuperSecretPass2026!');
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: quickEmail, password: 'SuperSecretPass2026!' })
      });
      const data = await res.json();

      if (data.success) {
        onLoginSuccess(data.user);
        onClose();
      } else {
        setErrorMsg(data.message || 'Quick login failed');
      }
    } catch (err) {
      setErrorMsg('Quick login error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (!signupEmail || !signupPassword) {
      setErrorMsg('Please enter both Mail ID and Password.');
      setLoading(false);
      return;
    }

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
        onLoginSuccess(data.user);
        onClose();
      } else {
        setErrorMsg(data.message || 'Signup failed');
      }
    } catch (err) {
      setErrorMsg('Error creating account on server.');
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/verify-mfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: tempUserId, otp })
      });
      const data = await res.json();

      if (data.success) {
        onLoginSuccess(data.user);
        onClose();
      } else {
        setErrorMsg(data.message || 'Invalid 6-digit OTP code');
      }
    } catch (err) {
      setErrorMsg('MFA verification error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0D1117] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative text-slate-200">
        
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {mode === 'login' ? 'Vault Authentication' :
                 mode === 'signup' ? 'Create Account' : 'MFA Challenge Gate'}
              </h3>
              <p className="text-[10px] font-mono text-slate-400">FIPS 140-2 KMS Enforced</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Selector: Login vs Signup */}
        {mode !== 'mfa' && (
          <div className="grid grid-cols-2 p-1 bg-white/5 rounded-lg border border-white/10 text-xs font-mono font-bold">
            <button
              onClick={() => { setMode('login'); setErrorMsg(''); }}
              className={`py-1.5 rounded transition-all flex items-center justify-center gap-2 ${
                mode === 'login' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" /> Log In
            </button>
            <button
              onClick={() => { setMode('signup'); setErrorMsg(''); }}
              className={`py-1.5 rounded transition-all flex items-center justify-center gap-2 ${
                mode === 'signup' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> Sign Up
            </button>
          </div>
        )}

        {/* Error Feedback Banner */}
        {errorMsg && (
          <div className="p-3 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* LOGIN FORM (Mail ID & Password Only) */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>Mail ID / Email Address</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="user@enterprise.com"
                className="w-full bg-[#0A0C10] border border-white/10 rounded py-2 px-3 text-white outline-none focus:border-blue-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                <span>Password</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-[#0A0C10] border border-white/10 rounded py-2 px-3 text-white outline-none focus:border-blue-500 font-mono text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all mt-2 uppercase tracking-wider font-mono"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Log In
            </button>

            {/* Quick Login Presets */}
            <div className="pt-2 border-t border-white/5 space-y-1.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">1-Click Demo Accounts:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('a.wright@securesaas.io')}
                  className="py-1 px-2 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-purple-300 text-left truncate"
                >
                  ⚡ Alex Wright
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('e.rostova@securesaas.io')}
                  className="py-1 px-2 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-rose-300 text-left truncate"
                >
                  ⚡ Elena Rostova
                </button>
              </div>
            </div>
          </form>
        )}

        {/* SIGNUP FORM (Mail ID & Password Only) */}
        {mode === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>Mail ID / Email Address</span>
              </label>
              <input
                type="email"
                placeholder="newuser@domain.com"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
                className="w-full bg-[#0A0C10] border border-white/10 rounded py-2 px-3 text-white outline-none focus:border-blue-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                <span>Password</span>
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required
                className="w-full bg-[#0A0C10] border border-white/10 rounded py-2 px-3 text-white outline-none focus:border-blue-500 font-mono text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all mt-2 uppercase tracking-wider font-mono"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Create Account
            </button>
          </form>
        )}

        {/* MFA CHALLENGE FORM */}
        {mode === 'mfa' && (
          <form onSubmit={handleMfaSubmit} className="space-y-4 text-xs">
            <div className="p-3 rounded bg-blue-950/40 border border-blue-500/30 text-blue-300 text-xs font-mono">
              🔒 Enter the 6-digit verification code sent to your Authenticator App (Default: <strong>123456</strong>).
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-bold text-center uppercase tracking-wider text-[10px]">6-Digit OTP Token</label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-[#0A0C10] border border-blue-500 rounded py-2.5 text-center text-xl font-mono tracking-widest text-blue-400 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-2.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider font-mono"
            >
              Verify OTP & Enter Vault
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
