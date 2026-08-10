'use client';

import DataTable from '@/components/DataTable';
import LoadingSpinner from '@/components/LoadingSpinner';
import StatusBadge from '@/components/StatusBadge';
import api from '@/lib/api';
import { ApiResponse, Coupon } from '@/lib/types';
import { useEffect, useState } from 'react';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await api.get<ApiResponse<Coupon[]>>('/api/v1/admin/coupons/history');
      if (response.data.success) {
        setCoupons(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load coupon history');
    } finally {
      setLoading(false);
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
      key: 'purchasedAt',
      label: 'Purchased',
      render: (coupon: Coupon) =>
        coupon.purchasedAt ? new Date(coupon.purchasedAt).toLocaleDateString() : '-',
    },
    {
      key: 'usedAt',
      label: 'Used At',
      render: (coupon: Coupon) =>
        coupon.usedAt ? new Date(coupon.usedAt).toLocaleDateString() : '-',
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Coupon Audit History</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">All Purchased & Used Coupons</h2>
        <DataTable columns={columns} data={coupons} />
      </div>
    </div>
  );
}
