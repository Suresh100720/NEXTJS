'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createJob, updateJob } from '@/lib/api';

export default function JobForm({ onClose, jobToEdit }: { onClose: () => void, jobToEdit?: any }) {
  const [title, setTitle] = useState(jobToEdit?.title || 'Frontend Developer');
  const [department, setDepartment] = useState(jobToEdit?.department || 'Engineering');
  const [type, setType] = useState(jobToEdit?.type || 'Full-time');
  const [status, setStatus] = useState(jobToEdit?.status || 'Active');
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const router = useRouter();

  const roleOptions = [
    'Frontend Developer',
    'Backend Developer',
    'Fullstack Developer',
    'UI/UX Designer',
    'Mobile App Developer',
    'DevOps Engineer',
    'QA Engineer'
  ];

  const deptOptions = [
    'Engineering',
    'Product',
    'Design',
    'Marketing',
    'Sales',
    'HR',
    'Finance'
  ];

  const statusOptions = [
    'Hiring',
    'Closed',
    'Active',
    'Urgently Hiring'
  ];

  useEffect(() => {
    if (title !== (jobToEdit?.title || 'Frontend Developer') || 
        department !== (jobToEdit?.department || 'Engineering') || 
        type !== (jobToEdit?.type || 'Full-time') ||
        status !== (jobToEdit?.status || 'Active')) {
      setIsDirty(true);
    } else {
      setIsDirty(false);
    }
  }, [title, department, type, status, jobToEdit]);

  const handleCancel = () => {
    if (isDirty) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const jobData = { title, department, type, status };
      if (jobToEdit) {
        await updateJob(jobToEdit._id || jobToEdit.id, jobData);
      } else {
        await createJob(jobData);
      }
      router.refresh();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl relative">
        <button 
          onClick={handleCancel}
          className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-6 text-slate-900">
          {jobToEdit ? 'Edit Job Listing' : 'Post a New Job'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Role / Title</label>
            <select
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            >
              {roleOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            >
              {deptOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            >
              {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Employment Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            >
              <option>Full-time</option>
              <option>Contract</option>
              <option>Part-time</option>
              <option>Freelance</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 shadow-lg shadow-indigo-100"
            >
              {loading ? 'Saving...' : (jobToEdit ? 'Update Job' : 'Post Job')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
