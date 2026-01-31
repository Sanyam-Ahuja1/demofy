'use client';

import { useState } from 'react';
import { Button } from '@/ui/primitives/Button';
import { Input } from '@/ui/primitives/Input';
import { authApi } from '@/core/api/auth';
import { useAuth } from '@/core/auth/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login } = useAuth();
  const [phone, setPhone] = useState('+91');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Basic formatting: remove spaces/dashes, ensure + prefix
      let formattedPhone = phone.replace(/[\s-]/g, '');
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+' + formattedPhone;
      }

      await authApi.requestOTP(formattedPhone);
      
      // Update state with formatted phone for verification step
      setPhone(formattedPhone);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response: any = await authApi.verifyOTP(phone, otp);
      if (response.data) {
        await login(response.data.accessToken, response.data.refreshToken);
        onClose();
        // Reset state
        setPhone('');
        setOtp('');
        setStep('phone');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
          <h2 className="text-2xl font-bold text-white">
            {step === 'phone' ? 'Login to Continue' : 'Verify OTP'}
          </h2>
          <p className="text-primary-100 text-sm mt-1">
            {step === 'phone'
              ? 'Enter your phone number to get started'
              : `We sent a code to ${phone}`}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChangeText={(text) => {
                  // If empty or user tries to delete prefix, verify it starts correctly
                  if (!text || text.length < 3) {
                    setPhone('+91');
                    return;
                  }
                  
                  // Ensure prefix is +91
                  if (!text.startsWith('+91')) {
                    // If they pasted something without +91, we could prepend it, but strict enforcing is safer
                    setPhone('+91');
                    return; 
                  }

                  // Allow only numbers after +91 and limit to 10 digits
                  const prefix = text.slice(0, 3); // +91
                  const rest = text.slice(3).replace(/[^0-9]/g, '');
                  if (rest.length <= 10) {
                    setPhone(prefix + rest);
                  }
                }}
                placeholder="+91 9999999999"
                required
              />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={loading || phone.length !== 13} // +91 + 10 digits = 13 characters
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <Input
                label="Enter OTP"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChangeText={(text) => {
                  // Allow only numbers and max 6 digits
                  const numericValue = text.replace(/[^0-9]/g, '');
                  if (numericValue.length <= 6) {
                    setOtp(numericValue);
                  }
                }}
                placeholder="Enter 6-digit code"
                required
              />
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  fullWidth
                  onPress={() => {
                    setStep('phone');
                    setOtp('');
                    setError('');
                  }}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={loading || !otp}
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
