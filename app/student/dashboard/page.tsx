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
  XCircle,
  RefreshCw
} from "lucide-react";

export default function StudentDashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "applications" | "internships" | "interviews">("overview");

  // Authentication State
  const [studentToken, setStudentToken] = useState<string | null>(null);
  const [studentName, setStudentName] = useState("Bala Aditya C");
  const [studentEmail, setStudentEmail] = useState("student.aditya@example.com");

  // Notifications State
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Interview scheduled with Tech Innovations Corp for Aug 19, 2026", time: "1h ago", read: false },
    { id: 2, text: "Application submitted for IoT Systems & Firmware Intern", time: "2d ago", read: false },
    { id: 3, text: "Offer letter issued by CloudScale Labs (₹20,000/mo)", time: "3d ago", read: true },
  ]);

  // Modals & Application Flow
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyFormData, setApplyFormData] = useState({
    resumeUrl: "https://storage.vic.edu/resumes/bala_aditya.pdf",
    coverLetter: "Strong background in full-stack architecture, microservices, and IoT hardware.",
    githubUrl: "https://github.com/aditya",
    portfolioUrl: "https://aditya.dev"
  });
  const [applyStatusMessage, setApplyStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Search & Loading
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Base Mockup Jobs
  const initialBaseJobs = useMemo(() => [
    {
      id: "job-base-1",
      title: "Full Stack Engineering Intern",
      company: "Tech Innovations Corp",
      location: "Bengaluru",
      mode: "HYBRID",
      stipend: 25000,
      durationMonths: 6,
      deadline: "Aug 30, 2026",
      description: "Develop responsive Next.js web applications, Fastify microservices, and PostgreSQL models with Prisma.",
      skills: ["React", "Next.js", "Node.js", "PostgreSQL"]
    },
    {
      id: "job-base-2",
      title: "IoT Systems & Firmware Intern",
      company: "Tenar Systems",
      location: "Bengaluru",
      mode: "ON_SITE",
      stipend: 30000,
      durationMonths: 6,
      deadline: "Sep 05, 2026",
      description: "Design RTOS firmware, manage sensor communication interfaces (I2C/SPI), and implement wireless telemetry.",
      skills: ["C++", "FreeRTOS", "Sensors", "Embedded C"]
    },
    {
      id: "job-base-3",
      title: "AI Solutions & Prompt Engineer Intern",
      company: "VIC Labs",
      location: "Bengaluru / Remote",
      mode: "REMOTE",
      stipend: 28000,
      durationMonths: 3,
      deadline: "Aug 28, 2026",
      description: "Integrate LLM reasoning pipelines, evaluate context retrieval outputs, and build AI workflows.",
      skills: ["Python", "GenAI SDK", "FastAPI"]
    }
  ], []);

  // Base Mockup Applications
  const initialApplications = useMemo(() => [
    {
      id: "app-101",
      role: "Full Stack Engineering Intern",
      company: "Tech Innovations Corp",
      appliedDate: "Aug 15, 2026",
      stipend: "₹25,000 / mo",
      status: "INTERVIEWING",
      location: "Bengaluru • Hybrid",
      interviews: [
        {
          id: "intv-201",
          roundName: "Live Architecture & Coding Round",
          scheduledAt: "Aug 19, 2026 • 2:00 PM IST",
          meetingUrl: "https://meet.google.com/vic-student-room",
          status: "SCHEDULED"
        }
      ]
    },
    {
      id: "app-102",
      role: "IoT Systems & Firmware Intern",
      company: "Tenar Systems",
      appliedDate: "Aug 12, 2026",
      stipend: "₹30,000 / mo",
      status: "APPLIED",
      location: "Bengaluru • On-Site",
      interviews: []
    }
  ], []);

  const [availableJobs, setAvailableJobs] = useState<any[]>(initialBaseJobs);
  const [myApplications, setMyApplications] = useState<any[]>(initialApplications);

  // Sync Student Data & Backend APIs
  const fetchBackendData = useCallback(async (token?: string | null) => {
    const currentToken = token || studentToken || localStorage.getItem("student_token");
    setIsRefreshing(true);

    try {
      // 1. Fetch Backend Active Internships
      const jobsRes = await fetch("http://127.0.0.1:3000/api/internships?status=ACTIVE").catch(() => null);
      if (jobsRes && jobsRes.ok) {
        const jobsData = await jobsRes.json();
        if (Array.isArray(jobsData.internships) && jobsData.internships.length > 0) {
          const backendFormatted = jobsData.internships.map((j: any) => ({
            id: j.id,
            title: j.title,
            company: j.company?.companyName || "Verified Partner",
            location: j.location || "Bengaluru",
            mode: j.mode || "HYBRID",
            stipend: j.stipend || 25000,
            durationMonths: j.durationMonths || 6,
            deadline: "Open until filled",
            description: j.description || "Internship with mentorship and hands-on deliverables.",
            skills: Array.isArray(j.skills) ? j.skills : ["General Engineering"]
          }));

          const backendIds = new Set(backendFormatted.map((b: any) => b.id));
          setAvailableJobs([...backendFormatted, ...initialBaseJobs.filter((b) => !backendIds.has(b.id))]);
        }
      }

      // 2. Fetch Student My-Applications
      if (currentToken) {
        const appsRes = await fetch("http://127.0.0.1:3000/api/applications/my-applications", {
          headers: { Authorization: `Bearer ${currentToken}` }
        }).catch(() => null);

        if (appsRes && appsRes.ok) {
          const appsData = await appsRes.json();
          if (Array.isArray(appsData.applications)) {
            const formattedApps = appsData.applications.map((a: any) => ({
              id: a.id,
              internshipId: a.internshipId,
              role: a.internship?.title || "Engineering Intern",
              company: a.internship?.company?.companyName || "Partner Organization",
              appliedDate: new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
              stipend: a.internship?.stipend ? `₹${Number(a.internship.stipend).toLocaleString()} / mo` : "₹25,000 / mo",
              status: a.status || "APPLIED",
              location: `${a.internship?.location || "Bengaluru"} • ${a.internship?.mode || "HYBRID"}`,
              interviews: a.interviews || []
            }));

            const appIds = new Set(formattedApps.map((a: any) => a.id));
            setMyApplications([...formattedApps, ...initialApplications.filter((m) => !appIds.has(m.id))]);
          }
        }
      }
    } catch (e) {
      // Fallback cleanly
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, [initialBaseJobs, initialApplications, studentToken]);

  useEffect(() => {
    const storedStudent = localStorage.getItem("student_data");
    const storedToken = localStorage.getItem("student_token");

    if (storedStudent) {
      try {
        const parsed = JSON.parse(storedStudent);
        if (parsed.name) setStudentName(parsed.name);
        if (parsed.email) setStudentEmail(parsed.email);
      } catch (e) {}
    }

    if (storedToken) {
      setStudentToken(storedToken);
      fetchBackendData(storedToken);
    } else {
      fetch("http://127.0.0.1:3000/api/student/dev-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: studentEmail })
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

    const handleJobPosted = () => fetchBackendData();
    window.addEventListener("vic_job_posted", handleJobPosted);
    return () => window.removeEventListener("vic_job_posted", handleJobPosted);
  }, [fetchBackendData, studentEmail]);

  // Filtered Job Openings
  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return availableJobs;
    const q = searchQuery.toLowerCase();
    return availableJobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        (j.company && j.company.toLowerCase().includes(q)) ||
        (j.location && j.location.toLowerCase().includes(q)) ||
        (j.skills && j.skills.some((s: string) => s.toLowerCase().includes(q)))
    );
  }, [availableJobs, searchQuery]);

  // Aggregate Scheduled Interviews
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
            date: intv.scheduledAt ? new Date(intv.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Upcoming",
            time: intv.scheduledAt ? new Date(intv.scheduledAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "Scheduled",
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

  // Submit Application with Duplicate Check
  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setIsApplying(true);
    setApplyStatusMessage(null);

    const alreadyApplied = myApplications.some(
      (a) => a.internshipId === selectedJob.id || a.role.toLowerCase() === selectedJob.title.toLowerCase()
    );

    if (alreadyApplied) {
      setApplyStatusMessage({
        type: "error",
        text: "You have already applied for this position. Duplicate applications are rejected."
      });
      setIsApplying(false);
      return;
    }

    try {
      if (studentToken && !selectedJob.id.startsWith("job-base-")) {
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
        if (!res.ok) throw new Error(data.message || "Failed to submit application");
      }

      const newApp = {
        id: `app-${Date.now()}`,
        internshipId: selectedJob.id,
        role: selectedJob.title,
        company: selectedJob.company || "Partner Organization",
        appliedDate: "Just now",
        stipend: typeof selectedJob.stipend === "number" ? `₹${selectedJob.stipend.toLocaleString()} / mo` : selectedJob.stipend,
        status: "APPLIED",
        location: `${selectedJob.location} • ${selectedJob.mode}`,
        interviews: []
      };

      setMyApplications([newApp, ...myApplications]);
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
        text: err.message || "Submission failed"
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-slate-800 flex flex-col md:flex-row font-sans">
      {/* Mobile Drawer Backdrop */}
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

          <div className="p-3.5 rounded-2xl bg-[#EDF0FF] border border-[#3B3588]/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#202960] text-white font-bold flex items-center justify-center text-xs shadow-sm">
                {studentName.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-xs text-[#1E1B4B]">{studentName}</div>
                <div className="text-[10px] text-indigo-700 font-semibold">Verified Member</div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <nav className="space-y-1.5 text-xs font-bold">
            <button
              onClick={() => { setActiveTab("overview"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeTab === "overview"
                  ? "bg-[#202960] text-white shadow-md shadow-[#202960]/20"
                  : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF] hover:text-[#202960]"
              }`}
            >
              <Award className="w-4 h-4" /> Overview
            </button>

            <button
              onClick={() => { setActiveTab("applications"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeTab === "applications"
                  ? "bg-[#202960] text-white shadow-md shadow-[#202960]/20"
                  : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF] hover:text-[#202960]"
              }`}
            >
              <FileText className="w-4 h-4" /> My Applications ({myApplications.length})
            </button>

            <button
              onClick={() => { setActiveTab("internships"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeTab === "internships"
                  ? "bg-[#202960] text-white shadow-md shadow-[#202960]/20"
                  : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF] hover:text-[#202960]"
              }`}
            >
              <Briefcase className="w-4 h-4" /> Explore Openings ({availableJobs.length})
            </button>

            <button
              onClick={() => { setActiveTab("interviews"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeTab === "interviews"
                  ? "bg-[#202960] text-white shadow-md shadow-[#202960]/20"
                  : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF] hover:text-[#202960]"
              }`}
            >
              <Video className="w-4 h-4" /> Live Interviews ({allScheduledInterviews.length})
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-[#3B3588]/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#EDF0FF] text-[#202960] font-bold text-xs flex items-center justify-center">
              ST
            </div>
            <div>
              <div className="text-xs font-bold text-[#1E1B4B]">Student Account</div>
              <div className="text-[10px] text-slate-400 truncate max-w-[110px]">{studentEmail}</div>
            </div>
          </div>
          <Link href="/" className="p-2 text-slate-400 hover:text-red-600 transition" title="Logout">
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
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

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => fetchBackendData()}
              disabled={isRefreshing}
              className="p-2.5 rounded-full bg-[#F8F9FD] border border-[#3B3588]/15 text-slate-600 hover:text-[#202960] transition cursor-pointer"
              title="Sync Latest Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>

            {/* Notifications Dropdown */}
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
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 rounded-2xl text-xs transition ${
                          n.read ? "bg-[#F8F9FD] text-slate-500" : "bg-[#EDF0FF]/60 text-slate-800 font-medium"
                        }`}
                      >
                        <p className="line-clamp-2">{n.text}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block font-normal">{n.time}</span>
                      </div>
                    ))}
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
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <>
              <section className="bg-gradient-to-br from-[#EDF0FF] via-white to-[#F8F9FD] border border-[#3B3588]/10 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#202960]/5 text-[#202960] text-[11px] font-black uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" /> Career Acceleration
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#1E1B4B] tracking-tight">
                    Hello, {studentName}!
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
                    Track your applications, inspect internship openings, and join live technical rounds directly.
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
                <div onClick={() => setActiveTab("applications")} className="bg-white border border-[#3B3588]/10 p-5 sm:p-6 rounded-3xl shadow-sm hover:shadow-md transition cursor-pointer">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Applications</span>
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#1E1B4B]">{myApplications.length}</div>
                  <div className="text-[11px] text-indigo-600 font-bold mt-1">Submitted</div>
                </div>

                <div onClick={() => setActiveTab("interviews")} className="bg-white border border-[#3B3588]/10 p-5 sm:p-6 rounded-3xl shadow-sm hover:shadow-md transition cursor-pointer">
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
                    {myApplications.filter((a) => a.status === "OFFERED" || a.status === "ACCEPTED").length || 1}
                  </div>
                  <div className="text-[11px] text-purple-600 font-bold mt-1">Verified Selected</div>
                </div>

                <div onClick={() => setActiveTab("internships")} className="bg-white border border-[#3B3588]/10 p-5 sm:p-6 rounded-3xl shadow-sm hover:shadow-md transition cursor-pointer">
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

              {/* Live Applications Table */}
              <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-black text-[#1E1B4B]">My Active Applications</h2>
                    <p className="text-xs text-slate-500">Real-time status updates synced directly from recruiters.</p>
                  </div>
                  <button onClick={() => setActiveTab("applications")} className="text-xs font-bold text-[#202960] hover:underline flex items-center gap-1 cursor-pointer">
                    View Pipeline <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
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
                          <td className="py-4 text-slate-500">{app.appliedDate}</td>
                          <td className="py-4 font-bold text-[#202960]">{app.stipend}</td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                              app.status === "OFFERED" || app.status === "ACCEPTED" ? "bg-purple-50 text-purple-700 border-purple-200" :
                              app.status === "REJECTED" ? "bg-red-50 text-red-700 border-red-200" :
                              app.status === "INTERVIEWING" || app.status === "SHORTLISTED" ? "bg-amber-50 text-amber-700 border-amber-200" :
                              "bg-indigo-50 text-indigo-700 border-indigo-200"
                            }`}>
                              {app.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {/* MY APPLICATIONS TAB */}
          {activeTab === "applications" && (
            <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-black text-[#1E1B4B]">My Applications Pipeline</h2>
                <p className="text-xs text-slate-500 mt-1">Live tracking of your application reviews, interview rounds, and offers.</p>
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
                          <p className="text-xs text-slate-500 mt-0.5">{app.company} • {app.location}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                          app.status === "OFFERED" || app.status === "ACCEPTED" ? "bg-purple-50 text-purple-700 border-purple-200" :
                          app.status === "REJECTED" ? "bg-red-50 text-red-700 border-red-200" :
                          app.status === "INTERVIEWING" || app.status === "SHORTLISTED" ? "bg-amber-50 text-amber-700 border-amber-200" :
                          "bg-indigo-50 text-indigo-700 border-indigo-200"
                        }`}>
                          {app.status}
                        </span>
                      </div>

                      {/* Attached Interview Notification if Shortlisted */}
                      {Array.isArray(app.interviews) && app.interviews.length > 0 && (
                        <div className="p-3 bg-white border border-amber-200/80 rounded-xl space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                            <Video className="w-3.5 h-3.5" /> {app.interviews[0].roundName || "Technical Round"}
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>{app.interviews[0].scheduledAt ? new Date(app.interviews[0].scheduledAt).toLocaleString() : "Upcoming Round"}</span>
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
                        <span className="text-slate-400">Applied: {app.appliedDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* EXPLORE INTERNSHIPS TAB */}
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredJobs.map((job) => {
                  const isApplied = myApplications.some(
                    (a) => a.internshipId === job.id || a.role.toLowerCase() === job.title.toLowerCase()
                  );

                  return (
                    <div key={job.id} className="p-5 rounded-2xl border border-[#3B3588]/10 bg-[#F8F9FD] space-y-4 flex flex-col justify-between hover:shadow-md transition">
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

                        <p className="text-xs text-slate-500 line-clamp-2">
                          {job.description}
                        </p>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(job.skills || []).map((s: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold text-slate-600">
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
                            onClick={() => { setSelectedJob(job); setApplyModalOpen(true); }}
                            className="px-3.5 py-1.5 rounded-full border border-[#202960]/20 text-[#202960] font-bold text-xs hover:bg-[#EDF0FF] transition cursor-pointer"
                          >
                            Details
                          </button>

                          <button
                            onClick={() => { setSelectedJob(job); setApplyModalOpen(true); }}
                            disabled={isApplied}
                            className={`px-4 py-1.5 text-xs font-bold rounded-full transition cursor-pointer ${
                              isApplied
                                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                                : "bg-[#202960] hover:bg-[#2E2A72] text-white shadow-sm"
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
            </section>
          )}

          {/* SCHEDULED INTERVIEWS TAB */}
          {activeTab === "interviews" && (
            <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-black text-[#1E1B4B]">Scheduled Technical Interviews</h2>
                <p className="text-xs text-slate-500 mt-1">Live interview schedules, video room links, and evaluation statuses.</p>
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
                          <Clock className="w-3.5 h-3.5" /> {intv.date} • {intv.time}
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
                <p className="text-xs text-slate-500">{selectedJob.company} • {selectedJob.location}</p>
              </div>
              <button
                onClick={() => { setApplyModalOpen(false); setSelectedJob(null); setApplyStatusMessage(null); }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 bg-[#F8F9FD] p-4 rounded-2xl border border-slate-100">
              <p className="leading-relaxed">{selectedJob.description}</p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 font-semibold">
                <span className="text-[#202960] font-black">
                  Stipend: {typeof selectedJob.stipend === "number" ? `₹${selectedJob.stipend.toLocaleString()} / mo` : selectedJob.stipend}
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
                {applyStatusMessage.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
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
                  onClick={() => { setApplyModalOpen(false); setSelectedJob(null); }}
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