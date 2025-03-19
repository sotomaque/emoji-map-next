'use client';

import { redirect } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const isAdmin = Boolean(user?.publicMetadata.admin);

  if (!isAdmin) {
    redirect('/admin');
  }

  return <>{children}</>;
}
