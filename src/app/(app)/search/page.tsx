'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ArrowRight, X } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const categories = ['engineering', 'design', 'marketing', 'sales', 'remote', 'hybrid'];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search/${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-black text-slate-900 mb-8 tracking-tight">Search</h1>
        <form onSubmit={handleSearch} className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-sm max-w-xl">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search keywords, titles, or locations..."
              className="w-full pl-12 pr-4 py-3 bg-transparent text-lg font-bold text-slate-700 focus:outline-none transition-all"
            />
          </div>
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-2.5 bg-slate-200 text-slate-500 rounded-lg hover:bg-slate-300 transition-all shadow-sm"
              title="Clear"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="submit"
              className="p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-all shadow-sm"
              title="Search"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </form>

        <div className="mt-12">
          <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-6 ml-2">Quick Filters</h3>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/search/${cat}`}
                className="px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all bg-slate-50 text-slate-600 hover:bg-slate-100 capitalize"
              >
                {cat === 'engineering' ? 'Engineering' : cat === 'design' ? 'Design' : cat === 'marketing' ? 'Marketing' : cat === 'sales' ? 'Sales' : cat === 'remote' ? 'Remote' : 'Hybrid'}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-12 border-t border-slate-100">
        <div className="bg-slate-50/50 rounded-[40px] p-12 border-2 border-dashed border-slate-100 text-center">
          <p className="text-slate-400 font-medium italic">Your search results will appear here after entering a query.</p>
        </div>
      </div>
    </div>
  );
}
