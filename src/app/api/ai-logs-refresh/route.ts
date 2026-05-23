import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import AiLog from '@/models/AiLog';
import * as Sentry from '@sentry/nextjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const dbLogs = await AiLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
      
    const serializedLogs = dbLogs.map((log: any) => ({
      ...log,
      _id: log._id.toString(),
      createdAt: log.createdAt.toISOString(),
      updatedAt: log.updatedAt.toISOString(),
    }));
    
    return NextResponse.json({ logs: serializedLogs });
  } catch (error: any) {
    console.error('API GET /api/ai-logs-refresh failed:', error);
    Sentry.captureException(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
