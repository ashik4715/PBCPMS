'use client';

import DataTable from '@/components/DataTable';
import LoadingSpinner from '@/components/LoadingSpinner';
import Modal from '@/components/Modal';
import api from '@/lib/api';
import { ApiResponse, Route } from '@/lib/types';
import { useEffect, useState } from 'react';

export default function AdminRoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    origin: '',
    destination: '',
    distanceKm: '',
    fee: '',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await api.get<ApiResponse<Route[]>>('/api/v1/admin/routes');
      if (response.data.success) {
        setRoutes(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (route?: Route) => {
    if (route) {
      setEditingRoute(route);
      setFormData({
        name: route.name,
        origin: route.origin,
        destination: route.destination,
        distanceKm: route.distanceKm?.toString() || '',
        fee: route.fee.toString(),
        isActive: route.isActive,
      });
    } else {
      setEditingRoute(null);
      setFormData({
        name: '',
        origin: '',
        destination: '',
        distanceKm: '',
        fee: '',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        ...formData,
        distanceKm: formData.distanceKm ? parseFloat(formData.distanceKm) : null,
        fee: parseFloat(formData.fee),
      };

      if (editingRoute) {
        await api.put(`/api/v1/admin/routes/${editingRoute.id}`, payload);
      } else {
        await api.post('/api/v1/admin/routes', payload);
      }
      
      fetchRoutes();
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save route');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this route?')) return;

    try {
      await api.delete(`/api/v1/admin/routes/${id}`);
      fetchRoutes();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete route');
    }
  };

  if (loading) return <LoadingSpinner />;

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'origin', label: 'Origin' },
    { key: 'destination', label: 'Destination' },
    {
      key: 'distanceKm',
      label: 'Distance',
      render: (route: Route) => route.distanceKm ? `${route.distanceKm} km` : '-',
    },
    {
      key: 'fee',
      label: 'Fee',
      render: (route: Route) => `$${route.fee.toFixed(2)}`,
    },
    {
      key: 'isActive',
      label: 'Active',
      render: (route: Route) => (
        <span className={route.isActive ? 'text-green-600' : 'text-red-600'}>
          {route.isActive ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (route: Route) => (
        <div className="flex gap-2">
          <button
            onClick={() => openModal(route)}
            className="px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(route.id)}
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Route Management</h1>
        <button
          onClick={() => openModal()}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Add Route
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <DataTable columns={columns} data={routes} />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRoute ? 'Edit Route' : 'Add Route'}
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
              Origin
            </label>
            <input
              type="text"
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-500 text-sm font-bold mb-2">
              Destination
            </label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) =>
                setFormData({ ...formData, destination: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-500 text-sm font-bold mb-2">
              Distance (km)
            </label>
            <input
              type="number"
              value={formData.distanceKm}
              onChange={(e) =>
                setFormData({ ...formData, distanceKm: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-500 text-sm font-bold mb-2">
              Fee ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.fee}
              onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300 text-sm font-bold">Active</span>
            </label>
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