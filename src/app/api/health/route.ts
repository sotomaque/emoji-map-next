import { NextResponse } from 'next/server';
import type { ErrorResponse } from 'resend';

type HealthResponse = {
  status: string;
  message: string;
  timestamp: string;
};

/**
 * Health check endpoint
 * Simple endpoint to check if the API is running
 * Returns a JSON response with status, message, and timestamp
 */
export async function GET(): Promise<
  NextResponse<HealthResponse | ErrorResponse>
> {
  try {
    return NextResponse.json({
      status: 'ok',
      message: 'API is running',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'API is not running',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
