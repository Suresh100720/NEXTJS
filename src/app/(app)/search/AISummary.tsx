'use client';
import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export default function AISummary({ q, role, experience, status }: { q: string, role: string, experience: string, status: string }) {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchSummary = async () => {
      setSummary('');
      setIsLoading(true);
      try {
        const res = await fetch('/api/search/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q, role, experience, status }),
        });
        
        if (!res.ok) throw new Error('Failed to fetch AI summary');
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const text = decoder.decode(value);
            if (isMounted) {
               setSummary((prev) => prev + text);
            }
          }
        }
      } catch (error) {
        console.error(error);
        if (isMounted) setSummary('AI Summary unavailable at the moment.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    if (q || role || experience || status) {
      fetchSummary();
    }
    
    return () => { isMounted = false; };
  }, [q, role, experience, status]);

  if (!q && !role && !experience && !status) return null;

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-3xl space-y-4 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
        <Sparkles className="w-24 h-24 text-indigo-500" />
      </div>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
          <Sparkles className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-black text-indigo-900">AI Search Intent</h3>
      </div>
      <div className="relative z-10">
        {summary ? (
          <p className="text-slate-700 font-medium leading-relaxed">{summary}</p>
        ) : isLoading ? (
          <div className="animate-pulse flex gap-1 items-center h-6">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
