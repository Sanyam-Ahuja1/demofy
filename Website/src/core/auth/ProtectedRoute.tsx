'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/core/auth/AuthContext';
import { LoginModal } from '@/ui/components/LoginModal';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    } else {
      setShowLoginModal(false);
    }
  }, [isAuthenticated]);

  // Show login modal if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <div className="container mx-auto py-16 text-center">
          <h1 className="text-2xl font-display font-bold text-neutral-900 mb-4">
            Please login to continue
          </h1>
          <p className="text-neutral-600">
            You need to be logged in to access this page.
          </p>
        </div>
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => {
            // Don't allow closing without login on protected routes
            // User needs to login or navigate away
          }}
        />
      </>
    );
  }

  // Render children if authenticated
  return <>{children}</>;
}
