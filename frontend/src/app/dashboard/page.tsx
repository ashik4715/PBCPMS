'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { ApiResponse, MyBookingStats, Booking } from '@/lib/types';
import StatsCard from '@/components/StatsCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DashboardPage() {
  const [stats, setStats] = useState<MyBookingStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          api.get<ApiResponse<MyBookingStats>>('/api/v1/reports/my-bookings'),
          api.get<ApiResponse<Booking[]>>('/api/v1/bookings/my'),
        ]);

        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
        if (bookingsRes.data.success) {
          setRecentBookings(bookingsRes.data.data.slice(0, 5));
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  const bookingColumns = [
    { key: 'id', label: 'ID' },
    { key: 'vesselName', label: 'Vessel' },
    { key: 'routeName', label: 'Route' },
    {
      key: 'status',
      label: 'Status',
      render: (booking: Booking) => <StatusBadge status={booking.status} />,
    },
    {
      key: 'totalFee',
      label: 'Fee',
      render: (booking: Booking) => `$${booking.totalFee.toFixed(2)}`,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Owner Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Total Bookings" value={stats?.totalBookings || 0} />
        <StatsCard title="Pending Bookings" value={stats?.pendingBookings || 0} />
        <StatsCard title="Completed Bookings" value={stats?.completedBookings || 0} />
        <StatsCard title="Active Coupons" value={stats?.activeCoupons || 0} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Recent Bookings</h2>
        <DataTable columns={bookingColumns} data={recentBookings} />
      </div>
    </div>
  );
}