"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Briefcase,
  FileText,
  Video,
  Award,
  Search,
  Bell,
  CheckCheck,
  LogOut,
  ChevronDown,
  ArrowUpRight,
  Sparkles,
  Menu,
  X,
  Clock,
  ExternalLink,
  Loader2,
  AlertCircle,
  MapPin,
  Building2,
  CheckCircle2,
  User,
  Mail,
  Phone,
  GraduationCap,
  Globe,
  Linkedin,
  Github,
  Save,
  PartyPopper,
  Printer,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Tag,
  UploadCloud,
  Trash2,
  Check
} from "lucide-react";
import { getActiveStudent, clearStudentSession, StudentProfile } from "@/lib/authSession";

interface ComprehensiveProfile extends StudentProfile {
  phone?: string;
  gradYear?: string;
  cgpa?: string;
  defaultResumeUrl?: string;
  defaultResumeFileName?: string;
}

function formatDateSafe(dateInput: any): string {
  if (!dateInput) return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  if (typeof dateInput === "string" && dateInput.includes("Invalid")) {
    return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  const parsed = new Date(dateInput);
  if (isNaN(parsed.getTime())) {
    return typeof dateInput === "string" && dateInput.length > 3
      ? dateInput
      : new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTimeSafe(dateInput: any): string {
  if (!dateInput) return new Date().toLocaleString();
  const parsed = new Date(dateInput);
  if (isNaN(parsed.getTime())) return String(dateInput);
  return parsed.toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
}

function formatStipend(val: any): string {
  if (val === null || val === undefined || val === "") return "₹0 / mo";
  if (typeof val === "string" && (val.includes("₹") || val.includes("/ mo") || val.includes("/mo"))) {
    return val;
  }
  const numeric = typeof val === "number" ? val : parseFloat(String(val).replace(/[^0-9.]/g, ""));
  if (isNaN(numeric) || numeric === 0) return "₹0 / mo";
  return `₹${numeric.toLocaleString("en-IN")} / mo`;
}

function isCompanyBlocked(companyName: string, blockedList: string[]): boolean {
  if (!companyName || !blockedList || blockedList.length === 0) return false;
  const cleanName = companyName.trim().toLowerCase();

  if (blockedList.includes(cleanName)) return true;

  try {
    const regCompanies = JSON.parse(localStorage.getItem("vic_registered_companies") || "[]");
    for (const c of regCompanies) {
      const cName = String(c.companyName || "").trim().toLowerCase();
      const cEmail = String(c.email || "").trim().toLowerCase();
      if (cName === cleanName || cleanName.includes(cName) || cName.includes(cleanName)) {
        if (blockedList.includes(cName) || blockedList.includes(cEmail)) {
          return true;
        }
      }
    }
  } catch {}

  return blockedList.some(
    (blocked) =>
      blocked === cleanName ||
      (cleanName.length > 2 && blocked.length > 2 && (cleanName.includes(blocked) || blocked.includes(cleanName)))
  );
}

export default function StudentDashboard() {
  const [mounted, setMounted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "applications" | "internships" | "interviews" | "offers" | "profile">("overview");

  const [profile, setProfile] = useState<ComprehensiveProfile>({
    name: "",
    email: "",
    department: "",
    bio: "",
    phone: "",
    gradYear: "2026",
    cgpa: "8.5",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    skills: "",
    defaultResumeFileName: "resume.pdf",
    defaultResumeUrl: "https://storage.vic.edu/resumes/resume.pdf"
  });

  const [profileSaved, setProfileSaved] = useState(false);

  // Modal & Live Toast States
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [selectedOfferApp, setSelectedOfferApp] = useState<any | null>(null);
  const [liveToast, setLiveToast] = useState<{ title: string; desc: string } | null>(null);

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Apply Modal State
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  // Job Description Inspection Modal State
  const [viewingJobDetails, setViewingJobDetails] = useState<any | null>(null);

  const [applyFormData, setApplyFormData] = useState({
    resumeFileName: "resume.pdf",
    resumeUrl: "https://storage.vic.edu/resumes/resume.pdf",
    coverLetter: "I am excited to contribute my engineering skills to your organization."
  });
  const [applyStatusMessage, setApplyStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);

  const notifyPipeline = useCallback((payload: { type: string; data?: any }) => {
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const bc = new BroadcastChannel("vic_realtime_pipeline");
        bc.postMessage(payload);
        setTimeout(() => bc.close(), 100);
      }
    } catch {}
    window.dispatchEvent(new CustomEvent("vic_pipeline_sync", { detail: payload }));
  }, []);

  const checkStudentBlockedStatus = useCallback((userEmail: string) => {
    try {
      const blockedList: string[] = JSON.parse(localStorage.getItem("vic_blocked_entities") || "[]");
      const isEmailBlocked = userEmail ? blockedList.includes(userEmail.trim().toLowerCase()) : false;
      setIsBlocked(isEmailBlocked);
    } catch {
      setIsBlocked(false);
    }
  }, []);

  const fetchStudentData = useCallback(() => {
    if (typeof window === "undefined") return;
    const session = getActiveStudent();
    const userEmail = (session.profile.email || "").trim().toLowerCase();

    checkStudentBlockedStatus(userEmail);

    let blockedEntities: string[] = [];
    try {
      blockedEntities = JSON.parse(localStorage.getItem("vic_blocked_entities") || "[]");
    } catch {}

    // 1. Load Notifications
    try {
      const storedNotifs: any[] = JSON.parse(localStorage.getItem("vic_student_notifications") || "[]");
      const myNotifs = storedNotifs.filter(
        (n) => n.candidateEmail && String(n.candidateEmail).trim().toLowerCase() === userEmail
      );
      setNotifications(myNotifs);
    } catch {
      setNotifications([]);
    }

    // 2. Load Jobs (Exclude deleted jobs and jobs belonging to suspended companies)
    try {
      const localJobs = JSON.parse(localStorage.getItem("vic_custom_jobs") || "[]");
      const deletedIds = new Set(JSON.parse(localStorage.getItem("vic_deleted_jobs") || "[]"));

      const jobMap = new Map<string, any>();
      localJobs.forEach((job: any) => {
        const comp = String(job.company || "").trim();
        const isJobDeleted = deletedIds.has(job.id);
        const isJobCompanySuspended = isCompanyBlocked(comp, blockedEntities);

        if (!isJobDeleted && !isJobCompanySuspended && job.status !== "PAUSED") {
          const dedupeKey = `${String(job.title).trim().toLowerCase()}::${comp.toLowerCase()}`;
          const normalizedSkills = Array.isArray(job.skills)
            ? job.skills
            : typeof job.skills === "string"
            ? job.skills.split(",").map((s: string) => s.trim()).filter(Boolean)
            : ["Engineering"];

          jobMap.set(dedupeKey, {
            ...job,
            stipend: formatStipend(job.stipend),
            skills: normalizedSkills.length > 0 ? normalizedSkills : ["Engineering"]
          });
        }
      });

      if (jobMap.size === 0 && localJobs.length === 0) {
        const defaults = [
          {
            id: "job-1",
            title: "Frontend Engineering Intern",
            company: "Accenture",
            location: "Bengaluru",
            mode: "HYBRID",
            stipend: "₹25,000 / mo",
            durationMonths: 6,
            description: "Work with modern React, Next.js, and TypeScript architectures to build production-grade web interfaces.",
            skills: ["React", "TypeScript", "Tailwind CSS"]
          },
          {
            id: "job-2",
            title: "Embedded Systems Intern",
            company: "Nexus Autonomous",
            location: "Bengaluru",
            mode: "ON-SITE",
            stipend: "₹30,000 / mo",
            durationMonths: 6,
            description: "Develop firmware and sensor telemetry pipelines using FreeRTOS and C++ for edge IoT hardware systems.",
            skills: ["C++", "FreeRTOS", "IoT", "Sensors"]
          }
        ];
        defaults.forEach((d) => {
          if (!isCompanyBlocked(d.company, blockedEntities)) {
            jobMap.set(`${d.title.toLowerCase()}::${d.company.toLowerCase()}`, d);
          }
        });
      }

      setAvailableJobs(Array.from(jobMap.values()));
    } catch {
      setAvailableJobs([]);
    }

    // 3. Load Applications
    try {
      const storedApps: any[] = JSON.parse(localStorage.getItem("vic_applications") || "[]");
      const myStoredApps = storedApps
        .filter((a: any) => String(a.email || "").trim().toLowerCase() === userEmail)
        .map((a: any) => ({
          ...a,
          appliedDate: formatDateSafe(a.appliedDate || a.appliedAt || a.createdAt),
          stipend: formatStipend(a.stipend),
          interviews: (a.interviews || []).map((i: any) => ({
            ...i,
            formattedTime: formatDateTimeSafe(i.scheduledAt || i.time || i.date)
          }))
        }));

      setMyApplications(myStoredApps);
    } catch {
      setMyApplications([]);
    }
  }, [checkStudentBlockedStatus]);

  useEffect(() => {
    setMounted(true);
    const session = getActiveStudent();

    let extraData: Partial<ComprehensiveProfile> = {};
    try {
      const raw = localStorage.getItem("student_data");
      if (raw) extraData = JSON.parse(raw);
    } catch {}

    setProfile({
      ...session.profile,
      phone: extraData.phone || "",
      gradYear: extraData.gradYear || "2026",
      cgpa: extraData.cgpa || "8.5",
      defaultResumeFileName: extraData.defaultResumeFileName || "resume.pdf",
      defaultResumeUrl: extraData.defaultResumeUrl || "https://storage.vic.edu/resumes/resume.pdf"
    });

    setApplyFormData((prev) => ({
      ...prev,
      resumeFileName: extraData.defaultResumeFileName || prev.resumeFileName,
      resumeUrl: extraData.defaultResumeUrl || prev.resumeUrl
    }));

    fetchStudentData();

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        bc = new BroadcastChannel("vic_realtime_pipeline");
        bc.onmessage = (event) => {
          fetchStudentData();
          if (event.data?.type === "DECISION_UPDATED" && event.data?.data) {
            const currentEmail = (getActiveStudent().profile.email || "").trim().toLowerCase();
            if (String(event.data.data.candidateEmail).trim().toLowerCase() === currentEmail) {
              if (event.data.data.newStatus === "ACCEPTED") {
                setLiveToast({
                  title: "Offer Letter Extended!",
                  desc: `Your application for "${event.data.data.role}" has been approved.`
                });
              }
            }
          }
        };
      }
    } catch {}

    const handleSync = () => fetchStudentData();
    window.addEventListener("vic_pipeline_sync", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      if (bc) bc.close();
      window.removeEventListener("vic_pipeline_sync", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [fetchStudentData]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setApplyFormData((prev) => ({
        ...prev,
        resumeFileName: file.name,
        resumeUrl: (reader.result as string) || "https://storage.vic.edu/resumes/uploaded_resume.pdf"
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleWithdrawApplication = (appId: string, roleTitle: string) => {
    if (isBlocked) return;
    const userEmail = profile.email.trim().toLowerCase();
    const storedApps: any[] = JSON.parse(localStorage.getItem("vic_applications") || "[]");

    const updated = storedApps.filter(
      (a: any) => !(a.id === appId || (a.email?.toLowerCase() === userEmail && a.role === roleTitle))
    );

    localStorage.setItem("vic_applications", JSON.stringify(updated));
    setMyApplications(updated.filter((a: any) => a.email?.toLowerCase() === userEmail));
    notifyPipeline({ type: "APPLICATION_WITHDRAWN", data: { appId, role: roleTitle, email: userEmail } });
  };

  const handleAcceptOffer = (appId: string) => {
    if (isBlocked) return;
    const userEmail = profile.email.trim().toLowerCase();
    const storedApps: any[] = JSON.parse(localStorage.getItem("vic_applications") || "[]");

    const updated = storedApps.map((a: any) => {
      if (a.id === appId || (a.email?.toLowerCase() === userEmail && a.id === selectedOfferApp?.id)) {
        return { ...a, status: "HIRED / ACCEPTED" };
      }
      return a;
    });

    localStorage.setItem("vic_applications", JSON.stringify(updated));
    setMyApplications(updated.filter((a: any) => a.email?.toLowerCase() === userEmail));

    if (selectedOfferApp && selectedOfferApp.id === appId) {
      setSelectedOfferApp({ ...selectedOfferApp, status: "HIRED / ACCEPTED" });
    }

    notifyPipeline({ type: "OFFER_CONFIRMED", data: { appId, email: userEmail } });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) return;

    localStorage.setItem("student_data", JSON.stringify(profile));

    try {
      const registered = JSON.parse(localStorage.getItem("vic_registered_students") || "[]");
      const updatedRegistered = registered.map((u: any) => {
        if (u.email?.toLowerCase() === profile.email.toLowerCase()) {
          return { ...u, ...profile };
        }
        return u;
      });
      localStorage.setItem("vic_registered_students", JSON.stringify(updatedRegistered));
    } catch {}

    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
    notifyPipeline({ type: "STUDENT_SESSION_UPDATED", data: profile });
  };

  const filteredJobs = useMemo(() => {
    let blockedEntities: string[] = [];
    try {
      blockedEntities = JSON.parse(localStorage.getItem("vic_blocked_entities") || "[]");
    } catch {}

    const unblockedJobs = availableJobs.filter((j) => !isCompanyBlocked(j.company, blockedEntities));

    if (!searchQuery.trim()) return unblockedJobs;
    const q = searchQuery.toLowerCase();
    return unblockedJobs.filter(
      (j) =>
        j.title?.toLowerCase().includes(q) ||
        (j.company && j.company.toLowerCase().includes(q)) ||
        (j.location && j.location.toLowerCase().includes(q)) ||
        (j.skills && j.skills.some((s: string) => s.toLowerCase().includes(q)))
    );
  }, [availableJobs, searchQuery]);

  const allScheduledInterviews = useMemo(() => {
    let blockedList: string[] = [];
    try {
      blockedList = JSON.parse(localStorage.getItem("vic_blocked_entities") || "[]");
    } catch {}

    const list: any[] = [];
    myApplications.forEach((app) => {
      const companyBlocked = isCompanyBlocked(app.company, blockedList);
      if (!companyBlocked && Array.isArray(app.interviews) && app.interviews.length > 0) {
        app.interviews.forEach((intv: any) => {
          list.push({
            id: intv.id || `intv-${Math.random()}`,
            role: app.role,
            company: app.company,
            round: intv.roundName || `Round ${intv.roundNumber || 1}`,
            date: formatDateSafe(intv.scheduledAt || intv.date),
            time: intv.time || (intv.scheduledAt ? formatDateTimeSafe(intv.scheduledAt) : "2:30 PM"),
            meetUrl: intv.meetingUrl || "https://meet.google.com/vic-student-room",
            status: intv.status || "SCHEDULED"
          });
        });
      }
    });
    return list;
  }, [myApplications]);

  const acceptedOffers = useMemo(() => {
    let blockedList: string[] = [];
    try {
      blockedList = JSON.parse(localStorage.getItem("vic_blocked_entities") || "[]");
    } catch {}

    return myApplications.filter((a) => {
      const companyBlocked = isCompanyBlocked(a.company, blockedList);
      return !companyBlocked && (a.status === "ACCEPTED" || a.status === "OFFERED" || a.status === "HIRED / ACCEPTED");
    });
  }, [myApplications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllNotifsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem("vic_student_notifications", JSON.stringify(updated));
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked || !selectedJob) return;
    setIsApplying(true);
    setApplyStatusMessage(null);

    const userEmail = profile.email.trim().toLowerCase();
    const targetJobId = String(selectedJob.id).trim();
    const targetJobTitle = String(selectedJob.title).trim().toLowerCase();
    const targetJobCompany = String(selectedJob.company || "").trim().toLowerCase();

    const isAlreadyApplied = myApplications.some(
      (a) =>
        String(a.internshipId).trim() === targetJobId ||
        (String(a.role).trim().toLowerCase() === targetJobTitle &&
          String(a.company || "").trim().toLowerCase() === targetJobCompany)
    );

    if (isAlreadyApplied) {
      setApplyStatusMessage({ type: "error", text: "You have already applied for this position." });
      setIsApplying(false);
      return;
    }

    const currentDateFormatted = formatDateSafe(new Date());

    const newApp = {
      id: `app-${Date.now()}`,
      internshipId: selectedJob.id,
      role: selectedJob.title,
      name: profile.name,
      email: userEmail,
      company: selectedJob.company || "Partner Organization",
      appliedDate: currentDateFormatted,
      appliedAt: currentDateFormatted,
      stipend: formatStipend(selectedJob.stipend),
      status: "APPLIED",
      location: `${selectedJob.location} • ${selectedJob.mode}`,
      resumeUrl: applyFormData.resumeUrl,
      resumeFileName: applyFormData.resumeFileName,
      coverLetter: applyFormData.coverLetter,
      interviews: []
    };

    const existingApps: any[] = JSON.parse(localStorage.getItem("vic_applications") || "[]");
    localStorage.setItem("vic_applications", JSON.stringify([newApp, ...existingApps]));

    notifyPipeline({
      type: "APPLICATION_SUBMITTED",
      data: { name: newApp.name, role: selectedJob.title, company: selectedJob.company, email: userEmail }
    });

    setMyApplications((prev) => [newApp, ...prev]);
    setApplyStatusMessage({ type: "success", text: `Application submitted successfully!` });

    setTimeout(() => {
      setApplyModalOpen(false);
      setSelectedJob(null);
      setApplyStatusMessage(null);
      setActiveTab("applications");
      setIsApplying(false);
    }, 1000);
  };

  const studentInitials = useMemo(() => {
    if (!mounted || !profile.name) return "ST";
    const parts = profile.name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : profile.name.substring(0, 2).toUpperCase();
  }, [mounted, profile.name]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-[#202960]" />
      </div>
    );
  }

  // SUSPENDED / BLOCKED STUDENT SCREEN
  if (isBlocked) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] text-slate-800 flex flex-col md:flex-row font-sans">
        <aside className="w-72 border-r border-red-200 bg-white p-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 shrink-0 rounded-xl overflow-hidden flex items-center justify-center bg-white border border-red-200 shadow-sm">
                <Image src="/logo.jpg" alt="Logo" width={36} height={36} className="object-contain" priority />
              </div>
              <div className="min-w-0">
                <div className="font-black text-xs tracking-tight text-[#1E1B4B] uppercase whitespace-nowrap">Visionary Interns Club</div>
                <div className="text-[10px] font-bold text-red-600 whitespace-nowrap">Student Portal</div>
              </div>
            </Link>

            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200">
              <div className="font-bold text-xs text-red-900">{profile.name || "Student"}</div>
              <div className="text-[10px] text-red-600 font-bold uppercase mt-0.5">Account Blocked</div>
            </div>
          </div>

          <div className="pt-4 border-t border-red-100 flex items-center justify-between">
            <div className="text-xs text-slate-400">{profile.email}</div>
            <Link
              href="/signin"
              onClick={() => clearStudentSession()}
              className="p-2 text-slate-400 hover:text-red-600 transition cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </aside>

        <main className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-lg bg-white border-2 border-red-200 rounded-[32px] p-8 sm:p-10 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-sm">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-[#1E1B4B]">Student Account Suspended</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your student profile and portal access have been restricted by the SuperAdmin Governance Council.
              </p>
            </div>

            <div className="p-4 bg-red-50/60 border border-red-200 rounded-2xl text-xs text-red-800 text-left space-y-1.5 font-medium">
              <div className="flex items-center gap-2 font-bold text-red-900">
                <Lock className="w-3.5 h-3.5" /> Restriction Details:
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-red-700">
                <li>Submitting new internship applications has been disabled.</li>
                <li>Access to scheduled technical rounds and meeting rooms is locked.</li>
                <li>Profile edits and offer confirmations have been frozen.</li>
              </ul>
            </div>

            <div className="pt-2">
              <Link
                href="/signin"
                onClick={() => clearStudentSession()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#202960] hover:bg-[#2E2A72] text-white text-xs font-bold rounded-full transition shadow-md"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-slate-800 flex flex-col md:flex-row font-sans relative">
      {liveToast && (
        <div className="fixed top-5 right-5 z-50 max-w-sm bg-white border-2 border-emerald-500 rounded-3xl shadow-2xl p-4 flex items-start gap-3 animate-in slide-in-from-top-5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <PartyPopper className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <h4 className="font-black text-xs text-[#1E1B4B]">{liveToast.title}</h4>
            <p className="text-[11px] text-slate-500">{liveToast.desc}</p>
            <button
              onClick={() => {
                setActiveTab("offers");
                setLiveToast(null);
              }}
              className="mt-1 px-3 py-1 bg-emerald-600 text-white font-bold text-[10px] rounded-full hover:bg-emerald-700 cursor-pointer"
            >
              Inspect Offers
            </button>
          </div>
          <button onClick={() => setLiveToast(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 md:w-64 border-r border-[#3B3588]/10 bg-white p-6 flex flex-col justify-between shadow-2xl md:shadow-sm transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 shrink-0 rounded-xl overflow-hidden flex items-center justify-center bg-white border border-[#3B3588]/10 shadow-sm">
                <Image src="/logo.jpg" alt="Logo" width={36} height={36} className="object-contain" priority />
              </div>
              <div className="min-w-0">
                <div className="font-black text-xs tracking-tight text-[#1E1B4B] uppercase whitespace-nowrap">Visionary Interns Club</div>
                <div className="text-[10px] font-bold text-[#3B3588] whitespace-nowrap">Student Portal</div>
              </div>
            </Link>
            <button onClick={() => setMobileMenuOpen(false)} className="md:hidden p-2 rounded-xl text-slate-500 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            onClick={() => setActiveTab("profile")}
            className="p-3.5 rounded-2xl bg-[#EDF0FF] border border-[#3B3588]/10 flex items-center justify-between cursor-pointer hover:border-[#202960]/30 transition"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#202960] text-white font-bold flex items-center justify-center text-xs">
                {studentInitials}
              </div>
              <div className="text-left">
                <div className="font-bold text-xs text-[#1E1B4B] truncate max-w-[120px]">{profile.name || "Student"}</div>
                <div className="text-[10px] text-indigo-700 font-semibold">{profile.department || "Member"}</div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <nav className="space-y-1.5 text-xs font-bold">
            <button
              onClick={() => { setActiveTab("overview"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition cursor-pointer ${
                activeTab === "overview" ? "bg-[#202960] text-white shadow-md" : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF]"
              }`}
            >
              <Award className="w-4 h-4" /> Overview
            </button>

            <button
              onClick={() => { setActiveTab("applications"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition cursor-pointer ${
                activeTab === "applications" ? "bg-[#202960] text-white shadow-md" : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF]"
              }`}
            >
              <FileText className="w-4 h-4" /> Applications ({myApplications.length})
            </button>

            <button
              onClick={() => { setActiveTab("internships"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition cursor-pointer ${
                activeTab === "internships" ? "bg-[#202960] text-white shadow-md" : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF]"
              }`}
            >
              <Briefcase className="w-4 h-4" /> Explore Openings ({filteredJobs.length})
            </button>

            <button
              onClick={() => { setActiveTab("interviews"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition cursor-pointer ${
                activeTab === "interviews" ? "bg-[#202960] text-white shadow-md" : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF]"
              }`}
            >
              <Video className="w-4 h-4" /> Interviews ({allScheduledInterviews.length})
            </button>

            <button
              onClick={() => { setActiveTab("offers"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition cursor-pointer ${
                activeTab === "offers" ? "bg-[#202960] text-white shadow-md" : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF]"
              }`}
            >
              <span className="flex items-center gap-3">
                <PartyPopper className="w-4 h-4 text-emerald-500" /> Offers & Letters
              </span>
              {acceptedOffers.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                  {acceptedOffers.length}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab("profile"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition cursor-pointer ${
                activeTab === "profile" ? "bg-[#202960] text-white shadow-md" : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF]"
              }`}
            >
              <User className="w-4 h-4" /> My Profile
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-[#3B3588]/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#202960] text-white font-bold text-xs flex items-center justify-center">
              {studentInitials}
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-[#1E1B4B] truncate max-w-[110px]">{profile.name || "Student"}</div>
              <div className="text-[10px] text-slate-400 truncate max-w-[110px]">{profile.email}</div>
            </div>
          </div>
          <Link
            href="/signin"
            onClick={() => clearStudentSession()}
            className="p-2 text-slate-400 hover:text-red-600 transition cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 md:h-18 px-4 sm:px-8 border-b border-[#3B3588]/10 bg-white flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 rounded-xl text-[#202960] cursor-pointer">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <span>Student</span>
              <span>/</span>
              <span className="text-[#1E1B4B] capitalize">{activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2.5 rounded-full bg-[#F8F9FD] border border-[#3B3588]/15 text-slate-600 hover:text-[#202960] cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-[#3B3588]/15 rounded-3xl shadow-2xl p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                    <span className="font-bold text-sm text-[#1E1B4B]">Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllNotifsRead} className="text-[11px] font-bold text-[#202960] hover:underline flex items-center gap-1 cursor-pointer">
                        <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-72 overflow-y-auto text-xs">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-slate-400">No notifications yet.</div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="p-3 rounded-2xl bg-[#EDF0FF]/80 text-slate-800 font-medium">
                          <p>{n.text}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveTab("internships")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#202960] hover:bg-[#2E2A72] text-white font-bold text-xs shadow-md cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" /> Find Internships
            </button>
          </div>
        </header>

        <div className="p-4 sm:p-8 space-y-8 max-w-7xl">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <>
              <section className="bg-gradient-to-br from-[#EDF0FF] via-white to-[#F8F9FD] border border-[#3B3588]/10 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#1E1B4B]">Welcome, {profile.name || "Student"}!</h1>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
                    Track your applications in real-time, join interviews, and confirm offer appointments.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("internships")}
                  className="px-5 py-3 rounded-full bg-[#202960] text-white font-bold text-xs hover:bg-[#2E2A72] cursor-pointer"
                >
                  Browse Positions
                </button>
              </section>

              <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div onClick={() => setActiveTab("applications")} className="bg-white border border-[#3B3588]/10 p-5 rounded-3xl cursor-pointer hover:shadow-md transition">
                  <div className="text-xs font-bold text-slate-500 uppercase">Applications</div>
                  <div className="text-2xl font-black text-[#1E1B4B] mt-1">{myApplications.length}</div>
                </div>
                <div onClick={() => setActiveTab("interviews")} className="bg-white border border-[#3B3588]/10 p-5 rounded-3xl cursor-pointer hover:shadow-md transition">
                  <div className="text-xs font-bold text-slate-500 uppercase">Interviews</div>
                  <div className="text-2xl font-black text-[#1E1B4B] mt-1">{allScheduledInterviews.length}</div>
                </div>
                <div onClick={() => setActiveTab("offers")} className="bg-white border border-[#3B3588]/10 p-5 rounded-3xl cursor-pointer hover:shadow-md transition">
                  <div className="text-xs font-bold text-slate-500 uppercase">Offers</div>
                  <div className="text-2xl font-black text-[#1E1B4B] mt-1">{acceptedOffers.length}</div>
                </div>
                <div onClick={() => setActiveTab("internships")} className="bg-white border border-[#3B3588]/10 p-5 rounded-3xl cursor-pointer hover:shadow-md transition">
                  <div className="text-xs font-bold text-slate-500 uppercase">Available Roles</div>
                  <div className="text-2xl font-black text-[#1E1B4B] mt-1">{filteredJobs.length}</div>
                </div>
              </section>
            </>
          )}

          {/* Applications Tab */}
          {activeTab === "applications" && (
            <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-black text-[#1E1B4B]">My Applications ({myApplications.length})</h2>

              {myApplications.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">No active applications. Explore open positions to apply!</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myApplications.map((app) => (
                    <div key={app.id} className="p-5 rounded-2xl border border-[#3B3588]/10 bg-[#F8F9FD] space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-sm text-[#1E1B4B]">{app.role}</h3>
                          <p className="text-xs text-slate-500">{app.company} • {app.location}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                            app.status === "ACCEPTED" || app.status === "HIRED / ACCEPTED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : app.status === "REJECTED"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : app.status === "INTERVIEWING" || app.status === "SHORTLISTED"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-indigo-50 text-indigo-700 border-indigo-200"
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>

                      {Array.isArray(app.interviews) && app.interviews.length > 0 && (
                        <div className="p-3 bg-white border border-amber-200 rounded-xl space-y-1.5">
                          <div className="text-[11px] font-bold text-amber-800 flex items-center gap-1.5">
                            <Video className="w-3.5 h-3.5" /> {app.interviews[0].roundName || "Interview Scheduled"}
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-500">
                            <span>{app.interviews[0].formattedTime || "Upcoming"}</span>
                            <a
                              href={app.interviews[0].meetingUrl || "https://meet.google.com"}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 bg-[#202960] text-white font-bold rounded-full flex items-center gap-1"
                            >
                              Join Call <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-[#3B3588]/10 text-xs">
                        <span className="font-black text-[#202960]">{app.stipend}</span>
                        <button
                          onClick={() => handleWithdrawApplication(app.id, app.role)}
                          className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Withdraw
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Explore Openings Tab */}
          {activeTab === "internships" && (
            <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-black text-[#1E1B4B]">Live Openings</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Explore active positions and inspect job descriptions before applying.</p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search roles, skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredJobs.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-slate-400 text-xs">
                    No active internship openings available right now.
                  </div>
                ) : (
                  filteredJobs.map((job) => {
                    const isApplied = myApplications.some(
                      (a) =>
                        String(a.internshipId).trim() === String(job.id).trim() ||
                        (String(a.role).trim().toLowerCase() === String(job.title).trim().toLowerCase() &&
                          String(a.company || "").trim().toLowerCase() === String(job.company || "").trim().toLowerCase())
                    );

                    return (
                      <div
                        key={job.id}
                        className="p-5 rounded-2xl border border-[#3B3588]/10 bg-[#F8F9FD] space-y-4 flex flex-col justify-between hover:shadow-md transition"
                      >
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-sm text-[#1E1B4B] capitalize">{job.title}</h3>
                              <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5 text-slate-400" /> {job.company} &bull; {job.location}
                              </p>
                            </div>
                            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-[10px] font-black uppercase">
                              {job.mode}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {(job.skills || []).map((s: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold text-slate-600 shadow-2xs"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#3B3588]/10 flex items-center justify-between gap-2">
                          <span className="font-black text-xs text-[#202960]">{formatStipend(job.stipend)}</span>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setViewingJobDetails(job)}
                              className="px-3.5 py-1.5 rounded-full border border-[#202960]/20 text-[#202960] font-bold text-xs hover:bg-[#EDF0FF] transition cursor-pointer"
                            >
                              Description
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedJob(job);
                                setApplyModalOpen(true);
                              }}
                              disabled={isApplied}
                              className={`px-4 py-1.5 text-xs font-bold rounded-full transition cursor-pointer ${
                                isApplied
                                  ? "bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300"
                                  : "bg-[#202960] hover:bg-[#2E2A72] text-white shadow-sm"
                              }`}
                            >
                              {isApplied ? "Applied ✓" : "Apply"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          )}

          {/* Scheduled Interviews Tab */}
          {activeTab === "interviews" && (
            <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-black text-[#1E1B4B]">Scheduled Technical Interviews ({allScheduledInterviews.length})</h2>

              {allScheduledInterviews.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">No technical rounds scheduled yet. When shortlisted by recruiters, call links will appear here.</div>
              ) : (
                <div className="space-y-4">
                  {allScheduledInterviews.map((intv) => (
                    <div key={intv.id} className="p-5 rounded-2xl border border-[#3B3588]/10 bg-[#F8F9FD] flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#1E1B4B]">{intv.role}</span>
                          <span className="text-xs text-slate-400">• {intv.company}</span>
                        </div>
                        <p className="text-xs font-semibold text-[#202960]">{intv.round}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> {intv.time}
                        </p>
                      </div>
                      <a
                        href={intv.meetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-5 py-2.5 bg-[#202960] hover:bg-[#2E2A72] text-white text-xs font-bold rounded-full flex items-center gap-2 shadow-md self-start sm:self-auto"
                      >
                        Join Video Meeting <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Offers Tab */}
          {activeTab === "offers" && (
            <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-black text-[#1E1B4B]">Appointment Letters & Confirmation</h2>
              {acceptedOffers.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">No offers extended yet. Complete interviews to receive letters.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {acceptedOffers.map((offer) => (
                    <div key={offer.id} className="p-6 rounded-3xl border border-emerald-300 bg-emerald-50/30 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-base text-[#1E1B4B]">{offer.role}</h3>
                          <p className="text-xs font-semibold text-slate-600">{offer.company}</p>
                        </div>
                        <Award className="w-6 h-6 text-emerald-600" />
                      </div>

                      <div className="text-xs space-y-1">
                        <div>Stipend: <strong>{offer.stipend}</strong></div>
                        <div>Status: <span className="font-bold text-emerald-700">{offer.status}</span></div>
                      </div>

                      <button
                        onClick={() => { setSelectedOfferApp(offer); setOfferModalOpen(true); }}
                        className="w-full py-2.5 bg-[#202960] text-white font-bold text-xs rounded-xl hover:bg-[#2E2A72] cursor-pointer"
                      >
                        Inspect & Formally Confirm Offer
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Complete Student Profile Tab */}
          {activeTab === "profile" && (
            <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 max-w-4xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-[#1E1B4B]">Student Profile & Portfolio</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage your identity, academic records, portfolio links, and technical skillset.
                  </p>
                </div>
                {profileSaved && (
                  <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Profile Updated Successfully!
                  </div>
                )}
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6 text-xs font-medium">
                <div>
                  <h3 className="text-xs font-black uppercase text-indigo-950 tracking-wider mb-3">1. Personal Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-[#1E1B4B] mb-1.5">Full Name *</label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F8F9FD] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#202960]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-[#1E1B4B] mb-1.5">Email Address *</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F8F9FD] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#202960]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-[#1E1B4B] mb-1.5">Contact Number</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={profile.phone || ""}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F8F9FD] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#202960]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-black uppercase text-indigo-950 tracking-wider mb-3">2. Academic Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-[#1E1B4B] mb-1.5">College / Department</label>
                      <div className="relative">
                        <GraduationCap className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="text"
                          placeholder="e.g. Computer Science"
                          value={profile.department}
                          onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F8F9FD] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#202960]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-[#1E1B4B] mb-1.5">Graduation Year</label>
                      <input
                        type="text"
                        placeholder="2026"
                        value={profile.gradYear || ""}
                        onChange={(e) => setProfile({ ...profile, gradYear: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FD] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#202960]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#1E1B4B] mb-1.5">CGPA / Percentage</label>
                      <input
                        type="text"
                        placeholder="e.g. 8.8 / 10"
                        value={profile.cgpa || ""}
                        onChange={(e) => setProfile({ ...profile, cgpa: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FD] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#202960]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-black uppercase text-indigo-950 tracking-wider mb-3">3. Links & Portfolio</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-[#1E1B4B] mb-1.5">LinkedIn Profile</label>
                      <div className="relative">
                        <Linkedin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="url"
                          placeholder="https://linkedin.com/in/..."
                          value={profile.linkedinUrl}
                          onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F8F9FD] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#202960]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-[#1E1B4B] mb-1.5">GitHub Profile</label>
                      <div className="relative">
                        <Github className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="url"
                          placeholder="https://github.com/..."
                          value={profile.githubUrl}
                          onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F8F9FD] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#202960]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-[#1E1B4B] mb-1.5">Personal Website</label>
                      <div className="relative">
                        <Globe className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="url"
                          placeholder="https://portfolio.dev"
                          value={profile.portfolioUrl}
                          onChange={(e) => setProfile({ ...profile, portfolioUrl: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F8F9FD] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#202960]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h3 className="text-xs font-black uppercase text-indigo-950 tracking-wider mb-1">4. Technical Background</h3>
                  <div>
                    <label className="block font-bold text-[#1E1B4B] mb-1.5">Core Technical Skills (Comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. React, Next.js, Python, PostgreSQL, C++, Embedded Systems"
                      value={profile.skills}
                      onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#F8F9FD] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#202960]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#1E1B4B] mb-1.5">Professional Bio</label>
                    <textarea
                      rows={3}
                      placeholder="Brief overview of your focus areas, projects, and target roles..."
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      className="w-full p-3 rounded-xl bg-[#F8F9FD] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#202960] leading-relaxed"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#202960] hover:bg-[#2E2A72] text-white font-bold rounded-full transition shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Save Profile Details
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>
      </main>

      {/* JOB DESCRIPTION MODAL */}
      {viewingJobDetails && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#3B3588]/15 rounded-[32px] w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase">
                  {viewingJobDetails.mode}
                </span>
                <h3 className="text-lg font-black text-[#1E1B4B] mt-1 capitalize">{viewingJobDetails.title}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" /> {viewingJobDetails.company} &bull; <MapPin className="w-3.5 h-3.5 text-slate-400" /> {viewingJobDetails.location}
                </p>
              </div>
              <button
                onClick={() => setViewingJobDetails(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600 bg-[#F8F9FD] p-5 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Role Overview & Responsibilities
                </span>
                <p className="leading-relaxed text-slate-700">
                  {viewingJobDetails.description || "Hands-on internship position with direct team mentorship and real-world system delivery exposure."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/60 font-semibold">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Monthly Stipend</span>
                  <span className="text-[#202960] font-black">{formatStipend(viewingJobDetails.stipend)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Duration</span>
                  <span className="text-slate-700 font-bold">{viewingJobDetails.durationMonths || 6} Months</span>
                </div>
              </div>

              {Array.isArray(viewingJobDetails.skills) && viewingJobDetails.skills.length > 0 && (
                <div className="pt-3 border-t border-slate-200/60 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Required Skills & Technologies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingJobDetails.skills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold text-slate-700 shadow-2xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewingJobDetails(null)}
                className="px-4 py-2 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-100 transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const jobToApply = viewingJobDetails;
                  setViewingJobDetails(null);
                  setSelectedJob(jobToApply);
                  setApplyModalOpen(true);
                }}
                disabled={myApplications.some(
                  (a) =>
                    String(a.internshipId).trim() === String(viewingJobDetails.id).trim() ||
                    (String(a.role).trim().toLowerCase() === String(viewingJobDetails.title).trim().toLowerCase() &&
                      String(a.company || "").trim().toLowerCase() === String(viewingJobDetails.company || "").trim().toLowerCase())
                )}
                className="px-6 py-2.5 rounded-full bg-[#202960] hover:bg-[#2E2A72] text-white text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-50"
              >
                {myApplications.some(
                  (a) =>
                    String(a.internshipId).trim() === String(viewingJobDetails.id).trim() ||
                    (String(a.role).trim().toLowerCase() === String(viewingJobDetails.title).trim().toLowerCase() &&
                      String(a.company || "").trim().toLowerCase() === String(viewingJobDetails.company || "").trim().toLowerCase())
                )
                  ? "Already Applied ✓"
                  : "Proceed to Apply"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPLY MODAL */}
      {applyModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-[#1E1B4B]">Apply for {selectedJob.title}</h3>
              <button onClick={() => setApplyModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {applyStatusMessage && (
              <div className={`p-3 rounded-xl text-xs font-bold ${applyStatusMessage.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
                {applyStatusMessage.text}
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#1E1B4B] mb-1">Upload Resume (PDF / Doc)</label>
                <div className="flex items-center gap-2 p-3 bg-[#F8F9FD] border border-slate-200 rounded-xl">
                  <UploadCloud className="w-5 h-5 text-indigo-600" />
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="text-xs text-slate-600 cursor-pointer" />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Selected: {applyFormData.resumeFileName}</span>
              </div>

              <div>
                <label className="block font-bold text-[#1E1B4B] mb-1">Cover Note</label>
                <textarea
                  rows={3}
                  value={applyFormData.coverLetter}
                  onChange={(e) => setApplyFormData({ ...applyFormData, coverLetter: e.target.value })}
                  className="w-full p-2.5 bg-[#F8F9FD] border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setApplyModalOpen(false)} className="px-4 py-2 text-slate-500 font-bold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={isApplying} className="px-5 py-2 bg-[#202960] text-white font-bold rounded-xl cursor-pointer">
                  {isApplying ? "Submitting..." : "Confirm & Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFER LETTER MODAL */}
      {offerModalOpen && selectedOfferApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#3B3588]/15 rounded-[32px] w-full max-w-2xl p-6 sm:p-10 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg text-[#1E1B4B]">{selectedOfferApp.company}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Verified Partner
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Official Internship Appointment Letter</p>
                </div>
              </div>
              <button onClick={() => setOfferModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-slate-700 bg-[#F8F9FD] p-6 rounded-2xl border border-slate-200/80">
              <div className="flex justify-between items-center text-[11px] text-slate-500 pb-2 border-b border-slate-200/60">
                <span>Date Issued: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                <span className="font-mono text-indigo-700 font-bold">REF: VIC-OFFER-{selectedOfferApp.id || "2026-X"}</span>
              </div>

              <p>Dear <strong className="text-[#1E1B4B]">{profile.name}</strong>,</p>
              <p>Following your interview evaluation, we are pleased to offer you the position of <strong className="text-[#1E1B4B]">{selectedOfferApp.role}</strong> at <strong className="text-[#1E1B4B]">{selectedOfferApp.company}</strong>.</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-white rounded-xl border border-slate-200 font-semibold text-slate-800 text-[11px]">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Designation</span>
                  {selectedOfferApp.role}
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Monthly Stipend</span>
                  <span className="text-emerald-700 font-black">{formatStipend(selectedOfferApp.stipend)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Location & Mode</span>
                  {selectedOfferApp.location}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200/60 flex justify-between items-end">
                <div>
                  <div className="font-bold text-[#1E1B4B]">{selectedOfferApp.company} Recruitment Team</div>
                  <div className="text-[10px] text-slate-400">Authorized by Visionary Interns Club Ecosystem</div>
                </div>
                <div className="px-3 py-1 bg-emerald-100 text-emerald-800 font-black text-[10px] rounded-lg">
                  OFFICIAL OFFER ISSUED
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => window.print()} className="px-4 py-2.5 rounded-full border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                <Printer className="w-3.5 h-3.5" /> Print Letter
              </button>
              {selectedOfferApp.status !== "HIRED / ACCEPTED" ? (
                <button
                  onClick={() => handleAcceptOffer(selectedOfferApp.id)}
                  className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Formally Accept Offer
                </button>
              ) : (
                <button onClick={() => setOfferModalOpen(false)} className="px-6 py-2.5 rounded-full bg-[#202960] text-white text-xs font-bold cursor-pointer">
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}