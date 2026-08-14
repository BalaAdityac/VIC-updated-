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

export interface StudentDashboardSummary {
  totalApplications: number;
  activeInterviewsCount: number;
  offersCount: number;
  recentApplications: ApplicationRecord[];
  upcomingInterviews: Array<InterviewSchedule & { internshipTitle: string; companyName: string }>;
}

// 1. Fetch Active Internships with Filter
export async function getActiveInternships(filters?: { search?: string; mode?: string; location?: string }): Promise<Internship[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.mode) params.append('mode', filters.mode);
  if (filters?.location) params.append('location', filters.location);

  const res = await fetch(`${API_BASE_URL}/api/internships?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to retrieve active internships');
  }
  const data = await res.json();
  return data.internships || [];
}

// 2. Fetch Single Internship Details
export async function getInternshipDetails(id: string): Promise<Internship> {
  const res = await fetch(`${API_BASE_URL}/api/internships/${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Internship posting not found');
  }
  const data = await res.json();
  return data.internship;
}

// 3. Apply to Internship (Token-derived student ID + duplicate checks)
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
    throw new Error(data.message || 'Failed to submit application');
  }
  return data;
}

// 4. Retrieve All Student Applications
export async function getMyApplications(): Promise<ApplicationRecord[]> {
  const res = await fetch(`${API_BASE_URL}/api/applications/my-applications`, {
    headers: getAuthHeaders()
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch student application history');
  }
  return data.applications || [];
}

// 5. Aggregate Student Dashboard Analytics & Upcoming Interviews
export async function getStudentDashboardSummary(): Promise<StudentDashboardSummary> {
  const apps = await getMyApplications();
  
  let upcomingInterviews: Array<InterviewSchedule & { internshipTitle: string; companyName: string }> = [];
  let offersCount = 0;

  apps.forEach((app) => {
    if (app.offers && app.offers.length > 0) {
      offersCount += app.offers.length;
    }
    if (app.interviews && app.interviews.length > 0) {
      app.interviews
        .filter((intv) => intv.status === 'SCHEDULED')
        .forEach((intv) => {
          upcomingInterviews.push({
            ...intv,
            internshipTitle: app.internship.title,
            companyName: app.internship.company.companyName
          });
        });
    }
  });

  // Sort upcoming interviews chronologically
  upcomingInterviews.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  return {
    totalApplications: apps.length,
    activeInterviewsCount: upcomingInterviews.length,
    offersCount,
    recentApplications: apps.slice(0, 5),
    upcomingInterviews
  };
}