'use client';

import type { ReactNode } from 'react';
import { LogLevel, StatsigProvider } from '@statsig/react-bindings';
import { StatsigAutoCapturePlugin } from '@statsig/web-analytics';
import { env } from '@/env';
import { LoadingSpinner } from '../ui/loading-spinner';

export default function MyStatsig({ children }: { children: ReactNode }) {
  return (
    <StatsigProvider
      sdkKey={env.NEXT_PUBLIC_STATSIG_CLIENT_KEY!}
      user={{ userID: 'a-user' }}
      options={{
        logLevel: LogLevel.Debug,
        plugins: [new StatsigAutoCapturePlugin()],
      }}
      loadingComponent={<LoadingSpinner />}
    >
      {children}
    </StatsigProvider>
  );
}
