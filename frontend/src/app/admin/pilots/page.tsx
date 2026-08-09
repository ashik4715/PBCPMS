'use client';

import DataTable from '@/components/DataTable';
import LoadingSpinner from '@/components/LoadingSpinner';
import Modal from '@/components/Modal';
import api from '@/lib/api';
import { ApiResponse, Pilot } from '@/lib/types';
import { useEffect, useState } from 'react';

export default function AdminPilotsPage() {
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPilot, setEditingPilot] = useState<Pilot | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    licenseNumber: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPilots();
  }, []);

  const fetchPilots = async () => {
    try {
      const response = await api.get<ApiResponse<Pilot[]>>('/api/v1/admin/pilots');
      if (response.data.success) {
        setPilots(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load pilots');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (pilot?: Pilot) => {
    if (pilot) {
      setEditingPilot(pilot);
      setFormData({
        name: pilot.name,
        email: pilot.email,
        phone: pilot.phone || '',
        licenseNumber: pilot.licenseNumber,
      });
    } else {
      setEditingPilot(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        licenseNumber: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingPilot) {
        await api.put(`/api/v1/admin/pilots/${editingPilot.id}`, formData);
      } else {
        await api.post('/api/v1/admin/pilots', formData);
      }
      
      fetchPilots();
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save pilot');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this pilot?')) return;

    try {
      await api.delete(`/api/v1/admin/pilots/${id}`);
      fetchPilots();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete pilot');
    }
  };

  const handleToggleAvailability = async (id: number) => {
    try {
      await api.put(`/api/v1/admin/pilots/${id}/availability`);
      fetchPilots();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle availability');
    }
  };

  if (loading) return <LoadingSpinner />;

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'licenseNumber', label: 'License Number' },
    {
      key: 'isAvailable',
      label: 'Available',
      render: (pilot: Pilot) => (
        <button
          onClick={() => handleToggleAvailability(pilot.id)}
          className={`px-2 py-1 rounded text-sm ${
            pilot.isAvailable
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {pilot.isAvailable ? 'Yes' : 'No'}
        </button>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (pilot: Pilot) => (
        <div className="flex gap-2">
          <button
            onClick={() => openModal(pilot)}
            className="px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(pilot.id)}
            className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Pilot Management</h1>
        <button
          onClick={() => openModal()}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Add Pilot
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <DataTable columns={columns} data={pilots} />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPilot ? 'Edit Pilot' : 'Add Pilot'}
      >
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
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-500 text-sm font-bold mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-500 text-sm font-bold mb-2">
              License Number
            </label>
            <input
              type="text"
              value={formData.licenseNumber}
              onChange={(e) =>
                setFormData({ ...formData, licenseNumber: e.target.value })
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
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}