'use client';

export default function CandidateError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-8 bg-red-50 rounded-xl border border-red-100 text-center">
      <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Candidate</h2>
      <p className="text-red-700 mb-4">{error.message}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
