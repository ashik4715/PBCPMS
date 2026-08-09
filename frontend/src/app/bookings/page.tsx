'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { ApiResponse, Booking } from '@/lib/types';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get<ApiResponse<Booking[]>>('/api/v1/bookings/my');
        if (response.data.success) {
          setBookings(response.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) return <LoadingSpinner />;

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'vesselName', label: 'Vessel' },
    { key: 'routeName', label: 'Route' },
    { key: 'pilotName', label: 'Pilot' },
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
    {
      key: 'createdAt',
      label: 'Created',
      render: (booking: Booking) =>
        new Date(booking.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Bookings</h1>
        <a
          href="/bookings/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Create Booking
        </a>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <DataTable columns={columns} data={bookings} />
      </div>
    </div>
  );
}