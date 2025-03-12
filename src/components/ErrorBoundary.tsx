'use client';

import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  title?: string;
  fallbackUI?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component that catches JavaScript errors in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can also log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { children, title = 'Something went wrong', fallbackUI } = this.props;

    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        fallbackUI || (
          <Card className='border-red-300 bg-red-50'>
            <CardHeader>
              <CardTitle className='text-red-700'>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <p className='text-red-600'>
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
                <Button onClick={this.resetError} variant='outline'>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      );
    }

    return children;
  }
}

export default ErrorBoundary;
