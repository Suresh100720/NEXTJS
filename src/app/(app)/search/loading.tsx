import { Skeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500 pb-20">
      <h1 className="text-4xl font-black text-slate-900 tracking-tight">Talent Discovery</h1>

      {/* Sticky Filters Skeleton */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md py-4 -mx-4 px-4 border-b border-slate-100">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 bg-white p-4 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40">
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-14 w-32 rounded-2xl" />
            <Skeleton className="h-14 w-32 rounded-2xl" />
            <Skeleton className="h-14 w-32 rounded-2xl" />
          </div>
          <div className="h-10 w-[1px] bg-slate-100 hidden lg:block mx-1" />
          <Skeleton className="flex-1 h-14 rounded-2xl" />
        </div>
      </div>

      <div className="space-y-12">
        <div className="bg-slate-50/50 rounded-[40px] p-20 border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
          <Skeleton className="w-20 h-20 rounded-[2rem] mb-8" />
          <Skeleton className="h-6 w-64 mb-4" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
    </div>
  );
}
