'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('admin-auth', 'true');
        localStorage.setItem('admin-login-time', Date.now().toString());
        router.push('/admin');
        router.refresh();
      } else {
        setError('Нууц үг буруу байна');
      }
    } catch {
      setError('Системийн алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow-md flex flex-col">
        <h2 className="text-2xl font-bold mb-6 text-center">Админ нэвтрэх</h2>
        <form onSubmit={handleLogin} className="space-y-5 flex flex-col flex-1 justify-center">
          <div>
            <label className="block text-sm font-medium mb-1">Нууц үг</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=""
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
          </button>
        </form>
        <div className="mt-6 text-xs text-gray-500 text-center">
          <p>ЗӨВХӨН АДМИН ОРХЫГ АНХААРНА УУ</p>
        </div>
      </div>
    </div>
  );
}
