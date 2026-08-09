'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isAdmin } from '@/lib/auth';

const ownerMenuItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/vessels', label: 'My Vessels' },
  { href: '/routes', label: 'Browse Routes' },
  { href: '/bookings', label: 'My Bookings' },
  { href: '/bookings/new', label: 'Create Booking' },
  { href: '/coupons', label: 'My Coupons' },
];

const adminMenuItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/vessels', label: 'Vessels' },
  { href: '/admin/routes', label: 'Routes' },
  { href: '/admin/pilots', label: 'Pilots' },
  { href: '/admin/coupons', label: 'Coupons' },
  { href: '/admin/bookings', label: 'Bookings' },
  { href: '/admin/reports', label: 'Reports' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const menuItems = isAdmin() ? adminMenuItems : ownerMenuItems;

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-indigo-900 dark:bg-gray-950 text-white">
      <div className="p-4">
        <h1 className="text-xl font-bold">PBCPMS</h1>
        <p className="text-sm text-indigo-200 dark:text-gray-400">Pilot Booking System</p>
      </div>
      <nav className="mt-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-4 py-3 transition-colors ${
              (item.href === '/admin' || item.href === '/dashboard'
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + '/'))
                ? 'bg-white text-indigo-900 font-semibold border-l-4 border-indigo-500'
                : 'text-white hover:bg-indigo-800 dark:hover:bg-gray-800'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}