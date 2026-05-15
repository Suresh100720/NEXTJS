'use client';

import { useState, useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { handleJobAction } from '@/lib/actions';
import { ChevronDown, ChevronUp, X, Loader2, Check, AlertCircle } from 'lucide-react';

// CUSTOM CONFIRMATION MODAL (MATCHING SCREENSHOT)
function ConfirmationModal({ onConfirm, onCancel }: { onConfirm: () => void, onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-[400px] bg-white rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Discard Changes?</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Are you sure you want to cancel? Any unsaved changes will be lost.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
          >
            Keep Editing
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 border border-red-200 text-red-500 rounded-xl font-bold text-sm hover:bg-red-50 transition-all"
          >
            Yes, Discard
          </button>
        </div>
      </div>
    </div>
  );
}

// CUSTOM DROPDOWN COMPONENT
function CustomSelect({ name, value, options, placeholder, onChange, required }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <input type="hidden" name={name} value={value} required={required} />
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-2.5 flex items-center justify-between cursor-pointer hover:border-slate-300 transition-all ${isOpen ? 'ring-4 ring-indigo-500/10 border-indigo-500' : ''}`}
      >
        <span className={`font-bold text-sm text-left ${value ? 'text-slate-900' : 'text-slate-300'}`}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 hide-scrollbar">
          <div className="flex flex-col gap-0.5">
            {options.map((opt: string) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${value === opt ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                {opt}
                {value === opt && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-50"
    >
      {pending ? (
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Processing...</span>
        </div>
      ) : (isEdit ? 'Update Job' : 'Post Job')}
    </button>
  );
}

export default function JobForm({ onClose, jobToEdit }: { onClose: () => void, jobToEdit?: any }) {
  const [state, formAction] = useFormState(handleJobAction, null);
  
  const [title, setTitle] = useState(jobToEdit?.title || '');
  const [department, setDepartment] = useState(jobToEdit?.department || '');
  const [type, setType] = useState(jobToEdit?.type || '');
  const [experience, setExperience] = useState(jobToEdit?.experience || '');
  const [openings, setOpenings] = useState(jobToEdit?.openings || 1);
  const [status, setStatus] = useState(jobToEdit?.status || '');
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  useEffect(() => {
    if (state?.success) onClose();
  }, [state, onClose]);

  const isDirty = () => {
    if (jobToEdit) {
      return (
        title !== (jobToEdit.title || '') ||
        department !== (jobToEdit.department || '') ||
        type !== (jobToEdit.type || '') ||
        status !== (jobToEdit.status || '') ||
        experience !== (jobToEdit.experience || '') ||
        openings !== (jobToEdit.openings || 1)
      );
    }
    return (
      title !== '' ||
      department !== '' ||
      type !== '' ||
      status !== '' ||
      experience !== '' ||
      openings !== 1
    );
  };

  const handleCloseRequest = () => {
    if (isDirty()) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  const roleOptions = ['Frontend Developer', 'Backend Developer', 'Fullstack Developer', 'UI/UX Designer', 'Mobile App Developer', 'DevOps Engineer', 'QA Engineer', 'Data Scientist', 'Product Manager', 'Business Analyst'];
  const deptOptions = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'HR', 'Finance'];
  const statusOptions = ['Hiring', 'Closed', 'Active', 'Urgently Hiring'];
  const typeOptions = ['Full-time', 'Contract', 'Part-time', 'Freelance'];
  const experienceOptions = ['Fresher', '1', '2', '3', '4', '5', '6', '7+'];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-hidden">
        <div className="w-full max-w-xl bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl relative animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
          <button onClick={handleCloseRequest} className="absolute top-8 right-8 z-10 p-2.5 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600 active:scale-90"><X className="w-5 h-5" /></button>

          <style>{`
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `}</style>

          <div className="flex-1 overflow-y-auto p-10 pt-12 hide-scrollbar">
            <div className="mb-8">
              <p className="text-sm font-bold text-slate-700 uppercase tracking-[0.1em] mb-1">Job Configuration</p>
              <p className="text-sm font-bold text-slate-500">{jobToEdit ? 'Update job details below' : 'Specify the details for the new job listing.'}</p>
            </div>
            
            {state?.success === false && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-sm"><X className="w-3.5 h-3.5" /></div>
                {state.message}
              </div>
            )}

            <form action={formAction} className="space-y-6">
              <input type="hidden" name="id" value={jobToEdit?._id || ''} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Role / Title</label>
                  <CustomSelect name="title" value={title} options={roleOptions} placeholder="Select title..." onChange={setTitle} required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Department</label>
                  <CustomSelect name="department" value={department} options={deptOptions} placeholder="Select dept..." onChange={setDepartment} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Job Status</label>
                  <CustomSelect name="status" value={status} options={statusOptions} placeholder="Select status..." onChange={setStatus} required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Employment Type</label>
                  <CustomSelect name="type" value={type} options={typeOptions} placeholder="Select type..." onChange={setType} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Req. Experience</label>
                  <CustomSelect name="experience" value={experience} options={experienceOptions} placeholder="Select exp..." onChange={setExperience} required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">No. of Openings</label>
                  <div className="relative group">
                    <input type="hidden" name="openings" value={openings} />
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-2.5 text-slate-900 font-bold h-[46px] flex items-center justify-start text-left">{openings}</div>
                    <div className="absolute right-1 top-1 bottom-1 flex flex-col w-10">
                      <button type="button" onClick={() => setOpenings(openings + 1)} className="flex-1 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-t-lg transition-all text-slate-400 hover:text-indigo-600"><ChevronUp className="w-4 h-4" /></button>
                      <div className="h-[1px] bg-slate-100 mx-1" />
                      <button type="button" onClick={() => setOpenings(Math.max(0, openings - 1))} className="flex-1 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-b-lg transition-all text-slate-400 hover:text-indigo-600"><ChevronDown className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <button type="button" onClick={handleCloseRequest} className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm uppercase tracking-wider transition-all border border-slate-200 active:scale-95">Cancel</button>
                <SubmitButton isEdit={!!jobToEdit} />
              </div>
            </form>
          </div>
        </div>
      </div>

      {showConfirmClose && (
        <ConfirmationModal 
          onConfirm={onClose} 
          onCancel={() => setShowConfirmClose(false)} 
        />
      )}
    </>
  );
}
