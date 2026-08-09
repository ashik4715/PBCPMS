'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn, isAdmin } from '@/lib/auth';
import Layout from '@/components/Layout';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login');
    } else if (!isAdmin()) {
      router.push('/dashboard');
    }
  }, [router]);

  if (!isLoggedIn() || !isAdmin()) {
    return null;
  }

  return <Layout>{children}</Layout>;
}