import { getJobs } from '@/lib/api';
import JobsClient from './JobsClient';

export default async function JobsPage() {
  let jobs = [];
  try {
    jobs = await getJobs();
  } catch (error) {
    console.error('Failed to fetch jobs:', error);
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <JobsClient initialJobs={jobs} />
    </div>
  );
}
