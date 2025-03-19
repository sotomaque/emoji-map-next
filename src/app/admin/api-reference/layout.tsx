import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  const isAdmin = Boolean(user?.publicMetadata.admin);

  if (!isAdmin) {
    redirect('/admin');
  }

  return <>{children}</>;
}
