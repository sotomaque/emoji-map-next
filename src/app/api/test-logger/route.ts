import { NextResponse } from 'next/server';
import { log } from '@/utils/log';

/**
 * Test endpoint to demonstrate the enhanced logger functionality
 */
export async function GET() {
  // Log different types of messages
  log.info('This is an info message', { endpoint: '/api/test-logger' });
  log.debug('This is a debug message (only visible in development)', {
    timestamp: new Date().toISOString(),
  });
  log.warn('This is a warning message', {
    warning: 'Something might be wrong',
  });
  log.success('This is a success message', {
    status: 'Operation completed successfully',
  });

  try {
    // Simulate an error
    throw new Error('This is a test error');
  } catch (error) {
    log.error('This is an error message', error);
  }

  return NextResponse.json({
    message: 'Logger test completed. Check your console for colorful logs!',
    timestamp: new Date().toISOString(),
  });
}
