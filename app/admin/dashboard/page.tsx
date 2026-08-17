"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Building2,
  Briefcase,
  Users,
  Video,
  Award,
  Bell,
  RefreshCw,
  LogOut,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
  CheckCheck,
  Menu,
  X
} from "lucide-react";

export default function SuperAdminDashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "jobs" | "companies">("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Notification Feature State
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New company 'Tenar Systems' completed recruiter onboarding", time: "15m ago", read: false },
    { id: 2, text: "Internship posting 'IoT Firmware Engineer' published by Tech Innovations", time: "1h ago", read: false },
    { id: 3, text: "Fastify ATS backend health check ping completed (200 OK)", time: "3h ago", read: true },
  ]);

  const [stats, setStats] = useState({
    totalCompanies: 17,
    totalInternships: 16,
    totalApplications: 13,
    totalInterviews: 11,
    totalOffers: 1
  });

  const [companies, setCompanies] = useState([
    {
      id: "c1",
      name: "tenar",
      website: "https://tenar.in",
      activeRoles: 0,
      status: "VERIFIED"
    },
    {
      id: "c2",
      name: "Tech Innovations 1786971693632",
      website: "https://techinnovations.example.com",
      activeRoles: 1,
      status: "VERIFIED"
    },
    {
      id: "c3",
      name: "Backend Test Corp 1786971573283",
      website: "https://backendtest.example.com",
      activeRoles: 1,
      status: "VERIFIED"
    },
    {
      id: "c4",
      name: "Backend Test Corp 1786971023998",
      website: "https://backendtest.example.com",
      activeRoles: 1,
      status: "VERIFIED"
    },
    {
      id: "c5",
      name: "Backend Test Corp 1786970911742",
      website: "https://backendtest.example.com",
      activeRoles: 1,
      status: "VERIFIED"
    }
  ]);

  const fetchLiveStats = async () => {
    setIsRefreshing(true);
    try {
      const tokenRes = await fetch("http://127.0.0.1:3000/api/admin/dev-token", { method: "POST" });
      const tokenData = await tokenRes.json();

      if (tokenData.token) {
        const res = await fetch("http://127.0.0.1:3000/api/admin/overview", {
          headers: { Authorization: `Bearer ${tokenData.token}` }
        });
        const data = await res.json();
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (e) {
      // Fallback to initial live state
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveStats();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllNotifsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-slate-800 flex flex-col md:flex-row font-sans">
      {/* Mobile Backdrop */}
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
          {/* Logo & Portal Header */}
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
                  VIC SuperAdmin
                </div>
                <div className="text-[11px] font-bold text-[#3B3588]">Institutional Governance</div>
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

          {/* Admin Role Badge */}
          <div className="p-3.5 rounded-2xl bg-[#EDF0FF] border border-[#3B3588]/10 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#202960] text-white font-black flex items-center justify-center text-xs shadow-sm">
              SA
            </div>
            <div>
              <div className="font-bold text-xs text-[#1E1B4B]">Master Governance</div>
              <div className="text-[10px] text-indigo-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Root Privileges
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-xs font-bold">
            <button
              onClick={() => { setActiveTab("overview"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeTab === "overview"
                  ? "bg-[#202960] text-white shadow-md shadow-[#202960]/20"
                  : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF] hover:text-[#202960]"
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Global Overview
            </button>
            <button
              onClick={() => { setActiveTab("companies"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeTab === "companies"
                  ? "bg-[#202960] text-white shadow-md shadow-[#202960]/20"
                  : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF] hover:text-[#202960]"
              }`}
            >
              <Building2 className="w-4 h-4" /> Registered Companies
            </button>
            <button
              onClick={() => { setActiveTab("jobs"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeTab === "jobs"
                  ? "bg-[#202960] text-white shadow-md shadow-[#202960]/20"
                  : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF] hover:text-[#202960]"
              }`}
            >
              <Briefcase className="w-4 h-4" /> Live Job Board
            </button>
          </nav>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#3B3588]/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#EDF0FF] text-[#202960] font-bold text-xs flex items-center justify-center">
              AD
            </div>
            <div>
              <div className="text-xs font-bold text-[#1E1B4B]">Super Admin</div>
              <div className="text-[10px] text-slate-400">superadmin@vic.edu</div>
            </div>
          </div>
          <Link href="/" className="p-2 text-slate-400 hover:text-red-600 transition" title="Sign Out">
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
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
              <span className="hidden sm:inline">Administration</span>
              <span className="hidden sm:inline">/</span>
              <span className="text-[#1E1B4B] capitalize">Overview</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications Feature */}
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
                      <span className="font-bold text-sm text-[#1E1B4B]">SuperAdmin Alerts</span>
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

            {/* Refresh Button */}
            <button
              onClick={fetchLiveStats}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-[#202960] hover:bg-[#2E2A72] text-white font-bold text-xs shadow-md shadow-[#202960]/20 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </header>

        {/* Dashboard Canvas */}
        <div className="p-4 sm:p-8 space-y-8 max-w-7xl">
          {/* Hero Banner */}
          <section className="bg-gradient-to-br from-[#EDF0FF] via-white to-[#F8F9FD] border border-[#3B3588]/10 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#202960]/5 text-[#202960] text-[11px] font-black uppercase tracking-wider">
                <Sparkles className="w-3 h-3" /> Master Governance Portal
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#1E1B4B] tracking-tight">
                Superadmin Central Command
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
                Cross-system monitoring across ATS, Student Profiles, and Recruiter Activity.
              </p>
            </div>
            <Link
              href="/company"
              className="px-5 py-2.5 rounded-full border border-[#202960]/20 text-[#202960] font-bold text-xs hover:bg-[#EDF0FF] transition flex items-center gap-1.5"
            >
              Recruiter ATS View <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </section>

          {/* Metric Stats Cards */}
          <section className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
            <div className="bg-white border border-[#3B3588]/10 p-5 sm:p-6 rounded-3xl shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Companies</span>
                <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#1E1B4B]">{stats.totalCompanies}</div>
            </div>

            <div className="bg-white border border-[#3B3588]/10 p-5 sm:p-6 rounded-3xl shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Internships</span>
                <div className="w-7 h-7 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#1E1B4B]">{stats.totalInternships}</div>
            </div>

            <div className="bg-white border border-[#3B3588]/10 p-5 sm:p-6 rounded-3xl shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Applications</span>
                <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#1E1B4B]">{stats.totalApplications}</div>
            </div>

            <div className="bg-white border border-[#3B3588]/10 p-5 sm:p-6 rounded-3xl shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Interviews</span>
                <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Video className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#1E1B4B]">{stats.totalInterviews}</div>
            </div>

            <div className="bg-white border border-[#3B3588]/10 p-5 sm:p-6 rounded-3xl shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Offers Issued</span>
                <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Award className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#1E1B4B]">{stats.totalOffers}</div>
            </div>
          </section>

          {/* Registered Partner Organizations Table */}
          <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-black text-[#1E1B4B]">Registered Partner Organizations</h2>
                <p className="text-xs text-slate-500 mt-0.5">Recruiters authorized on the Visionary Interns Club platform.</p>
              </div>
              <Link href="/company" className="text-xs font-bold text-[#202960] hover:underline flex items-center gap-1">
                Recruiter ATS View <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] uppercase font-bold text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="pb-3.5 font-bold">Company Name</th>
                    <th className="pb-3.5 font-bold">Domain / Website</th>
                    <th className="pb-3.5 font-bold">Active Roles</th>
                    <th className="pb-3.5 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {companies.map((comp) => (
                    <tr key={comp.id} className="hover:bg-[#F8F9FD]/60 transition">
                      <td className="py-4.5 font-bold text-[#1E1B4B] text-sm">{comp.name}</td>
                      <td className="py-4.5 text-slate-500">
                        <a
                          href={comp.website}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-[#202960] hover:underline flex items-center gap-1"
                        >
                          {comp.website} <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      </td>
                      <td className="py-4.5 font-semibold text-slate-600">{comp.activeRoles} Postings</td>
                      <td className="py-4.5">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-[10px] font-black">
                          {comp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}