'use client';

import { useState } from 'react';
import JobForm from '@/app/components/JobForm';
import CandidateForm from '@/app/components/CandidateForm';
import { deleteJob } from '@/app/lib/api';
import { useRouter } from 'next/navigation';

export default function JobsClient({ initialJobs }: { initialJobs: any[] }) {
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<any>(null);
  const [applyingRole, setApplyingRole] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete the "${title}" job listing? This action cannot be undone.`)) {
      try {
        await deleteJob(id);
        router.refresh();
      } catch (err) {
        console.error(err);
        alert('Failed to delete job.');
      }
    }
  };

  const handleEdit = (job: any) => {
    setJobToEdit(job);
    setIsJobModalOpen(true);
  };

  const closeJobModal = () => {
    setIsJobModalOpen(false);
    setJobToEdit(null);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Urgently Hiring': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Hiring': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Closed': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="space-y-10">
      {/* Clean Header Section */}
      <div className="flex justify-end items-center">
        <button
          onClick={() => setIsJobModalOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-100 active:scale-95"
        >
          <span className="text-xl">+</span> Create New Job
        </button>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {initialJobs.length === 0 ? (
          <div className="col-span-full text-center py-32 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[32px]">
            <p className="text-slate-400 font-medium italic">No jobs found. Start by creating a new job listing.</p>
          </div>
        ) : (
          initialJobs.map((job: any) => (
            <div key={job._id} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                {/* Status & Date */}
                <div className="flex justify-between items-center mb-8">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest border ${getStatusStyle(job.status)}`}>
                    {job.status}
                  </span>
                  <span className="text-[11px] font-bold text-slate-300">
                    {new Date(job.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>

                {/* Job Title */}
                <h3 className="text-2xl font-black text-slate-900 mb-4 leading-tight">
                  {job.title}
                </h3>

                {/* Info Rows */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-2.5 text-slate-500 font-bold text-sm">
                    <span className="opacity-40">📁</span> {job.department || 'Engineering'}
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-400 text-sm font-medium">
                    <span className="opacity-40">📍</span> {job.type || 'Full-time'}
                  </div>
                </div>

                {/* Openings */}
                <div className="text-xs font-bold text-slate-900 mb-8">
                  1 Openings
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <button
                  onClick={() => handleEdit(job)}
                  className="flex items-center gap-2 text-[12px] font-bold text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  <span className="text-base">✏️</span> Edit
                </button>
                <button
                  onClick={() => handleDelete(job._id, job.title)}
                  className="flex items-center gap-2 text-[12px] font-bold text-red-400 hover:text-red-600 transition-colors"
                >
                  <span className="text-base">🗑️</span> Delete
                </button>
                <button
                  onClick={() => setApplyingRole(job.title)}
                  className="flex items-center gap-2 text-[12px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <span className="text-base">✈️</span> Apply
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isJobModalOpen && (
        <JobForm
          onClose={closeJobModal}
          jobToEdit={jobToEdit}
        />
      )}

      {applyingRole && (
        <CandidateForm
          onClose={() => setApplyingRole(null)}
          initialRole={applyingRole}
        />
      )}
    </div>
  );
}
