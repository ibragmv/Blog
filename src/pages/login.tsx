import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate('/admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold mb-6 text-center text-zinc-100">Admin Login</h1>
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-700 text-zinc-200 placeholder-zinc-600"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-700 text-zinc-200 placeholder-zinc-600"
            required
          />
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded border border-red-900/30">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-zinc-100 text-zinc-900 py-2 rounded-md hover:bg-zinc-200 transition-colors disabled:opacity-50 flex justify-center items-center font-medium"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
