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
  BookOpen
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

export default function StudentDashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "applications" | "internships" | "interviews" | "profile">("overview");

  const [studentToken, setStudentToken] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    name: "ashley",
    email: "user2@gmail.com",
    department: "Computer Science & Engineering",
    bio: "Passionate engineer focusing on embedded architectures, real-time telemetry, and modern full-stack systems.",
    linkedinUrl: "https://linkedin.com",
    githubUrl: "https://github.com",
    portfolioUrl: "https://portfolio.dev",
    skills: "React, Next.js, Node.js, Python, PostgreSQL, FreeRTOS, C++"
  });

  const [profileSaved, setProfileSaved] = useState(false);

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

  // Bidirectional sync for the current authenticated student
  const fetchBackendData = useCallback(async (token?: string | null) => {
    const currentToken = token || studentToken || localStorage.getItem("student_token");
    const userEmail = (profile.email || "user2@gmail.com").trim().toLowerCase();

    try {
      // 1. Fetch Backend Active Internships
      const jobsRes = await fetch("http://127.0.0.1:3000/api/internships?status=ACTIVE").catch(() => null);
      if (jobsRes && jobsRes.ok) {
        const jobsData = await jobsRes.json();
        if (Array.isArray(jobsData.internships)) {
          const backendFormatted = jobsData.internships.map((j: any) => ({
            id: j.id,
            title: j.title,
            company: j.company?.companyName || "Verified Partner",
            location: j.location || "Bengaluru",
            mode: j.mode || "HYBRID",
            stipend: j.stipend || 0,
            durationMonths: j.durationMonths || 6,
            deadline: "Open until filled",
            description: j.description || "Internship position with hands-on project deliverables.",
            skills: Array.isArray(j.skills) ? j.skills : ["General Engineering"]
          }));

          let localJobs: any[] = [];
          try {
            localJobs = JSON.parse(localStorage.getItem("vic_custom_jobs") || "[]");
          } catch (e) {}

          const customIds = new Set(localJobs.map((l) => l.id));
          setAvailableJobs([...localJobs, ...backendFormatted.filter((b: any) => !customIds.has(b.id))]);
        }
      } else {
        try {
          const localJobs = JSON.parse(localStorage.getItem("vic_custom_jobs") || "[]");
          setAvailableJobs(localJobs);
        } catch (e) {}
      }

      // 2. Fetch User-Specific Applications (Filtering only current user's records)
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
              stipend: a.internship?.stipend ? `₹${Number(a.internship.stipend).toLocaleString()} / mo` : "₹0 / mo",
              status: a.status || "APPLIED",
              location: `${a.internship?.location || "Bengaluru"} • ${a.internship?.mode || "HYBRID"}`,
              interviews: a.interviews || []
            }));
          }
        }
      }

      // Fallback merge with candidate's live local storage applications
      try {
        const storedApps: any[] = JSON.parse(localStorage.getItem("vic_applications") || "[]");
        const myStoredApps = storedApps
          .filter((a: any) => String(a.email || "").trim().toLowerCase() === userEmail)
          .map((a: any) => ({
            ...a,
            appliedDate: formatDateSafe(a.appliedDate || a.appliedAt || a.createdAt),
            interviews: (a.interviews || []).map((i: any) => ({
              ...i,
              formattedTime: formatDateTimeSafe(i.scheduledAt || i.time || i.date)
            }))
          }));

        const combinedIds = new Set(syncedApplications.map((s) => s.id));
        const finalMerged = [...syncedApplications, ...myStoredApps.filter((m) => !combinedIds.has(m.id))];
        setMyApplications(finalMerged);
      } catch (e) {}
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

    const handlePipelineUpdate = () => fetchBackendData();
    window.addEventListener("vic_pipeline_sync", handlePipelineUpdate);
    window.addEventListener("vic_job_posted", handlePipelineUpdate);
    window.addEventListener("vic_interview_scheduled", handlePipelineUpdate);
    window.addEventListener("storage", handlePipelineUpdate);

    return () => {
      window.removeEventListener("vic_pipeline_sync", handlePipelineUpdate);
      window.removeEventListener("vic_job_posted", handlePipelineUpdate);
      window.removeEventListener("vic_interview_scheduled", handlePipelineUpdate);
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

  // Aggregate user's live scheduled interview rounds (matches company portal count)
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

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllNotifsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setIsApplying(true);
    setApplyStatusMessage(null);

    const existingApps: any[] = JSON.parse(localStorage.getItem("vic_applications") || "[]");
    const userEmail = (profile.email || "user2@gmail.com").trim().toLowerCase();
    const targetJobId = String(selectedJob.id).trim();
    const targetJobTitle = String(selectedJob.title).trim().toLowerCase();

    const isAlreadyApplied =
      myApplications.some(
        (a) =>
          String(a.internshipId).trim() === targetJobId ||
          String(a.role).trim().toLowerCase() === targetJobTitle
      ) ||
      existingApps.some((a) => {
        const appEmail = String(a.email || "").trim().toLowerCase();
        const appJobId = String(a.internshipId || "").trim();
        const appRole = String(a.role || "").trim().toLowerCase();

        return (
          appEmail === userEmail &&
          (appJobId === targetJobId || appRole === targetJobTitle)
        );
      });

    if (isAlreadyApplied) {
      setApplyStatusMessage({
        type: "error",
        text: "You have already applied for this position. Duplicate applications are rejected."
      });
      setIsApplying(false);
      return;
    }

    try {
      const isBackendUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(selectedJob.id);

      if (studentToken && isBackendUUID) {
        try {
          const res = await fetch("http://127.0.0.1:3000/api/applications/student/apply", {
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
          });

          if (res.status === 409) {
            throw new Error("You have already applied for this position (409 Conflict).");
          }

          const data = await res.json();
          if (!res.ok && res.status !== 404) {
            throw new Error(data.message || data.error || "Failed to submit application");
          }
        } catch (apiErr: any) {
          if (apiErr.message?.includes("already applied")) {
            throw apiErr;
          }
        }
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
        stipend: typeof selectedJob.stipend === "number" ? `₹${selectedJob.stipend.toLocaleString()} / mo` : selectedJob.stipend,
        status: "APPLIED",
        location: `${selectedJob.location} • ${selectedJob.mode}`,
        resumeUrl: applyFormData.resumeUrl,
        coverLetter: applyFormData.coverLetter,
        interviews: []
      };

      localStorage.setItem("vic_applications", JSON.stringify([newApp, ...existingApps]));

      window.dispatchEvent(new CustomEvent("vic_pipeline_sync"));
      window.dispatchEvent(
        new CustomEvent("vic_application_submitted", {
          detail: { name: newApp.name, role: selectedJob.title, email: userEmail }
        })
      );

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
    if (!profile.name) return "AS";
    const parts = profile.name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : profile.name.substring(0, 2).toUpperCase();
  }, [profile.name]);

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-slate-800 flex flex-col md:flex-row font-sans">
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
                            n.read ? "bg-[#F8F9FD] text-slate-500" : "bg-[#EDF0FF]/60 text-slate-800 font-medium"
                          }`}
                        >
                          <p className="line-clamp-2">{n.text}</p>
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
                    Track applications, join scheduled technical interview rounds, and explore live opportunities.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("internships")}
                  className="px-5 py-3 rounded-full bg-[#202960] text-white font-bold text-xs hover:bg-[#2E2A72] transition shadow-md shadow-[#202960]/20 cursor-pointer"
                >
                  Browse {availableJobs.length} Positions
                </button>
              </section>

              {/* Metric Cards */}
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

                <div className="bg-white border border-[#3B3588]/10 p-5 sm:p-6 rounded-3xl shadow-sm hover:shadow-md transition">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Offers Received</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Award className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#1E1B4B]">
                    {myApplications.filter((a) => a.status === "OFFERED" || a.status === "ACCEPTED").length}
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
                          <th className="pb-3.5 font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {myApplications.map((app) => (
                          <tr key={app.id} className="hover:bg-[#F8F9FD]/60 transition">
                            <td className="py-4 font-bold text-[#1E1B4B] text-sm">{app.role}</td>
                            <td className="py-4 font-medium text-slate-600">{app.company}</td>
                            <td className="py-4 text-slate-500">{formatDateSafe(app.appliedDate)}</td>
                            <td className="py-4 font-bold text-[#202960]">{app.stipend}</td>
                            <td className="py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                                  app.status === "OFFERED" || app.status === "ACCEPTED"
                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                    : app.status === "REJECTED"
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : app.status === "INTERVIEWING" || app.status === "SHORTLISTED"
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-indigo-50 text-indigo-700 border-indigo-200"
                                }`}
                              >
                                {app.status}
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
                    <div key={app.id} className="p-5 rounded-2xl border border-[#3B3588]/10 bg-[#F8F9FD] space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-sm text-[#1E1B4B]">{app.role}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {app.company} • {app.location}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                            app.status === "OFFERED" || app.status === "ACCEPTED"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
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
                        <span className="font-black text-[#202960]">{app.stipend}</span>
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
                    const userEmail = (profile.email || "user2@gmail.com").trim().toLowerCase();
                    const existingStoredApps = JSON.parse(localStorage.getItem("vic_applications") || "[]");

                    const isApplied =
                      myApplications.some(
                        (a) =>
                          String(a.internshipId).trim() === String(job.id).trim() ||
                          String(a.role).trim().toLowerCase() === String(job.title).trim().toLowerCase()
                      ) ||
                      existingStoredApps.some(
                        (a: any) =>
                          String(a.email || "").trim().toLowerCase() === userEmail &&
                          (String(a.internshipId).trim() === String(job.id).trim() ||
                            String(a.role).trim().toLowerCase() === String(job.title).trim().toLowerCase())
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
                            {typeof job.stipend === "number" ? `₹${job.stipend.toLocaleString()} / mo` : job.stipend}
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
                        <p className="text-xs font-bold text-[#202960] flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5 text-indigo-600" /> {intv.round}
                        </p>
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
        </div>
      </main>

      {/* INTERNSHIP DETAILS & APPLY MODAL */}
      {applyModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#3B3588]/15 rounded-[32px] w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start pb-2 border-b border-slate-100">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase">
                  {selectedJob.mode}
                </span>
                <h3 className="text-lg font-black text-[#1E1B4B] mt-1">{selectedJob.title}</h3>
                <p className="text-xs text-slate-500">
                  {selectedJob.company} • {selectedJob.location}
                </p>
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

            <div className="space-y-3 text-xs text-slate-600 bg-[#F8F9FD] p-4 rounded-2xl border border-slate-100">
              <p className="leading-relaxed">{selectedJob.description}</p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 font-semibold">
                <span className="text-[#202960] font-black">
                  Stipend:{" "}
                  {typeof selectedJob.stipend === "number"
                    ? `₹${selectedJob.stipend.toLocaleString()} / mo`
                    : selectedJob.stipend}
                </span>
                <span className="text-slate-500">Duration: {selectedJob.durationMonths || 6} Months</span>
              </div>
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