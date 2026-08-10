'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn, isOwner } from '@/lib/auth';

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login');
    } else if (!isOwner()) {
      router.push('/admin');
    }
  }, [router]);

  if (!isLoggedIn() || !isOwner()) {
    return null;
  }

  return <>{children}</>;
}
