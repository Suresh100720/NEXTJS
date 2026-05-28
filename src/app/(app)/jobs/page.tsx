import { getJobs } from '@/lib/api';
import JobsClient from './JobsClient';
import { Metadata } from 'next';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

export const metadata: Metadata = {
  title: 'Public Job Board | Recruitment Hub',
  description: 'Explore the latest career opportunities.',
};

export default async function JobsPage() {
  const queryClient = new QueryClient();

  try {
    // 1. PREFETCHING: Fetch and cache server data on the server side
    await queryClient.prefetchQuery({
      queryKey: ['jobs'],
      queryFn: () => getJobs(),
    });
  } catch (error) {
    console.error('Failed to prefetch jobs:', error);
  }

  // 2. DEHYDRATION: Serialize server cache state for client reuse
  const dehydratedState = dehydrate(queryClient);

  return (
    // 3. HYDRATION: Transfer server-fetched data into client cache
    <HydrationBoundary state={dehydratedState}>
      <JobsClient />
    </HydrationBoundary>
  );
}

