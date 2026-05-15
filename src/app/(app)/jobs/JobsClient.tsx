'use client';

import { useState } from 'react';
import JobForm from '@/components/JobForm';
import CandidateForm from '@/components/CandidateForm';
import { deleteJobAction } from '@/lib/actions';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function JobsClient({ initialJobs }: { initialJobs: any[] }) {
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<any>(null);
  const [applyingRole, setApplyingRole] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, title: string } | null>(null);
  const router = useRouter();

  const handleDeleteRequest = (id: string, title: string) => {
    setDeleteConfirm({ id, title });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteJobAction(deleteConfirm.id);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteConfirm(null);
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
                  <div className="flex items-center gap-2.5 text-slate-400 text-sm font-medium">
                    <span className="opacity-40">⏳</span> Experience: {job.experience && job.experience !== 'Fresher' ? `${job.experience} Yrs` : 'Fresher'}
                  </div>
                </div>

                {/* Openings */}
                <div className="text-xs font-bold text-indigo-600 mb-8 bg-indigo-50 inline-block px-3 py-1 rounded-full">
                  {job.openings || 1} {job.openings === 1 ? 'Opening' : 'Openings'}
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
                  onClick={() => handleDeleteRequest(job._id, job.title)}
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-[400px] bg-white rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Job?</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Are you sure you want to delete "{deleteConfirm.title}"? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-100"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
