import { SignedIn, SignedOut } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { Header } from '@/components/nav/header/header';
import { env } from '@/env';
import { AuthRequiredSection } from './components/auth-required-section';
import { UserProvider } from './context/user-context';

const FavoriteSchema = z.object({
  createdAt: z.string().transform((val) => new Date(val)),
  id: z.string(),
  placeId: z.string(),
  updatedAt: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : new Date())),
  userId: z.string(),
});

const RatingSchema = z.object({
  createdAt: z.string().transform((val) => new Date(val)),
  id: z.string(),
  placeId: z.string(),
  rating: z.number(),
  updatedAt: z.string().transform((val) => new Date(val)),
  userId: z.string(),
});

const UserResponseSchema = z.object({
  user: z.object({
    createdAt: z.string().transform((val) => new Date(val)),
    email: z.string(),
    favorites: z.array(FavoriteSchema).optional().default([]),
    firstName: z.string().nullable(),
    id: z.string(),
    imageUrl: z.string().nullable(),
    lastName: z.string().nullable(),
    ratings: z.array(RatingSchema).optional().default([]),
    updatedAt: z.string().transform((val) => new Date(val)),
    username: z.string().nullable(),
  }),
  status: z.number(),
});

const TokenSchema = z.string();
/**
 * Layout component for the app section
 *
 * Wraps the app section in a ClerkProvider for authentication
 * and uses the Header component with authentication elements.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render within the layout
 * @returns {JSX.Element} App layout component
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getToken } = await auth();
  const token = await getToken();
  const response = await fetch(`${env.NEXT_PUBLIC_SITE_URL}/api/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const rawResponse = await response.json();
  const validatedResponse = UserResponseSchema.parse(rawResponse);
  const validatedToken = TokenSchema.parse(token);

  return (
    <div className='min-h-screen flex flex-col bg-zinc-950 dark:bg-zinc-950 text-cyan-400 dark:text-cyan-400 font-mono bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.1),transparent)]'>
      <Header showAuth={true} />
      <SignedIn>
        <UserProvider user={validatedResponse.user} token={validatedToken}>
          <main className='flex-grow'>{children}</main>
        </UserProvider>
      </SignedIn>
      <SignedOut>
        <AuthRequiredSection />
      </SignedOut>
    </div>
  );
}
