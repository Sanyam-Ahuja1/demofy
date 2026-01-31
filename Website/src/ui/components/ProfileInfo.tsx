'use client';

import { useState } from 'react';
import { useAuth } from '@/core/auth/AuthContext';
import { authApi } from '@/core/api/auth';
import { Button } from '../primitives/Button';
import { Input } from '../primitives/Input';

export function ProfileInfo() {
  const { user, accessToken, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Verification State
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyStep, setVerifyStep] = useState<'phone' | 'otp'>('phone');
  const [verifyPhone, setVerifyPhone] = useState(user?.phone || '');
  const [verifyOtp, setVerifyOtp] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response: any = await authApi.updateProfile(accessToken!, {
        name: formData.name || undefined,
        email: formData.email || undefined,
      });

      if (response.data) {
        // Refresh user data by re-fetching profile
        await login(accessToken!, localStorage.getItem('refreshToken')!);
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleRequestVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyPhone.length !== 10) {
      setVerifyError('Please enter a valid 10-digit phone number');
      return;
    }
    setVerifyError('');
    setVerifyLoading(true);

    try {
      await authApi.requestOTP(`+91${verifyPhone}`);
      setVerifyStep('otp');
    } catch (err: any) {
      setVerifyError(err.message || 'Failed to send OTP');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleVerifyAndLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyOtp.length !== 6) {
      setVerifyError('Please enter a valid 6-digit OTP');
      return;
    }
    setVerifyError('');
    setVerifyLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/link-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ phone: `+91${verifyPhone}`, code: verifyOtp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      // Success
      await login(accessToken!, localStorage.getItem('refreshToken')!);
      setSuccess('Phone number verified successfully!');
      setShowVerifyModal(false);
    } catch (err: any) {
      setVerifyError(err.message || 'Verification failed');
    } finally {
      setVerifyLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">Profile Information</h2>
        <p className="text-neutral-600 mb-6">
          Manage your personal information and contact details
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      <div className="space-y-4">
        {/* Phone (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Phone Number
            {user.isPhoneVerified === false && (
              <span className="text-red-500 text-xs ml-2 font-normal">(Unverified)</span>
            )}
          </label>
          <div className="flex gap-2">
            <div className="flex-1 px-4 py-3 bg-neutral-50 rounded-lg text-neutral-700 border border-neutral-200">
              {user.phone || 'Not set'}
            </div>
            {user.isPhoneVerified === false && (
              <Button
                variant="primary"
                size="sm"
                onPress={() => {
                   setVerifyStep('phone');
                   setVerifyPhone(user.phone || '');
                   setShowVerifyModal(true);
                }}
              >
                Verify Now
              </Button>
            )}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Phone number cannot be changed
          </p>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Full Name
          </label>
          {isEditing ? (
            <Input
              type="text"
              value={formData.name}
              onChangeText={(value) => setFormData({ ...formData, name: value })}
              placeholder="Enter your full name"
            />
          ) : (
            <div className="px-4 py-3 bg-neutral-50 rounded-lg text-neutral-700 border border-neutral-200">
              {user.name || 'Not set'}
            </div>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Email Address
          </label>
          {isEditing ? (
            <Input
              type="email"
              value={formData.email}
              onChangeText={(value) => setFormData({ ...formData, email: value })}
              placeholder="Enter your email"
            />
          ) : (
            <div className="px-4 py-3 bg-neutral-50 rounded-lg text-neutral-700 border border-neutral-200">
              {user.email || 'Not set'}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        {isEditing ? (
          <>
            <Button
              onPress={handleSubmit}
              variant="primary"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              onPress={handleCancel}
              variant="secondary"
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            onPress={() => setIsEditing(true)}
            variant="primary"
          >
            Edit Profile
          </Button>
        )}
      </div>

      {/* Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4">Verify Phone Number</h3>
            <p className="text-sm text-gray-600 mb-4">
              Verify your phone number to secure your account.
            </p>

            {verifyStep === 'phone' ? (
              <form onSubmit={handleRequestVerifyOTP} className="space-y-4">
                <Input
                  label="Phone Number"
                  value={verifyPhone}
                  onChangeText={(text) => setVerifyPhone(text.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile number"
                  type="tel"
                  required
                />
                {verifyError && <p className="text-red-500 text-sm">{verifyError}</p>}
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onPress={() => setShowVerifyModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={verifyLoading}>
                    Send OTP
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndLink} className="space-y-4">
                <Input
                  label="Enter OTP"
                  value={verifyOtp}
                  onChangeText={(text) => setVerifyOtp(text.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit OTP"
                  required
                  maxLength={6}
                />
                <p className="text-xs text-gray-500">Sent to +91 {verifyPhone}</p>
                {verifyError && <p className="text-red-500 text-sm">{verifyError}</p>}
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onPress={() => setVerifyStep('phone')}
                  >
                    Change Phone
                  </Button>
                  <Button type="submit" variant="primary" disabled={verifyLoading}>
                    Verify
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
