'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCandidateById, getCandidateSummary } from '@/lib/api';
import { Loader2, Sparkles } from 'lucide-react';

export default function CandidateModal({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [candidate, setCandidate] = useState<any>(null);
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);

  useEffect(() => {
    if (!params.id) return;

    // Fetch Candidate Data
    getCandidateById(params.id)
      .then((data) => {
        setCandidate(data);
        setLoading(false);
        
        // Fetch AI Summary
        getCandidateSummary(params.id)
          .then((sumData) => {
            setSummary(sumData.summary);
            setLoadingSummary(false);
          })
          .catch(() => {
            setSummary('Failed to generate AI summary.');
            setLoadingSummary(false);
          });
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) return null;
  if (!candidate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => router.back()}>
      <div 
        className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{candidate.name}</h2>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">ID: {candidate._id || candidate.id}</p>
          </div>
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-white hover:shadow-md rounded-full transition-all text-slate-400 border border-transparent hover:border-slate-100"
          >
            <Loader2 className="w-5 h-5 animate-spin" style={{ display: loading ? 'block' : 'none' }} />
            {!loading && <span>✕</span>}
          </button>
        </div>
        
        <div className="p-8 space-y-8">
          <div className="flex gap-6 items-center">
            <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-indigo-100">
              {candidate.name?.substring(0, 1).toUpperCase()}
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{candidate.role}</h3>
              <div className="flex items-center gap-2 mt-2">
                 <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-bold uppercase tracking-wide border border-indigo-100">
                   {candidate.status}
                 </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-2">Email Address</div>
              <div className="text-slate-700 font-bold text-sm truncate" title={candidate.email}>{candidate.email}</div>
            </div>
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-2">Experience</div>
              <div className="text-slate-700 font-bold text-sm truncate">
                {(() => {
                  const currentYear = new Date().getFullYear();
                  let expYears = 0;
                  if (candidate.experience && candidate.experience !== 'Fresher') {
                    expYears = parseInt(candidate.experience) || 0;
                  }
                  return expYears > 0 ? `${currentYear - expYears} to present` : 'Fresher';
                })()}
              </div>
            </div>
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-2">Skills Found</div>
              <div className="text-slate-700 font-bold text-sm truncate">{candidate.skills?.length || 0} Tech</div>
            </div>
          </div>

          <div className="relative p-6 bg-indigo-50/30 rounded-2xl border border-indigo-100/50">
            <div className="absolute -top-3 left-6 px-3 py-1 bg-white border border-indigo-100 rounded-full flex items-center gap-1.5 shadow-sm">
               <Sparkles className="w-3 h-3 text-indigo-600" />
               <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">AI Summary</span>
            </div>
            
            {loadingSummary ? (
              <div className="flex items-center gap-3 py-2">
                <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                <p className="text-sm text-indigo-400 font-medium italic">Generating professional profile...</p>
              </div>
            ) : (
              <p className="text-slate-700 font-medium leading-relaxed animate-in fade-in duration-700">
                {summary}
              </p>
            )}
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={() => router.back()}
            className="px-6 py-2.5 text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => window.location.assign(`/candidates/${candidate._id || candidate.id}`)}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
          >
            View Full Page
          </button>
          <a 
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${candidate.email}&su=Regarding your application for ${candidate.role}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-2.5 bg-indigo-600 rounded-xl font-bold text-sm text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center no-underline active:scale-95"
          >
            Contact Candidate
          </a>
        </div>
      </div>
    </div>
  );
}
