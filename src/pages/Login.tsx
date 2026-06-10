import { useState } from 'react';
import { Activity, Eye, EyeOff, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!username.trim()) { setError('Please enter your username'); return; }
    if (!password) { setError('Please enter your password'); return; }

    setLoading(true);
    const email = `${username.trim().toLowerCase()}@meditrack.app`;

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError('Invalid username or password. Please try again.');
      setLoading(false);
      return;
    }

    onLogin();
  }

  async function handleDemoLogin() {
    setLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: 'demo@meditrack.app',
      password: 'demo'
    });

    if (authError) {
      setError(authError.message || 'Failed to authenticate demo user');
      setLoading(false);
      return;
    }

    onLogin();
  }

  return (
    <div className="min-h-screen premium-gradient flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 -right-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10 transform transition-all duration-700 ease-out translate-y-0 opacity-100">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-[2.5rem] mb-6 backdrop-blur-xl border border-white/20 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
            <Activity size={40} className="text-white drop-shadow-lg" />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2 drop-shadow-sm">
            MediTrack <span className="text-blue-200">MR</span>
          </h1>
          <p className="text-blue-100 font-medium text-lg opacity-80">Medical Representative Portal</p>
        </div>

        <div className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-10 border border-white/20">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome Back</h2>
            <p className="text-slate-500 font-medium">Sign in to manage your medical orders</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50/50 border border-red-100 text-red-600 px-4 py-4 rounded-2xl text-sm font-semibold flex items-center gap-3 animate-shake">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 ml-1">
                Username
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoCapitalize="none"
                  autoComplete="username"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all duration-300 group-hover:border-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 ml-1">
                Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all duration-300 group-hover:border-slate-300 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4.5 rounded-2xl font-bold text-lg hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 active:scale-[0.98] disabled:opacity-60 transition-all duration-300 mt-4 group"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                  Sign In
                </>
              )}
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="h-[1px] bg-slate-100 flex-1"></div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">or</span>
              <div className="h-[1px] bg-slate-100 flex-1"></div>
            </div>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-emerald-600 text-white py-4.5 rounded-2xl font-bold text-lg hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-100 active:scale-[0.98] disabled:opacity-60 transition-all duration-300 group"
            >
              <Activity size={20} className="group-hover:animate-pulse" />
              Try Demo Version
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center font-medium uppercase tracking-widest leading-relaxed">
              Access restricted to authorized<br/>MR personnel only
            </p>
          </div>
        </div>

        <p className="text-center text-blue-200/60 text-sm mt-10 font-medium">
          MediTrack MR &copy; {new Date().getFullYear()} · v1.0.0
        </p>
      </div>
    </div>
  );

}
