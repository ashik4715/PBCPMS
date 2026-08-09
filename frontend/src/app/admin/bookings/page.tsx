'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { ApiResponse, Booking, Pilot } from '@/lib/types';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import Modal from '@/components/Modal';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [selectedPilot, setSelectedPilot] = useState<Record<number, number>>({});
  const [assignModalBookingId, setAssignModalBookingId] = useState<number | null>(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, pilotsRes] = await Promise.all([
        api.get<ApiResponse<Booking[]>>('/api/v1/admin/bookings'),
        api.get<ApiResponse<Pilot[]>>('/api/v1/admin/pilots'),
      ]);

      if (bookingsRes.data.success) {
        setBookings(bookingsRes.data.data);
      }
      if (pilotsRes.data.success) {
        setPilots(pilotsRes.data.data.filter((p) => p.isAvailable));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await api.put(`/api/v1/admin/bookings/${id}/approve`);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve booking');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.put(`/api/v1/admin/bookings/${id}/reject`);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject booking');
    }
  };

  const handleAssignPilot = async () => {
    if (!assignModalBookingId || !selectedPilot[assignModalBookingId]) return;

    setAssigning(true);
    try {
      await api.put(`/api/v1/admin/bookings/${assignModalBookingId}/assign-pilot`, {
        pilotId: selectedPilot[assignModalBookingId],
      });
      setAssignModalBookingId(null);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign pilot');
    } finally {
      setAssigning(false);
    }
  };

  const openAssignModal = (bookingId: number) => {
    setSelectedPilot({ ...selectedPilot, [bookingId]: selectedPilot[bookingId] || 0 });
    setAssignModalBookingId(bookingId);
  };

  if (loading) return <LoadingSpinner />;

  const filteredBookings =
    filter === 'ALL' ? bookings : bookings.filter((b) => b.status === filter);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'ownerName', label: 'Owner' },
    { key: 'vesselName', label: 'Vessel' },
    { key: 'routeName', label: 'Route' },
    {
      key: 'pilotName',
      label: 'Pilot',
      render: (booking: Booking) => {
        const isEditable = booking.status === 'PENDING' || booking.status === 'ASSIGNED';
        if (!isEditable) {
          return <span className="text-gray-700 dark:text-gray-300">{booking.pilotName || '-'}</span>;
        }
        return (
          <button
            onClick={() => openAssignModal(booking.id)}
            className={`text-left px-2 py-1 rounded text-sm cursor-pointer hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors ${
              booking.pilotName
                ? 'text-indigo-600 dark:text-indigo-400 font-medium'
                : 'text-gray-400 dark:text-gray-500 italic'
            }`}
            title="Click to assign pilot"
          >
            {booking.pilotName || '-'}
          </button>
        );
      },
    },
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
      key: 'actions',
      label: 'Actions',
      render: (booking: Booking) => (
        <div className="flex gap-2">
          {booking.status === 'PENDING' && (
            <>
              <button
                onClick={() => handleApprove(booking.id)}
                disabled={!booking.pilotName}
                className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                title={!booking.pilotName ? 'Assign a pilot first' : 'Approve booking'}
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(booking.id)}
                className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              >
                Reject
              </button>
            </>
          )}
          {booking.status === 'ASSIGNED' && (
            <>
              <button
                onClick={() => handleApprove(booking.id)}
                className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(booking.id)}
                className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              >
                Reject
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const assignModalBooking = assignModalBookingId
    ? bookings.find((b) => b.id === assignModalBookingId)
    : null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Booking Management</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="ALL">All</option>
          <option value="PENDING">Pending</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="APPROVED">Approved</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <DataTable columns={columns} data={filteredBookings} />
      </div>

      <Modal
        isOpen={assignModalBookingId !== null}
        onClose={() => setAssignModalBookingId(null)}
        title={assignModalBooking ? `Assign Pilot — Booking #${assignModalBooking.id}` : 'Assign Pilot'}
      >
        <div className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p><span className="font-medium text-gray-900 dark:text-gray-100">Route:</span> {assignModalBooking?.routeName}</p>
            <p><span className="font-medium text-gray-900 dark:text-gray-100">Fee:</span> ${assignModalBooking?.totalFee.toFixed(2)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Pilot <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedPilot[assignModalBookingId || 0] || ''}
              onChange={(e) =>
                setSelectedPilot({
                  ...selectedPilot,
                  [assignModalBookingId || 0]: Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">-- Select a pilot --</option>
              {pilots.map((pilot) => (
                <option key={pilot.id} value={pilot.id}>
                  {pilot.name} ({pilot.licenseNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setAssignModalBookingId(null)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignPilot}
              disabled={!selectedPilot[assignModalBookingId || 0] || assigning}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {assigning ? 'Assigning...' : 'Assign Pilot'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
