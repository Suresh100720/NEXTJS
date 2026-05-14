import Link from 'next/link';
import { getCandidateById } from '@/lib/api';

export default async function CandidateDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;
  let candidate;
  try {
    candidate = await getCandidateById(id);
  } catch (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="bg-red-50 p-8 rounded-[32px] border border-red-100 max-w-md shadow-xl shadow-red-100/20">
          <h2 className="text-2xl font-black text-red-600 mb-2">Something went wrong!</h2>
          <p className="text-red-500/80 font-bold text-sm mb-8">We couldn't fetch the candidate details. The ID may be invalid or deleted.</p>
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
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${candidate.email}&su=Regarding your application for ${candidate.role}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 bg-indigo-600 rounded-2xl font-bold text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-100 no-underline active:scale-95"
          >
            Contact Candidate
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
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

          <section className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[32px] shadow-xl text-white">
            <h2 className="text-xl font-black mb-4 tracking-tight">Quick Action</h2>
            <p className="text-indigo-100 text-sm mb-6 font-medium">Ready to move forward? Schedule an interview with {candidate.name.split(' ')[0]} today.</p>
            <a 
              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${candidate.email}&su=Interview Invitation for ${candidate.role}&body=Hi ${candidate.name.split(' ')[0]},\n\nWe would like to schedule an interview with you regarding your application for the ${candidate.role} position.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm shadow-lg hover:bg-indigo-50 transition-all active:scale-95 flex items-center justify-center no-underline"
            >
              Schedule Interview
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
