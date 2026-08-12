// src/lib/student-api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export interface Internship {
  id: string;
  title: string;
  description: string;
  location: string;
  mode: 'REMOTE' | 'HYBRID' | 'ON_SITE';
  stipend?: number;
  salary?: number;
  durationMonths?: number;
  skills: string[];
  status: string;
  deadline?: string;
  publishedAt: string;
  company: {
    id: string;
    companyName: string;
    website?: string;
    description?: string;
  };
}

export interface Application {
  id: string;
  internshipId: string;
  studentId: string;
  resumeUrl: string;
  coverLetter?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  status: 'APPLIED' | 'SHORTLISTED' | 'INTERVIEWING' | 'OFFERED' | 'REJECTED' | 'WITHDRAWN';
  appliedAt: string;
  internship: {
    id: string;
    title: string;
    location: string;
    mode: string;
    stipend?: number;
    company: {
      companyName: string;
      website?: string;
    };
  };
  interviews?: Array<{
    id: string;
    roundName: string;
    roundNumber: number;
    scheduledAt: string;
    status: string;
    meetingUrl?: string;
  }>;
  offers?: Array<{
    id: string;
    stipendAmount: number;
    joiningDate: string;
    offerLetterUrl: string;
    status: string;
  }>;
}

// 1. Fetch Active Internships (with optional filters)
export async function getInternships(filters?: { search?: string; mode?: string; location?: string }): Promise<Internship[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.mode) params.append('mode', filters.mode);
  if (filters?.location) params.append('location', filters.location);

  const res = await fetch(`${API_BASE_URL}/api/internships?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch internships');
  const data = await res.json();
  return data.internships;
}

// 2. Fetch Single Internship Details
export async function getInternshipById(id: string): Promise<Internship> {
  const res = await fetch(`${API_BASE_URL}/api/internships/${id}`);
  if (!res.ok) throw new Error('Failed to fetch internship details');
  const data = await res.json();
  return data.internship;
}

// 3. Submit Application
export async function applyToInternship(payload: {
  internshipId: string;
  resumeUrl: string;
  coverLetter?: string;
  portfolioUrl?: string;
  githubUrl?: string;
}): Promise<{ message: string; application: Application }> {
  const res = await fetch(`${API_BASE_URL}/api/applications/student/apply`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to submit application');
  }
  return data;
}

// 4. Get My Applications
export async function getMyApplications(): Promise<Application[]> {
  const res = await fetch(`${API_BASE_URL}/api/applications/my-applications`, {
    headers: getAuthHeaders()
  });

  if (!res.ok) throw new Error('Failed to fetch applications');
  const data = await res.json();
  return data.applications;
}