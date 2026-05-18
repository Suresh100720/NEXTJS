'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, ChevronDown, Check, RotateCcw } from 'lucide-react';

function FilterDropdown({ label, options, value, onChange }: { label: string, options: string[], value: string, onChange: (val: string) => void }) {
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
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:border-slate-300 transition-all ${value ? 'ring-2 ring-indigo-500/10 border-indigo-500 bg-indigo-50/10' : ''}`}
      >
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</span>
          <span className={`text-sm font-bold truncate max-w-[120px] ${value ? 'text-indigo-600' : 'text-slate-700'}`}>
            {value || `Select ${label}...`}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-64 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 hide-scrollbar">
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

export default function SearchFilters({ initialQ, initialRole, initialExperience, initialStatus }: { initialQ: string, initialRole: string, initialExperience: string, initialStatus: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(initialQ);
  const [role, setRole] = useState(initialRole);
  const [experience, setExperience] = useState(initialExperience);
  const [status, setStatus] = useState(initialStatus);

  const roleOptions = ['Frontend Developer', 'Backend Developer', 'Fullstack Developer', 'UI/UX Designer', 'Mobile App Developer', 'DevOps Engineer', 'QA Engineer'];
  const experienceOptions = ['Fresher', '1', '2', '3', '4', '5', '6', '7+'];
  const statusOptions = ['Screening', 'Shortlisted', 'On Hold', 'Rejected', 'Finalised'];

  const performSearch = useCallback((newQuery?: string, newRole?: string, newExp?: string, newStatus?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    const q = newQuery !== undefined ? newQuery : query;
    const r = newRole !== undefined ? newRole : role;
    const e = newExp !== undefined ? newExp : experience;
    const s = newStatus !== undefined ? newStatus : status;

    if (q) params.set('q', q); else params.delete('q');
    if (r) params.set('role', r); else params.delete('role');
    if (e) params.set('experience', e); else params.delete('experience');
    if (s) params.set('status', s); else params.delete('status');

    router.push(`?${params.toString()}`);
  }, [searchParams, query, role, experience, status, router]);

  const handleRoleChange = (val: string) => { setRole(val); performSearch(undefined, val, undefined, undefined); };
  const handleExpChange = (val: string) => { setExperience(val); performSearch(undefined, undefined, val, undefined); };
  const handleStatusChange = (val: string) => { setStatus(val); performSearch(undefined, undefined, undefined, val); };

  const clearFilters = () => {
    setQuery('');
    setRole('');
    setExperience('');
    setStatus('');
    router.push('?');
  };

  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md py-4 -mx-4 px-4 border-b border-slate-100">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 bg-white p-4 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40">
        
        {/* DROPDOWN FILTERS (LEFT) */}
        <div className="flex flex-wrap items-center gap-3">
          <FilterDropdown label="Roles" options={roleOptions} value={role} onChange={handleRoleChange} />
          <FilterDropdown label="Experience" options={experienceOptions} value={experience} onChange={handleExpChange} />
          <FilterDropdown label="Status" options={statusOptions} value={status} onChange={handleStatusChange} />
        </div>

        <div className="h-10 w-[1px] bg-slate-100 hidden lg:block mx-1" />

        {/* SEARCH INPUT WITH INTEGRATED BUTTONS (RIGHT) */}
        <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 focus-within:ring-4 focus-within:ring-indigo-500/5 focus-within:border-indigo-500 transition-all">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && performSearch(query)}
            placeholder="Search names, skills, locations..."
            className="w-full bg-transparent text-sm font-bold text-slate-700 focus:outline-none placeholder:text-slate-300"
          />
          <div className="flex items-center gap-1">
            {query && (
              <button onClick={() => { setQuery(''); performSearch(''); }} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-all">
                <X className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={() => performSearch(query)} 
              className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-all shadow-sm active:scale-90"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {(query || role || experience || status) && (
          <button 
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-3 text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-50 rounded-2xl transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
