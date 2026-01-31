'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/core/auth/AuthContext';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    if (error) {
      // Handle OAuth error
      console.error('Google OAuth error:', error);
      router.push(`/login?error=${error}`);
      return;
    }

    if (accessToken && refreshToken) {
      // Store tokens and fetch user profile
      login(accessToken, refreshToken);
      router.push('/');
    } else {
      // Missing tokens, redirect to login
      router.push('/login?error=missing_tokens');
    }
  }, [searchParams, login, router]);

  return (
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-800">
        Completing Google Sign In...
      </h2>
      <p className="text-sm text-gray-600 mt-2">
        Please wait while we set up your account
      </p>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl">
        <Suspense fallback={<div>Loading authentication...</div>}>
          <GoogleCallbackContent />
        </Suspense>
      </div>
    </div>
  );
}
