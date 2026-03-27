import { Loader2 } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/components/admin-auth-provider';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, signIn } = useAdminAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signIn(email, password);
      navigate('/admin');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold mb-6 text-center text-zinc-100">Admin Login</h1>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-zinc-400 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-700 text-zinc-200 placeholder-zinc-600"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-zinc-400 mb-1">
            Password
          </label>
          <input
            id="password"
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
          disabled={isLoading}
          className="w-full bg-zinc-100 text-zinc-900 py-2 rounded-md hover:bg-zinc-200 transition-colors disabled:opacity-50 flex justify-center items-center font-medium"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
