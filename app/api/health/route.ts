// app/api/health/route.ts
// Health Check Endpoint - ทดสอบ MongoDB connection
// ✅ Path ถูกต้อง: @/lib/mongodb

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

/**
 * GET /api/health
 * 
 * Test endpoint to verify:
 * - Server is running
 * - MongoDB is connected
 * 
 * Success Response (200):
 * {
 *   "status": "ok",
 *   "timestamp": "2025-01-06T15:47:00.000Z",
 *   "uptime": 12.34,
 *   "environment": "development",
 *   "mongodb": "connected"
 * }
 * 
 * Error Response (500):
 * {
 *   "status": "error",
 *   "timestamp": "2025-01-06T15:47:00.000Z",
 *   "error": "MongoDB connection failed",
 *   "mongodb": "disconnected"
 * }
 */

export async function GET(request: NextRequest) {
  try {
    // Test MongoDB connection
    await connectDB();

    // Return success response
    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'unknown',
        mongodb: 'connected',
      },
      { status: 200 }
    );
  } catch (error) {
    // Log error
    console.error('❌ Health check failed:', error);

    // Return error response
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        mongodb: 'disconnected',
      },
      { status: 500 }
    );
  }
}