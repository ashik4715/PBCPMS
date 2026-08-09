'use client';

import DataTable from '@/components/DataTable';
import LoadingSpinner from '@/components/LoadingSpinner';
import StatusBadge from '@/components/StatusBadge';
import api from '@/lib/api';
import { ApiResponse, Booking, Coupon, User } from '@/lib/types';
import { useEffect, useState } from 'react';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [owners, setOwners] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    ownerId: '',
    amount: '',
    expiresAt: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [couponsRes, bookingsRes] = await Promise.all([
        api.get<ApiResponse<Coupon[]>>('/api/v1/admin/coupons'),
        api.get<ApiResponse<Booking[]>>('/api/v1/admin/bookings'),
      ]);

      if (couponsRes.data.success) {
        setCoupons(couponsRes.data.data);
      }
      if (bookingsRes.data.success) {
        const uniqueOwners = Array.from(
          new Map(
            bookingsRes.data.data.map((b) => [b.ownerId, { id: b.ownerId, fullName: b.ownerName || '', email: '' }])
          ).values()
        );
        setOwners(uniqueOwners as User[]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await api.post('/api/v1/admin/coupons/issue', {
        ownerId: Number(formData.ownerId),
        amount: parseFloat(formData.amount),
        expiresAt: formData.expiresAt,
      });

      if (response.data.success) {
        fetchData();
        setFormData({ ownerId: '', amount: '', expiresAt: '' });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to issue coupon');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'ownerName', label: 'Owner' },
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
      key: 'issuedAt',
      label: 'Issued',
      render: (coupon: Coupon) =>
        new Date(coupon.issuedAt).toLocaleDateString(),
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Coupon Management</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Issue Coupon</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-500 text-sm font-bold mb-2">
              Owner
            </label>
            <select
              value={formData.ownerId}
              onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select owner</option>
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-500 text-sm font-bold mb-2">
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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
              value={formData.expiresAt}
              onChange={(e) =>
                setFormData({ ...formData, expiresAt: e.target.value })
              }
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
              {submitting ? 'Issuing...' : 'Issue Coupon'}
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