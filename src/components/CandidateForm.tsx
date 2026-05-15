'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import { handleCandidateAction, enrichCVAction } from '@/lib/actions';
import { X, ChevronDown, Check, Sparkles, Loader2, Upload, FileText, AlertCircle } from 'lucide-react';

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
      ) : (isEdit ? 'Save Changes' : 'Confirm Candidate')}
    </button>
  );
}

export default function CandidateForm({ onClose, initialRole, candidateToEdit }: { onClose: () => void, initialRole?: string, candidateToEdit?: any }) {
  const [state, formAction] = useFormState(handleCandidateAction, null);
  const [name, setName] = useState(candidateToEdit?.name || '');
  const [email, setEmail] = useState(candidateToEdit?.email || '');
  const [role, setRole] = useState(candidateToEdit?.role || initialRole || '');
  const [status, setStatus] = useState(candidateToEdit?.status || '');
  const [experience, setExperience] = useState(candidateToEdit?.experience || '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(candidateToEdit?.skills || []);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [error, setError] = useState('');
  const skillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state?.success) onClose();
  }, [state, onClose]);

  const isDirty = () => {
    if (candidateToEdit) {
      return (
        name !== (candidateToEdit.name || '') ||
        email !== (candidateToEdit.email || '') ||
        role !== (candidateToEdit.role || '') ||
        status !== (candidateToEdit.status || '') ||
        experience !== (candidateToEdit.experience || '') ||
        JSON.stringify(selectedSkills) !== JSON.stringify(candidateToEdit.skills || [])
      );
    }
    return (
      name !== '' ||
      email !== '' ||
      role !== (initialRole || '') ||
      status !== '' ||
      experience !== '' ||
      selectedSkills.length > 0 ||
      fileName !== null
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
  const statusOptions = ['Screening', 'Shortlisted', 'On Hold', 'Rejected', 'Finalised'];
  const experienceOptions = ['Fresher', '1', '2', '3', '4', '5', '6', '7+'];
  const skillOptions = ['React', 'Next.js', 'Node.js', 'TypeScript', 'MongoDB', 'AWS', 'Tailwind CSS', 'Python', 'Java', 'Docker', 'PostgreSQL', 'GraphQL', 'Swift', 'Kotlin', 'Figma', 'Redux'];

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleEnrich = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setIsEnriching(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('cv', file);
      const enrichedData = await enrichCVAction(formData);
      if (enrichedData.error) throw new Error(enrichedData.error);
      if (enrichedData.name) setName(enrichedData.name);
      if (enrichedData.email) setEmail(enrichedData.email);
      if (enrichedData.suggestedRole) setRole(enrichedData.suggestedRole);
      if (enrichedData.experience) setExperience(enrichedData.experience);
      if (enrichedData.skills) setSelectedSkills(enrichedData.skills);
    } catch (err: any) {
      setError(err.message || 'Failed to parse CV');
      setFileName(null);
    } finally {
      setIsEnriching(false);
    }
  };

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
              <p className="text-sm font-bold text-slate-700 uppercase tracking-[0.1em] mb-1">Candidate Profile</p>
              <p className="text-sm font-bold text-slate-500">{candidateToEdit ? 'Update details below' : 'Fill details manually or upload a resume to auto-fill.'}</p>
            </div>

            {!candidateToEdit && (
              <div className="mb-10">
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">AI CV Parser</label>
                <label className={`group relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-3xl transition-all cursor-pointer ${isEnriching ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200 bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-300'}`}>
                  <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                    {isEnriching ? (
                      <>
                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-3" />
                        <p className="text-sm font-bold text-indigo-600">Analyzing Resume...</p>
                      </>
                    ) : fileName ? (
                      <>
                        <FileText className="w-10 h-10 text-emerald-500 mb-3" />
                        <p className="text-sm font-bold text-emerald-600">Resume Loaded</p>
                        <p className="text-xs text-emerald-400 mt-1">{fileName}</p>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><Upload className="w-6 h-6 text-indigo-600" /></div>
                        <p className="text-sm font-bold text-slate-700">Upload CV to Auto-Fill</p>
                        <p className="text-xs text-slate-400 mt-1">PDF, Word, or Text (Max 5MB)</p>
                      </>
                    )}
                  </div>
                  <input type="file" className="hidden" accept=".txt,.md,.pdf,.docx" onChange={handleEnrich} disabled={isEnriching} />
                </label>
              </div>
            )}
            
            {(error || state?.success === false) && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-sm"><X className="w-3.5 h-3.5" /></div>
                {error || state?.message}
              </div>
            )}

            <form action={formAction} className="space-y-6">
              <input type="hidden" name="id" value={candidateToEdit?._id || ''} />
              <input type="hidden" name="skills" value={JSON.stringify(selectedSkills)} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Full Name *</label>
                  <input type="text" name="name" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-2.5 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900 font-bold transition-all text-left" placeholder="e.g. John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Email Address *</label>
                  <input type="email" name="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-2.5 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900 font-bold transition-all text-left" placeholder="john@example.com" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Target Role</label>
                  <CustomSelect name="role" value={role} options={roleOptions} placeholder="Select role..." onChange={setRole} required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Current Status</label>
                  <CustomSelect name="status" value={status} options={statusOptions} placeholder="Select status..." onChange={setStatus} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Total Experience</label>
                  <CustomSelect name="experience" value={experience} options={experienceOptions} placeholder="Select exp..." onChange={setExperience} required />
                </div>
                <div className="relative" ref={skillsRef}>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Expertise & Skills</label>
                  <div onClick={() => setIsSkillsOpen(!isSkillsOpen)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-2.5 flex items-center justify-between cursor-pointer hover:border-slate-300 transition-all shadow-sm">
                    <div className="flex flex-wrap gap-2 overflow-hidden max-h-[30px]">
                      {selectedSkills.length > 0 ? selectedSkills.map(skill => (
                        <span key={skill} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-black uppercase tracking-wider">{skill}</span>
                      )) : <span className="text-slate-300 font-bold">Add skills...</span>}
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isSkillsOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {isSkillsOpen && (
                    <div className="absolute z-50 w-full mt-3 bg-white border border-slate-200 rounded-[2rem] shadow-2xl p-4 max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-300 hide-scrollbar">
                      <div className="grid grid-cols-1 gap-1">
                        {skillOptions.map(skill => (
                          <button key={skill} type="button" onClick={() => toggleSkill(skill)} className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedSkills.includes(skill) ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>{skill}{selectedSkills.includes(skill) && <Check className="w-4 h-4" />}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <button type="button" onClick={handleCloseRequest} className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm uppercase tracking-wider transition-all border border-slate-200 active:scale-95">Cancel</button>
                <SubmitButton isEdit={!!candidateToEdit} />
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
