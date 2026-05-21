export default function CandidateNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="bg-gray-100 p-6 rounded-full mb-6">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Candidate Not Found</h2>
      <p className="text-gray-500 max-w-sm">
        We couldn&apos;t find the candidate you&apos;re looking for. They might have been removed or the ID is incorrect.
      </p>
    </div>
  );
}
