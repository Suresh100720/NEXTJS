'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createJob, updateJob } from '@/lib/api';
import { ChevronDown } from 'lucide-react';

export default function JobForm({ onClose, jobToEdit }: { onClose: () => void, jobToEdit?: any }) {
  const [title, setTitle] = useState(jobToEdit?.title || '');
  const [department, setDepartment] = useState(jobToEdit?.department || '');
  const [type, setType] = useState(jobToEdit?.type || '');
  const [experience, setExperience] = useState(jobToEdit?.experience || '');
  const [status, setStatus] = useState(jobToEdit?.status || '');
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

  const experienceOptions = ['Fresher', '1', '2', '3', '4', '5', '6', '7+'];

  useEffect(() => {
    if (title !== (jobToEdit?.title || '') || 
        department !== (jobToEdit?.department || '') || 
        type !== (jobToEdit?.type || '') ||
        experience !== (jobToEdit?.experience || '') ||
        status !== (jobToEdit?.status || '')) {
      setIsDirty(true);
    } else {
      setIsDirty(false);
    }
  }, [title, department, type, experience, status, jobToEdit]);

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
      const jobData = { title, department, type, status, experience };
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
            <div className="relative">
              <select
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${title ? 'text-slate-900' : 'text-slate-400'}`}
              >
                <option value="" disabled hidden>Select job title...</option>
                {roleOptions.map(opt => <option key={opt} value={opt} className="text-slate-900">{opt}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Department</label>
            <div className="relative">
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${department ? 'text-slate-900' : 'text-slate-400'}`}
              >
                <option value="" disabled hidden>Select department...</option>
                {deptOptions.map(opt => <option key={opt} value={opt} className="text-slate-900">{opt}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Status</label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${status ? 'text-slate-900' : 'text-slate-400'}`}
              >
                <option value="" disabled hidden>Select status...</option>
                {statusOptions.map(opt => <option key={opt} value={opt} className="text-slate-900">{opt}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Employment Type</label>
            <div className="relative">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${type ? 'text-slate-900' : 'text-slate-400'}`}
              >
                <option value="" disabled hidden>Select type...</option>
                <option value="Full-time" className="text-slate-900">Full-time</option>
                <option value="Contract" className="text-slate-900">Contract</option>
                <option value="Part-time" className="text-slate-900">Part-time</option>
                <option value="Freelance" className="text-slate-900">Freelance</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Experience (Years)</label>
            <div className="relative">
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${experience ? 'text-slate-900' : 'text-slate-400'}`}
              >
                <option value="" disabled hidden>Select experience...</option>
                {experienceOptions.map(opt => <option key={opt} value={opt} className="text-slate-900">{opt}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
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
