'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/auth/AuthContext';
import { authApi } from '@/core/api/auth';
import { Button } from '@/ui/primitives/Button';

export default function DeleteAccountPage() {
  const { isAuthenticated, accessToken, logout } = useAuth();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await authApi.deleteAccount(accessToken!);
      
      // Logout and redirect
      logout();
      router.push('/');
      
      // Show success message
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          alert('Your account has been successfully deleted.');
        }, 500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-neutral-200 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Delete Account</h1>
            <p className="text-neutral-600">
              This action cannot be undone
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
              {error}
            </div>
          )}

          {!showConfirmation ? (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h2 className="font-semibold text-red-900 mb-3">
                  What happens when you delete your account:
                </h2>
                <ul className="space-y-2 text-red-800">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>All your personal information will be permanently deleted</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>Your order history will be removed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>All saved addresses will be deleted</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>Your cart items will be cleared</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>You will be logged out immediately</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>This action <strong>cannot be reversed</strong></span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="secondary"
                  onPress={() => router.push('/profile')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onPress={() => setShowConfirmation(true)}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Continue to Delete
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h2 className="font-semibold text-yellow-900 mb-3">
                  Final Confirmation
                </h2>
                <p className="text-yellow-800 mb-4">
                  Are you absolutely sure you want to delete your account? This is your last chance to cancel.
                </p>
                <p className="text-yellow-900 font-medium">
                  This action is <strong className="text-red-600">PERMANENT</strong> and cannot be undone.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="secondary"
                  onPress={() => setShowConfirmation(false)}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  No, Keep My Account
                </Button>
                <Button
                  variant="primary"
                  onPress={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete Forever'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
