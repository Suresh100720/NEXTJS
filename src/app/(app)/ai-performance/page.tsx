import connectDB from '@/lib/db';
import AiLog from '@/models/AiLog';
import TelemetryClient from './TelemetryClient';

export const revalidate = 0; // Disable server cache for real-time telemetry

export default async function TelemetryPage() {
  await connectDB();

  // Retrieve top 10 most recent logs
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

  // Aggregate metrics from MongoDB
  const stats = await AiLog.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        avgLatency: { $avg: '$latencyMs' },
        totalTokens: { $sum: '$totalTokens' },
        success: {
          $sum: {
            $cond: [{ $eq: ['$status', 'success'] }, 1, 0]
          }
        }
      }
    }
  ]);

  const totalRequests = stats[0]?.total || 0;
  const avgLatency = stats[0]?.avgLatency || 0;
  const totalTokens = stats[0]?.totalTokens || 0;
  const successCount = stats[0]?.success || 0;
  const successRate = totalRequests > 0 ? successCount / totalRequests : 1.0;
  
  const errorCount = await AiLog.countDocuments({ status: 'error' });

  const metrics = {
    totalRequests,
    avgLatency,
    totalTokens,
    successRate,
    errorCount,
  };

  return (
    <TelemetryClient 
      initialLogs={serializedLogs} 
      metrics={metrics} 
    />
  );
}
