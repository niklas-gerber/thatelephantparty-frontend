// app/admin/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include', // <- THIS IS CRUCIAL FOR COOKIES
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // The HTTP-only cookie is now stored by the browser automatically.
        // We can simply redirect. The cookie will be sent on the next request.
        router.push('/admin');
        // Optional: force a refresh to ensure all client-side data is clean
        router.refresh();
      } else {
        setError(data.error?.message || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center custom-gradient-bg">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md outline-outline outline-2">
        <h1 className="text-2xl font-slimbold mb-6 text-center text-black">Admin Login</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="mt-1 p-2 w-full border border-gray-300 rounded-md text-black"
            disabled={isLoading}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 p-2 w-full border border-gray-300 rounded-md text-black"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-color-primary py-2 px-4 rounded-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-slimbold text-black disabled:opacity-50"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}