'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { ApiResponse, DashboardStats, Booking, BookingAnalytics } from '@/lib/types';
import StatsCard from '@/components/StatsCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [analytics, setAnalytics] = useState<BookingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const statsRes = await api.get<ApiResponse<DashboardStats>>('/api/v1/admin/reports/dashboard');
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }

        const bookingsRes = await api.get<ApiResponse<Booking[]>>('/api/v1/admin/bookings');
        if (bookingsRes.data.success) {
          setRecentBookings(bookingsRes.data.data.slice(0, 5));
        }

        try {
          const analyticsRes = await api.get<ApiResponse<BookingAnalytics>>('/api/v1/admin/reports/booking-analytics', {
            params: { startDate, endDate },
          });
          if (analyticsRes.data.success) {
            setAnalytics(analyticsRes.data.data);
          }
        } catch {
          setAnalytics(null);
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
    { key: 'ownerName', label: 'Owner' },
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Admin Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Total Bookings" value={stats?.totalBookings || 0} />
        <StatsCard
          title="Total Revenue"
          value={`$${(stats?.totalRevenueAmount || 0).toFixed(2)}`}
        />
        <StatsCard title="Active Pilots" value={stats?.activePilots || 0} />
        <StatsCard title="Pending Vessels" value={stats?.pendingVessels || 0} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Booking Trends</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics?.monthlyStats || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="bookings" stroke="#4F46E5" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Recent Bookings</h2>
        <DataTable columns={bookingColumns} data={recentBookings} />
      </div>
    </div>
  );
}