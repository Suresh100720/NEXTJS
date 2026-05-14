import connectDB from '@/lib/db';
import Candidate from '@/models/Candidate';
import CandidatesClient from '../CandidatesClient';
import { Suspense } from 'react';

export default async function CandidatesPage({
  params,
  searchParams,
}: {
  params: { slug?: string[] };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  await connectDB();
  
  const statusFromPath = params.slug?.[0];
  const statusFilter = statusFromPath || searchParams.status;
  const searchFilter = searchParams.search;
  
  const query: any = {};
  if (statusFilter && statusFilter !== 'All') {
    query.status = statusFilter;
  }
  if (searchFilter && typeof searchFilter === 'string') {
    query.name = { $regex: searchFilter, $options: 'i' };
  }
  
  const rawCandidates = await Candidate.find(query).sort({ createdAt: -1 }).lean();
  
  const candidates = rawCandidates.map(doc => ({
    ...doc,
    _id: doc._id.toString(),
  }));

  return (
    <div className="w-full">
      <Suspense fallback={<div className="p-8 text-center text-slate-400 font-bold">Loading candidates...</div>}>
        <CandidatesClient initialCandidates={candidates} />
      </Suspense>
    </div>
  );
}
