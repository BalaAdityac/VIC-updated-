export interface StudentProfile {
  name: string;
  email: string;
  department: string;
  bio: string;
  phone?: string;
  gradYear?: string;
  cgpa?: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  skills: string;
  defaultResumeFileName?: string;
  defaultResumeUrl?: string;
}

export interface CompanyProfile {
  companyName: string;
  email: string;
  phone?: string;
  website?: string;
  location?: string;
  industry?: string;
  companySize?: string;
  foundedYear?: string;
  registrationNumber?: string;
  tagline?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  cultureBenefits?: string;
  techStack?: string;
  description?: string;
}

// ---------------- STUDENT SESSION HELPERS ----------------

const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  name: "",
  email: "",
  department: "Computer Science & Engineering",
  bio: "",
  phone: "",
  gradYear: "2026",
  cgpa: "8.5",
  linkedinUrl: "",
  githubUrl: "",
  portfolioUrl: "",
  skills: "React, TypeScript, Python",
  defaultResumeFileName: "resume.pdf",
  defaultResumeUrl: "https://storage.vic.edu/resumes/resume.pdf"
};

export function getActiveStudent(): { token: string | null; profile: StudentProfile } {
  if (typeof window === "undefined") {
    return { token: null, profile: DEFAULT_STUDENT_PROFILE };
  }

  const token = localStorage.getItem("student_token");
  const storedData = localStorage.getItem("student_data");

  let profile = DEFAULT_STUDENT_PROFILE;
  if (storedData) {
    try {
      const parsed = JSON.parse(storedData);
      profile = {
        ...DEFAULT_STUDENT_PROFILE,
        ...parsed
      };
    } catch {
      profile = DEFAULT_STUDENT_PROFILE;
    }
  }

  return { token, profile };
}

export function saveStudentSession(token: string, profile: Partial<StudentProfile>) {
  if (typeof window === "undefined") return;

  const current = getActiveStudent().profile;
  const updated: StudentProfile = {
    ...current,
    ...profile
  };

  localStorage.setItem("student_token", token);
  localStorage.setItem("student_data", JSON.stringify(updated));

  try {
    if ("BroadcastChannel" in window) {
      const bc = new BroadcastChannel("vic_realtime_pipeline");
      bc.postMessage({ type: "STUDENT_SESSION_UPDATED", data: updated });
      setTimeout(() => bc.close(), 100);
    }
  } catch {}

  window.dispatchEvent(new CustomEvent("vic_pipeline_sync", { detail: { type: "STUDENT_SESSION_UPDATED" } }));
}

export function clearStudentSession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("student_token");
  localStorage.removeItem("student_data");

  try {
    if ("BroadcastChannel" in window) {
      const bc = new BroadcastChannel("vic_realtime_pipeline");
      bc.postMessage({ type: "STUDENT_LOGOUT" });
      setTimeout(() => bc.close(), 100);
    }
  } catch {}

  window.dispatchEvent(new CustomEvent("vic_pipeline_sync", { detail: { type: "STUDENT_LOGOUT" } }));
}

// ---------------- COMPANY / RECRUITER SESSION HELPERS ----------------

const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  companyName: "",
  email: "",
  phone: "",
  website: "",
  location: "Bengaluru, Karnataka, India",
  industry: "Software & Technology Services",
  companySize: "11-50 Employees",
  foundedYear: "2026",
  registrationNumber: "",
  tagline: "",
  linkedinUrl: "",
  twitterUrl: "",
  cultureBenefits: "Direct mentorship, certificate of completion, pre-placement offer (PPO) opportunities.",
  techStack: "React, TypeScript, Node.js, Python",
  description: ""
};

export function getActiveCompany(): { token: string | null; profile: CompanyProfile } {
  if (typeof window === "undefined") {
    return { token: null, profile: DEFAULT_COMPANY_PROFILE };
  }

  const token = localStorage.getItem("company_token");
  const storedData = localStorage.getItem("company_data");

  let profile = DEFAULT_COMPANY_PROFILE;
  if (storedData) {
    try {
      const parsed = JSON.parse(storedData);
      profile = {
        ...DEFAULT_COMPANY_PROFILE,
        ...parsed
      };
    } catch {
      profile = DEFAULT_COMPANY_PROFILE;
    }
  }

  return { token, profile };
}

export function saveCompanySession(token: string, profile: Partial<CompanyProfile>) {
  if (typeof window === "undefined") return;

  const current = getActiveCompany().profile;
  const updated: CompanyProfile = {
    ...current,
    ...profile
  };

  localStorage.setItem("company_token", token);
  localStorage.setItem("company_data", JSON.stringify(updated));

  try {
    if ("BroadcastChannel" in window) {
      const bc = new BroadcastChannel("vic_realtime_pipeline");
      bc.postMessage({ type: "COMPANY_PROFILE_UPDATED", data: updated });
      setTimeout(() => bc.close(), 100);
    }
  } catch {}

  window.dispatchEvent(new CustomEvent("vic_pipeline_sync", { detail: { type: "COMPANY_PROFILE_UPDATED" } }));
}

export function clearCompanySession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("company_token");
  localStorage.removeItem("company_data");

  try {
    if ("BroadcastChannel" in window) {
      const bc = new BroadcastChannel("vic_realtime_pipeline");
      bc.postMessage({ type: "COMPANY_LOGOUT" });
      setTimeout(() => bc.close(), 100);
    }
  } catch {}

  window.dispatchEvent(new CustomEvent("vic_pipeline_sync", { detail: { type: "COMPANY_LOGOUT" } }));
}