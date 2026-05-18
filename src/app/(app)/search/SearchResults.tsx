import { searchData } from '@/lib/api';
import Link from 'next/link';

export default async function SearchResults({ q, role, experience, status }: { q: string, role: string, experience: string, status: string }) {
  // Adding artificial delay to clearly show streaming in development
  if (process.env.NODE_ENV === 'development') {
    await new Promise(r => setTimeout(r, 1000));
  }
  
  const results = await searchData(q, role, experience, status);

  return (
    <>
      {/* Jobs Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">💼</span>
          Matching Jobs ({results.jobs?.length || 0})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.jobs?.length > 0 ? (
            results.jobs.map((job: any) => (
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
          Matching Candidates ({results.candidates?.length || 0})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.candidates?.length > 0 ? (
            results.candidates.map((candidate: any) => (
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
  );
}
