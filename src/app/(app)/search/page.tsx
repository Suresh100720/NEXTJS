'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keywords, titles, or locations..."
            className="w-full bg-white border border-slate-200 rounded-[24px] py-5 px-8 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-lg text-slate-900 shadow-xl shadow-slate-100/50"
          />
          <button
            type="submit"
            className="absolute right-3 top-2.5 bottom-2.5 bg-indigo-600 hover:bg-indigo-500 text-white px-8 rounded-2xl font-bold transition-all active:scale-95"
          >
            Search
          </button>
        </form>

        <div className="mt-12">
          <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-6 ml-2">Quick Filters</h3>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/search/${cat}`}
                className="px-6 py-3 bg-white border border-slate-100 rounded-2xl hover:border-indigo-500 hover:text-indigo-600 transition-all capitalize text-slate-700 font-bold text-sm shadow-sm hover:shadow-md"
              >
                {cat}
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
