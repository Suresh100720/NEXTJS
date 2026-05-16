import { getJobs } from '@/lib/api';
import JobsClient from './JobsClient';
import { Metadata } from 'next';
import { revalidateTag } from 'next/cache';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Public Job Board | Recruitment Hub',
  description: 'Explore the latest career opportunities.',
};

export default async function JobsPage() {
  // Manual Revalidation Server Action
  async function manualRevalidate() {
    'use server';
    revalidateTag('jobs'); // This clears the ISR cache instantly
  }

  let jobs = [];
  try {
    // Pass the tag to the API helper
    jobs = await getJobs(60);
  } catch (error) {
    console.error('Failed to fetch jobs:', error);
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Public Job Board</h1>
          <p className="text-slate-400">Showing {jobs.length} open positions. (ISR: 60s)</p>
        </div>
        
        <form action={manualRevalidate}>
          <button 
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium transition-all text-slate-300"
          >
            ⚡ Force Revalidate Cache
          </button>
        </form>
      </div>

      <JobsClient initialJobs={jobs} />
    </div>
  );
}
