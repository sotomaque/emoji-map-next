'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import { useTheme } from 'next-themes';

// Dynamically import SwaggerUI to avoid build issues with lodash-es
const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => <div className='p-8 text-center'>Loading Swagger UI...</div>,
});

interface SwaggerUIWrapperProps {
  spec: Record<string, unknown>;
}

// Create a wrapper component to handle the warnings
const SwaggerUIWrapper: React.FC<SwaggerUIWrapperProps> = ({ spec }) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Effect for mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Suppress console warnings in development
  useEffect(() => {
    const originalConsoleWarn = console.warn;
    console.warn = (...args: unknown[]) => {
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('componentWillReceiveProps') ||
          args[0].includes('componentWillMount') ||
          args[0].includes('componentWillUpdate'))
      ) {
        return;
      }
      originalConsoleWarn(...args);
    };

    return () => {
      console.warn = originalConsoleWarn;
    };
  }, []);

  // Render loading state if not mounted
  if (!mounted) {
    return <div className='p-8 text-center'>Loading Swagger UI...</div>;
  }

  return (
    <div className={resolvedTheme === 'dark' ? 'swagger-ui-dark' : ''}>
      <SwaggerUI spec={spec} />
    </div>
  );
};

export default SwaggerUIWrapper;
