import { searchData } from '@/lib/api';
import Link from 'next/link';

export default async function SearchResultsPage({
  params,
}: {
  params: { query: string[] };
}) {
  const query = decodeURIComponent(params.query.join(' '));
  let results = { jobs: [], candidates: [] };

  try {
    results = await searchData(query);
  } catch (error) {
    console.error('Search failed:', error);
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <Link href="/search" className="text-slate-400 hover:text-slate-900 font-bold text-sm transition-colors mb-4 inline-block">
          ← Back to Search
        </Link>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          Results for <span className="text-indigo-600">&quot;{query}&quot;</span>
        </h1>
        <p className="text-slate-400 font-bold text-sm mt-2 uppercase tracking-widest">
          Found {results.jobs.length} jobs and {results.candidates.length} candidates
        </p>
      </div>

      {/* Jobs Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">💼</span>
          Matching Jobs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.jobs.length > 0 ? (
            results.jobs.map((job: any) => (
              <div key={job._id || job.id} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-black uppercase tracking-wide border border-indigo-100">
                    {job.status}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1">{job.title}</h3>
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{job.department} • {job.type}</p>
                  <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">
                    Experience: {job.experience && job.experience !== 'Fresher' ? `${job.experience} Yrs` : 'Fresher'}
                  </p>
                </div>
                <Link href="/jobs" className="mt-6 block text-center py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-black transition-all">
                  View in Jobs
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100 text-center">
              <p className="text-slate-400 font-medium italic">No jobs found for this query.</p>
            </div>
          )}
        </div>
      </section>

      {/* Candidates Section */}
      <section className="space-y-6 pb-12">
        <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">👥</span>
          Matching Candidates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.candidates.length > 0 ? (
            results.candidates.map((candidate: any) => (
              <div key={candidate._id || candidate.id} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-xl transition-all">
                <div className="flex items-center gap-4 mb-4">
                   <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-lg font-black text-white">
                     {candidate.name.substring(0, 1).toUpperCase()}
                   </div>
                   <div>
                     <h3 className="text-lg font-black text-slate-900">{candidate.name}</h3>
                     <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{candidate.role}</p>
                   </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {candidate.skills?.slice(0, 3).map((skill: string) => (
                    <span key={skill} className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded-md text-[10px] font-bold border border-slate-100">
                      {skill}
                    </span>
                  ))}
                </div>
                <Link 
                  href={`/candidates/${candidate._id || candidate.id}`} 
                  className="block text-center py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-indigo-100"
                >
                  View Profile
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100 text-center">
              <p className="text-slate-400 font-medium italic">No candidates found for this query.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
