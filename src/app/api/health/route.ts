import { NextResponse } from 'next/server';

/**
 * Health check endpoint
 * Simple endpoint to check if the API is running
 * Returns a JSON response with status, message, and timestamp
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
}
