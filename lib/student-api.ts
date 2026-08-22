export interface CompanyNested {
  companyName: string;
  website?: string;
  description?: string;
  location?: string;
}

export interface InternshipNested {
  id: string;
  title: string;
  company: CompanyNested;
  location: string;
  mode: string;
  stipend: string | number;
  durationMonths?: number;
  description?: string;
  skills: string[];
}

export interface InterviewRound {
  id?: string;
  roundNumber?: number;
  roundName?: string;
  date?: string;
  time?: string;
  scheduledAt?: string;
  meetingUrl?: string;
  status?: string;
  feedback?: string;
  formattedTime?: string;
}

export interface OfferRecord {
  id?: string;
  stipendAmount: number | string;
  joiningDate: string;
  offerLetterUrl?: string;
  status?: string;
  offerNote?: string;
}

export interface ApplicationRecord {
  id: string;
  internshipId?: string;
  internship: InternshipNested;
  role: string;
  name: string;
  email: string;
  company: string | CompanyNested;
  appliedDate?: string;
  appliedAt?: string;
  stipend: string | number;
  status: string;
  location?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  coverLetter?: string;
  interviews: InterviewRound[];
  offers?: OfferRecord[];
}

export interface Internship {
  id: string;
  title: string;
  company: CompanyNested;
  location: string;
  mode: string;
  stipend: string | number;
  durationMonths?: number;
  description?: string;
  skills: string[];
  status?: string;
  postedAt?: string;
  deadline?: string;
  applicantsCount?: number;
}

export interface ApplyPayload {
  internshipId?: string;
  coverLetter?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  portfolioUrl?: string;
  githubUrl?: string;
}

export interface InternshipFilters {
  search?: string;
  mode?: string;
  location?: string;
}

// ---------------- AUTH TOKEN HELPERS ----------------

export function setAuthToken(token: string | null): void {
  if (typeof window === "undefined") return;

  if (token) {
    localStorage.setItem("jwt_token", token);
  } else {
    localStorage.removeItem("jwt_token");
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("jwt_token");
}

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

// ---------------- HELPER FORMATTERS ----------------

function formatStipendSafe(val: any): string {
  if (val === null || val === undefined || val === "") return "₹0 / mo";
  if (typeof val === "string" && (val.includes("₹") || val.includes("/ mo") || val.includes("/mo"))) {
    return val;
  }
  const numeric = typeof val === "number" ? val : parseFloat(String(val).replace(/[^0-9.]/g, ""));
  if (isNaN(numeric) || numeric === 0) return "₹0 / mo";
  return `₹${numeric.toLocaleString("en-IN")} / mo`;
}

function normalizeSkills(skills: any): string[] {
  if (Array.isArray(skills)) return skills;
  if (typeof skills === "string") return skills.split(",").map((s) => s.trim()).filter(Boolean);
  return ["Engineering"];
}

function normalizeCompanyObject(comp: any): CompanyNested {
  if (typeof comp === "object" && comp !== null) {
    return {
      companyName: comp.companyName || comp.name || "Partner Organization",
      website: comp.website || `https://${String(comp.companyName || "company").toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
      description: comp.description || "Partner enterprise recruitment collaborator on Visionary Interns Club.",
      location: comp.location || "Bengaluru",
    };
  }
  const rawName = String(comp || "Partner Organization").trim();
  return {
    companyName: rawName,
    website: `https://${rawName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
    description: "Partner enterprise recruitment collaborator on Visionary Interns Club.",
    location: "Bengaluru",
  };
}

// ---------------- API EXPORTS ----------------

export async function getActiveInternships(filters?: InternshipFilters): Promise<Internship[]> {
  if (typeof window === "undefined") return [];

  let blockedEntities: string[] = [];
  try {
    blockedEntities = JSON.parse(localStorage.getItem("vic_blocked_entities") || "[]");
  } catch {}

  const deletedIds = new Set(JSON.parse(localStorage.getItem("vic_deleted_jobs") || "[]"));
  const localJobs: any[] = JSON.parse(localStorage.getItem("vic_custom_jobs") || "[]");

  const jobMap = new Map<string, Internship>();

  localJobs.forEach((job: any) => {
    const compObj = normalizeCompanyObject(job.company);
    const compNameLower = compObj.companyName.toLowerCase();

    if (!deletedIds.has(job.id) && !blockedEntities.includes(compNameLower) && job.status !== "PAUSED") {
      const dedupeKey = `${String(job.title).trim().toLowerCase()}::${compNameLower}`;
      jobMap.set(dedupeKey, {
        id: String(job.id),
        title: job.title,
        company: compObj,
        location: job.location || "Bengaluru",
        mode: job.mode || "HYBRID",
        stipend: formatStipendSafe(job.stipend),
        durationMonths: Number(job.durationMonths) || 6,
        description: job.description || "Hands-on engineering position with architect mentorship.",
        skills: normalizeSkills(job.skills),
        status: job.status || "ACTIVE",
        postedAt: job.postedAt || "Recently",
        deadline: job.deadline || "Open until filled",
        applicantsCount: job.applicantsCount || 0,
      });
    }
  });

  if (jobMap.size === 0 && localJobs.length === 0) {
    const defaults: Internship[] = [
      {
        id: "job-1",
        title: "Frontend Engineering Intern",
        company: normalizeCompanyObject("Accenture"),
        location: "Bengaluru",
        mode: "HYBRID",
        stipend: "₹25,000 / mo",
        durationMonths: 6,
        description: "Work with modern React, Next.js, and TypeScript architectures to build production-grade web interfaces.",
        skills: ["React", "TypeScript", "Tailwind CSS"],
        status: "ACTIVE"
      },
      {
        id: "job-2",
        title: "Embedded Systems Intern",
        company: normalizeCompanyObject("Nexus Autonomous"),
        location: "Bengaluru",
        mode: "ON-SITE",
        stipend: "₹30,000 / mo",
        durationMonths: 6,
        description: "Develop firmware and sensor telemetry pipelines using FreeRTOS and C++ for edge IoT hardware systems.",
        skills: ["C++", "FreeRTOS", "IoT", "Sensors"],
        status: "ACTIVE"
      }
    ];

    defaults.forEach((d) => {
      if (!blockedEntities.includes(d.company.companyName.toLowerCase())) {
        jobMap.set(`${d.title.toLowerCase()}::${d.company.companyName.toLowerCase()}`, d);
      }
    });
  }

  let list = Array.from(jobMap.values());

  if (filters) {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.companyName.toLowerCase().includes(q) ||
          j.skills.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (filters.mode && filters.mode !== "ALL") {
      list = list.filter((j) => j.mode.toLowerCase() === filters.mode?.toLowerCase());
    }
    if (filters.location && filters.location !== "ALL") {
      list = list.filter((j) => j.location.toLowerCase().includes(filters.location!.toLowerCase()));
    }
  }

  return list;
}

export async function getInternshipDetails(id: string): Promise<Internship | null> {
  const jobs = await getActiveInternships();
  const matched = jobs.find((j) => String(j.id).trim() === String(id).trim());
  return matched || null;
}

export async function getMyApplications(): Promise<ApplicationRecord[]> {
  if (typeof window === "undefined") return [];

  let userEmail = "";
  try {
    const studentData = JSON.parse(localStorage.getItem("student_data") || "{}");
    userEmail = (studentData.email || "").trim().toLowerCase();
  } catch {}

  const storedApps: any[] = JSON.parse(localStorage.getItem("vic_applications") || "[]");

  return storedApps
    .filter((a: any) => !userEmail || String(a.email || "").trim().toLowerCase() === userEmail)
    .map((a: any) => {
      const compObj = normalizeCompanyObject(a.company);
      const appliedDateClean = a.appliedDate || a.appliedAt || new Date().toISOString();
      const rawNumericStipend = parseFloat(String(a.stipend || "25000").replace(/[^0-9.]/g, "")) || 25000;

      const offersList: OfferRecord[] = (a.offers && Array.isArray(a.offers) && a.offers.length > 0)
        ? a.offers
        : (a.status === "ACCEPTED" || a.status === "OFFERED" || a.status === "HIRED / ACCEPTED")
        ? [
            {
              id: `off-${a.id}`,
              stipendAmount: rawNumericStipend,
              joiningDate: a.joiningDate || "2026-09-01",
              offerLetterUrl: "#",
              status: "OFFERED",
              offerNote: a.offerNote || "Congratulations on your performance during evaluations."
            }
          ]
        : [];

      const nestedInternship: InternshipNested = {
        id: a.internshipId || a.id,
        title: a.role || "Engineering Intern",
        company: compObj,
        location: a.location || "Bengaluru",
        mode: "HYBRID",
        stipend: formatStipendSafe(a.stipend),
        description: "Hands-on internship position with direct team mentorship.",
        skills: ["Engineering"]
      };

      const parsedInterviews: InterviewRound[] = (a.interviews || []).map((i: any, idx: number) => ({
        id: i.id || `round-${idx + 1}`,
        roundNumber: i.roundNumber || idx + 1,
        roundName: i.roundName || `Technical Round ${idx + 1}`,
        date: i.date || "Upcoming",
        time: i.time || "2:30 PM",
        scheduledAt: i.scheduledAt || new Date().toISOString(),
        meetingUrl: i.meetingUrl || "https://meet.google.com/vic-student-room",
        status: i.status || "SCHEDULED",
        feedback: i.feedback || "",
        formattedTime: i.time || (i.scheduledAt ? new Date(i.scheduledAt).toLocaleString() : "Upcoming")
      }));

      return {
        id: a.id,
        internshipId: a.internshipId || a.id,
        internship: nestedInternship,
        role: a.role || nestedInternship.title,
        name: a.name || "Student",
        email: a.email,
        company: compObj,
        appliedDate: appliedDateClean,
        appliedAt: appliedDateClean,
        stipend: formatStipendSafe(a.stipend),
        status: a.status || "APPLIED",
        location: a.location || "Bengaluru",
        resumeUrl: a.resumeUrl || "https://storage.vic.edu/resumes/resume.pdf",
        resumeFileName: a.resumeFileName || "resume.pdf",
        coverLetter: a.coverLetter || "",
        interviews: parsedInterviews,
        offers: offersList
      };
    });
}

export async function applyToInternship(
  param1: string | ApplyPayload,
  param2?: ApplyPayload
): Promise<{ success: boolean; message: string }> {
  if (typeof window === "undefined") return { success: false, message: "Client not ready." };

  let internshipId = "";
  let payload: ApplyPayload = {};

  if (typeof param1 === "object" && param1 !== null) {
    internshipId = String(param1.internshipId || "");
    payload = param1;
  } else {
    internshipId = String(param1 || "");
    payload = param2 || {};
  }

  const job = await getInternshipDetails(internshipId);
  if (!job) return { success: false, message: "Internship position not found." };

  let studentProfile = { name: "Student", email: "student@vic.edu" };
  try {
    const raw = localStorage.getItem("student_data");
    if (raw) studentProfile = JSON.parse(raw);
  } catch {}

  const userEmail = (studentProfile.email || "").trim().toLowerCase();
  const existingApps: any[] = JSON.parse(localStorage.getItem("vic_applications") || "[]");

  const alreadyApplied = existingApps.some(
    (a) =>
      String(a.email || "").trim().toLowerCase() === userEmail &&
      (String(a.internshipId).trim() === String(job.id).trim() ||
        (String(a.role).trim().toLowerCase() === String(job.title).trim().toLowerCase() &&
          String(a.company || a.company?.companyName || "").trim().toLowerCase() === job.company.companyName.toLowerCase()))
  );

  if (alreadyApplied) {
    return { success: false, message: "You have already applied for this position." };
  }

  const currentDateISO = new Date().toISOString();
  const currentDateDisplay = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const newApp: ApplicationRecord = {
    id: `app-${Date.now()}`,
    internshipId: job.id,
    internship: {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      mode: job.mode,
      stipend: job.stipend,
      durationMonths: job.durationMonths,
      description: job.description,
      skills: job.skills
    },
    role: job.title,
    name: studentProfile.name,
    email: userEmail,
    company: job.company.companyName,
    appliedDate: currentDateDisplay,
    appliedAt: currentDateISO,
    stipend: formatStipendSafe(job.stipend),
    status: "APPLIED",
    location: `${job.location} • ${job.mode}`,
    resumeUrl: payload.resumeUrl || "https://storage.vic.edu/resumes/resume.pdf",
    resumeFileName: payload.resumeFileName || "resume.pdf",
    coverLetter: payload.coverLetter || "I am excited to contribute my engineering skills.",
    interviews: [],
    offers: []
  };

  localStorage.setItem("vic_applications", JSON.stringify([newApp, ...existingApps]));

  try {
    if ("BroadcastChannel" in window) {
      const bc = new BroadcastChannel("vic_realtime_pipeline");
      bc.postMessage({
        type: "APPLICATION_SUBMITTED",
        data: { name: newApp.name, role: job.title, company: job.company.companyName, email: userEmail }
      });
      setTimeout(() => bc.close(), 100);
    }
  } catch {}

  window.dispatchEvent(
    new CustomEvent("vic_pipeline_sync", {
      detail: { type: "APPLICATION_SUBMITTED", data: newApp }
    })
  );

  return { success: true, message: "Application submitted successfully." };
}