'use client';

import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/lib/api';
import { ApiResponse, BookingAnalytics } from '@/lib/types';
import { useEffect, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

export default function AdminReportsPage() {
  const [analytics, setAnalytics] = useState<BookingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const response = await api.get<ApiResponse<BookingAnalytics>>('/api/v1/admin/reports/booking-analytics', {
        params: { startDate, endDate },
      });

      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const response = await api.get<ApiResponse<BookingAnalytics>>(
        `/api/v1/admin/reports/booking-analytics?${params.toString()}`
      );

      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to filter reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const monthlyStats = analytics?.monthlyStats || [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Reports</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Date Range Filter</h2>
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-gray-700 dark:text-gray-500 text-sm font-bold mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-500 text-sm font-bold mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            onClick={handleFilter}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Booking Count</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="bookings" fill="#4F46E5" name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10B981"
                strokeWidth={2}
                name="Revenue ($)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}