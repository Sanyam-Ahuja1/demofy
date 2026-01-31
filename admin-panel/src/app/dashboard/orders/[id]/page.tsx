'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import Link from 'next/link';
import Script from 'next/script';
import Image from 'next/image';

export default function OrderDetailsPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    if (params.id) {
      loadOrder(params.id as string);
    }
  }, [params.id]);

  const loadOrder = async (id: string) => {
    try {
      const response: any = await api.getOrder(id);
      setOrder(response.data);
    } catch (error) {
      console.error('Failed to load order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (!order) return;
    
    // Prevent changing status if order is in terminal state
    if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
      alert('Cannot change status of delivered or cancelled orders');
      return;
    }
    
    setUpdating(true);
    try {
      await api.updateOrderStatus(order.id, status);
      setOrder({ ...order, status: status as any });
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  // Initialize Map when order is loaded and has coordinates
  useEffect(() => {
    if (!loading && order?.address?.latitude && order?.address?.longitude) {
      if (window.google?.maps) {
        initMap();
      }
    }
  }, [loading, order]);

  const initMap = () => {
    if (!mapRef.current || !order?.address?.latitude || !order?.address?.longitude) return;

    const location = { 
      lat: Number(order.address.latitude), 
      lng: Number(order.address.longitude) 
    };

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: location,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    markerRef.current = new window.google.maps.Marker({
      position: location,
      map: mapInstanceRef.current,
      title: 'Delivery Location',
      animation: google.maps.Animation.DROP,
    });
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
    SHIPPED: 'bg-purple-100 text-purple-800 border-purple-200',
    DELIVERED: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500">Order not found</p>
        <Link href="/dashboard/orders" className="text-green-600 hover:underline mt-4 inline-block">
          Back to Orders
        </Link>
      </div>
    );
  }

  const googleMapsUrl = order.address?.latitude && order.address?.longitude
    ? `https://www.google.com/maps?q=${order.address.latitude},${order.address.longitude}`
    : null;

  return (
    <div className="space-y-6">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="lazyOnload"
        onLoad={() => {
          if (order?.address?.latitude) initMap();
        }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/orders"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order #{order.id.slice(-8).toUpperCase()}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN', { 
                dateStyle: 'medium', 
                timeStyle: 'short' 
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-lg text-sm font-medium border ${statusColors[order.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
            {order.status.toUpperCase()}
          </span>
          <select
            value={order.status}
            onChange={(e) => handleStatusUpdate(e.target.value)}
            disabled={updating || order.status === 'DELIVERED' || order.status === 'CANCELLED'}
            className="text-sm border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed bg-white"
            title={order.status === 'DELIVERED' || order.status === 'CANCELLED' ? 'Cannot change status of ' + order.status.toLowerCase() + ' orders' : 'Update order status'}
          >
            <option value="pending" className="bg-yellow-50 text-yellow-800">Pending</option>
            <option value="confirmed" className="bg-blue-50 text-blue-800">Confirmed</option>
            <option value="shipped" className="bg-purple-50 text-purple-800">Shipped</option>
            <option value="delivered" className="bg-green-50 text-green-800">Delivered</option>
            <option value="cancelled" className="bg-red-50 text-red-800">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Items & Customer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Order Items ({order.items?.length || 0})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {order.items?.map((item) => {
                const productImage = item.product?.images && Array.isArray(item.product.images) && item.product.images.length > 0 
                  ? item.product.images[0] 
                  : null;
                
                return (
                  <div key={item.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {productImage ? (
                          <Image 
                            src={productImage} 
                            alt={item.product?.name || 'Product'} 
                            width={80} 
                            height={80}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.product?.name || 'Product'}</h3>
                        <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-500">Price: ₹{Number(item.priceAtPurchase).toFixed(2)} each</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">₹{(Number(item.priceAtPurchase) * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 flex justify-between items-center border-t border-gray-200">
                <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold text-green-600">₹{Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Customer Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-medium block mb-1">Name</label>
                  <p className="text-gray-900 font-medium">{order.user?.name || 'Guest User'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-medium block mb-1">Phone Number</label>
                  <p className="text-gray-900 font-medium">
                    <a href={`tel:${order.user?.phone}`} className="hover:text-green-600 transition-colors">
                      {order.user?.phone}
                    </a>
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-medium block mb-1">Email</label>
                  <p className="text-gray-900 font-medium">
                    {order.user?.email ? (
                      <a href={`mailto:${order.user.email}`} className="hover:text-green-600 transition-colors">
                        {order.user.email}
                      </a>
                    ) : (
                      <span className="text-gray-400 italic">Not provided</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-medium block mb-1">Payment Status</label>
                  <p className="text-gray-900 font-medium capitalize">{order.paymentStatus || 'Pending'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Map & Address */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Delivery Location
              </h2>
            </div>
            
            {/* Map Container */}
            <div className="h-64 w-full bg-gray-100 relative">
              {order.address?.latitude && order.address?.longitude ? (
                <div ref={mapRef} className="w-full h-full" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p className="text-sm">Location coordinates not available</p>
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {order.address && (
                  <>
                    {order.address.fullName && (
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider font-medium block mb-1">Recipient</label>
                        <p className="font-medium text-gray-900">{order.address.fullName}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wider font-medium block mb-1">Address</label>
                      <div className="text-gray-700 space-y-1">
                        <p>{order.address.line1}</p>
                        {order.address.line2 && <p>{order.address.line2}</p>}
                        <p>{order.address.city}, {order.address.state}</p>
                        <p className="font-medium">{order.address.pincode}</p>
                        {order.address.country && <p>{order.address.country}</p>}
                      </div>
                    </div>
                    {googleMapsUrl && (
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium mt-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Open in Google Maps
                      </a>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Order Timeline
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider font-medium block mb-1">Created</label>
                <p className="text-gray-900">
                  {new Date(order.createdAt).toLocaleString('en-IN', {
                    dateStyle: 'full',
                    timeStyle: 'short'
                  })}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider font-medium block mb-1">Last Updated</label>
                <p className="text-gray-900">
                  {new Date(order.updatedAt).toLocaleString('en-IN', {
                    dateStyle: 'full',
                    timeStyle: 'short'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
