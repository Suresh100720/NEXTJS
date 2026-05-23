'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Captured client rendering crash:', error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6 text-center font-sans relative overflow-hidden">
      {/* Background Glow Blobs */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-red-600/10 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 max-w-md shadow-2xl relative z-10">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6 text-red-500">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-3">Something went wrong!</h2>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          An unexpected interface exception has been recorded and sent to our performance telemetry system.
        </p>
        <button
          onClick={() => reset()}
          className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] text-sm tracking-wide"
        >
          <RefreshCw className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} /> Recover View
        </button>
      </div>
    </div>
  );
}
