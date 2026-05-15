'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, ChevronDown, Check, RotateCcw, Briefcase, UserCheck, Timer, Loader2 } from 'lucide-react';
import { searchData } from '@/lib/api';
import Link from 'next/link';

// COMPACT FILTER DROPDOWN
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

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('');
  const [status, setStatus] = useState('');
  const [results, setResults] = useState<{ jobs: any[], candidates: any[] }>({ jobs: [], candidates: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const roleOptions = ['Frontend Developer', 'Backend Developer', 'Fullstack Developer', 'UI/UX Designer', 'Mobile App Developer', 'DevOps Engineer', 'QA Engineer'];
  const experienceOptions = ['Fresher', '1', '2', '3', '4', '5', '6', '7+'];
  const statusOptions = ['Screening', 'Shortlisted', 'On Hold', 'Rejected', 'Finalised'];

  const performSearch = useCallback(async () => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const data = await searchData(query, role, experience, status);
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [query, role, experience, status]);

  // AUTO-FILTER ON DROPDOWN CHANGE
  useEffect(() => {
    if (role || experience || status) {
      performSearch();
    }
  }, [role, experience, status, performSearch]);

  const clearFilters = () => {
    setQuery('');
    setRole('');
    setExperience('');
    setStatus('');
    setResults({ jobs: [], candidates: [] });
    setHasSearched(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500 pb-20">
      <h1 className="text-4xl font-black text-slate-900 tracking-tight">Talent Discovery</h1>

      {/* STICKY FILTERS BAR */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md py-4 -mx-4 px-4 border-b border-slate-100">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 bg-white p-4 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40">
          
          {/* DROPDOWN FILTERS (LEFT) */}
          <div className="flex flex-wrap items-center gap-3">
            <FilterDropdown label="Roles" options={roleOptions} value={role} onChange={setRole} />
            <FilterDropdown label="Experience" options={experienceOptions} value={experience} onChange={setExperience} />
            <FilterDropdown label="Status" options={statusOptions} value={status} onChange={setStatus} />
          </div>

          <div className="h-10 w-[1px] bg-slate-100 hidden lg:block mx-1" />

          {/* SEARCH INPUT WITH INTEGRATED BUTTONS (RIGHT) */}
          <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 focus-within:ring-4 focus-within:ring-indigo-500/5 focus-within:border-indigo-500 transition-all">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && performSearch()}
              placeholder="Search names, skills, locations..."
              className="w-full bg-transparent text-sm font-bold text-slate-700 focus:outline-none placeholder:text-slate-300"
            />
            <div className="flex items-center gap-1">
              {query && (
                <button onClick={() => setQuery('')} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-all">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button 
                onClick={performSearch} 
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

      {/* RESULTS AREA */}
      <div className="space-y-12">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Searching Talent Pool...</p>
          </div>
        ) : !hasSearched ? (
          <div className="bg-slate-50/50 rounded-[40px] p-20 border-2 border-dashed border-slate-100 text-center">
            <div className="w-20 h-20 bg-white rounded-[2rem] shadow-sm flex items-center justify-center mx-auto mb-8">
              <Search className="w-10 h-10 text-slate-100" />
            </div>
            <h2 className="text-xl font-bold text-slate-400 mb-2 italic">Ready to find talent?</h2>
            <p className="text-slate-300 font-medium max-w-xs mx-auto leading-relaxed">
              Adjust the filters above or type keywords to explore matches instantly.
            </p>
          </div>
        ) : (
          <>
            {/* Jobs Section */}
            <section className="space-y-6">
              <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">💼</span>
                Matching Jobs ({results.jobs.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.jobs.length > 0 ? (
                  results.jobs.map((job) => (
                    <div key={job._id} className="p-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-wide border border-indigo-100">
                          {job.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{job.department} • {job.type}</p>
                      <Link href="/jobs" className="mt-6 block text-center py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                        View Details
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100 text-center">
                    <p className="text-slate-400 font-medium italic text-sm">No jobs match your current filters.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Candidates Section */}
            <section className="space-y-6">
              <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">👥</span>
                Matching Candidates ({results.candidates.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.candidates.length > 0 ? (
                  results.candidates.map((candidate) => (
                    <div key={candidate._id} className="p-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group">
                      <div className="flex items-center gap-4 mb-5">
                         <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-lg shadow-indigo-100">
                           {candidate.name.substring(0, 1).toUpperCase()}
                         </div>
                         <div>
                           <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{candidate.name}</h3>
                           <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{candidate.role}</p>
                         </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-8">
                        {candidate.skills?.slice(0, 3).map((skill: string) => (
                          <span key={skill} className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold border border-slate-100">
                            {skill}
                          </span>
                        ))}
                      </div>
                      <Link 
                        href={`/candidates/${candidate._id}`} 
                        className="block text-center py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 active:scale-95"
                      >
                        View Profile
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100 text-center">
                    <p className="text-slate-400 font-medium italic text-sm">No candidates match your current filters.</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
