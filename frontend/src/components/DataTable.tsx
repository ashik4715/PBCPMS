'use client';

import { ReactNode } from 'react';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
}

export default function DataTable<T extends { id: number }>({
  columns,
  data,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700">
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((item) => (
            <tr
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap dark:text-gray-200">
                  {column.render
                    ? column.render(item)
                    : (item as any)[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">No data available</div>
      )}
    </div>
  );
}