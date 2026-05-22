const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function getJobs(revalidate?: number) {
  const options: any = { cache: 'no-store' };
  if (revalidate !== undefined) {
    delete options.cache;
    options.next = { revalidate, tags: ['jobs'] };
  }

  const res = await fetch(`${BASE_URL}/jobs`, options);
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
}

export async function getCandidates() {
  const res = await fetch(`${BASE_URL}/candidates`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch candidates');
  return res.json();
}

export async function getCandidateById(id: string) {
  const res = await fetch(`${BASE_URL}/candidates/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch candidate');
  return res.json();
}

export async function createJob(jobData: any) {
  const res = await fetch(`${BASE_URL}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobData),
  });
  if (!res.ok) throw new Error('Failed to create job');
  return res.json();
}

export async function updateJob(id: string, jobData: any) {
  const res = await fetch(`${BASE_URL}/jobs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobData),
  });
  if (!res.ok) throw new Error('Failed to update job');
  return res.json();
}

export async function deleteJob(id: string) {
  const res = await fetch(`${BASE_URL}/jobs/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete job');
  return res.json();
}

export async function createCandidate(candidateData: any) {
  const res = await fetch(`${BASE_URL}/candidates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(candidateData),
  });
  if (!res.ok) throw new Error('Failed to create candidate');
  return res.json();
}

export async function updateCandidate(id: string, candidateData: any) {
  const res = await fetch(`${BASE_URL}/candidates/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(candidateData),
  });
  if (!res.ok) throw new Error('Failed to update candidate');
  return res.json();
}

export async function deleteCandidate(id: string) {
  const res = await fetch(`${BASE_URL}/candidates/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete candidate');
  return res.json();
}

export async function deleteCandidates(ids: string[]) {
  const res = await fetch(`${BASE_URL}/candidates/bulk-delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error('Failed to delete candidates');
  return res.json();
}

export async function getStats() {
  // Stats should remain dynamic (no-store) by default as per requirement
  const res = await fetch(`${BASE_URL}/stats`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function searchData(q: string, role?: string, experience?: string, status?: string) {
  const params = new URLSearchParams();
  if (q && q !== 'results') params.set('q', q);
  if (role) params.set('role', role);
  if (experience) params.set('experience', experience);
  if (status) params.set('status', status);

  const res = await fetch(`${BASE_URL}/search?${params.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to search');
  return res.json();
}

export const getCandidateSummary = async (id: string) => {
  const res = await fetch(`${BASE_URL}/candidates/${id}/summary`);
  if (!res.ok) throw new Error('Failed to fetch summary');
  return res.json();
};
