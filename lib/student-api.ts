// src/lib/student-api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export interface InterviewSchedule {
  id: string;
  roundNumber: number;
  roundName: string;
  meetingUrl?: string;
  scheduledAt: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface OfferDetails {
  id: string;
  stipendAmount: number;
  joiningDate: string;
  offerLetterUrl: string;
  status: 'SENT' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
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
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
  deadline?: string;
  publishedAt: string;
  company: {
    id: string;
    companyName: string;
    website?: string;
    description?: string;
    address?: string;
  };
}

export interface ApplicationRecord {
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
  interviews?: InterviewSchedule[];
  offers?: OfferDetails[];
}

// 1. Get all active internships with search/filters
export async function getActiveInternships(filters?: { search?: string; mode?: string; location?: string }): Promise<Internship[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.mode) params.append('mode', filters.mode);
  if (filters?.location) params.append('location', filters.location);

  const res = await fetch(`${API_BASE_URL}/api/internships?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch active internships');
  }
  const data = await res.json();
  return data.internships || [];
}

// 2. Get specific internship details
export async function getInternshipDetails(id: string): Promise<Internship> {
  const res = await fetch(`${API_BASE_URL}/api/internships/${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to retrieve internship details');
  }
  const data = await res.json();
  return data.internship;
}

// 3. Apply to internship (Student ID derived securely on backend from JWT)
export async function applyToInternship(payload: {
  internshipId: string;
  resumeUrl: string;
  coverLetter?: string;
  portfolioUrl?: string;
  githubUrl?: string;
}): Promise<{ message: string; application: ApplicationRecord }> {
  const res = await fetch(`${API_BASE_URL}/api/applications/student/apply`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Application submission failed');
  }
  return data;
}

// 4. Get current student's applications with interview and offer relations
export async function getMyApplications(): Promise<ApplicationRecord[]> {
  const res = await fetch(`${API_BASE_URL}/api/applications/my-applications`, {
    headers: getAuthHeaders()
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch your applications');
  }
  return data.applications || [];
}