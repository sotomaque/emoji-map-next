import { useMemo } from 'react';
import { useUser } from '@clerk/nextjs';

export function useIsAdmin() {
  const { user } = useUser();

  const isAdmin = useMemo(
    () => Boolean(user?.publicMetadata?.admin),
    [user?.publicMetadata?.admin]
  );

  return isAdmin;
}
