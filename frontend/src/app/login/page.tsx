'use client';

import api from '@/lib/api';
import { setAuth } from '@/lib/auth';
import { ApiResponse, User } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post<ApiResponse<{ token: string; user: User }>>(
        '/api/v1/auth/login',
        { email, password }
      );

      if (response.data.success) {
        const { token, user } = response.data.data;
        setAuth(token, user);
        
        if (user.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-indigo-900 dark:text-indigo-300">
          PBCPMS Login
        </h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-500 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-500 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{' '}
          <a href="/register" className="text-indigo-600 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}