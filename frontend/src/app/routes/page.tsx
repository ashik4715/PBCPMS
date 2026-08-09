'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { ApiResponse, Route } from '@/lib/types';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await api.get<ApiResponse<Route[]>>('/api/v1/routes');
        if (response.data.success) {
          setRoutes(response.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load routes');
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Browse Routes</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routes.map((route) => (
          <div key={route.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">{route.name}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-1">
              From: {route.origin}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-1">
              To: {route.destination}
            </p>
            {route.distanceKm && (
              <p className="text-gray-600 dark:text-gray-400 mb-1">
                Distance: {route.distanceKm} km
              </p>
            )}
            <p className="text-2xl font-bold text-indigo-600 mt-4">
              ${route.fee.toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}