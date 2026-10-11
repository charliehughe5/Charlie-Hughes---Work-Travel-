import React, { useState } from 'react';
import { Lock, Youtube, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { api, setClientToken } from '../api/client';

interface AuthLoginViewProps {
  onSuccess: () => void;
}

export const AuthLoginView: React.FC<AuthLoginViewProps> = ({ onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;

    setError('');
    setLoading(true);

    try {
      const res = await api.login(pin.trim());
      if (res.success && res.token) {
        setClientToken(res.token);
        onSuccess();
      } else {
        setError('Authentication failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Incorrect owner PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-600 text-white shadow-md mb-4">
          <Youtube className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Charlie Creator Hub
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Work. Travel. Real Life.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          <div className="mb-6 flex items-center gap-2 p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs text-slate-600">
            <Lock className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Private creator workspace for Charlie Hughes. Please enter your owner PIN to continue.</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="pin" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Owner Access PIN
              </label>
              <div className="mt-1 relative">
                <input
                  id="pin"
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter 4-digit PIN (Default: 2026)"
                  maxLength={12}
                  autoFocus
                  className="block w-full text-center text-lg tracking-widest font-mono rounded-xl border border-slate-300 py-3 px-4 shadow-2xs focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                <KeyRound className="absolute right-3.5 top-3.5 w-5 h-5 text-slate-400" />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !pin.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-xs text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Verifying...' : 'Unlock Creator Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Encrypted Session
            </span>
            <span>Default PIN: 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};
