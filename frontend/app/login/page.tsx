'use client';

import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/');
      } else {
        const err = await response.json();
        setError(err.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white border border-gray-200 shadow-xl rounded-2xl text-center">
        <div>
          <h1 className="text-4xl mb-2">🏥</h1>
          <h2 className="text-2xl font-bold text-gray-900">Hospital Management System</h2>
          <p className="mt-2 text-sm text-gray-500">Sign in to access your portal</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center justify-center pt-4">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google login failed')}
            useOneTap
            shape="pill"
            theme="filled_blue"
            text="continue_with"
          />
        </div>

        <div className="pt-6 text-xs text-gray-400">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy.</p>
          <p className="mt-2 font-mono font-bold text-gray-300">MODERN MINIMALIST HMS v1.0</p>
        </div>
      </div>
    </div>
  );
}
