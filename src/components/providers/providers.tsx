import { ThemeProvider } from './theme-provider';
import { QueryProvider } from './query-provider';
import StatsigProvider from './statsig-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <StatsigProvider>{children}</StatsigProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
