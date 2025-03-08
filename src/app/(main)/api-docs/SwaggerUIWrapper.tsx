'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import { useTheme } from 'next-themes';

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

interface SwaggerUIWrapperProps {
  spec: Record<string, unknown>;
}

// Create a wrapper component to handle the warnings
const SwaggerUIWrapper: React.FC<SwaggerUIWrapperProps> = ({ spec }) => {
  const { resolvedTheme } = useTheme();

  // Suppress console warnings in development
  useEffect(() => {
    // Save original console.error
    const originalError = console.error;

    // Replace console.error to filter out the specific warning
    console.error = (...args: unknown[]) => {
      // Filter out the UNSAFE_componentWillReceiveProps warning
      if (
        typeof args[0] === 'string' &&
        args[0].includes('UNSAFE_componentWillReceiveProps') &&
        args[0].includes('strict mode')
      ) {
        return;
      }

      // Pass through other errors
      originalError(...args);
    };

    // Restore original console.error on cleanup
    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <div
      className={`swagger-ui-container ${resolvedTheme === 'dark' ? 'swagger-dark-theme' : ''}`}
    >
      <SwaggerUI
        spec={spec}
        docExpansion='list'
        defaultModelsExpandDepth={5}
        displayRequestDuration={true}
        filter={true}
        deepLinking={true}
        supportedSubmitMethods={['get', 'post', 'put', 'delete', 'patch']}
        tryItOutEnabled={true}
        persistAuthorization={true}
      />
    </div>
  );
};

export default SwaggerUIWrapper;
