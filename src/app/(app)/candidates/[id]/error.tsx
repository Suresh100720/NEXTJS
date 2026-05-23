'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function CandidateError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Candidate panel exception:', error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center font-sans max-w-lg mx-auto shadow-xl relative overflow-hidden">
      <div className="absolute inset-0 bg-red-500/5 blur-[80px]" />
      <div className="relative z-10 space-y-4">
        <div className="w-12 h-12 mx-auto rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white mb-1">Error Loading Profile</h2>
          <p className="text-red-400 text-xs font-mono bg-red-950/20 py-2 px-3 rounded-lg border border-red-900/30 break-words max-w-md mx-auto">
            {error.message}
          </p>
        </div>
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-600/15 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reload Candidate Profile
        </button>
      </div>
    </div>
  );
}
