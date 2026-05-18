import { Suspense } from 'react';
import SearchFilters from './SearchFilters';
import SearchResults from './SearchResults';
import AISummary from './AISummary';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';

export default function SearchPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const q = typeof searchParams.q === 'string' ? searchParams.q : '';
  const role = typeof searchParams.role === 'string' ? searchParams.role : '';
  const experience = typeof searchParams.experience === 'string' ? searchParams.experience : '';
  const status = typeof searchParams.status === 'string' ? searchParams.status : '';

  const hasSearched = !!(q || role || experience || status);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500 pb-20">
      <h1 className="text-4xl font-black text-slate-900 tracking-tight">Talent Discovery</h1>

      {/* Sticky Filters */}
      <SearchFilters initialQ={q} initialRole={role} initialExperience={experience} initialStatus={status} />

      {/* Results Area */}
      <div className="space-y-12">
        {!hasSearched ? (
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
            <AISummary q={q} role={role} experience={experience} status={status} />

            {/* This is an App Router streaming boundary */}
            <Suspense fallback={<SearchResultsSkeleton />}>
              <SearchResults q={q} role={role} experience={experience} status={status} />
            </Suspense>
          </>
        )}
      </div>
    </div>
  );
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-[2.5rem]" />
          ))}
        </div>
      </section>
      <section className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-[2.5rem]" />
          ))}
        </div>
      </section>
    </div>
  );
}
