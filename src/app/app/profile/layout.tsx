import { redirect } from 'next/navigation';
import { getCurrentUser } from './actions';
import { UserProvider } from './context/user-context';

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch user data using the server action
  const user = await getCurrentUser();

  if (!user) {
    console.log('Redirecting to /app due to: No user data');
    redirect('/app');
  }

  return (
    <div className="profile-layout">
      <UserProvider user={user}>
        {children}
      </UserProvider>
    </div>
  );
} 