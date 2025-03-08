'use client';

import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error('Error boundary caught an error:', error, errorInfo);

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        this.props.fallback || (
          <div className='p-8 bg-destructive/10 border border-destructive/20 rounded-md'>
            <h2 className='text-xl font-bold text-destructive mb-2'>
              Something went wrong
            </h2>
            <p className='text-destructive/80 mb-4'>
              An unexpected error occurred. Our team has been notified.
            </p>
            <details className='bg-background p-4 rounded border border-destructive/20'>
              <summary className='cursor-pointer font-medium'>
                Error details
              </summary>
              <pre className='mt-2 text-sm overflow-auto p-2 bg-muted'>
                {this.state.error?.toString()}
              </pre>
            </details>
            <div className='flex gap-4 mt-4'>
              <button
                className='px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors'
                onClick={() => window.location.reload()}
              >
                Reload page
              </button>
              <button
                className='px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-colors'
                onClick={() => window.history.back()}
              >
                Go back
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
