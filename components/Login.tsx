
import React, { useState, useEffect } from 'react';

interface LoginProps {
  onLogin: (user: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const hasAccount = localStorage.getItem('hemoscan_has_account');
    if (!hasAccount) setIsLogin(false);
  }, []);

  const validatePassword = (pass: string) => {
    // Simple validation: 8 chars, letter, number, and special character
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(pass);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (!validatePassword(password)) {
      setError("Password must be 8+ characters with a letter, number, and special character.");
      return;
    }

    // Direct login for simplified flow
    localStorage.setItem('hemoscan_has_account', 'true');
    onLogin(email.split('@')[0]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50 relative overflow-hidden">
      {/* Soft decorative background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative z-10 transition-all">
        <div className="bg-blue-600 px-8 py-10 text-center relative">
          <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-4 backdrop-blur-md border border-white/20">
            <i className="fas fa-droplet"></i>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-blue-100/80 text-sm mt-2">
            {isLogin ? 'Sign in to access HemoScan AI' : 'Join our hematology screening portal'}
          </p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg flex items-center gap-2">
              <i className="fas fa-circle-exclamation"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                  <i className="fas fa-envelope text-sm"></i>
                </span>
                <input 
                  type="email" 
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all text-sm"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                  <i className="fas fa-lock text-sm"></i>
                </span>
                <input 
                  type="password" 
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95 mt-2 flex items-center justify-center gap-2"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
              <i className="fas fa-arrow-right text-xs"></i>
            </button>

            <div className="text-center pt-4 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 text-xs font-bold hover:underline"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
