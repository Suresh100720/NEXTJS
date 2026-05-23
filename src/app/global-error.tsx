'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('💥 Root layout/Core application crash caught:', error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en" className="h-full bg-slate-950 text-white">
      <body className="h-full flex items-center justify-center p-6 text-center font-sans relative overflow-hidden">
        {/* Background Glow Blobs */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-red-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-[32px] p-8 max-w-md shadow-2xl relative z-10">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6 text-red-500">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white mb-3">Critical Application Crash</h1>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            A fatal base-level layout error occurred. Sentry has captured this exception. Please reload to try recovering.
          </p>
          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-600/20 active:scale-[0.98] text-sm tracking-wide cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} /> Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
