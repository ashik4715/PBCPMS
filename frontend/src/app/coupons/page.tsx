'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { ApiResponse, Coupon } from '@/lib/types';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import Swal from 'sweetalert2';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [amount, setAmount] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await api.get<ApiResponse<Coupon[]>>('/api/v1/coupons/my');
      if (response.data.success) {
        setCoupons(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await api.post('/api/v1/coupons/purchase', {
        amount: parseFloat(amount),
        expiresAt: expiresAt,
      });

      if (response.data.success) {
        Swal.fire({ icon: 'success', title: 'Coupon Purchased!', text: 'Your new coupon is ready to use.' });
        setAmount('');
        setExpiresAt('');
        fetchCoupons();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to purchase coupon');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const columns = [
    { key: 'code', label: 'Code' },
    {
      key: 'amount',
      label: 'Amount',
      render: (coupon: Coupon) => `$${coupon.amount.toFixed(2)}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (coupon: Coupon) => <StatusBadge status={coupon.status} />,
    },
    {
      key: 'purchasedAt',
      label: 'Purchased',
      render: (coupon: Coupon) =>
        coupon.purchasedAt ? new Date(coupon.purchasedAt).toLocaleDateString() : '-',
    },
    {
      key: 'expiresAt',
      label: 'Expires',
      render: (coupon: Coupon) =>
        new Date(coupon.expiresAt).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">My Coupons</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Purchase Coupon</h2>
        <form onSubmit={handlePurchase} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-500 text-sm font-bold mb-2">
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-500 text-sm font-bold mb-2">
              Expires At
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {submitting ? 'Purchasing...' : 'Purchase Coupon'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">All Coupons</h2>
        <DataTable columns={columns} data={coupons} />
      </div>
    </div>
  );
}
