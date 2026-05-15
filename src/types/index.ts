export interface Candidate {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'applied' | 'interviewing' | 'offered' | 'hired' | 'rejected';
  experience: number;
}

export interface Job {
  id: string;
  _id?: string;
  title: string;
  department: string;
  type: string;
  experience?: string;
  openings: number;
  status: 'Active' | 'Closed' | 'Hiring' | 'Urgently Hiring';
  createdAt?: string;
}
