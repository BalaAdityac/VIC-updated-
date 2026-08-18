"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  MapPin,
  CheckCircle2,
  Building2,
  Calendar
} from "lucide-react";


export default function StudentDashboard() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "applications" | "internships" | "interviews">("overview");

  // --- ADD NOTIFICATION STATES HERE ---
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Interview scheduled with Tech Innovations Corp for Aug 19, 2026", time: "1h ago", read: false },
    { id: 2, text: "Application submitted for IoT Systems & Firmware Intern", time: "2d ago", read: false },
    { id: 3, text: "Offer letter issued by CloudScale Labs (₹20,000/mo)", time: "3d ago", read: true },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllNotifsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };
  // ------------------------------------

  const [studentName, setStudentName] = useState("Bala Aditya C");
  const [studentEmail, setStudentEmail] = useState("student.aditya@example.com");

  // Live Student Applications
  const [myApplications, setMyApplications] = useState([
    {
      id: "app-101",
      role: "Full Stack Engineering Intern",
      company: "Tech Innovations Corp",
      appliedDate: "Aug 15, 2026",
      stipend: "₹25,000 / mo",
      status: "INTERVIEWING",
      location: "Bengaluru • Hybrid"
    },
    {
      id: "app-102",
      role: "IoT Systems & Firmware Intern",
      company: "Tenar Systems",
      appliedDate: "Aug 12, 2026",
      stipend: "₹30,000 / mo",
      status: "APPLIED",
      location: "Bengaluru • On-Site"
    },
    {
      id: "app-103",
      role: "Next.js Web Developer Intern",
      company: "CloudScale Labs",
      appliedDate: "Aug 08, 2026",
      stipend: "₹20,000 / mo",
      status: "OFFERED",
      location: "Remote"
    }
  ]);

  // Scheduled Interviews
  const [scheduledInterviews, setScheduledInterviews] = useState([
    {
      id: "intv-201",
      company: "Tech Innovations Corp",
      role: "Full Stack Engineering Intern",
      round: "Live Architecture & Coding Round",
      date: "Aug 19, 2026",
      time: "2:00 PM - 3:00 PM IST",
      meetUrl: "https://meet.google.com/vic-student-room"
    }
  ]);

  // Browse Available Internships
  const [availableJobs, setAvailableJobs] = useState([
    {
      id: "job-1",
      title: "Full Stack Engineering Intern",
      company: "Tech Innovations Corp",
      location: "Bengaluru",
      mode: "Hybrid",
      stipend: "₹25,000 / mo",
      deadline: "Aug 30, 2026",
      skills: ["React", "Next.js", "Node.js", "PostgreSQL"]
    },
    {
      id: "job-2",
      title: "IoT Systems & Firmware Intern",
      company: "Tenar Systems",
      location: "Bengaluru",
      mode: "On-Site",
      stipend: "₹30,000 / mo",
      deadline: "Sep 05, 2026",
      skills: ["C++", "FreeRTOS", "Sensors", "Embedded C"]
    },
    {
      id: "job-3",
      title: "AI Solutions & Prompt Engineer Intern",
      company: "VIC Labs",
      location: "Bengaluru / Remote",
      mode: "Remote",
      stipend: "₹28,000 / mo",
      deadline: "Aug 28, 2026",
      skills: ["Python", "GenAI SDK", "FastAPI"]
    }
  ]);

  useEffect(() => {
    const stored = localStorage.getItem("student_data");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.name) setStudentName(parsed.name);
        if (parsed.email) setStudentEmail(parsed.email);
      } catch (e) {}
    }
  }, []);

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
          {/* Logo */}
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

          {/* Student Profile Pill */}
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

          {/* Nav Links */}
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
              <FileText className="w-4 h-4" /> My Applications
            </button>

            <button
              onClick={() => { setActiveTab("internships"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeTab === "internships"
                  ? "bg-[#202960] text-white shadow-md shadow-[#202960]/20"
                  : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF] hover:text-[#202960]"
              }`}
            >
              <Briefcase className="w-4 h-4" /> Explore Openings
            </button>

            <button
              onClick={() => { setActiveTab("interviews"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeTab === "interviews"
                  ? "bg-[#202960] text-white shadow-md shadow-[#202960]/20"
                  : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF] hover:text-[#202960]"
              }`}
            >
              <Video className="w-4 h-4" /> Live Interviews
            </button>
          </nav>
        </div>

        {/* Footer */}
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
        {/* Header */}
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

          <header className="h-16 md:h-18 px-4 sm:px-8 border-b border-[#3B3588]/10 bg-white flex items-center justify-between sticky top-0 z-20">
  {/* Left Side: Mobile Menu Button & Breadcrumb */}
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

  {/* Right Side: Bell Notification Dropdown + Find Internships Button */}
  <div className="flex items-center gap-3">
    {/* 🔔 1. Notification Dropdown */}
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

      {/* Popover Card that appears on click */}
      {isNotifOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-[#3B3588]/15 rounded-3xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
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
                  n.read
                    ? "bg-[#F8F9FD] text-slate-500"
                    : "bg-[#EDF0FF]/60 text-slate-800 font-medium"
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

    {/* 🔍 2. Find Internships Button */}
    <button
      onClick={() => setActiveTab("internships")}
      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#202960] hover:bg-[#2E2A72] text-white font-bold text-xs shadow-md shadow-[#202960]/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
    >
      <Search className="w-3.5 h-3.5" /> Find Internships
    </button>
  </div>
</header>
        </header>

        {/* Dynamic Tab Body */}
        <div className="p-4 sm:p-8 space-y-8 max-w-7xl">
          {/* 1. OVERVIEW TAB */}
          {activeTab === "overview" && (
            <>
              {/* Banner */}
              <section className="bg-gradient-to-br from-[#EDF0FF] via-white to-[#F8F9FD] border border-[#3B3588]/10 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#202960]/5 text-[#202960] text-[11px] font-black uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" /> Career Acceleration
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#1E1B4B] tracking-tight">
                    Hello, {studentName}!
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
                    Track your active applications, join scheduled technical interview rounds, and apply for verified internship roles.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("internships")}
                  className="px-5 py-3 rounded-full bg-[#202960] text-white font-bold text-xs hover:bg-[#2E2A72] transition shadow-md shadow-[#202960]/20"
                >
                  Browse Top Positions
                </button>
              </section>

              {/* Stats */}
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
                  <div className="text-2xl sm:text-3xl font-black text-[#1E1B4B]">{scheduledInterviews.length}</div>
                  <div className="text-[11px] text-amber-600 font-bold mt-1">Scheduled Round</div>
                </div>

                <div className="bg-white border border-[#3B3588]/10 p-5 sm:p-6 rounded-3xl shadow-sm hover:shadow-md transition">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Offers Received</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Award className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#1E1B4B]">1</div>
                  <div className="text-[11px] text-purple-600 font-bold mt-1">CloudScale Labs</div>
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
                  <div className="text-[11px] text-emerald-600 font-bold mt-1">Available today</div>
                </div>
              </section>

              {/* My Applications Table */}
              <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-black text-[#1E1B4B]">My Active Applications</h2>
                    <p className="text-xs text-slate-500">Real-time status updates from hiring companies.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("applications")}
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {/* 2. MY APPLICATIONS TAB */}
          {activeTab === "applications" && (
            <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-black text-[#1E1B4B]">My Applications Pipeline</h2>
                <p className="text-xs text-slate-500 mt-1">Detailed application timeline and recruiter responses.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myApplications.map((app) => (
                  <div key={app.id} className="p-5 rounded-2xl border border-[#3B3588]/10 bg-[#F8F9FD] space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-sm text-[#1E1B4B]">{app.role}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{app.company} • {app.location}</p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                          app.status === "OFFERED"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : app.status === "INTERVIEWING"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-indigo-50 text-indigo-700 border-indigo-200"
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#3B3588]/10 text-xs">
                      <span className="font-black text-[#202960]">{app.stipend}</span>
                      <span className="text-slate-400">Applied: {app.appliedDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 3. EXPLORE INTERNSHIPS TAB */}
          {activeTab === "internships" && (
            <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-black text-[#1E1B4B]">Explore Live Internship Openings</h2>
                <p className="text-xs text-slate-500 mt-1">Verified student opportunities with transparent stipends.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableJobs.map((job) => (
                  <div key={job.id} className="p-5 rounded-2xl border border-[#3B3588]/10 bg-[#F8F9FD] space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-sm text-[#1E1B4B]">{job.title}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">{job.company}</p>
                        </div>
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-[10px] font-black">
                          {job.mode}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {job.skills.map((s, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold text-slate-600">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#3B3588]/10 flex items-center justify-between">
                      <span className="font-black text-xs text-[#202960]">{job.stipend}</span>
                      <button
                        onClick={() => router.push(`/student/internships/${job.id}`)}
                        className="px-4 py-1.5 bg-[#202960] hover:bg-[#2E2A72] text-white text-xs font-bold rounded-full transition"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 4. INTERVIEWS TAB */}
          {activeTab === "interviews" && (
            <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-black text-[#1E1B4B]">Scheduled Technical Interviews</h2>
                <p className="text-xs text-slate-500 mt-1">Join your live Google Meet video rooms for technical evaluation.</p>
              </div>

              <div className="space-y-4">
                {scheduledInterviews.map((intv) => (
                  <div
                    key={intv.id}
                    className="p-5 rounded-2xl border border-[#3B3588]/10 bg-[#F8F9FD] flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#1E1B4B]">{intv.role}</span>
                        <span className="text-xs text-slate-400">• {intv.company}</span>
                      </div>
                      <p className="text-xs font-semibold text-[#202960]">{intv.round}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> {intv.date} • {intv.time}
                      </p>
                    </div>

                    <div>
                      <a
                        href={intv.meetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-5 py-2.5 bg-[#202960] hover:bg-[#2E2A72] text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-md shadow-[#202960]/20 transition"
                      >
                        Join Interview Room <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
