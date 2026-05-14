'use client';

import {  } from 'lucide-react';

export default function DashboardSidebar({ stats, recentJobs }: { stats: any, recentJobs: any[] }) {
  return (
    <div className="w-80 space-y-8 flex flex-col pt-4">
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <h5 className="font-bold text-slate-800 text-sm mb-6">Jobs Posted</h5>
        <div className="space-y-4">
          {recentJobs && recentJobs.length > 0 ? (
            recentJobs.map((job: any) => (
              <div key={job._id || job.id} className={`${job.status === 'Urgently Hiring' ? 'bg-orange-400' : 'bg-indigo-600'} p-5 rounded-2xl text-white shadow-lg shadow-indigo-100/20`}>
                <div className="text-sm font-bold opacity-90 truncate">{job.title}</div>
                <div className="text-[10px] mt-1 font-medium opacity-70">Total Applicants - {stats.totalCandidates}</div>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-xs italic text-center py-4">No recent jobs</p>
          )}
        </div>
      </div>


    </div>
  );
}
