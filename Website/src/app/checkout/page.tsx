'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import Link from 'next/link';
import { Button } from '@/ui/primitives/Button';
import { Input } from '@/ui/primitives/Input';
import { Card } from '@/ui/primitives/Card';
import { AddressAutocomplete, AddressComponents } from '@/ui/components/AddressAutocomplete';
import { ProtectedRoute } from '@/core/auth/ProtectedRoute';
import { useCart } from '@/core/hooks/useCart';
import { useAuth } from '@/core/auth/AuthContext';
import { getProducts } from '@/core/data/dataService';
import { addressApi, Address } from '@/core/api/address';
import { orderApi } from '@/core/api/order';
import { authApi } from '@/core/api/auth';
import { formatPrice } from '@/core/lib/formatting';
import type { Product } from '@/core/data/types';

function CheckoutContent() {
  const router = useRouter();
  const { user, accessToken, login } = useAuth(); // Added login to refresh tokens after linking
  const { items, clearCart, getTotalPrice } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');

  // Verification State
  const [showPhoneVerifyModal, setShowPhoneVerifyModal] = useState(false);
  const [verifyStep, setVerifyStep] = useState<'phone' | 'otp'>('phone');
  const [verifyPhone, setVerifyPhone] = useState('');
  const [verifyOtp, setVerifyOtp] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');


  // Initialize userName from user data
  useEffect(() => {
    if (user?.name) {
      setUserName(user.name);
    }
    // Also init verify phone if user has a phone but it's not verified (weird case but good to have)
    if (user?.phone) {
        setVerifyPhone(user.phone);
    }
  }, [user]);

  // New address form state
  const [newAddress, setNewAddress] = useState<AddressComponents & { type: 'home' | 'work' | 'other'; fullName?: string; line2?: string }>({
    type: 'home',
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
    async function fetchData() {
      const productsData = await getProducts();
      setProducts(productsData);

      if (accessToken) {
        try {
          const response: any = await addressApi.getUserAddresses(accessToken);
          const addresses = response.data || [];
          setSavedAddresses(addresses);
          
          // Auto-select default address
          const defaultAddr = addresses.find((addr: Address) => addr.isDefault);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
          } else if (addresses.length > 0) {
            setSelectedAddressId(addresses[0].id);
          } else {
            setUseNewAddress(true);
          }
        } catch (err) {
          console.error('Failed to fetch addresses:', err);
          setUseNewAddress(true);
        }
      }
    }
    fetchData();
  }, [accessToken]);

  const total = getTotalPrice(products);

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-xl sm:text-2xl font-display font-bold text-neutral-900 mb-4">
            Your cart is empty
          </h1>
          <Link href="/">
            <Button variant="primary" size="lg">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddressAutocomplete = (address: AddressComponents) => {
    setNewAddress(prev => ({
      ...prev,
      ...address,
    }));
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
         // Assuming authApi has a linkPhoneNumber method as planned
         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/link-phone`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ phone: `+91${verifyPhone}`, code: verifyOtp })
         });

         const data = await response.json();

         if (!response.ok) {
            throw new Error(data.message || 'Verification failed');
         }

        // Close modal and refresh user data (re-login slightly hacky but works to update context)
        setShowPhoneVerifyModal(false);
        window.location.reload(); // Simple refresh to get new user state with verified phone
    } catch (err: any) {
        setVerifyError(err.message || 'Verification failed');
    } finally {
        setVerifyLoading(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for phone verification
    if (!user?.phone || (user as any).isPhoneVerified === false) { // Casting checking for new property
       setShowPhoneVerifyModal(true);
       return;
    }

    setError('');
    setLoading(true);

    try {
      // Update user's name if it's been entered at checkout and doesn't exist in profile
      if (userName && userName.trim() && !user?.name) {
        try {
          await authApi.updateProfile(accessToken!, { name: userName.trim() });
          // Note: The user object in AuthContext will be refreshed on next page load
          // or we could manually call fetchUser here, but it's not critical
        } catch (nameErr) {
          console.error('Failed to update user name:', nameErr);
          // Don't block order if name update fails - it's not critical
        }
      }

      let addressId = selectedAddressId;

      // Create new address if needed
      if (useNewAddress) {
        // Validate address fields
        if (!newAddress.line1 || !newAddress.city || !newAddress.state || !newAddress.pincode) {
          setError('Please fill in all required address fields');
          setLoading(false);
          return;
        }

        // Validate pincode format (6 digits for India)
        if (!/^\d{6}$/.test(newAddress.pincode)) {
          setError('Pincode must be 6 digits');
          setLoading(false);
          return;
        }

        const createResponse: any = await addressApi.createAddress(accessToken!, {
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
        addressId = createResponse.data.id;
      }

      // Create order (Stateless approach - passing items directly)
      // This avoids race conditions with backend cart synchronization
      const orderItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      const orderResponse: any = await orderApi.createOrder(accessToken!, addressId, orderItems);
      
      if (orderResponse.data) {
        // Clear local cart on successful order
        clearCart();
        // Redirect to orders page
        router.push('/orders');
      }
    } catch (err: any) {
      console.error('Order creation failed:', err);
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Load Google Maps Script Once */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`}
        strategy="afterInteractive"
      />
      
      <div className="container mx-auto py-6 sm:py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-neutral-900 mb-6 sm:mb-8">
          Checkout
        </h1>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* User Information */}
              <Card padding="lg">
                <h2 className="text-xl font-semibold mb-4">Your Information</h2>
                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    value={userName}
                    onChangeText={setUserName}
                    placeholder="Enter your full name"
                    required
                  />
                  
                   {/* Phone Verification Check */}
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Phone Number
                       {(!user?.phone || (user as any).isPhoneVerified === false) && (
                        <span className="text-red-500 text-xs ml-2">(Verification Required)</span>
                       )}
                     </label>
                     <div className="flex gap-2">
                       <Input
                         label="" 
                         type="tel"
                         value={user?.phone || ''}
                         onChangeText={() => {}}
                         disabled
                         className="flex-1"
                       />
                       {(!user?.phone || (user as any).isPhoneVerified === false) && (
                         <Button
                           type="button"
                           variant="outline"
                           size="sm"
                           onPress={() => setShowPhoneVerifyModal(true)}
                         >
                           Verify Now
                         </Button>
                       )}
                     </div>
                   </div>

                  {user?.email && (
                    <Input
                      label="Email"
                      type="email"
                      value={user.email}
                      onChangeText={() => {}}
                      disabled
                    />
                  )}
                </div>
              </Card>

              {/* Address Selection */}
              <Card padding="lg">
                <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>

                {savedAddresses.length > 0 && (
                  <div className="mb-4">
                    <label className="flex items-center gap-2 mb-2">
                      <input
                        type="radio"
                        checked={!useNewAddress}
                        onChange={() => setUseNewAddress(false)}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span className="font-medium">Use saved address</span>
                    </label>

                    {!useNewAddress && (
                      <select
                        value={selectedAddressId}
                        onChange={(e) => setSelectedAddressId(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                        required
                      >
                        {savedAddresses.map((addr) => (
                          <option key={addr.id} value={addr.id}>
                            {addr.type.toUpperCase()}: {addr.line1}, {addr.city}, {addr.state} - {addr.pincode}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                <label className="flex items-center gap-2 mb-4">
                  <input
                    type="radio"
                    checked={useNewAddress}
                    onChange={() => setUseNewAddress(true)}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="font-medium">Add new address</span>
                </label>

                {useNewAddress && (
                  <div className="space-y-4 pl-6">
                    <div>
                      <label className="text-sm font-medium text-neutral-700 mb-2 block">
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

                    <Input
                      label="Full Name (Recipient)"
                      value={newAddress.fullName || ''}
                      onChangeText={(text) => setNewAddress({ ...newAddress, fullName: text })}
                      placeholder="e.g. John Doe"
                      required
                    />

                    <AddressAutocomplete
                      onAddressSelect={handleAddressAutocomplete}
                      placeholder="Start typing your address..."
                      label="Street Address"
                      required
                    />

                    <Input
                      label="Apartment, Suite, etc. (Optional)"
                      value={newAddress.line2 || ''}
                      onChangeText={(text) => setNewAddress({ ...newAddress, line2: text })}
                      placeholder="Apt 4B, Floor 2, etc."
                    />

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

                    <Input
                      label="Pincode"
                      value={newAddress.pincode}
                      onChangeText={(text) => setNewAddress({ ...newAddress, pincode: text })}
                      placeholder="400001"
                      required
                    />
                  </div>
                )}
              </Card>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div>
              <Card padding="lg" className="lg:sticky top-24">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">Order Summary</h2>

                <div className="space-y-3 mb-4 pb-4 border-b border-neutral-200">
                  {items.map((item) => {
                    const product = products.find((p) => p.id === item.productId);
                    if (!product) return null;

                    return (
                      <div key={item.productId} className="flex justify-between text-sm">
                        <span className="text-neutral-700">
                          {product.name} × {item.quantity}
                        </span>
                        <span className="font-medium">
                          {formatPrice(product.price * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Subtotal:</span>
                    <span className="font-medium">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Shipping:</span>
                    <span className="font-medium text-primary-600">Free</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-200 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Total:</span>
                    <span className="font-bold text-2xl text-primary-600">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={loading || (!useNewAddress && !selectedAddressId)}
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </Button>
              </Card>
            </div>
          </div>
        </form>
      </div>
      </div>

       {/* Phone Verification Modal */}
       {showPhoneVerifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4">Verify Phone Number</h3>
            <p className="text-sm text-gray-600 mb-4">
              Phone verification is required to place an order.
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
                        <Button type="button" variant="ghost" onPress={() => setShowPhoneVerifyModal(false)}>Cancel</Button>
                        <Button type="submit" variant="primary" disabled={verifyLoading}>Send OTP</Button>
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
                         <Button type="button" variant="ghost" onPress={() => setVerifyStep('phone')}>Change Phone</Button>
                         <Button type="submit" variant="primary" disabled={verifyLoading}>Verify</Button>
                    </div>
                </form>
            )}
          </div>
        </div>
    )}
    </>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}
