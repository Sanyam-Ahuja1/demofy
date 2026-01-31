'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useAuth } from '@/core/auth/AuthContext';
import { ProfileLayout } from '@/ui/components/ProfileLayout';
import { addressApi, Address } from '@/core/api/address';
import { Button } from '@/ui/primitives/Button';
import { Input } from '@/ui/primitives/Input';
import { AddressAutocomplete, AddressComponents } from '@/ui/components/AddressAutocomplete';

export default function AddressesPage() {
  const { isAuthenticated, isLoading: authLoading, accessToken } = useAuth();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New address form state
  const [newAddress, setNewAddress] = useState<AddressComponents & { type: 'home' | 'work' | 'other'; fullName: string; line2: string }>({
    type: 'home',
    fullName: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response: any = await addressApi.getUserAddresses(accessToken!);
      if (response.data) {
        setAddresses(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch addresses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressAutocomplete = (address: AddressComponents) => {
    setNewAddress(prev => ({
      ...prev,
      ...address,
    }));
  };

  const handleAddAddress = async () => {
    try {
      // Validate required fields
      if (!newAddress.fullName?.trim()) {
        setError('Please enter recipient name');
        return;
      }
      if (!newAddress.line1?.trim()) {
        setError('Please enter street address');
        return;
      }
      if (!newAddress.city?.trim()) {
        setError('Please enter city');
        return;
      }
      if (!newAddress.state?.trim()) {
        setError('Please enter state');
        return;
      }
      if (!newAddress.pincode?.trim()) {
        setError('Please enter pincode');
        return;
      }
      if (!/^\d{6}$/.test(newAddress.pincode)) {
        setError('Pincode must be 6 digits');
        return;
      }

      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const response: any = await addressApi.createAddress(accessToken!, {
        type: newAddress.type,
        fullName: newAddress.fullName,
        line1: newAddress.line1,
        line2: newAddress.line2 || undefined,
        city: newAddress.city,
        state: newAddress.state,
        pincode: newAddress.pincode,
        country: newAddress.country || undefined,
        latitude: newAddress.latitude > 0 ? newAddress.latitude : undefined,
        longitude: newAddress.longitude > 0 ? newAddress.longitude : undefined,
      });

      if (response.data) {
        setSuccess('Address added successfully!');
        setShowAddForm(false);
        // Reset form
        setNewAddress({
          type: 'home',
          fullName: '',
          line1: '',
          line2: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India',
          latitude: 0,
          longitude: 0,
        });
        fetchAddresses();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add address');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      await addressApi.deleteAddress(accessToken!, addressId);
      setSuccess('Address deleted successfully!');
      fetchAddresses();
    } catch (err: any) {
      // Check if it's a foreign key constraint error
      if (err.message && err.message.includes('Foreign key constraint')) {
        setError('Cannot delete this address as it is being used in existing orders.');
      } else {
        setError(err.message || 'Failed to delete address');
      }
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Load Google Maps Script */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`}
        strategy="afterInteractive"
      />
      
      <ProfileLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">My Addresses</h2>
            <p className="text-neutral-600">
              Manage your saved delivery addresses
            </p>
          </div>
          {!showAddForm && (
            <Button
              variant="primary"
              onPress={() => setShowAddForm(true)}
            >
              + Add Address
            </Button>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Add Address Form */}
        {showAddForm && (
          <div className="p-6 bg-white rounded-xl border border-neutral-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Add New Address</h3>
            <div className="space-y-4">
              {/* Address Type */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Address Type
                </label>
                <select
                  value={newAddress.type}
                  onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value as 'home' | 'work' | 'other' })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Full Name */}
              <Input
                label="Full Name (Recipient)"
                value={newAddress.fullName}
                onChangeText={(text) => setNewAddress({ ...newAddress, fullName: text })}
                placeholder="e.g. John Doe"
                required
              />

              {/* Address Autocomplete */}
              <AddressAutocomplete
                onAddressSelect={handleAddressAutocomplete}
                placeholder="Start typing your address..."
                label="Street Address"
                required
              />

              {/* Line 2 */}
              <Input
                label="Apartment, Suite, etc. (Optional)"
                value={newAddress.line2}
                onChangeText={(text) => setNewAddress({ ...newAddress, line2: text })}
                placeholder="Apt 4B, Floor 2, etc."
              />

              {/* City and State */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  value={newAddress.city}
                  onChangeText={(text) => setNewAddress({ ...newAddress, city: text })}
                  placeholder="Mumbai"
                  required
                />
                <Input
                  label="State"
                  value={newAddress.state}
                  onChangeText={(text) => setNewAddress({ ...newAddress, state: text })}
                  placeholder="Maharashtra"
                  required
                />
              </div>

              {/* Pincode */}
              <Input
                label="Pincode"
                value={newAddress.pincode}
                onChangeText={(text) => setNewAddress({ ...newAddress, pincode: text })}
                placeholder="400001"
                required
              />

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="primary"
                  onPress={handleAddAddress}
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? 'Saving...' : 'Save Address'}
                </Button>
                <Button
                  variant="secondary"
                  onPress={() => {
                    setShowAddForm(false);
                    setError(null);
                  }}
                  disabled={isSaving}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8 text-neutral-600">
            Loading addresses...
          </div>
        )}

        {/* Address List */}
        {!isLoading && !showAddForm && addresses.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-neutral-200 shadow-sm px-4">
            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No addresses saved yet</h3>
            <p className="text-neutral-500 mb-6 max-w-sm mx-auto">
              Add your delivery address to make checkout faster
            </p>
            <Button
              variant="primary"
              onPress={() => setShowAddForm(true)}
            >
              Add Your First Address
            </Button>
          </div>
        )}

        {!isLoading && addresses.length > 0 && (
          <div className="grid gap-4">
            {addresses.map((address) => (
              <div key={address.id} className="p-4 bg-white rounded-lg border border-neutral-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded uppercase">
                        {address.type}
                      </span>
                      {address.isDefault && (
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-neutral-900 mb-1">{address.fullName}</p>
                    <p className="text-sm text-neutral-600">
                      {address.line1}
                      {address.line2 && `, ${address.line2}`}
                    </p>
                    <p className="text-sm text-neutral-600">
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                    {address.country && (
                      <p className="text-sm text-neutral-600">{address.country}</p>
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onPress={() => handleDeleteAddress(address.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProfileLayout>
    </>
  );
}
