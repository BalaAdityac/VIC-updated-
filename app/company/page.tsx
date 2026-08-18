"use client";

import { useEffect, useState, useMemo } from "react";
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
  CheckCheck
} from "lucide-react";

export default function CompanyDashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "jobs" | "applications" | "interviews">("overview");

  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // Notifications State
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Bala Aditya submitted an application for Full Stack Intern", time: "10m ago", read: false },
    { id: 2, text: "Interview confirmed with Disham N for IoT Systems round", time: "1h ago", read: false },
    { id: 3, text: "Offer letter accepted by candidate Sanjay Kumar", time: "1d ago", read: true },
  ]);

  // Modal & Posting State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState("Tenar");
  const [companyEmail, setCompanyEmail] = useState("admin@tenar.com");

  // Mockup base jobs
  const initialJobs = [
    {
      id: "job-1",
      title: "Full Stack Engineering Intern",
      mode: "Hybrid",
      location: "Bengaluru",
      stipend: "₹25,000 / mo",
      applicantsCount: 4,
      status: "ACTIVE",
      postedAt: "2 days ago",
      skills: ["React", "Next.js", "Node.js"]
    },
    {
      id: "job-2",
      title: "IoT Systems & Firmware Intern",
      mode: "On-Site",
      location: "Bengaluru",
      stipend: "₹30,000 / mo",
      applicantsCount: 2,
      status: "ACTIVE",
      postedAt: "5 days ago",
      skills: ["C++", "FreeRTOS", "Sensors"]
    }
  ];

  const [jobs, setJobs] = useState(initialJobs);

  // Applicants Mockup Data
  const [applicants, setApplicants] = useState([
    {
      id: "app-1",
      name: "Bala Aditya C",
      role: "Full Stack Engineering Intern",
      email: "aditya@example.com",
      status: "INTERVIEWING",
      appliedAt: "Aug 16, 2026",
      resumeUrl: "#"
    },
    {
      id: "app-2",
      name: "Disham N",
      role: "IoT Systems & Firmware Intern",
      email: "disham@example.com",
      status: "APPLIED",
      appliedAt: "Aug 15, 2026",
      resumeUrl: "#"
    },
    {
      id: "app-3",
      name: "Sanjay Kumar",
      role: "Full Stack Engineering Intern",
      email: "sanjay@example.com",
      status: "OFFERED",
      appliedAt: "Aug 14, 2026",
      resumeUrl: "#"
    }
  ]);

  // Scheduled Interviews Mockup Data
  const [interviews, setInterviews] = useState([
    {
      id: "intv-1",
      candidateName: "Bala Aditya C",
      role: "Full Stack Engineering Intern",
      roundName: "Live Coding & Architecture",
      time: "Aug 19, 2026 • 2:00 PM",
      meetingUrl: "https://meet.google.com/vic-test-room",
      status: "SCHEDULED"
    },
    {
      id: "intv-2",
      candidateName: "Disham N",
      role: "IoT Systems & Firmware Intern",
      roundName: "Embedded Hardware & RTOS Round",
      time: "Aug 20, 2026 • 4:30 PM",
      meetingUrl: "https://meet.google.com/vic-embedded-round",
      status: "SCHEDULED"
    }
  ]);

  // Form State for Post New Role
  const [formData, setFormData] = useState({
    title: "",
    mode: "HYBRID",
    location: "Bengaluru",
    stipend: "",
    durationMonths: "6",
    skills: "",
    description: ""
  });

  // Load custom persisted jobs on mount
  useEffect(() => {
    const storedCompany = localStorage.getItem("company_data");
    if (storedCompany) {
      try {
        const parsed = JSON.parse(storedCompany);
        if (parsed.companyName) setCompanyName(parsed.companyName);
        if (parsed.email) setCompanyEmail(parsed.email);
      } catch (e) {}
    }

    const customJobsStr = localStorage.getItem("vic_custom_jobs");
    if (customJobsStr) {
      try {
        const customJobs = JSON.parse(customJobsStr);
        if (Array.isArray(customJobs) && customJobs.length > 0) {
          setJobs([...customJobs, ...initialJobs]);
        }
      } catch (e) {}
    }
  }, []);

  // Filtered lists based on search query
  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs;
    const q = searchQuery.toLowerCase();
    return jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.mode.toLowerCase().includes(q)
    );
  }, [jobs, searchQuery]);

  const filteredApplicants = useMemo(() => {
    if (!searchQuery.trim()) return applicants;
    const q = searchQuery.toLowerCase();
    return applicants.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q)
    );
  }, [applicants, searchQuery]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllNotifsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  // Real-time Post Role Handler
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

      // Update Local State & Persist Pipeline
      const existingCustom = JSON.parse(localStorage.getItem("vic_custom_jobs") || "[]");
      const updatedCustom = [createdJob, ...existingCustom];
      localStorage.setItem("vic_custom_jobs", JSON.stringify(updatedCustom));

      // Trigger cross-component real-time pipeline event
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
                {companyName.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-xs text-[#1E1B4B] capitalize">{companyName}</div>
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
              <Briefcase className="w-4 h-4" /> Job Postings
            </button>
            <button
              onClick={() => { setActiveTab("applications"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeTab === "applications"
                  ? "bg-[#202960] text-white shadow-md shadow-[#202960]/20"
                  : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF] hover:text-[#202960]"
              }`}
            >
              <Users className="w-4 h-4" /> Applicants
            </button>
            <button
              onClick={() => { setActiveTab("interviews"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeTab === "interviews"
                  ? "bg-[#202960] text-white shadow-md shadow-[#202960]/20"
                  : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF] hover:text-[#202960]"
              }`}
            >
              <Video className="w-4 h-4" /> Scheduled Rounds
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-[#3B3588]/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#EDF0FF] text-[#202960] font-bold text-xs flex items-center justify-center">
              TS
            </div>
            <div>
              <div className="text-xs font-bold text-[#1E1B4B]">Recruiter Admin</div>
              <div className="text-[10px] text-slate-400 truncate max-w-[110px]">{companyEmail}</div>
            </div>
          </div>
          <Link href="/" className="p-2 text-slate-400 hover:text-red-600 transition" title="Logout">
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
            {/* Search */}
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

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2.5 rounded-full bg-[#F8F9FD] border border-[#3B3588]/15 text-slate-600 hover:text-[#202960] transition"
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
                        className="text-[11px] font-bold text-[#202960] hover:underline flex items-center gap-1"
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
                        <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Post New Role */}
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

        <div className="p-4 sm:p-8 space-y-8 max-w-7xl">
          {searchQuery && (
            <div className="p-3 bg-[#EDF0FF] rounded-2xl border border-[#3B3588]/15 text-xs text-[#1E1B4B] flex items-center justify-between">
              <span>Filtering results for: <strong>&ldquo;{searchQuery}&rdquo;</strong></span>
              <button onClick={() => setSearchQuery("")} className="font-bold text-[#202960] hover:underline text-xs">
                Clear filter
              </button>
            </div>
          )}

          {/* OVERVIEW TAB */}
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
                  className="px-5 py-3 rounded-full bg-[#202960] text-white font-bold text-xs hover:bg-[#2E2A72] transition shadow-md shadow-[#202960]/20"
                >
                  Create New Position
                </button>
              </section>

              <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                <div
                  onClick={() => setActiveTab("jobs")}
                  className="bg-white border border-[#3B3588]/10 p-5 sm:p-6 rounded-3xl shadow-sm hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Roles</span>
                    <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                      <Briefcase className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#1E1B4B]">{jobs.length}</div>
                  <div className="text-[11px] text-emerald-600 font-bold mt-1">● Live on Job Board</div>
                </div>

                <div
                  onClick={() => setActiveTab("applications")}
                  className="bg-white border border-[#3B3588]/10 p-5 sm:p-6 rounded-3xl shadow-sm hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Applicants</span>
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#1E1B4B]">{applicants.length}</div>
                  <div className="text-[11px] text-indigo-600 font-bold mt-1">Submissions received</div>
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
                  <div className="text-2xl sm:text-3xl font-black text-[#1E1B4B]">1</div>
                  <div className="text-[11px] text-purple-600 font-bold mt-1">100% Accepted</div>
                </div>
              </section>

              <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-black text-[#1E1B4B]">Live Internship Postings</h2>
                    <p className="text-xs text-slate-500">Live positions open for student applications.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("jobs")}
                    className="text-xs font-bold text-[#202960] hover:underline flex items-center gap-1"
                  >
                    View All <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
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
                          <td className="py-4 font-semibold text-slate-600">{j.applicantsCount} Candidates</td>
                          <td className="py-4">
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-[10px] font-black">
                              {j.status}
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

          {/* JOBS TAB */}
          {activeTab === "jobs" && (
            <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-black text-[#1E1B4B]">Job Postings Management</h2>
                  <p className="text-xs text-slate-500 mt-1">Create, edit, and view live pipeline roles.</p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#202960] text-white font-bold text-xs shadow-md"
                >
                  <Plus className="w-4 h-4" /> Create New Role
                </button>
              </div>

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
                      {job.skills?.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold text-slate-600">
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#3B3588]/10 text-xs">
                      <span className="font-black text-[#202960]">{job.stipend}</span>
                      <span className="text-slate-500">{job.applicantsCount} Applicants</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* APPLICANTS TAB */}
          {activeTab === "applications" && (
            <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-black text-[#1E1B4B]">Candidate Submissions</h2>
                <p className="text-xs text-slate-500 mt-1">Review student applications and take recruitment actions.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] uppercase font-bold text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="pb-3.5 font-bold">Candidate Name</th>
                      <th className="pb-3.5 font-bold">Applied Role</th>
                      <th className="pb-3.5 font-bold">Date Applied</th>
                      <th className="pb-3.5 font-bold">Status</th>
                      <th className="pb-3.5 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredApplicants.map((app) => (
                      <tr key={app.id} className="hover:bg-[#F8F9FD]/60 transition">
                        <td className="py-4 font-bold text-[#1E1B4B] text-sm">{app.name}</td>
                        <td className="py-4 text-slate-500">{app.role}</td>
                        <td className="py-4 text-slate-500">{app.appliedAt}</td>
                        <td className="py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                              app.status === "OFFERED"
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
                            onClick={() => setActiveTab("interviews")}
                            className="px-3.5 py-1.5 bg-[#202960] text-white text-xs font-bold rounded-full hover:bg-[#2E2A72] transition"
                          >
                            Schedule Round
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* SCHEDULED ROUNDS TAB */}
          {activeTab === "interviews" && (
            <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-black text-[#1E1B4B]">Scheduled Interview Rounds</h2>
                <p className="text-xs text-slate-500 mt-1">Live interview schedules, meet links, and candidate evaluations.</p>
              </div>

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
            </section>
          )}
        </div>
      </main>

      {/* POST NEW ROLE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#3B3588]/15 rounded-[32px] w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-[#1E1B4B]">Post New Internship Role</h3>
                <p className="text-xs text-slate-500">Instant real-time update to student Explore page</p>
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