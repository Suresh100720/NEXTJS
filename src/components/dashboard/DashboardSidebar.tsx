'use client';

import { } from 'lucide-react';
import { Job } from '@/types';

export default function DashboardSidebar({ totalCandidates, recentJobs }: { totalCandidates: number, recentJobs: Job[] }) {
  return (
    <div className="w-80 space-y-8 flex flex-col pt-4">
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <h5 className="font-bold text-slate-800 text-sm mb-6">Jobs Posted</h5>
        <div className="space-y-4">
          {recentJobs && recentJobs.length > 0 ? (
            recentJobs.map((job: Job) => (
              <div
                key={job._id || job.id}
                className="p-5 rounded-2xl border border-indigo-100/50 bg-indigo-50/30 text-indigo-950 shadow-sm transition-all hover:scale-[1.01] hover:shadow-sm"
              >
                <div className="text-sm font-black tracking-tight truncate">{job.title}</div>
                <div className="text-[10px] mt-1.5 font-bold uppercase tracking-wider text-indigo-500">
                  Total Applicants — {totalCandidates}
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-xs italic text-center py-4 font-bold opacity-60">
              No recent job postings available.
            </p>
          )}
        </div>
      </div>


    </div>
  );
}
