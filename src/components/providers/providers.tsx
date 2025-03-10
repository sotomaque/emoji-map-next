import { QueryProvider } from './query-provider';
import StatsigProvider from './statsig-provider';
import { ThemeProvider } from './theme-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <StatsigProvider>{children}</StatsigProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
