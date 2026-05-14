import { getCandidates } from '@/lib/api';
import CandidatesClient from './CandidatesClient';

export default async function CandidatesPage() {
  let candidates = [];
  try {
    candidates = await getCandidates();
  } catch (error) {
    console.error('Failed to fetch candidates:', error);
  }

  return <CandidatesClient initialCandidates={candidates} />;
}
