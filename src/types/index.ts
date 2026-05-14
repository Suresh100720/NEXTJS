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
  title: string;
  department: string;
  type: 'full-time' | 'part-time' | 'contract';
  salary: string;
  location: string;
}
