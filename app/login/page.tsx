'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Bizim Proxy'ye istek atıyoruz
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();

    if (data.success) {
      // Başarılıysa yönlendir. Middleware zaten cookie'yi görecek.
      router.push('/dashboard');
      router.refresh(); // Server Component'leri yenilemek için
    } else {
      alert('Hata: ' + data.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded shadow-md w-96"
      >
        <h2 className="text-xl font-bold mb-4">Secure Login</h2>
        <input
          className="w-full border p-2 mb-2 rounded text-black"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
        <input
          className="w-full border p-2 mb-4 rounded text-black"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Giriş Yap
        </button>
      </form>
    </div>
  );
}
