import Link from 'next/link';
import { getCandidateById, getCandidateSummary } from '@/lib/api';
import { Sparkles } from 'lucide-react';

export default async function CandidateDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;
  let candidate;
  let summaryData = { summary: '' };

  try {
    // Fetch both candidate details and AI summary in parallel
    const [cData, sData] = await Promise.all([
      getCandidateById(id),
      getCandidateSummary(id).catch(() => ({ summary: 'Summary currently unavailable.' }))
    ]);
    candidate = cData;
    summaryData = sData;
  } catch {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="bg-red-50 p-8 rounded-[32px] border border-red-100 max-w-md shadow-xl shadow-red-100/20">
          <h2 className="text-2xl font-black text-red-600 mb-2">Something went wrong!</h2>
          <p className="text-red-500/80 font-bold text-sm mb-8">We couldn&apos;t fetch the candidate details. The ID may be invalid or deleted.</p>
          <Link href="/candidates" className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 transition-all hover:bg-red-700 active:scale-95 inline-block">
            Back to Candidates
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link href="/candidates" className="text-slate-500 hover:text-slate-900 flex items-center gap-2 font-bold text-sm transition-colors">
        ← Back to Candidates
      </Link>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900">{candidate.name}</h1>
          <p className="text-slate-500 mt-2 font-bold">{candidate.role} • ID: <span className="text-indigo-600 font-mono">{id}</span></p>
        </div>
        <div className="flex gap-4">
          <a 
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${candidate.email}&su=Interview Invitation for ${candidate.role}&body=Hi ${candidate.name.split(' ')[0]},\n\nWe would like to schedule an interview with you regarding your application for the ${candidate.role} position.`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 bg-indigo-600 rounded-2xl font-bold text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-100 no-underline active:scale-95 flex items-center justify-center"
          >
            Schedule Interview
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* AI Summary Section */}
          <section className="bg-white border border-slate-200 p-8 rounded-[32px] shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Sparkles className="w-32 h-32 text-indigo-600" />
            </div>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Sparkles className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">AI Profile Summary</h2>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium text-lg">
              {summaryData.summary}
            </p>
          </section>

          <section className="bg-white border border-slate-200 p-8 rounded-[32px] shadow-sm">
            <h2 className="text-2xl font-black mb-6 text-slate-900 tracking-tight">Experience</h2>
            <div className="space-y-8">
              {(() => {
                const currentYear = new Date().getFullYear();
                let expYears = 0;
                if (candidate.experience && candidate.experience !== 'Fresher') {
                  expYears = parseInt(candidate.experience) || 0;
                }
                const startYear = currentYear - expYears;
                const experienceText = expYears > 0 ? `${startYear} — Present` : 'Fresher / Recent Graduate';
                const roleTitle = expYears > 0 ? `Experienced ${candidate.role}` : `Entry-Level ${candidate.role}`;
                
                return (
                  <div className="border-l-4 border-slate-100 pl-8 space-y-2 relative">
                    <div className="absolute -left-1.5 top-0 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white shadow-sm"></div>
                    <h3 className="text-lg font-black text-slate-800">{roleTitle}</h3>
                    <p className="text-sm text-slate-400 font-bold">{experienceText}</p>
                    <p className="text-slate-600 leading-relaxed">
                      {expYears > 0 
                        ? `Demonstrated expertise and consistent growth over ${candidate.experience} years of professional experience in the industry. Highly skilled in core technologies and best practices related to the role.`
                        : `Highly motivated and eager to apply academic knowledge and foundational skills to real-world projects. Fast learner with a strong passion for the industry.`}
                    </p>
                  </div>
                );
              })()}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white border border-slate-200 p-8 rounded-[32px] shadow-sm">
            <h2 className="text-2xl font-black mb-6 text-slate-900 tracking-tight">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {candidate.skills?.map((skill: string) => (
                <span key={skill} className="px-4 py-1.5 bg-slate-50 rounded-xl text-xs font-black text-slate-600 border border-slate-100 uppercase tracking-wider">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
