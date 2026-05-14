import { getStats, getJobs, getCandidates } from '@/lib/api';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
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

  return <DashboardClient stats={stats} jobs={jobs} candidates={candidates} />;
}
