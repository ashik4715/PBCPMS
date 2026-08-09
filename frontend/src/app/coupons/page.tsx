'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { ApiResponse, Coupon } from '@/lib/types';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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

    fetchCoupons();
  }, []);

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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <DataTable columns={columns} data={coupons} />
      </div>
    </div>
  );
}