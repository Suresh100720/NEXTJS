'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createCandidate, updateCandidate } from '@/lib/api';
import { X, ChevronDown, Check } from 'lucide-react';

export default function CandidateForm({ onClose, initialRole, candidateToEdit }: { onClose: () => void, initialRole?: string, candidateToEdit?: any }) {
  const [name, setName] = useState(candidateToEdit?.name || '');
  const [email, setEmail] = useState(candidateToEdit?.email || '');
  const [role, setRole] = useState(candidateToEdit?.role || initialRole || 'Frontend Developer');
  const [status, setStatus] = useState(candidateToEdit?.status || 'Screening');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(candidateToEdit?.skills || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const skillsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const hasChanges = 
      name !== (candidateToEdit?.name || '') ||
      email !== (candidateToEdit?.email || '') ||
      role !== (candidateToEdit?.role || initialRole || 'Frontend Developer') ||
      status !== (candidateToEdit?.status || 'Screening') ||
      JSON.stringify(selectedSkills) !== JSON.stringify(candidateToEdit?.skills || []);
    
    setIsDirty(hasChanges);
  }, [name, email, role, status, selectedSkills, initialRole, candidateToEdit]);

  // Handle click outside to close skills dropdown
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (skillsRef.current && !skillsRef.current.contains(e.target as Node)) {
        setIsSkillsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleCancel = () => {
    if (isDirty) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const roleOptions = [
    'Frontend Developer',
    'Backend Developer',
    'Fullstack Developer',
    'UI/UX Designer',
    'Mobile App Developer',
    'DevOps Engineer',
    'QA Engineer'
  ];

  const statusOptions = [
    'Shortlisted',
    'Rejected',
    'On Hold',
    'Finalised',
    'Screening'
  ];

  const skillOptions = [
    'React', 'Next.js', 'Node.js', 'TypeScript', 'MongoDB', 
    'AWS', 'Tailwind CSS', 'Python', 'Java', 'Docker', 
    'PostgreSQL', 'GraphQL'
  ];

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = { name, email, role, status, skills: selectedSkills };
      if (candidateToEdit) {
        await updateCandidate(candidateToEdit._id, data);
      } else {
        await createCandidate(data);
      }
      router.refresh();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save candidate. Make sure email is unique.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl relative">
        <button 
          onClick={handleCancel}
          className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-black mb-6 text-slate-900">
          {candidateToEdit ? 'Edit Candidate' : (initialRole ? `Apply for ${initialRole}` : 'Add New Candidate')}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 font-medium transition-all"
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 font-medium transition-all"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Applied Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={!!initialRole}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 font-medium transition-all disabled:opacity-50 appearance-none"
              >
                {roleOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 font-medium transition-all appearance-none"
              >
                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          {/* Custom Multiselect for Skills */}
          <div className="relative" ref={skillsRef}>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Skills</label>
            <div 
              onClick={() => setIsSkillsOpen(!isSkillsOpen)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between cursor-pointer hover:border-slate-300 transition-all"
            >
              <div className="flex flex-wrap gap-1.5 overflow-hidden max-h-7">
                {selectedSkills.length > 0 ? (
                  selectedSkills.map(skill => (
                    <span key={skill} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md text-[10px] font-black uppercase">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-sm">Select skills...</span>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isSkillsOpen ? 'rotate-180' : ''}`} />
            </div>

            {isSkillsOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex flex-col gap-0.5">
                  {skillOptions.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                        selectedSkills.includes(skill) 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {skill}
                      {selectedSkills.includes(skill) && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-indigo-100 active:scale-95"
            >
              {loading ? 'Saving...' : (candidateToEdit ? 'Update Candidate' : 'Add Candidate')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
