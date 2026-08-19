"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Briefcase,
  Users,
  Video,
  ClipboardCheck,
  Building2,
  Plus,
  Search,
  Bell,
  LogOut,
  ChevronDown,
  ArrowUpRight,
  Sparkles,
  Menu,
  X,
  Clock,
  ExternalLink,
  Loader2,
  CheckCheck,
  FileText
} from "lucide-react";

export default function CompanyDashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "jobs" | "applications" | "interviews">("overview");

  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // Notifications State
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Modal & Posting State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  // Job-Specific View Applicants Modal State
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState<any | null>(null);

  // Schedule Interview Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [interviewForm, setInterviewForm] = useState({
    roundName: "Technical Systems Round",
    date: "2026-08-20",
    time: "14:30",
    meetingUrl: "https://meet.google.com/vic-recruitment-room"
  });

  // Logged-in Company Info
  const [companyName, setCompanyName] = useState("Tenar Systems");
  const [companyEmail, setCompanyEmail] = useState("admin@tenar.com");

  // Real-time Data Arrays
  const [jobs, setJobs] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);

  // Post Role Form State
  const [formData, setFormData] = useState({
    title: "",
    mode: "HYBRID",
    location: "Bengaluru",
    stipend: "",
    durationMonths: "6",
    skills: "",
    description: ""
  });

  // Synchronize dynamic jobs and incoming applicants
  const syncPipelineData = useCallback(() => {
    let liveApplicants: any[] = [];
    try {
      const storedApps = localStorage.getItem("vic_applications");
      if (storedApps) {
        liveApplicants = JSON.parse(storedApps);
      }
    } catch (e) {}
    setApplicants(liveApplicants);

    let currentJobsList: any[] = [];
    try {
      const customJobsStr = localStorage.getItem("vic_custom_jobs");
      if (customJobsStr) {
        const customJobs = JSON.parse(customJobsStr);
        if (Array.isArray(customJobs)) {
          currentJobsList = customJobs;
        }
      }
    } catch (e) {}

    const updatedJobsWithCounts = currentJobsList.map((job) => {
      const matchCount = liveApplicants.filter(
        (app) => app.internshipId === job.id || app.role?.toLowerCase() === job.title?.toLowerCase()
      ).length;
      return {
        ...job,
        applicantsCount: matchCount
      };
    });

    setJobs(updatedJobsWithCounts);
  }, []);

  useEffect(() => {
    const storedCompany = localStorage.getItem("company_data");
    if (storedCompany) {
      try {
        const parsed = JSON.parse(storedCompany);
        if (parsed.companyName) setCompanyName(parsed.companyName);
        if (parsed.email) setCompanyEmail(parsed.email);
      } catch (e) {}
    }

    syncPipelineData();

    const handleApplicationSubmitted = (e: any) => {
      syncPipelineData();
      const applicantName = e?.detail?.name || "A candidate";
      const roleName = e?.detail?.role || "an internship role";

      setNotifications((prev) => [
        {
          id: Date.now(),
          text: `New application received from ${applicantName} for ${roleName}!`,
          time: "Just now",
          read: false
        },
        ...prev
      ]);
    };

    window.addEventListener("vic_application_submitted", handleApplicationSubmitted);
    window.addEventListener("storage", syncPipelineData);

    return () => {
      window.removeEventListener("vic_application_submitted", handleApplicationSubmitted);
      window.removeEventListener("storage", syncPipelineData);
    };
  }, [syncPipelineData]);

  const handleScheduleInterviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    const newInterview = {
      id: `intv-${Date.now()}`,
      candidateName: selectedCandidate.name,
      role: selectedCandidate.role,
      roundName: interviewForm.roundName,
      time: `${interviewForm.date} • ${interviewForm.time}`,
      meetingUrl: interviewForm.meetingUrl,
      status: "SCHEDULED"
    };

    setInterviews((prev) => [newInterview, ...prev]);

    setApplicants((prev) =>
      prev.map((app) => (app.id === selectedCandidate.id ? { ...app, status: "INTERVIEWING" } : app))
    );

    try {
      const storedApps = JSON.parse(localStorage.getItem("vic_applications") || "[]");
      const updatedStored = storedApps.map((a: any) =>
        a.id === selectedCandidate.id ? { ...a, status: "INTERVIEWING" } : a
      );
      localStorage.setItem("vic_applications", JSON.stringify(updatedStored));
    } catch (e) {}

    setIsScheduleModalOpen(false);
    setSelectedCandidate(null);
    setSelectedJobForApplicants(null);
    setActiveTab("interviews");
  };

  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs;
    const q = searchQuery.toLowerCase();
    return jobs.filter(
      (j) =>
        j.title?.toLowerCase().includes(q) ||
        j.location?.toLowerCase().includes(q) ||
        j.mode?.toLowerCase().includes(q)
    );
  }, [jobs, searchQuery]);

  const filteredApplicants = useMemo(() => {
    if (!searchQuery.trim()) return applicants;
    const q = searchQuery.toLowerCase();
    return applicants.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        a.role?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q)
    );
  }, [applicants, searchQuery]);

  // Specific candidate list for the opened job modal
  const jobSpecificApplicants = useMemo(() => {
    if (!selectedJobForApplicants) return [];
    return applicants.filter(
      (app) =>
        app.internshipId === selectedJobForApplicants.id ||
        app.role?.toLowerCase() === selectedJobForApplicants.title?.toLowerCase()
    );
  }, [applicants, selectedJobForApplicants]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllNotifsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handlePostRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPosting(true);
    setPostError(null);

    const token = localStorage.getItem("company_token");
    const skillList = formData.skills
      ? formData.skills.split(",").map((s) => s.trim())
      : ["React", "TypeScript"];

    try {
      if (token) {
        await fetch("http://127.0.0.1:3000/api/internships", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description || "Hands-on internship position with direct team mentorship.",
            location: formData.location,
            mode: formData.mode,
            stipend: Number(formData.stipend),
            durationMonths: Number(formData.durationMonths),
            skills: skillList,
            status: "ACTIVE"
          })
        }).catch(() => null);
      }

      const formattedMode = formData.mode === "HYBRID" ? "Hybrid" : formData.mode === "REMOTE" ? "Remote" : "On-Site";

      const createdJob = {
        id: `job-${Date.now()}`,
        title: formData.title,
        company: companyName,
        mode: formattedMode,
        location: formData.location,
        stipend: `₹${Number(formData.stipend).toLocaleString()} / mo`,
        applicantsCount: 0,
        status: "ACTIVE",
        postedAt: "Just now",
        deadline: "Open until filled",
        skills: skillList
      };

      const existingCustom = JSON.parse(localStorage.getItem("vic_custom_jobs") || "[]");
      const updatedCustom = [createdJob, ...existingCustom];
      localStorage.setItem("vic_custom_jobs", JSON.stringify(updatedCustom));

      window.dispatchEvent(new Event("vic_job_posted"));
      setJobs([createdJob, ...jobs]);

      setNotifications([
        {
          id: Date.now(),
          text: `Position "${formData.title}" published successfully to student job board`,
          time: "Just now",
          read: false
        },
        ...notifications
      ]);

      setFormData({
        title: "",
        mode: "HYBRID",
        location: "Bengaluru",
        stipend: "",
        durationMonths: "6",
        skills: "",
        description: ""
      });
      setIsCreateModalOpen(false);
      setActiveTab("jobs");
    } catch (err: any) {
      setPostError(err.message || "Failed to post internship role");
    } finally {
      setIsPosting(false);
    }
  };

  const companyInitials = useMemo(() => {
    if (!companyName) return "CO";
    const parts = companyName.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : companyName.substring(0, 2).toUpperCase();
  }, [companyName]);

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
                <div className="text-[11px] font-bold text-[#3B3588]">Company Portal</div>
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
                {companyInitials}
              </div>
              <div className="text-left">
                <div className="font-bold text-xs text-[#1E1B4B] truncate max-w-[120px]">{companyName}</div>
                <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  ● Verified Partner
                </div>
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
              <Building2 className="w-4 h-4" /> Overview
            </button>

            <button
              onClick={() => { setActiveTab("jobs"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeTab === "jobs"
                  ? "bg-[#202960] text-white shadow-md shadow-[#202960]/20"
                  : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF] hover:text-[#202960]"
              }`}
            >
              <Briefcase className="w-4 h-4" /> Job Postings ({jobs.length})
            </button>

            <button
              onClick={() => { setActiveTab("applications"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeTab === "applications"
                  ? "bg-[#202960] text-white shadow-md shadow-[#202960]/20"
                  : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF] hover:text-[#202960]"
              }`}
            >
              <Users className="w-4 h-4" /> Applicants ({applicants.length})
            </button>

            <button
              onClick={() => { setActiveTab("interviews"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeTab === "interviews"
                  ? "bg-[#202960] text-white shadow-md shadow-[#202960]/20"
                  : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF] hover:text-[#202960]"
              }`}
            >
              <Video className="w-4 h-4" /> Scheduled Rounds ({interviews.length})
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-[#3B3588]/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#202960] text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {companyInitials}
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-[#1E1B4B] truncate max-w-[110px]" title={companyName}>
                {companyName}
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[110px]" title={companyEmail}>
                {companyEmail}
              </div>
            </div>
          </div>
          <Link
            href="/"
            onClick={() => {
              localStorage.removeItem("company_token");
              localStorage.removeItem("company_data");
            }}
            className="p-2 text-slate-400 hover:text-red-600 transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* Main Header & Body */}
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
              <span className="hidden sm:inline">Company</span>
              <span className="hidden sm:inline">/</span>
              <span className="text-[#1E1B4B] capitalize">
                {activeTab === "overview" ? "Overview" : activeTab === "jobs" ? "Job Postings" : activeTab === "applications" ? "Applicants" : "Scheduled Rounds"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search candidates, roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-44 sm:w-64 pl-10 pr-8 py-2 rounded-full bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960] text-slate-800 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2.5 rounded-full bg-[#F8F9FD] border border-[#3B3588]/15 text-slate-600 hover:text-[#202960] transition cursor-pointer"
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
                      <span className="font-bold text-sm text-[#1E1B4B]">Notifications</span>
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
                          <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-[#202960] hover:bg-[#2E2A72] text-white font-bold text-xs shadow-md shadow-[#202960]/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Post New Role</span>
              <span className="sm:hidden">Post</span>
            </button>
          </div>
        </header>

        {/* Dynamic Content Views */}
        <div className="p-4 sm:p-8 space-y-8 max-w-7xl">
          {searchQuery && (
            <div className="p-3 bg-[#EDF0FF] rounded-2xl border border-[#3B3588]/15 text-xs text-[#1E1B4B] flex items-center justify-between">
              <span>Filtering results for: <strong>&ldquo;{searchQuery}&rdquo;</strong></span>
              <button onClick={() => setSearchQuery("")} className="font-bold text-[#202960] hover:underline text-xs">
                Clear filter
              </button>
            </div>
          )}

          {/* 1. OVERVIEW TAB */}
          {activeTab === "overview" && (
            <>
              <section className="bg-gradient-to-br from-[#EDF0FF] via-white to-[#F8F9FD] border border-[#3B3588]/10 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#202960]/5 text-[#202960] text-[11px] font-black uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" /> ATS Recruitment Suite
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#1E1B4B] tracking-tight">
                    Welcome back, {companyName}.
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
                    Review candidate submissions, create active roles, and schedule technical rounds.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-5 py-3 rounded-full bg-[#202960] text-white font-bold text-xs hover:bg-[#2E2A72] transition shadow-md shadow-[#202960]/20 cursor-pointer"
                >
                  Create New Position
                </button>
              </section>

              <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                <div onClick={() => setActiveTab("jobs")} className="bg-white border border-[#3B3588]/10 p-5 sm:p-6 rounded-3xl shadow-sm hover:shadow-md transition cursor-pointer">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Roles</span>
                    <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                      <Briefcase className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#1E1B4B]">{jobs.length}</div>
                  <div className="text-[11px] text-emerald-600 font-bold mt-1">● Live on Job Board</div>
                </div>

                <div onClick={() => setActiveTab("applications")} className="bg-white border border-[#3B3588]/10 p-5 sm:p-6 rounded-3xl shadow-sm hover:shadow-md transition cursor-pointer">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Applicants</span>
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#1E1B4B]">{applicants.length}</div>
                  <div className="text-[11px] text-indigo-600 font-bold mt-1">Real-time Submissions</div>
                </div>

                <div onClick={() => setActiveTab("interviews")} className="bg-white border border-[#3B3588]/10 p-5 sm:p-6 rounded-3xl shadow-sm hover:shadow-md transition cursor-pointer">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Interviews</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Video className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#1E1B4B]">{interviews.length}</div>
                  <div className="text-[11px] text-amber-600 font-bold mt-1">Rounds scheduled</div>
                </div>

                <div className="bg-white border border-[#3B3588]/10 p-5 sm:p-6 rounded-3xl shadow-sm hover:shadow-md transition">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Offers Sent</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <ClipboardCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#1E1B4B]">
                    {applicants.filter((a) => a.status === "OFFERED" || a.status === "ACCEPTED").length}
                  </div>
                  <div className="text-[11px] text-purple-600 font-bold mt-1">Hired Candidates</div>
                </div>
              </section>

              <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-black text-[#1E1B4B]">Live Internship Postings</h2>
                    <p className="text-xs text-slate-500">Live positions open for student applications.</p>
                  </div>
                  <button onClick={() => setActiveTab("jobs")} className="text-xs font-bold text-[#202960] hover:underline flex items-center gap-1 cursor-pointer">
                    View All <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  {filteredJobs.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs">
                      No internship roles posted yet. Click &ldquo;+ Post New Role&rdquo; to publish your first position.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="text-[11px] uppercase font-bold text-slate-400 border-b border-slate-100">
                        <tr>
                          <th className="pb-3.5 font-bold">Role Title</th>
                          <th className="pb-3.5 font-bold">Work Mode</th>
                          <th className="pb-3.5 font-bold">Stipend</th>
                          <th className="pb-3.5 font-bold">Submissions</th>
                          <th className="pb-3.5 font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {filteredJobs.map((j) => (
                          <tr key={j.id} className="hover:bg-[#F8F9FD]/60 transition">
                            <td className="py-4 font-bold text-[#1E1B4B] text-sm">{j.title}</td>
                            <td className="py-4 text-slate-500">{j.location} • {j.mode}</td>
                            <td className="py-4 font-bold text-[#202960]">{j.stipend}</td>
                            <td className="py-4 font-semibold text-slate-600">
                              <button
                                onClick={() => setSelectedJobForApplicants(j)}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EDF0FF] hover:bg-[#202960] text-[#202960] hover:text-white font-bold text-xs transition cursor-pointer"
                              >
                                {j.applicantsCount} Applicants <ArrowUpRight className="w-3 h-3" />
                              </button>
                            </td>
                            <td className="py-4">
                              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-[10px] font-black">
                                {j.status}
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

          {/* 2. JOB POSTINGS TAB (CLICKABLE APPLICANTS BUTTON) */}
          {activeTab === "jobs" && (
            <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-black text-[#1E1B4B]">Job Postings Management</h2>
                  <p className="text-xs text-slate-500 mt-1">Create, edit, and click applicant buttons to inspect applicants for any role.</p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#202960] text-white font-bold text-xs shadow-md"
                >
                  <Plus className="w-4 h-4" /> Create New Role
                </button>
              </div>

              {filteredJobs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No job postings created yet. Click &ldquo;Create New Role&rdquo; to publish your first internship.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredJobs.map((job) => (
                    <div key={job.id} className="p-5 rounded-2xl border border-[#3B3588]/10 bg-[#F8F9FD] space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-sm text-[#1E1B4B]">{job.title}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">{job.location} • {job.mode}</p>
                        </div>
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-[10px] font-black">
                          {job.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {job.skills?.map((s: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold text-slate-600">
                            {s}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-[#3B3588]/10 text-xs">
                        <span className="font-black text-[#202960]">{job.stipend}</span>
                        
                        {/* Interactive Clickable Button to View Role Applicants */}
                        <button
                          type="button"
                          onClick={() => setSelectedJobForApplicants(job)}
                          className="font-bold text-[#202960] bg-[#EDF0FF] hover:bg-[#202960] hover:text-white px-3 py-1.5 rounded-full text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{job.applicantsCount || 0} Applicants</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* 3. APPLICANTS TAB */}
          {activeTab === "applications" && (
            <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-black text-[#1E1B4B]">Candidate Submissions ({filteredApplicants.length})</h2>
                <p className="text-xs text-slate-500 mt-1">Review student applications and take recruitment actions in real-time.</p>
              </div>

              <div className="overflow-x-auto">
                {filteredApplicants.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    No candidate applications received yet. Applications will appear here automatically when students apply.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="text-[11px] uppercase font-bold text-slate-400 border-b border-slate-100">
                      <tr>
                        <th className="pb-3.5 font-bold">Candidate Name</th>
                        <th className="pb-3.5 font-bold">Applied Role</th>
                        <th className="pb-3.5 font-bold">Date Applied</th>
                        <th className="pb-3.5 font-bold">Resume / Profile</th>
                        <th className="pb-3.5 font-bold">Status</th>
                        <th className="pb-3.5 font-bold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredApplicants.map((app) => (
                        <tr key={app.id} className="hover:bg-[#F8F9FD]/60 transition">
                          <td className="py-4">
                            <div className="font-bold text-[#1E1B4B] text-sm">{app.name}</div>
                            <div className="text-slate-400 text-[11px]">{app.email}</div>
                          </td>
                          <td className="py-4 text-slate-600 font-semibold">{app.role}</td>
                          <td className="py-4 text-slate-500">{app.appliedAt || app.appliedDate}</td>
                          <td className="py-4">
                            <a
                              href={app.resumeUrl || "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[#202960] font-bold text-xs hover:underline"
                            >
                              <FileText className="w-3.5 h-3.5 text-indigo-600" /> View Resume
                            </a>
                          </td>
                          <td className="py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                                app.status === "OFFERED" || app.status === "ACCEPTED"
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : app.status === "INTERVIEWING"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-indigo-50 text-indigo-700 border-indigo-200"
                              }`}
                            >
                              {app.status}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedCandidate(app);
                                setIsScheduleModalOpen(true);
                              }}
                              className="px-4 py-2 bg-[#202960] hover:bg-[#2E2A72] text-white text-xs font-bold rounded-full transition shadow-sm cursor-pointer"
                            >
                              Schedule Round
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          )}

          {/* 4. SCHEDULED ROUNDS TAB */}
          {activeTab === "interviews" && (
            <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-black text-[#1E1B4B]">Scheduled Interview Rounds</h2>
                <p className="text-xs text-slate-500 mt-1">Live interview schedules, meet links, and candidate evaluations.</p>
              </div>

              {interviews.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No interview rounds scheduled yet. Use the Schedule Round button in the Applicants tab to create meetings.
                </div>
              ) : (
                <div className="space-y-4">
                  {interviews.map((intv) => (
                    <div
                      key={intv.id}
                      className="p-5 rounded-2xl border border-[#3B3588]/10 bg-[#F8F9FD] flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#1E1B4B]">{intv.candidateName}</span>
                          <span className="text-xs text-slate-400">• {intv.role}</span>
                        </div>
                        <p className="text-xs font-semibold text-[#202960]">{intv.roundName}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> {intv.time}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={intv.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 bg-[#202960] hover:bg-[#2E2A72] text-white text-xs font-bold rounded-full flex items-center gap-1.5 transition"
                        >
                          Join Room <ExternalLink className="w-3.5 h-3.5" />
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

      {/* JOB-SPECIFIC APPLICANTS MODAL */}
      {selectedJobForApplicants && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#3B3588]/15 rounded-[32px] w-full max-w-2xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase">
                  {selectedJobForApplicants.mode}
                </span>
                <h3 className="text-lg font-black text-[#1E1B4B] mt-1">
                  Applicants for &ldquo;{selectedJobForApplicants.title}&rdquo;
                </h3>
                <p className="text-xs text-slate-500">
                  {jobSpecificApplicants.length} candidate(s) have submitted applications for this position.
                </p>
              </div>
              <button
                onClick={() => setSelectedJobForApplicants(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-80 space-y-3">
              {jobSpecificApplicants.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No applications received yet for this specific opening.
                </div>
              ) : (
                jobSpecificApplicants.map((cand) => (
                  <div
                    key={cand.id}
                    className="p-4 rounded-2xl border border-[#3B3588]/10 bg-[#F8F9FD] flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-[#1E1B4B] text-sm">{cand.name}</div>
                      <div className="text-slate-400 text-xs">{cand.email}</div>
                      <div className="text-slate-500 text-[11px]">
                        Applied: {cand.appliedAt || cand.appliedDate}
                      </div>
                      {cand.resumeUrl && (
                        <a
                          href={cand.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[#202960] font-bold text-xs hover:underline mt-1"
                        >
                          <FileText className="w-3.5 h-3.5 text-indigo-600" /> View Candidate Resume
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                          cand.status === "OFFERED" || cand.status === "ACCEPTED"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : cand.status === "INTERVIEWING"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-indigo-50 text-indigo-700 border-indigo-200"
                        }`}
                      >
                        {cand.status}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedCandidate(cand);
                          setIsScheduleModalOpen(true);
                        }}
                        className="px-4 py-2 bg-[#202960] hover:bg-[#2E2A72] text-white text-xs font-bold rounded-full transition shadow-sm cursor-pointer"
                      >
                        Schedule Round
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedJobForApplicants(null)}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE INTERVIEW MODAL */}
      {isScheduleModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#3B3588]/15 rounded-[32px] w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-[#1E1B4B]">Schedule Interview</h3>
                <p className="text-xs text-slate-500">Candidate: {selectedCandidate.name}</p>
              </div>
              <button
                onClick={() => { setIsScheduleModalOpen(false); setSelectedCandidate(null); }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleInterviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                  Interview Round Title *
                </label>
                <input
                  type="text"
                  required
                  value={interviewForm.roundName}
                  onChange={(e) => setInterviewForm({ ...interviewForm, roundName: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={interviewForm.date}
                    onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                    Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={interviewForm.time}
                    onChange={(e) => setInterviewForm({ ...interviewForm, time: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                  Meeting Video URL (Google Meet / Zoom) *
                </label>
                <input
                  type="url"
                  required
                  value={interviewForm.meetingUrl}
                  onChange={(e) => setInterviewForm({ ...interviewForm, meetingUrl: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsScheduleModalOpen(false); setSelectedCandidate(null); }}
                  className="px-4 py-2 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#202960] hover:bg-[#2E2A72] text-white text-xs font-bold shadow-md shadow-[#202960]/20 flex items-center gap-2 cursor-pointer transition"
                >
                  Confirm & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POST NEW ROLE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#3B3588]/15 rounded-[32px] w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-[#1E1B4B]">Post New Internship Role</h3>
                <p className="text-xs text-slate-500">Publish position to active students on Visionary Interns Club</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {postError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                {postError}
              </div>
            )}

            <form onSubmit={handlePostRole} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                  Role Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Systems Engineer Intern"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                    Work Mode
                  </label>
                  <select
                    value={formData.mode}
                    onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                    className="w-full px-3 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
                  >
                    <option value="HYBRID">Hybrid</option>
                    <option value="REMOTE">Remote</option>
                    <option value="ON_SITE">On-Site</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bengaluru"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                    Monthly Stipend (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="25000"
                    value={formData.stipend}
                    onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                    Duration (Months)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={formData.durationMonths}
                    onChange={(e) => setFormData({ ...formData, durationMonths: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                  Required Skills (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Next.js, Node.js, PostgreSQL"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPosting}
                  className="px-6 py-2.5 rounded-full bg-[#202960] hover:bg-[#2E2A72] text-white text-xs font-bold shadow-md shadow-[#202960]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition"
                >
                  {isPosting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isPosting ? "Publishing..." : "Publish Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}