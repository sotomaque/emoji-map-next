'use client';

import React from 'react';
import { LogLevel, StatsigProvider } from '@statsig/react-bindings';
import { StatsigAutoCapturePlugin } from '@statsig/web-analytics';
import { env } from '@/env';

export default function MyStatsig({ children }: { children: React.ReactNode }) {
  return (
    <StatsigProvider
      sdkKey={env.NEXT_PUBLIC_STATSIG_CLIENT_KEY!}
      user={{ userID: 'a-user' }}
      options={{
        logLevel: LogLevel.Debug,
        plugins: [new StatsigAutoCapturePlugin()],
      }}
    >
      {children}
    </StatsigProvider>
  );
}
