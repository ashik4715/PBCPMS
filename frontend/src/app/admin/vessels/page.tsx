'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { ApiResponse, Vessel } from '@/lib/types';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import Modal from '@/components/Modal';

export default function AdminVesselsPage() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    registrationNumber: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVessels();
  }, []);

  const fetchVessels = async () => {
    try {
      const response = await api.get<ApiResponse<Vessel[]>>('/api/v1/admin/vessels');
      if (response.data.success) {
        setVessels(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load vessels');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await api.put(`/api/v1/admin/vessels/${id}/approve`, { notes: notes[id] || '' });
      fetchVessels();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve vessel');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.put(`/api/v1/admin/vessels/${id}/reject`, { notes: notes[id] || '' });
      fetchVessels();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject vessel');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await api.post<ApiResponse<Vessel>>('/api/v1/vessels', formData);
      if (response.data.success) {
        setVessels([...vessels, response.data.data]);
        setIsModalOpen(false);
        setFormData({ name: '', type: '', registrationNumber: '' });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add vessel');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const filteredVessels =
    filter === 'ALL' ? vessels : vessels.filter((v) => v.status === filter);

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'type', label: 'Type' },
    { key: 'registrationNumber', label: 'Registration' },
    { key: 'ownerName', label: 'Owner' },
    {
      key: 'status',
      label: 'Status',
      render: (vessel: Vessel) => <StatusBadge status={vessel.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (vessel: Vessel) =>
        vessel.status === 'PENDING' && (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Notes"
              value={notes[vessel.id] || ''}
              onChange={(e) => setNotes({ ...notes, [vessel.id]: e.target.value })}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={() => handleApprove(vessel.id)}
              className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              Approve
            </button>
            <button
              onClick={() => handleReject(vessel.id)}
              className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              Reject
            </button>
          </div>
        ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Vessel Approvals</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="ALL">All</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Add Vessel
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <DataTable columns={columns} data={filteredVessels} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Vessel">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-500 text-sm font-bold mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-500 text-sm font-bold mb-2">
              Type
            </label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-500 text-sm font-bold mb-2">
              Registration Number
            </label>
            <input
              type="text"
              value={formData.registrationNumber}
              onChange={(e) =>
                setFormData({ ...formData, registrationNumber: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {submitting ? 'Adding...' : 'Add Vessel'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}