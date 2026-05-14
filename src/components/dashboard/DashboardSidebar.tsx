'use client';

import { Calendar, Users, LogOut } from 'lucide-react';

export default function DashboardSidebar({ stats, recentJobs, reminders }: { stats: any, recentJobs: any[], reminders: any[] }) {
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

      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex-1">
        <h5 className="font-bold text-slate-800 text-sm mb-6">Reminders</h5>
        <div className="space-y-6">
          {reminders.map((rem, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0">{rem.icon}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className="text-[11px] font-bold text-slate-700 leading-tight pr-4">{rem.text}</p>
                  <span className="text-[9px] text-slate-300 font-bold whitespace-nowrap">{rem.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
