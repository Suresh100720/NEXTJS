// ─── CONCEPTS IMPLEMENTED IN THIS FILE ─────────────────────────────────────
// • Lazy Loading      → Dynamic imports load JobForm/CandidateForm only on demand
// • React Profiler    → DevProfiler wraps the jobs grid to measure render time
// • INP               → startTransition defers non-urgent state updates
// • CLS               → Skeleton loader reserves space during loading
// • Core Web Vitals   → All three (LCP/INP/CLS) optimizations applied here
// ────────────────────────────────────────────────────────────────────────────

'use client';

import { useState, startTransition } from 'react';
import { AlertCircle, Loader2, Briefcase, Clock, Users } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteJob, getJobs } from '@/lib/api';
import Link from 'next/link';

// ─── Lazy Loading — Dynamic Imports ───────────────────────────────────────
// Concept: Lazy Loading → Loads content only when needed
//
// JobForm and CandidateForm are large modal components (~14KB + ~16KB).
// Without dynamic imports they'd be in the INITIAL bundle — downloaded even
// if the user never opens a modal.
//
// With dynamic():
//   - They're split into SEPARATE chunks
//   - Downloaded ONLY when the user clicks "Create Job" or "Apply"
//   - Reduces initial JS parse time → better TTI and INP
//   - ssr: false — modals are client-only, no need to SSR them
import dynamic from 'next/dynamic';

// Spinner shown while the modal chunk is being downloaded
const ModalSkeleton = () => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
    </div>
  </div>
);

// Concept: Lazy Loading → ssr: false prevents server-side rendering of modals
// loading: () => <ModalSkeleton /> shows a spinner while the chunk loads
const JobForm = dynamic(() => import('@/components/JobForm'), {
  ssr: false,
  loading: () => <ModalSkeleton />,
});

const CandidateForm = dynamic(() => import('@/components/CandidateForm'), {
  ssr: false,
  loading: () => <ModalSkeleton />,
});

// ─── DevProfiler — React Profiler ─────────────────────────────────────────
// Concept: React Profiler → Measures React rendering performance
// DevProfiler wraps the jobs grid to log render timings in development.
// In production it's a no-op (renders children directly).
import DevProfiler from '@/components/DevProfiler';

export default function JobsClient() {
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<any>(null);
  const [applyingRole, setApplyingRole] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, title: string } | null>(null);

  const queryClient = useQueryClient();

  // 1. QUERIES: Fetch and cache server data using TanStack Query
  // Note: Since this is wrapped in HydrationBoundary, it instantly hydrates
  // from server prefetch — no client-side loading on initial load (LCP fix)!
  const { data: jobs = [], isLoading, isFetching, isError, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => getJobs(),
  });

  // 2. MUTATIONS & OPTIMISTIC UPDATES
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteJob(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['jobs'] });
      const previousJobs = queryClient.getQueryData<any[]>(['jobs']);
      queryClient.setQueryData<any[]>(['jobs'], (old) =>
        old ? old.filter((job) => job._id !== deletedId) : []
      );
      return { previousJobs };
    },
    onError: (err, deletedId, context) => {
      if (context?.previousJobs) {
        queryClient.setQueryData(['jobs'], context.previousJobs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const handleDeleteRequest = (id: string, title: string) => {
    setDeleteConfirm({ id, title });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    deleteMutation.mutate(deleteConfirm.id);
    setDeleteConfirm(null);
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
      case 'Hiring':          return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Active':          return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Closed':          return 'bg-red-50 text-red-600 border-red-100';
      default:                return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  // ─── INP Optimization: startTransition ───────────────────────────────────
  // Concept: INP → Measures interaction responsiveness
  // startTransition marks state updates as NON-URGENT so React can
  // keep the UI responsive to other interactions (typing, clicks) while
  // processing this update. This prevents "janky" UI during re-renders.
  const handleManualInvalidate = () => {
    startTransition(() => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    });
  };

  // ─── CLS Fix: Skeleton Loader ────────────────────────────────────────────
  // Concept: CLS → Measures layout stability during loading
  // Instead of showing nothing (which causes layout shift when content appears),
  // we show a skeleton with the EXACT same dimensions as the job cards.
  // This reserves the space in advance → zero layout shift.
  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-2">
            <div className="h-9 w-48 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-4 w-72 bg-slate-100 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-slate-100 rounded-xl animate-pulse" />
        </div>

        {/* Skeleton cards — same grid as real cards (CLS prevention) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm"
              style={{ minHeight: 320 }} // Reserve exact card height
            >
              <div className="flex justify-between mb-8">
                <div className="h-5 w-20 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-4 w-16 bg-slate-100 rounded-lg animate-pulse" />
              </div>
              <div className="h-8 w-3/4 bg-slate-100 rounded-xl animate-pulse mb-4" />
              <div className="space-y-3 mb-8">
                <div className="h-4 w-1/2 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-4 w-2/3 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-4 w-1/2 bg-slate-100 rounded-lg animate-pulse" />
              </div>
              <div className="h-6 w-24 bg-slate-100 rounded-full animate-pulse mb-8" />
              <div className="flex justify-between pt-6 border-t border-slate-50">
                <div className="h-4 w-12 bg-slate-100 rounded animate-pulse" />
                <div className="h-4 w-14 bg-slate-100 rounded animate-pulse" />
                <div className="h-4 w-12 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-red-50 border border-red-100 text-red-600 rounded-3xl font-bold flex items-center gap-3">
        <AlertCircle className="w-6 h-6" />
        <div>
          <p className="text-base">Failed to load jobs</p>
          <p className="text-xs font-medium text-red-500">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-100 pb-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Public Job Board</h1>
            {isFetching && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-[10px] font-bold animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                Syncing cache...
              </span>
            )}
          </div>
          <p className="text-slate-400">
            Showing {jobs.length} open positions managed with{' '}
            <span className="text-indigo-500 font-semibold">TanStack Query</span>.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleManualInvalidate}
            disabled={isFetching}
            className="flex-1 md:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold transition-all text-slate-300 flex items-center justify-center gap-2"
          >
            ⚡ Invalidate & Refetch
          </button>

          {/* 
            Concept: Lazy Loading → JobForm chunk loads ONLY when this button is clicked
            Before click: 0 bytes downloaded for JobForm
            After click: chunk downloaded + modal renders
          */}
          <button
            onClick={() => setIsJobModalOpen(true)}
            className="flex-1 md:flex-none px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <span className="text-sm font-black">+</span> Create Job
          </button>
        </div>
      </div>

      {/* ─── Jobs Grid — wrapped with React Profiler ────────────────────────
          Concept: React Profiler → Measures React rendering performance
          DevProfiler logs actualDuration, baseDuration, phase for this grid.
          Open DevTools console to see render timing data. ─────────────────── */}
      <DevProfiler id="JobsGrid">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {jobs.length === 0 ? (
            <div className="col-span-full text-center py-32 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[32px]">
              <p className="text-slate-400 font-medium italic">
                No jobs found. Start by creating a new job listing.
              </p>
            </div>
          ) : (
            jobs.map((job: any) => (
              <div
                key={job._id}
                className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                style={{ minHeight: 320 }} // CLS: reserve space for card
              >
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

                  {/* Job Title — Link to detail page */}
                  <Link href={`/jobs/${job._id}`}>
                    <h3 className="text-2xl font-black text-slate-900 mb-4 leading-tight hover:text-indigo-600 transition-colors cursor-pointer">
                      {job.title}
                    </h3>
                  </Link>

                  {/* Info Rows */}
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-2.5 text-slate-500 font-bold text-sm">
                      <Briefcase className="w-4 h-4 opacity-40" />
                      {job.department || 'Engineering'}
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-400 text-sm font-medium">
                      <Users className="w-4 h-4 opacity-40" />
                      {job.type || 'Full-time'}
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-400 text-sm font-medium">
                      <Clock className="w-4 h-4 opacity-40" />
                      Experience: {job.experience && job.experience !== 'Fresher' ? `${job.experience} Yrs` : 'Fresher'}
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
      </DevProfiler>

      {/* 
        Concept: Lazy Loading → These modals are dynamically imported.
        The JobForm/CandidateForm chunks are downloaded ONLY when these
        conditional renders become true (user clicks the button).
      */}
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
                  Are you sure you want to delete &quot;{deleteConfirm.title}&quot;? This action will optimistically delete the item instantly.
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
