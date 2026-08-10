'use client';

import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/lib/api';
import { ApiResponse, Booking, Coupon, Route, Vessel } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

export default function NewBookingPage() {
  const router = useRouter();
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [activeCoupons, setActiveCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [vesselId, setVesselId] = useState('');
  const [routeId, setRouteId] = useState('');
  const [selectedCouponId, setSelectedCouponId] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vesselsRes, routesRes, couponsRes] = await Promise.all([
          api.get<ApiResponse<Vessel[]>>('/api/v1/vessels/my'),
          api.get<ApiResponse<Route[]>>('/api/v1/routes'),
          api.get<ApiResponse<Coupon[]>>('/api/v1/coupons/my'),
        ]);

        if (vesselsRes.data.success) {
          setVessels(vesselsRes.data.data.filter((v) => v.status === 'APPROVED'));
        }
        if (routesRes.data.success) {
          setRoutes(routesRes.data.data);
        }
        if (couponsRes.data.success) {
          setActiveCoupons(couponsRes.data.data.filter((c) => c.status === 'ACTIVE'));
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (routeId) {
      const route = routes.find((r) => r.id === Number(routeId));
      setSelectedRoute(route || null);
    } else {
      setSelectedRoute(null);
    }
    setSelectedCouponId('');
    setSelectedCoupon(null);
  }, [routeId, routes]);

  useEffect(() => {
    if (selectedCouponId) {
      const coupon = activeCoupons.find((c) => c.id === Number(selectedCouponId));
      setSelectedCoupon(coupon || null);
    } else {
      setSelectedCoupon(null);
    }
  }, [selectedCouponId, activeCoupons]);

  const routeFee = selectedRoute?.fee || 0;
  const discount = selectedCoupon ? Math.min(selectedCoupon.amount, routeFee) : 0;
  const totalAmount = routeFee - discount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const bookingRes = await api.post<ApiResponse<Booking>>('/api/v1/bookings', {
        vesselId: Number(vesselId),
        routeId: Number(routeId),
      });

      if (bookingRes.data.success) {
        if (selectedCoupon) {
          try {
            await api.post(`/api/v1/bookings/${bookingRes.data.data.id}/apply-coupon`, {
              couponCode: selectedCoupon.code,
            });
          } catch {
            // Coupon application failed, but booking was created
          }
        }

        Swal.fire({ icon: 'success', title: 'Booking Created!', text: 'Your booking has been submitted.' })
          .then(() => router.push('/bookings'));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Create Booking</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-500 text-sm font-bold mb-2">
                  Select Vessel
                </label>
                <select
                  value={vesselId}
                  onChange={(e) => setVesselId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select a vessel</option>
                  {vessels.map((vessel) => (
                    <option key={vessel.id} value={vessel.id}>
                      {vessel.name} ({vessel.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-500 text-sm font-bold mb-2">
                  Select Route
                </label>
                <select
                  value={routeId}
                  onChange={(e) => setRouteId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select a route</option>
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.name} - ${route.fee.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-500 text-sm font-bold mb-2">
                  Apply Coupon (Optional)
                </label>
                <select
                  value={selectedCouponId}
                  onChange={(e) => setSelectedCouponId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">No coupon</option>
                  {activeCoupons.map((coupon) => (
                    <option key={coupon.id} value={coupon.id}>
                      {coupon.code} - ${coupon.amount.toFixed(2)} (expires {new Date(coupon.expiresAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-indigo-400"
                >
                  {submitting ? 'Creating...' : 'Create Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Cost Breakdown</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Route Fee</span>
                <span className="text-gray-900 dark:text-gray-100">${routeFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Coupon Discount</span>
                <span className={discount > 0 ? 'text-green-600' : 'text-gray-500'}>
                  {discount > 0 ? `-$${discount.toFixed(2)}` : '$0.00'}
                </span>
              </div>
              <hr className="border-gray-200 dark:border-gray-700" />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-900 dark:text-gray-100">Total Amount</span>
                <span className="text-indigo-600 dark:text-indigo-400">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
            {selectedCoupon && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded text-sm text-green-700 dark:text-green-400">
                Coupon <strong>{selectedCoupon.code}</strong> applied. You save ${discount.toFixed(2)}!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
