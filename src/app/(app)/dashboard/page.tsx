import { getStats, getJobs, getCandidates } from '@/lib/api';
import DashboardClient from './DashboardClient';
import { Metadata } from 'next';
import { cookies, headers } from 'next/headers';

// 1. Force Dynamic: Ensures the page is rendered for every request
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const metadata: Metadata = {
  title: 'Recruiter Dashboard | Private',
  description: 'Real-time monitoring of recruitment statistics and candidate pipeline.',
  robots: 'noindex, nofollow',
};

export default async function DashboardPage() {
  // Accessing headers() or cookies() automatically makes the page dynamic
  const headerList = await headers();
  const userAgent = headerList.get('user-agent');
  
  // This timestamp is generated ON THE SERVER at the moment of request
  const serverTime = new Date().toLocaleTimeString();
  console.log('--- DASHBOARD RENDERED AT:', serverTime, '---');

  let stats = {};
  let jobs = [];
  let candidates = [];

  try {
    [stats, jobs, candidates] = await Promise.all([
      getStats(),
      getJobs(),
      getCandidates()
    ]);
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900/80 p-4 rounded-xl border border-blue-500/30 shadow-lg shadow-blue-500/10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-emerald-400 uppercase tracking-widest">Live Dynamic View</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Server Request Time</span>
          <span className="text-lg font-mono text-white font-bold">{serverTime}</span>
        </div>
      </div>
      
      <DashboardClient stats={stats} jobs={jobs} candidates={candidates} />
    </div>
  );
}
