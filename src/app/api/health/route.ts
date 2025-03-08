import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Simple endpoint to check if the API is running
 *     tags:
 *       - system
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 message:
 *                   type: string
 *                   example: "API is running"
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
}
