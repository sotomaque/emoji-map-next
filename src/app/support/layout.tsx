import { Footer } from '@/components/footer/footer';
import { Header } from '@/components/nav/header/header';

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header showAuth={false} />
      <main className='flex-1 flex flex-col'>{children}</main>
      <Footer />
    </>
  );
}
