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
  Globe,
  Linkedin,
  Github,
  Save,
  BookOpen,
  PartyPopper,
  Printer,
  ShieldCheck,
  Tag
} from "lucide-react";

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

export default function StudentDashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "applications" | "internships" | "interviews" | "offers" | "profile">("overview");

  const [studentToken, setStudentToken] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    name: "Sukruthi",
    email: "sukruthi@gmail.com",
    department: "Computer Science & Engineering",
    bio: "Passionate engineer focusing on embedded architectures, real-time telemetry, and modern full-stack systems.",
    linkedinUrl: "https://linkedin.com",
    githubUrl: "https://github.com",
    portfolioUrl: "https://portfolio.dev",
    skills: "React, Next.js, Node.js, Python, PostgreSQL, FreeRTOS, C++"
  });

  const [profileSaved, setProfileSaved] = useState(false);

  // Offer Letter Modal State
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [selectedOfferApp, setSelectedOfferApp] = useState<any | null>(null);

  // Real-time Live Toast Banner
  const [liveToast, setLiveToast] = useState<{ title: string; desc: string; app?: any } | null>(null);

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyFormData, setApplyFormData] = useState({
    resumeUrl: "https://storage.vic.edu/resumes/resume.pdf",
    coverLetter: "I am excited to contribute my engineering skills to your organization.",
    githubUrl: "https://github.com",
    portfolioUrl: "https://portfolio.dev"
  });
  const [applyStatusMessage, setApplyStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);

  // Cross-Tab Broadcast Helper
  const notifyPipeline = useCallback((payload: { type: string; data?: any }) => {
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const bc = new BroadcastChannel("vic_realtime_pipeline");
        bc.postMessage(payload);
        setTimeout(() => bc.close(), 100);
      }
    } catch (e) {}
    window.dispatchEvent(new CustomEvent("vic_pipeline_sync", { detail: payload }));
  }, []);

  // Synchronized Data Fetcher with Composite Deduplication
  const fetchBackendData = useCallback(async (token?: string | null) => {
    const currentToken = token || studentToken || localStorage.getItem("student_token");
    const userEmail = (profile.email || "sukruthi@gmail.com").trim().toLowerCase();

    // 1. Load Notifications
    try {
      const storedNotifs: any[] = JSON.parse(localStorage.getItem("vic_student_notifications") || "[]");
      const myNotifs = storedNotifs.filter(
        (n) => !n.candidateEmail || String(n.candidateEmail).toLowerCase() === userEmail
      );
      setNotifications(myNotifs);
    } catch (e) {}

    try {
      // 2. Fetch & Deduplicate Available Jobs
      let backendFormatted: any[] = [];
      const jobsRes = await fetch("http://127.0.0.1:3000/api/internships?status=ACTIVE").catch(() => null);
      if (jobsRes && jobsRes.ok) {
        const jobsData = await jobsRes.json();
        if (Array.isArray(jobsData.internships)) {
          backendFormatted = jobsData.internships.map((j: any) => ({
            id: j.id,
            title: j.title,
            company: j.company?.companyName || "Verified Partner",
            location: j.location || "Bengaluru",
            mode: j.mode || "HYBRID",
            stipend: formatStipend(j.stipend),
            durationMonths: j.durationMonths || 6,
            deadline: "Open until filled",
            description: j.description || "Hands-on internship position with direct team mentorship.",
            skills: Array.isArray(j.skills) ? j.skills : ["General Engineering"]
          }));
        }
      }

      let localJobs: any[] = [];
      try {
        const customJobsStr = localStorage.getItem("vic_custom_jobs");
        if (customJobsStr) {
          localJobs = JSON.parse(customJobsStr);
        }
      } catch (e) {}

      // Global Deleted Jobs Exclusion List
      const deletedIds = new Set(JSON.parse(localStorage.getItem("vic_deleted_jobs") || "[]"));

      const jobMap = new Map<string, any>();
      [...backendFormatted, ...localJobs].forEach((job) => {
        if (!deletedIds.has(job.id)) {
          const dedupeKey = `${String(job.title).trim().toLowerCase()}::${String(job.company || "").trim().toLowerCase()}`;
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

      setAvailableJobs(Array.from(jobMap.values()));

      // 3. Fetch & Deduplicate Candidate Applications
      let syncedApplications: any[] = [];
      if (currentToken) {
        const appsRes = await fetch("http://127.0.0.1:3000/api/applications/my-applications", {
          headers: { Authorization: `Bearer ${currentToken}` }
        }).catch(() => null);

        if (appsRes && appsRes.ok) {
          const appsData = await appsRes.json();
          if (Array.isArray(appsData.applications)) {
            syncedApplications = appsData.applications.map((a: any) => ({
              id: a.id,
              internshipId: a.internshipId,
              role: a.internship?.title || "Engineering Intern",
              company: a.internship?.company?.companyName || "Partner Organization",
              appliedDate: formatDateSafe(a.createdAt),
              stipend: formatStipend(a.internship?.stipend),
              status: a.status || "APPLIED",
              location: `${a.internship?.location || "Bengaluru"} • ${a.internship?.mode || "HYBRID"}`,
              resumeUrl: a.resumeUrl,
              coverLetter: a.coverLetter,
              interviews: a.interviews || []
            }));
          }
        }
      }

      let myStoredApps: any[] = [];
      try {
        const storedApps: any[] = JSON.parse(localStorage.getItem("vic_applications") || "[]");
        myStoredApps = storedApps
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
      } catch (e) {}

      // Composite Deduplication by Role + Company
      const mergedMap = new Map<string, any>();
      [...myStoredApps, ...syncedApplications].forEach((app) => {
        const dedupeKey = `${String(app.role || "").trim().toLowerCase()}::${String(app.company || "").trim().toLowerCase()}`;
        if (!mergedMap.has(dedupeKey)) {
          mergedMap.set(dedupeKey, app);
        } else {
          const existing = mergedMap.get(dedupeKey);
          if ((!existing.interviews || existing.interviews.length === 0) && (app.interviews && app.interviews.length > 0)) {
            mergedMap.set(dedupeKey, { ...existing, interviews: app.interviews, status: app.status });
          } else if (existing.status === "APPLIED" && app.status !== "APPLIED") {
            mergedMap.set(dedupeKey, { ...existing, status: app.status });
          }
        }
      });

      setMyApplications(Array.from(mergedMap.values()));
    } catch (e) {}
  }, [studentToken, profile.email]);

  useEffect(() => {
    const storedStudent = localStorage.getItem("student_data");
    const storedToken = localStorage.getItem("student_token");

    if (storedStudent) {
      try {
        const parsed = JSON.parse(storedStudent);
        setProfile((prev) => ({
          ...prev,
          name: parsed.name || prev.name,
          email: parsed.email || prev.email,
          department: parsed.department || prev.department,
          bio: parsed.bio || prev.bio,
          linkedinUrl: parsed.linkedinUrl || prev.linkedinUrl,
          githubUrl: parsed.githubUrl || prev.githubUrl,
          portfolioUrl: parsed.portfolioUrl || prev.portfolioUrl,
          skills: parsed.skills || prev.skills
        }));
      } catch (e) {}
    }

    if (storedToken) {
      setStudentToken(storedToken);
      fetchBackendData(storedToken);
    } else {
      fetch("http://127.0.0.1:3000/api/student/dev-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profile.email })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.token) {
            localStorage.setItem("student_token", data.token);
            setStudentToken(data.token);
            fetchBackendData(data.token);
          }
        })
        .catch(() => null);
    }

    // BroadcastChannel Listener for Sub-Millisecond Cross-Tab Sync
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        bc = new BroadcastChannel("vic_realtime_pipeline");
        bc.onmessage = (event) => {
          fetchBackendData();

          if (event.data?.type === "DECISION_UPDATED" && event.data?.data) {
            const userEmail = (profile.email || "sukruthi@gmail.com").trim().toLowerCase();
            if (String(event.data.data.candidateEmail).toLowerCase() === userEmail) {
              if (event.data.data.newStatus === "ACCEPTED") {
                setLiveToast({
                  title: "🎉 Offer Letter Extended!",
                  desc: `Your application for "${event.data.data.role}" was accepted by recruiters.`
                });
              }
            }
          }
        };
      }
    } catch (e) {}

    const handlePipelineUpdate = (e: any) => {
      fetchBackendData();
      if (e?.detail?.type === "ACCEPTED" || e?.detail?.newStatus === "ACCEPTED") {
        setLiveToast({
          title: "🎉 Offer Letter Extended!",
          desc: e.detail.text || "Your application was accepted by recruiters."
        });
      }
    };

    window.addEventListener("vic_pipeline_sync", handlePipelineUpdate);
    window.addEventListener("vic_student_decision", handlePipelineUpdate);
    window.addEventListener("storage", handlePipelineUpdate);

    return () => {
      if (bc) bc.close();
      window.removeEventListener("vic_pipeline_sync", handlePipelineUpdate);
      window.removeEventListener("vic_student_decision", handlePipelineUpdate);
      window.removeEventListener("storage", handlePipelineUpdate);
    };
  }, [fetchBackendData, profile.email]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("student_data", JSON.stringify(profile));
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return availableJobs;
    const q = searchQuery.toLowerCase();
    return availableJobs.filter(
      (j) =>
        j.title?.toLowerCase().includes(q) ||
        (j.company && j.company.toLowerCase().includes(q)) ||
        (j.location && j.location.toLowerCase().includes(q)) ||
        (j.skills && j.skills.some((s: string) => s.toLowerCase().includes(q)))
    );
  }, [availableJobs, searchQuery]);

  const allScheduledInterviews = useMemo(() => {
    const list: any[] = [];
    myApplications.forEach((app) => {
      if (Array.isArray(app.interviews) && app.interviews.length > 0) {
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
    return myApplications.filter((a) => a.status === "ACCEPTED" || a.status === "OFFERED");
  }, [myApplications]);

  const activeOfferApp = useMemo(() => {
    return acceptedOffers[0] || null;
  }, [acceptedOffers]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllNotifsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem("vic_student_notifications", JSON.stringify(updated));
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setIsApplying(true);
    setApplyStatusMessage(null);

    const userEmail = (profile.email || "sukruthi@gmail.com").trim().toLowerCase();
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
      setApplyStatusMessage({
        type: "error",
        text: "You have already applied for this position. Duplicate applications are rejected."
      });
      setIsApplying(false);
      return;
    }

    try {
      const currentDateFormatted = formatDateSafe(new Date());

      const newApp = {
        id: `app-${Date.now()}`,
        internshipId: selectedJob.id,
        role: selectedJob.title,
        name: profile.name,
        email: userEmail,
        company: selectedJob.company || "Accenture",
        appliedDate: currentDateFormatted,
        appliedAt: currentDateFormatted,
        stipend: formatStipend(selectedJob.stipend),
        status: "APPLIED",
        location: `${selectedJob.location} • ${selectedJob.mode}`,
        resumeUrl: applyFormData.resumeUrl,
        coverLetter: applyFormData.coverLetter,
        interviews: []
      };

      // Store in shared local storage pipeline
      const existingApps: any[] = JSON.parse(localStorage.getItem("vic_applications") || "[]");
      const filteredExisting = existingApps.filter(
        (a: any) =>
          !(
            String(a.email || "").toLowerCase() === userEmail &&
            String(a.role || "").toLowerCase() === targetJobTitle &&
            String(a.company || "").toLowerCase() === targetJobCompany
          )
      );

      localStorage.setItem("vic_applications", JSON.stringify([newApp, ...filteredExisting]));

      // Optional Backend sync if UUID
      if (studentToken && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(selectedJob.id)) {
        await fetch("http://127.0.0.1:3000/api/applications/student/apply", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${studentToken}`
          },
          body: JSON.stringify({
            internshipId: selectedJob.id,
            resumeUrl: applyFormData.resumeUrl,
            coverLetter: applyFormData.coverLetter,
            githubUrl: applyFormData.githubUrl,
            portfolioUrl: applyFormData.portfolioUrl
          })
        }).catch(() => null);
      }

      // Broadcast update to Company portal
      notifyPipeline({
        type: "APPLICATION_SUBMITTED",
        data: {
          name: newApp.name,
          role: selectedJob.title,
          company: selectedJob.company,
          email: userEmail
        }
      });

      setMyApplications((prev) => [newApp, ...prev]);

      setApplyStatusMessage({
        type: "success",
        text: `Application for "${selectedJob.title}" submitted successfully!`
      });

      setTimeout(() => {
        setApplyModalOpen(false);
        setSelectedJob(null);
        setApplyStatusMessage(null);
        setActiveTab("applications");
      }, 1200);
    } catch (err: any) {
      setApplyStatusMessage({
        type: "error",
        text: err.message || "Failed to submit application"
      });
    } finally {
      setIsApplying(false);
    }
  };

  const studentInitials = useMemo(() => {
    if (!profile.name) return "SU";
    const parts = profile.name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : profile.name.substring(0, 2).toUpperCase();
  }, [profile.name]);

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-slate-800 flex flex-col md:flex-row font-sans relative">
      {/* Real-time Toast */}
      {liveToast && (
        <div className="fixed top-5 right-5 z-50 max-w-sm bg-white border-2 border-emerald-500 rounded-3xl shadow-2xl p-4 flex items-start gap-3 animate-in slide-in-from-top-5 duration-300">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <PartyPopper className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <h4 className="font-black text-xs text-[#1E1B4B]">{liveToast.title}</h4>
            <p className="text-[11px] text-slate-500">{liveToast.desc}</p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  setActiveTab("offers");
                  setLiveToast(null);
                }}
                className="px-3 py-1 bg-emerald-600 text-white font-bold text-[10px] rounded-full hover:bg-emerald-700 transition"
              >
                Inspect Offers
              </button>
              <button
                onClick={() => setLiveToast(null)}
                className="text-[10px] font-semibold text-slate-400 hover:text-slate-600"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button onClick={() => setLiveToast(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 md:w-64 border-r border-[#3B3588]/10 bg-white p-6 flex flex-col justify-between shadow-2xl md:shadow-sm transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-2xl overflow-hidden flex items-center justify-center bg-white border border-[#3B3588]/10 shadow-sm transition-transform group-hover:scale-105">
                <Image
                  src="/logo.jpg"
                  alt="Visionary Interns Club Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <div className="font-black text-sm tracking-tight text-[#1E1B4B] uppercase">
                  Visionary Interns
                </div>
                <div className="text-[11px] font-bold text-[#3B3588]">Student Portal</div>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            onClick={() => setActiveTab("profile")}
            className="p-3.5 rounded-2xl bg-[#EDF0FF] border border-[#3B3588]/10 flex items-center justify-between cursor-pointer hover:border-[#202960]/30 transition"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#202960] text-white font-bold flex items-center justify-center text-xs shadow-sm">
                {studentInitials}
              </div>
              <div className="text-left">
                <div className="font-bold text-xs text-[#1E1B4B] truncate max-w-[120px]">{profile.name}</div>
                <div className="text-[10px] text-indigo-700 font-semibold">Verified Member</div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <nav className="space-y-1.5 text-xs font-bold">
            <button
              onClick={() => {
                setActiveTab("overview");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeTab === "overview"
                  ? "bg-[#202960] text-white shadow-md shadow-[#202960]/20"
                  : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF] hover:text-[#202960]"
              }`}
            >
              <Award className="w-4 h-4" /> Overview
            </button>

            <button
              onClick={() => {
                setActiveTab("applications");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeTab === "applications"
                  ? "bg-[#202960] text-white shadow-md shadow-[#202960]/20"
                  : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF] hover:text-[#202960]"
              }`}
            >
              <FileText className="w-4 h-4" /> My Applications ({myApplications.length})
            </button>

            <button
              onClick={() => {
                setActiveTab("internships");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeTab === "internships"
                  ? "bg-[#202960] text-white shadow-md shadow-[#202960]/20"
                  : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF] hover:text-[#202960]"
              }`}
            >
              <Briefcase className="w-4 h-4" /> Explore Openings ({availableJobs.length})
            </button>

            <button
              onClick={() => {
                setActiveTab("interviews");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeTab === "interviews"
                  ? "bg-[#202960] text-white shadow-md shadow-[#202960]/20"
                  : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF] hover:text-[#202960]"
              }`}
            >
              <Video className="w-4 h-4" /> Live Interviews ({allScheduledInterviews.length})
            </button>

            <button
              onClick={() => {
                setActiveTab("offers");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition ${
                activeTab === "offers"
                  ? "bg-[#202960] text-white shadow-md shadow-[#202960]/20"
                  : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF] hover:text-[#202960]"
              }`}
            >
              <span className="flex items-center gap-3">
                <PartyPopper className="w-4 h-4 text-emerald-500" /> Offers & Letters
              </span>
              {acceptedOffers.length > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === "offers" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {acceptedOffers.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab("profile");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeTab === "profile"
                  ? "bg-[#202960] text-white shadow-md shadow-[#202960]/20"
                  : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF] hover:text-[#202960]"
              }`}
            >
              <User className="w-4 h-4" /> My Profile
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-[#3B3588]/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#202960] text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {studentInitials}
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-[#1E1B4B] truncate max-w-[110px]" title={profile.name}>
                {profile.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[110px]" title={profile.email}>
                {profile.email}
              </div>
            </div>
          </div>
          <Link
            href="/"
            onClick={() => {
              localStorage.removeItem("student_token");
              localStorage.removeItem("student_data");
            }}
            className="p-2 text-slate-400 hover:text-red-600 transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 md:h-18 px-4 sm:px-8 border-b border-[#3B3588]/10 bg-white flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-[#202960] hover:bg-[#EDF0FF] transition"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <span className="hidden sm:inline">Student</span>
              <span className="hidden sm:inline">/</span>
              <span className="text-[#1E1B4B] capitalize">{activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2.5 rounded-full bg-[#F8F9FD] border border-[#3B3588]/15 text-slate-600 hover:text-[#202960] transition cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-[#3B3588]/15 rounded-3xl shadow-2xl p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#1E1B4B]">Your Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-[#EDF0FF] text-[#202960] text-[10px] font-black">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotifsRead}
                        className="text-[11px] font-bold text-[#202960] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-2xl text-xs transition ${
                            n.read
                              ? "bg-[#F8F9FD] text-slate-500"
                              : n.type === "ACCEPTED"
                              ? "bg-purple-50 text-purple-950 font-semibold border border-purple-200"
                              : n.type === "REJECTED"
                              ? "bg-red-50 text-red-950 font-semibold border border-red-200"
                              : "bg-[#EDF0FF]/80 text-slate-800 font-medium border border-indigo-100"
                          }`}
                        >
                          <p className="line-clamp-3">{n.text}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block font-normal">{n.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveTab("internships")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#202960] hover:bg-[#2E2A72] text-white font-bold text-xs shadow-md shadow-[#202960]/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" /> Find Internships
            </button>
          </div>
        </header>

        {/* Dynamic Views */}
        <div className="p-4 sm:p-8 space-y-8 max-w-7xl">
          {activeOfferApp && (
            <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-purple-500/10 to-indigo-500/10 border border-emerald-300 flex items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <PartyPopper className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-[#1E1B4B]">Congratulations! You have an active Internship Offer!</h2>
                  <p className="text-xs text-slate-600">
                    Your application for <strong>{activeOfferApp.role}</strong> with <strong>{activeOfferApp.company}</strong> was approved!
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedOfferApp(activeOfferApp);
                  setOfferModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-full bg-[#202960] hover:bg-[#2E2A72] text-white text-xs font-bold transition shadow-md shadow-[#202960]/20 shrink-0 cursor-pointer"
              >
                View Offer Details
              </button>
            </div>
          )}

          {/* 1. OVERVIEW TAB */}
          {activeTab === "overview" && (
            <>
              <section className="bg-gradient-to-br from-[#EDF0FF] via-white to-[#F8F9FD] border border-[#3B3588]/10 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#202960]/5 text-[#202960] text-[11px] font-black uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" /> Career Acceleration
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#1E1B4B] tracking-tight">
                    Hello, {profile.name}!
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
                    Track applications, join scheduled technical interview rounds, and inspect official offer letters.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("internships")}
                  className="px-5 py-3 rounded-full bg-[#202960] text-white font-bold text-xs hover:bg-[#2E2A72] transition shadow-md shadow-[#202960]/20 cursor-pointer"
                >
                  Browse {availableJobs.length} Positions
                </button>
              </section>

              <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                <div
                  onClick={() => setActiveTab("applications")}
                  className="bg-white border border-[#3B3588]/10 p-5 sm:p-6 rounded-3xl shadow-sm hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Applications</span>
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#1E1B4B]">{myApplications.length}</div>
                  <div className="text-[11px] text-indigo-600 font-bold mt-1">Submitted</div>
                </div>

                <div
                  onClick={() => setActiveTab("interviews")}
                  className="bg-white border border-[#3B3588]/10 p-5 sm:p-6 rounded-3xl shadow-sm hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Interviews</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Video className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#1E1B4B]">{allScheduledInterviews.length}</div>
                  <div className="text-[11px] text-amber-600 font-bold mt-1">Active Rounds</div>
                </div>

                <div
                  onClick={() => setActiveTab("offers")}
                  className="bg-white border border-[#3B3588]/10 p-5 sm:p-6 rounded-3xl shadow-sm hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Offers Received</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Award className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#1E1B4B]">
                    {acceptedOffers.length}
                  </div>
                  <div className="text-[11px] text-purple-600 font-bold mt-1">Verified Selected</div>
                </div>

                <div
                  onClick={() => setActiveTab("internships")}
                  className="bg-white border border-[#3B3588]/10 p-5 sm:p-6 rounded-3xl shadow-sm hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Open Positions</span>
                    <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                      <Briefcase className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#1E1B4B]">{availableJobs.length}</div>
                  <div className="text-[11px] text-emerald-600 font-bold mt-1">Live listings</div>
                </div>
              </section>

              {/* Applications Table */}
              <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-black text-[#1E1B4B]">My Active Applications</h2>
                    <p className="text-xs text-slate-500">Real-time status updates synced directly from recruiters.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("applications")}
                    className="text-xs font-bold text-[#202960] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    View Pipeline <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  {myApplications.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs">
                      No applications submitted yet. Browse open positions to apply.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="text-[11px] uppercase font-bold text-slate-400 border-b border-slate-100">
                        <tr>
                          <th className="pb-3.5 font-bold">Role Title</th>
                          <th className="pb-3.5 font-bold">Company</th>
                          <th className="pb-3.5 font-bold">Applied On</th>
                          <th className="pb-3.5 font-bold">Stipend</th>
                          <th className="pb-3.5 font-bold">Live Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {myApplications.map((app) => (
                          <tr key={app.id} className="hover:bg-[#F8F9FD]/60 transition">
                            <td className="py-4 font-bold text-[#1E1B4B] text-sm">{app.role}</td>
                            <td className="py-4 font-medium text-slate-600">{app.company}</td>
                            <td className="py-4 text-slate-500">{formatDateSafe(app.appliedDate)}</td>
                            <td className="py-4 font-bold text-[#202960]">{formatStipend(app.stipend)}</td>
                            <td className="py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                                  app.status === "ACCEPTED" || app.status === "OFFERED"
                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                    : app.status === "REJECTED"
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : app.status === "INTERVIEWING" || app.status === "SHORTLISTED"
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-indigo-50 text-indigo-700 border-indigo-200"
                                }`}
                              >
                                {app.status === "ACCEPTED" || app.status === "OFFERED" ? "OFFER RECEIVED ✓" : app.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>
            </>
          )}

          {/* 2. MY PROFILE TAB */}
          {activeTab === "profile" && (
            <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 max-w-4xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-[#1E1B4B]">Student Profile & Portfolio</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage personal information, social links, engineering skills, and verified bio.
                  </p>
                </div>
                {profileSaved && (
                  <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Changes Saved Successfully!
                  </div>
                )}
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960] font-semibold text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960] font-semibold text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-2">
                    College & Branch
                  </label>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Computer Science & Engineering"
                      value={profile.department}
                      onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960] font-semibold text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-2">
                    Professional Bio
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of your expertise, projects, and target career domains..."
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960] leading-relaxed text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-2">
                      LinkedIn URL
                    </label>
                    <div className="relative">
                      <Linkedin className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/..."
                        value={profile.linkedinUrl}
                        onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960] text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-2">
                      GitHub URL
                    </label>
                    <div className="relative">
                      <Github className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
                      <input
                        type="url"
                        placeholder="https://github.com/..."
                        value={profile.githubUrl}
                        onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960] text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-2">
                      Portfolio Website
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
                      <input
                        type="url"
                        placeholder="https://yourportfolio.dev"
                        value={profile.portfolioUrl}
                        onChange={(e) => setProfile({ ...profile, portfolioUrl: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960] text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-2">
                    Core Technical Skills (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. React, Next.js, Node.js, Python, PostgreSQL, FreeRTOS"
                    value={profile.skills}
                    onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960] font-semibold text-slate-800"
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-full bg-[#202960] hover:bg-[#2E2A72] text-white text-xs font-bold shadow-md shadow-[#202960]/20 flex items-center gap-2 transition cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Save Profile Details
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* 3. MY APPLICATIONS TAB */}
          {activeTab === "applications" && (
            <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-black text-[#1E1B4B]">My Applications Pipeline</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Live tracking of your application reviews, interview rounds, and offers.
                </p>
              </div>

              {myApplications.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No applications submitted yet. Browse open positions to apply!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myApplications.map((app) => (
                    <div
                      key={app.id}
                      className={`p-5 rounded-2xl border transition ${
                        app.status === "ACCEPTED" || app.status === "OFFERED"
                          ? "border-emerald-300 bg-emerald-50/40 shadow-sm"
                          : app.status === "REJECTED"
                          ? "border-red-200 bg-red-50/30"
                          : "border-[#3B3588]/10 bg-[#F8F9FD]"
                      } space-y-4`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-sm text-[#1E1B4B]">{app.role}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {app.company} • {app.location}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                            app.status === "ACCEPTED" || app.status === "OFFERED"
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                              : app.status === "REJECTED"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : app.status === "INTERVIEWING" || app.status === "SHORTLISTED"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-indigo-50 text-indigo-700 border-indigo-200"
                          }`}
                        >
                          {app.status === "ACCEPTED" || app.status === "OFFERED" ? "OFFER RECEIVED ✓" : app.status}
                        </span>
                      </div>

                      {(app.status === "ACCEPTED" || app.status === "OFFERED") && (
                        <div className="p-3.5 bg-white border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                              <PartyPopper className="w-4 h-4 text-emerald-600" /> Internship Offer Extended!
                            </div>
                            <p className="text-[11px] text-slate-600">
                              Stipend: <strong>{formatStipend(app.stipend)}</strong> &bull; Location: <strong>{app.location}</strong>
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedOfferApp(app);
                              setOfferModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-full transition shadow-sm shrink-0 cursor-pointer"
                          >
                            View Letter
                          </button>
                        </div>
                      )}

                      {Array.isArray(app.interviews) && app.interviews.length > 0 && (
                        <div className="p-3 bg-white border border-amber-200/80 rounded-xl space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                            <Video className="w-3.5 h-3.5" /> {app.interviews[0].roundName || "Technical Round"}
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>
                              {app.interviews[0].time ||
                                (app.interviews[0].scheduledAt
                                  ? formatDateTimeSafe(app.interviews[0].scheduledAt)
                                  : "Upcoming Round")}
                            </span>
                            <a
                              href={app.interviews[0].meetingUrl || "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1 bg-[#202960] text-white text-[11px] font-bold rounded-full flex items-center gap-1 hover:bg-[#2E2A72] transition"
                            >
                              Attend Interview <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-[#3B3588]/10 text-xs">
                        <span className="font-black text-[#202960]">{formatStipend(app.stipend)}</span>
                        <span className="text-slate-400">Applied: {formatDateSafe(app.appliedDate)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* 4. EXPLORE INTERNSHIPS TAB */}
          {activeTab === "internships" && (
            <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-black text-[#1E1B4B]">Explore Live Internship Openings</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Verified opportunities synced with recruiter listings.</p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search roles, skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
                  />
                </div>
              </div>

              {filteredJobs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No internship roles currently available. Check back soon for new openings.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredJobs.map((job) => {
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
                              <h3 className="font-bold text-sm text-[#1E1B4B]">{job.title}</h3>
                              <p className="text-xs font-semibold text-slate-600 flex items-center gap-1 mt-0.5">
                                <Building2 className="w-3.5 h-3.5 text-slate-400" /> {job.company}
                              </p>
                              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-slate-400" /> {job.location} • {job.mode}
                              </p>
                            </div>
                            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-[10px] font-black">
                              {job.mode}
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 line-clamp-2">{job.description}</p>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {(job.skills || []).map((s: string, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold text-slate-600"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#3B3588]/10 flex items-center justify-between gap-2">
                          <span className="font-black text-xs text-[#202960]">
                            {formatStipend(job.stipend)}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedJob(job);
                                setApplyModalOpen(true);
                              }}
                              className="px-3.5 py-1.5 rounded-full border border-[#202960]/20 text-[#202960] font-bold text-xs hover:bg-[#EDF0FF] transition cursor-pointer"
                            >
                              Details
                            </button>

                            <button
                              onClick={() => {
                                setSelectedJob(job);
                                setApplyModalOpen(true);
                              }}
                              disabled={isApplied}
                              className={`px-4 py-1.5 text-xs font-bold rounded-full transition ${
                                isApplied
                                  ? "bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300"
                                  : "bg-[#202960] hover:bg-[#2E2A72] text-white shadow-sm cursor-pointer"
                              }`}
                            >
                              {isApplied ? "Applied ✓" : "Apply"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* 5. SCHEDULED INTERVIEWS TAB */}
          {activeTab === "interviews" && (
            <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-black text-[#1E1B4B]">Scheduled Technical Interviews</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Live interview schedules, video room links, and evaluation statuses.
                </p>
              </div>

              {allScheduledInterviews.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No interview rounds scheduled yet. When shortlisted, meeting rooms will appear here.
                </div>
              ) : (
                <div className="space-y-4">
                  {allScheduledInterviews.map((intv) => (
                    <div
                      key={intv.id}
                      className="p-5 rounded-2xl border border-[#3B3588]/10 bg-[#F8F9FD] flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#1E1B4B]">{intv.role}</span>
                          <span className="text-xs text-slate-400">• {intv.company}</span>
                        </div>
                        <p className="text-xs font-semibold text-[#202960]">{intv.roundName}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> {intv.time}
                        </p>
                      </div>

                      <div>
                        <a
                          href={intv.meetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-5 py-2.5 bg-[#202960] hover:bg-[#2E2A72] text-white text-xs font-bold rounded-full flex items-center gap-2 shadow-md shadow-[#202960]/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        >
                          Attend Interview <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* 6. OFFERS & LETTERS TAB */}
          {activeTab === "offers" && (
            <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-black text-[#1E1B4B]">My Verified Offers & Appointment Letters</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Official internship appointment letters issued after successful technical interview rounds.
                </p>
              </div>

              {acceptedOffers.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs space-y-2">
                  <Award className="w-8 h-8 text-slate-300 mx-auto" />
                  <p>No offers issued yet. Complete scheduled technical interview rounds to receive appointment letters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {acceptedOffers.map((offer) => (
                    <div
                      key={offer.id}
                      className="p-6 rounded-3xl border border-emerald-300 bg-gradient-to-br from-emerald-50/60 via-white to-[#F8F9FD] space-y-4 shadow-sm flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                              Verified Offer
                            </span>
                            <h3 className="font-bold text-base text-[#1E1B4B] mt-1.5">{offer.role}</h3>
                            <p className="text-xs font-semibold text-slate-600 flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3.5 h-3.5 text-emerald-600" /> {offer.company}
                            </p>
                          </div>
                          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
                            <Award className="w-5 h-5" />
                          </div>
                        </div>

                        <div className="p-3.5 bg-white rounded-2xl border border-emerald-200/80 text-xs space-y-1.5">
                          <div className="flex justify-between items-center text-slate-600">
                            <span>Monthly Compensation:</span>
                            <span className="font-black text-emerald-700">{formatStipend(offer.stipend)}</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-600">
                            <span>Work Mode & Location:</span>
                            <span className="font-semibold">{offer.location}</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-500 text-[11px] pt-1 border-t border-slate-100">
                            <span>Reference Code:</span>
                            <span className="font-mono text-indigo-700 font-bold">VIC-OFFER-{offer.id}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between gap-3">
                        <span className="text-[11px] text-slate-400">Accepted & Verified</span>
                        <button
                          onClick={() => {
                            setSelectedOfferApp(offer);
                            setOfferModalOpen(true);
                          }}
                          className="px-5 py-2.5 rounded-full bg-[#202960] hover:bg-[#2E2A72] text-white text-xs font-bold shadow-md shadow-[#202960]/20 flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" /> View Official Letter
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      {/* VERIFIED OFFER LETTER MODAL */}
      {offerModalOpen && selectedOfferApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#3B3588]/15 rounded-[32px] w-full max-w-2xl p-6 sm:p-10 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shadow-sm">
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
              <button
                onClick={() => setOfferModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-slate-700 bg-[#F8F9FD] p-6 rounded-2xl border border-slate-200/80">
              <div className="flex justify-between items-center text-[11px] text-slate-500 pb-2 border-b border-slate-200/60">
                <span>Date Issued: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                <span className="font-mono text-indigo-700 font-bold">REF: VIC-OFFER-{selectedOfferApp.id || "2026-X"}</span>
              </div>

              <p>
                Dear <strong className="text-[#1E1B4B]">{profile.name}</strong>,
              </p>

              <p>
                Following your technical interview round, we are delighted to offer you the position of{" "}
                <strong className="text-[#1E1B4B]">{selectedOfferApp.role}</strong> at{" "}
                <strong className="text-[#1E1B4B]">{selectedOfferApp.company}</strong> under the Visionary Interns Club recruitment framework.
              </p>

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

              <p>
                Your performance demonstrated strong technical capability and alignment with our engineering standards. We look forward to your contributions.
              </p>

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
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-full border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print Letter
              </button>
              <button
                onClick={() => setOfferModalOpen(false)}
                className="px-6 py-2.5 rounded-full bg-[#202960] hover:bg-[#2E2A72] text-white text-xs font-bold transition shadow-md shadow-[#202960]/20 cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILS & APPLY MODAL WITH SKILLS BADGES */}
      {applyModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#3B3588]/15 rounded-[32px] w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start pb-2 border-b border-slate-100">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase">
                  {selectedJob.mode}
                </span>
                <h3 className="text-lg font-black text-[#1E1B4B] mt-1">{selectedJob.title}</h3>
                <p className="text-xs text-slate-500">{selectedJob.company} • {selectedJob.location}</p>
              </div>
              <button
                onClick={() => {
                  setApplyModalOpen(false);
                  setSelectedJob(null);
                  setApplyStatusMessage(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description, Stipend & Duration */}
            <div className="space-y-3.5 text-xs text-slate-600 bg-[#F8F9FD] p-4 rounded-2xl border border-slate-100">
              <p className="leading-relaxed">{selectedJob.description || "Hands-on internship position with direct team mentorship."}</p>
              
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 font-semibold">
                <span className="text-[#202960] font-black">
                  Stipend: {formatStipend(selectedJob.stipend)}
                </span>
                <span className="text-slate-500">Duration: {selectedJob.durationMonths || 6} Months</span>
              </div>

              {/* Skills Tag Rendering */}
              {Array.isArray(selectedJob.skills) && selectedJob.skills.length > 0 && (
                <div className="pt-2.5 border-t border-slate-200/60 space-y-1.5">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                    <Tag className="w-3.5 h-3.5 text-indigo-600" /> Required Skills & Technologies:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.skills.map((skill: string, index: number) => (
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

            {applyStatusMessage && (
              <div
                className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  applyStatusMessage.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                {applyStatusMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                {applyStatusMessage.text}
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-[#1E1B4B] uppercase tracking-wider mb-1">
                  Resume Link (PDF) *
                </label>
                <input
                  type="url"
                  required
                  value={applyFormData.resumeUrl}
                  onChange={(e) => setApplyFormData({ ...applyFormData, resumeUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1E1B4B] uppercase tracking-wider mb-1">
                  Cover Letter / Note to Recruiter
                </label>
                <textarea
                  rows={3}
                  value={applyFormData.coverLetter}
                  onChange={(e) => setApplyFormData({ ...applyFormData, coverLetter: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setApplyModalOpen(false);
                    setSelectedJob(null);
                  }}
                  className="px-4 py-2 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isApplying}
                  className="px-6 py-2.5 rounded-full bg-[#202960] hover:bg-[#2E2A72] text-white text-xs font-bold shadow-md shadow-[#202960]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition"
                >
                  {isApplying && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isApplying ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}