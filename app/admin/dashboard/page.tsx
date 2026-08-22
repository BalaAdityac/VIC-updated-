"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  Briefcase,
  Users,
  Video,
  Award,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  FileText,
  Search,
  X,
  Lock,
  Unlock,
  CheckCheck,
  Loader2,
  ShieldCheck,
  Printer
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

function formatStipend(val: any): string {
  if (val === null || val === undefined || val === "") return "₹0 / mo";
  if (typeof val === "string" && (val.includes("₹") || val.includes("/ mo") || val.includes("/mo"))) {
    return val;
  }
  const numeric = typeof val === "number" ? val : parseFloat(String(val).replace(/[^0-9.]/g, ""));
  if (isNaN(numeric) || numeric === 0) return "₹0 / mo";
  return `₹${numeric.toLocaleString("en-IN")} / mo`;
}

const isTestCorp = (name: string) => /backend\s*test\s*corp|testcorp/i.test(name || "");

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Global Administrative Entities
  const [companies, setCompanies] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [blockedEntities, setBlockedEntities] = useState<string[]>([]);

  // UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInspectApp, setSelectedInspectApp] = useState<any | null>(null);
  const [selectedOfferPreview, setSelectedOfferPreview] = useState<any | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

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

  const loadDashboardData = useCallback(() => {
    if (typeof window === "undefined") return;
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch Blocked Registry
      let blockedList: string[] = [];
      try {
        blockedList = JSON.parse(localStorage.getItem("vic_blocked_entities") || "[]");
        setBlockedEntities(blockedList);
      } catch {}

      // 2. Fetch Jobs
      let localJobs: any[] = [];
      try {
        localJobs = JSON.parse(localStorage.getItem("vic_custom_jobs") || "[]");
      } catch {}

      const deletedJobIds = new Set(JSON.parse(localStorage.getItem("vic_deleted_jobs") || "[]"));
      const jobMap = new Map<string, any>();

      localJobs.forEach((job) => {
        if (!deletedJobIds.has(job.id) && !isTestCorp(job.company)) {
          const dedupeKey = `${String(job.title).trim().toLowerCase()}::${String(job.company || "").trim().toLowerCase()}`;
          jobMap.set(dedupeKey, {
            ...job,
            stipend: formatStipend(job.stipend),
            status: blockedList.includes(String(job.company).toLowerCase()) ? "BLOCKED" : job.status || "ACTIVE"
          });
        }
      });

      if (jobMap.size === 0) {
        const defaults = [
          {
            id: "job-1",
            title: "Frontend Engineering Intern",
            company: "Accenture",
            location: "Bengaluru",
            mode: "HYBRID",
            stipend: "₹25,000 / mo",
            durationMonths: 6,
            skills: ["React", "TypeScript", "Tailwind CSS"],
            status: "ACTIVE"
          },
          {
            id: "job-2",
            title: "Embedded Systems Intern",
            company: "Nexus Autonomous",
            location: "Bengaluru",
            mode: "ON-SITE",
            stipend: "₹30,000 / mo",
            durationMonths: 6,
            skills: ["C++", "FreeRTOS", "IoT", "Sensors"],
            status: "ACTIVE"
          }
        ];
        defaults.forEach((d) => jobMap.set(`${d.title.toLowerCase()}::${d.company.toLowerCase()}`, d));
      }

      const unifiedJobs = Array.from(jobMap.values());
      setJobs(unifiedJobs);

      // 3. Fetch Applications
      let localApps: any[] = [];
      try {
        localApps = JSON.parse(localStorage.getItem("vic_applications") || "[]");
      } catch {}

      const appMap = new Map<string, any>();
      localApps.forEach((app) => {
        if (!isTestCorp(app.company)) {
          const dedupeKey = `${String(app.email || "").trim().toLowerCase()}::${String(app.role || "").trim().toLowerCase()}::${String(app.company || "").trim().toLowerCase()}`;
          if (!appMap.has(dedupeKey)) {
            appMap.set(dedupeKey, {
              ...app,
              stipend: formatStipend(app.stipend),
              appliedDate: formatDateSafe(app.appliedDate || app.appliedAt || app.createdAt),
              isBlocked: blockedList.includes(String(app.email).toLowerCase())
            });
          }
        }
      });
      const unifiedApplications = Array.from(appMap.values());
      setApplications(unifiedApplications);

      // 4. Fetch Companies
      const compMap = new Map<string, any>();
      try {
        const regComps = JSON.parse(localStorage.getItem("vic_registered_companies") || "[]");
        regComps.forEach((c: any) => {
          if (!isTestCorp(c.companyName)) {
            compMap.set(c.companyName.toLowerCase(), {
              id: c.id || `comp-${c.companyName.toLowerCase().replace(/\s+/g, "-")}`,
              companyName: c.companyName,
              website: c.website || "https://company.io",
              email: c.email,
              status: blockedList.includes(c.companyName.toLowerCase()) ? "SUSPENDED" : "VERIFIED"
            });
          }
        });
      } catch {}

      unifiedJobs.forEach((job) => {
        const cName = job.company;
        if (cName && !isTestCorp(cName) && !compMap.has(cName.toLowerCase())) {
          compMap.set(cName.toLowerCase(), {
            id: `comp-${cName.toLowerCase().replace(/\s+/g, "-")}`,
            companyName: cName,
            website: `https://${cName.toLowerCase().replace(/\s+/g, "")}.com`,
            email: `recruiter@${cName.toLowerCase().replace(/\s+/g, "")}.com`,
            status: blockedList.includes(cName.toLowerCase()) ? "SUSPENDED" : "VERIFIED"
          });
        }
      });

      const defaultPartners = [
        { name: "Accenture", email: "recruitment@accenture.com", website: "https://accenture.com" },
        { name: "Nexus Autonomous", email: "recruiter@nexus.com", website: "https://nexus.io" },
        { name: "Tenar Systems", email: "admin@tenar.com", website: "https://tenar.in" }
      ];

      defaultPartners.forEach((p) => {
        if (!compMap.has(p.name.toLowerCase())) {
          compMap.set(p.name.toLowerCase(), {
            id: `comp-${p.name.toLowerCase().replace(/\s+/g, "-")}`,
            companyName: p.name,
            website: p.website,
            email: p.email,
            status: blockedList.includes(p.name.toLowerCase()) ? "SUSPENDED" : "VERIFIED"
          });
        }
      });

      setCompanies(Array.from(compMap.values()));

      // 5. Fetch Registered Students
      try {
        const regStudents = JSON.parse(localStorage.getItem("vic_registered_students") || "[]");
        setStudents(regStudents);
      } catch {
        setStudents([]);
      }
    } catch {
      setError("Synchronized with active client persistence.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadDashboardData();

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        bc = new BroadcastChannel("vic_realtime_pipeline");
        bc.onmessage = () => loadDashboardData();
      }
    } catch {}

    const handleLocalSync = () => loadDashboardData();
    window.addEventListener("vic_pipeline_sync", handleLocalSync);
    window.addEventListener("storage", handleLocalSync);

    return () => {
      if (bc) bc.close();
      window.removeEventListener("vic_pipeline_sync", handleLocalSync);
      window.removeEventListener("storage", handleLocalSync);
    };
  }, [loadDashboardData]);

  const handleAdminDecision = (app: any, newStatus: "ACCEPTED" | "REJECTED" | "SHORTLISTED") => {
    try {
      const storedApps: any[] = JSON.parse(localStorage.getItem("vic_applications") || "[]");
      const updatedApps = storedApps.map((a: any) => {
        if (
          a.id === app.id ||
          (String(a.email).toLowerCase() === String(app.email).toLowerCase() &&
            String(a.role).toLowerCase() === String(app.role).toLowerCase() &&
            String(a.company).toLowerCase() === String(app.company).toLowerCase())
        ) {
          return { ...a, status: newStatus };
        }
        return a;
      });

      localStorage.setItem("vic_applications", JSON.stringify(updatedApps));

      const studentNotifs: any[] = JSON.parse(localStorage.getItem("vic_student_notifications") || "[]");
      const adminNotif = {
        id: Date.now(),
        candidateEmail: app.email,
        text:
          newStatus === "ACCEPTED"
            ? `SuperAdmin Authorized Offer: Your application for "${app.role}" at ${app.company} has been approved.`
            : `SuperAdmin Update: Application for "${app.role}" at ${app.company} set to ${newStatus}.`,
        time: "Just now",
        read: false,
        type: newStatus
      };
      localStorage.setItem("vic_student_notifications", JSON.stringify([adminNotif, ...studentNotifs]));

      notifyPipeline({
        type: "DECISION_UPDATED",
        data: { candidateEmail: app.email, newStatus, role: app.role }
      });

      setActionSuccessMsg(`Application for ${app.name} (${app.role}) set to ${newStatus}.`);
      setTimeout(() => setActionSuccessMsg(null), 3500);

      loadDashboardData();
    } catch {}
  };

  const handleToggleBlockEntity = (identifier: string, isBlocked: boolean) => {
    try {
      const target = String(identifier).trim().toLowerCase();
      let currentBlocked: string[] = JSON.parse(localStorage.getItem("vic_blocked_entities") || "[]");

      if (isBlocked) {
        currentBlocked = currentBlocked.filter((b) => b !== target);
      } else {
        if (!currentBlocked.includes(target)) currentBlocked.push(target);
      }

      localStorage.setItem("vic_blocked_entities", JSON.stringify(currentBlocked));
      setBlockedEntities(currentBlocked);

      notifyPipeline({ type: "GOVERNANCE_BLOCK_UPDATED", data: { entity: target, blocked: !isBlocked } });

      setActionSuccessMsg(`${identifier} has been ${isBlocked ? "UNBLOCKED" : "BLOCKED / SUSPENDED"}.`);
      setTimeout(() => setActionSuccessMsg(null), 3500);

      loadDashboardData();
    } catch {}
  };

  const handleAdminDeleteJob = (job: any) => {
    try {
      const deletedIds = JSON.parse(localStorage.getItem("vic_deleted_jobs") || "[]");
      if (!deletedIds.includes(job.id)) {
        deletedIds.push(job.id);
        localStorage.setItem("vic_deleted_jobs", JSON.stringify(deletedIds));
      }

      const allCustomJobs = JSON.parse(localStorage.getItem("vic_custom_jobs") || "[]");
      const updated = allCustomJobs.filter((j: any) => j.id !== job.id);
      localStorage.setItem("vic_custom_jobs", JSON.stringify(updated));

      notifyPipeline({ type: "JOB_DELETED", data: { id: job.id, title: job.title } });

      setActionSuccessMsg(`Job Posting "${job.title}" removed globally.`);
      setTimeout(() => setActionSuccessMsg(null), 3500);

      loadDashboardData();
    } catch {}
  };

  const filteredApplications = useMemo(() => {
    if (!searchQuery.trim()) return applications;
    const q = searchQuery.toLowerCase();
    return applications.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.role?.toLowerCase().includes(q) ||
        a.company?.toLowerCase().includes(q) ||
        a.status?.toLowerCase().includes(q)
    );
  }, [applications, searchQuery]);

  const computedStats = useMemo(() => {
    const uniqueStudents = new Set(
      [...applications.map((a) => a.email), ...students.map((s) => s.email)]
        .map((e) => String(e || "").toLowerCase().trim())
        .filter(Boolean)
    );
    const uniqueRecruiters = new Set(companies.map((c) => String(c.email || "").toLowerCase().trim()).filter(Boolean));

    const totalInterviewsCount = applications.reduce((acc, app) => {
      return acc + (Array.isArray(app.interviews) ? app.interviews.length : 0);
    }, 0);

    const totalOffersCount = applications.filter(
      (a) => a.status === "ACCEPTED" || a.status === "OFFERED" || a.status === "HIRED / ACCEPTED"
    ).length;

    return {
      totalUsers: uniqueStudents.size + uniqueRecruiters.size,
      totalCompanies: companies.length,
      totalInternships: jobs.length,
      totalApplications: applications.length,
      totalInterviews: totalInterviewsCount,
      totalOffers: totalOffersCount
    };
  }, [applications, companies, jobs, students]);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#202960]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-12">
      {/* SuperAdmin Header */}
      <section className="bg-gradient-to-br from-[#EDF0FF] via-white to-[#F8F9FD] border border-[#3B3588]/10 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          {/* <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#202960]/5 text-[#202960] text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Governance Command Center
          </div> */}
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E1B4B] tracking-tight">
            SuperAdmin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Complete institutional control across student submissions, recruiter vacancies, and multi-tenant pipeline operations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="p-3 rounded-2xl bg-white border border-[#3B3588]/15 text-slate-600 hover:text-[#202960] transition cursor-pointer shadow-sm"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </section>

      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCheck className="w-4 h-4 text-emerald-600" /> {actionSuccessMsg}
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600" /> {error}
        </div>
      )}

      {/* Aggregate Metric Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white border border-[#3B3588]/10 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Total Users</span>
            <Users className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-[#1E1B4B]">{computedStats.totalUsers}</div>
          <div className="text-[10px] text-slate-400 mt-1">Platform Accounts</div>
        </div>

        <div className="bg-white border border-[#3B3588]/10 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Companies</span>
            <Building2 className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-[#1E1B4B]">{computedStats.totalCompanies}</div>
          <div className="text-[10px] text-slate-400 mt-1">Total Companies</div>
        </div>

        <div className="bg-white border border-[#3B3588]/10 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Job Roles</span>
            <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-[#1E1B4B]">{computedStats.totalInternships}</div>
          <div className="text-[10px] text-slate-400 mt-1">Active Postings</div>
        </div>

        <div className="bg-white border border-[#3B3588]/10 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Applications</span>
            <FileText className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-[#1E1B4B]">{computedStats.totalApplications}</div>
          <div className="text-[10px] text-purple-600 font-semibold mt-1">Total Pipeline</div>
        </div>

        <div className="bg-white border border-[#3B3588]/10 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Interviews</span>
            <Video className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-[#1E1B4B]">{computedStats.totalInterviews}</div>
          <div className="text-[10px] text-amber-600 font-semibold mt-1">Scheduled Rounds</div>
        </div>

        <div className="bg-white border border-[#3B3588]/10 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Offers Sent</span>
            <Award className="w-3.5 h-3.5 text-pink-600" />
          </div>
          <div className="text-2xl font-black text-[#1E1B4B]">{computedStats.totalOffers}</div>
          <div className="text-[10px] text-pink-600 font-semibold mt-1">Hired Candidates</div>
        </div>
      </section>

      {/* Master Application Table */}
      <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-black text-[#1E1B4B]"> Applicant Pipeline </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              SuperAdmin inspection and override authority for all student applications across partner organizations.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search candidate, role, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">No candidate submissions found.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase font-bold text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="pb-3.5 font-bold">Candidate</th>
                  <th className="pb-3.5 font-bold">Applied Role</th>
                  <th className="pb-3.5 font-bold">Company</th>
                  <th className="pb-3.5 font-bold">Applied Date</th>
                  <th className="pb-3.5 font-bold">Status</th>
                  <th className="pb-3.5 font-bold text-right">SuperAdmin Authority Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredApplications.map((app) => {
                  const isBlocked = blockedEntities.includes(String(app.email).toLowerCase());

                  return (
                    <tr key={app.id} className="hover:bg-[#F8F9FD]/60 transition">
                      <td className="py-4">
                        <div className="font-bold text-[#1E1B4B] text-sm flex items-center gap-1.5">
                          {app.name}
                          {isBlocked && (
                            <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[9px] font-black">
                              BLOCKED
                            </span>
                          )}
                        </div>
                        <div className="text-slate-400 text-[11px]">{app.email}</div>
                      </td>

                      <td className="py-4 font-semibold text-slate-700">{app.role}</td>
                      <td className="py-4 font-medium text-[#202960] flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" /> {app.company}
                      </td>
                      <td className="py-4 text-slate-500">{app.appliedDate}</td>

                      <td className="py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                            app.status === "ACCEPTED" || app.status === "OFFERED" || app.status === "HIRED / ACCEPTED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : app.status === "REJECTED"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-indigo-50 text-indigo-700 border-indigo-200"
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>

                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedInspectApp(app)}
                            className="p-1.5 rounded-lg bg-[#EDF0FF] text-[#202960] hover:bg-[#202960] hover:text-white transition cursor-pointer"
                            title="Inspect Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {(app.status === "ACCEPTED" || app.status === "OFFERED" || app.status === "HIRED / ACCEPTED") && (
                            <button
                              onClick={() => setSelectedOfferPreview(app)}
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition cursor-pointer"
                              title="Preview Offer Letter"
                            >
                              <Award className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {app.status !== "ACCEPTED" && app.status !== "HIRED / ACCEPTED" && (
                            <button
                              onClick={() => handleAdminDecision(app, "ACCEPTED")}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-full transition shadow-xs cursor-pointer flex items-center gap-1"
                              title="Force Accept & Issue Offer"
                            >
                              <CheckCircle className="w-3 h-3" /> Accept
                            </button>
                          )}

                          {app.status !== "REJECTED" && (
                            <button
                              onClick={() => handleAdminDecision(app, "REJECTED")}
                              className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-[10px] rounded-full transition cursor-pointer flex items-center gap-1"
                              title="Force Reject"
                            >
                              <XCircle className="w-3 h-3" /> Reject
                            </button>
                          )}

                          <button
                            onClick={() => handleToggleBlockEntity(app.email, isBlocked)}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              isBlocked
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                            }`}
                            title={isBlocked ? "Unblock Candidate" : "Blacklist / Block Candidate"}
                          >
                            {isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Organizations & Vacancies Oversight */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-[#1E1B4B]">Authorized Organizations</h2>
              <p className="text-xs text-slate-500">Corporate recruiters & partners.</p>
            </div>
            <Link
              href="/admin/companies"
              className="text-xs font-bold text-[#202960] hover:underline flex items-center gap-1"
            >
              Directory <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-y-auto max-h-72 space-y-3">
            {companies.map((comp) => {
              const isCompBlocked = blockedEntities.includes(String(comp.companyName).toLowerCase());

              return (
                <div
                  key={comp.id}
                  className="p-4 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/10 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-sm text-[#1E1B4B] flex items-center gap-2">
                      {comp.companyName}
                      {isCompBlocked && (
                        <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[9px] font-black">
                          SUSPENDED
                        </span>
                      )}
                    </div>
                    <div className="text-slate-400 text-xs">{comp.email}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleBlockEntity(comp.companyName, isCompBlocked)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-full transition cursor-pointer ${
                        isCompBlocked
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                      }`}
                    >
                      {isCompBlocked ? "Reinstate" : "Suspend"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-[#1E1B4B]">Active Vacancies ({jobs.length})</h2>
              <p className="text-xs text-slate-500">Live positions open across board.</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black">
              System Wide
            </span>
          </div>

          <div className="overflow-y-auto max-h-72 space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-4 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/10 flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-sm text-[#1E1B4B]">{job.title}</div>
                  <div className="text-xs text-slate-500">
                    {job.company} &bull; {job.location} &bull; <strong>{job.stipend}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAdminDeleteJob(job)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                    title="Terminate Job Globally"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Inspect Candidate Drawer */}
      {selectedInspectApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#3B3588]/15 rounded-[32px] w-full max-w-xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-black uppercase">
                  Application Audit Inspection
                </span>
                <h3 className="text-lg font-black text-[#1E1B4B] mt-1">{selectedInspectApp.name}</h3>
                <p className="text-xs text-slate-500">
                  Target: {selectedInspectApp.role} &bull; {selectedInspectApp.company}
                </p>
              </div>
              <button
                onClick={() => setSelectedInspectApp(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 bg-[#F8F9FD] p-5 rounded-2xl border border-slate-100 text-xs">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200/60">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Candidate Email</span>
                  <span className="font-semibold text-slate-800">{selectedInspectApp.email}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Application Status</span>
                  <span className="font-bold text-[#202960]">{selectedInspectApp.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200/60">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Compensation</span>
                  <span className="font-black text-emerald-700">{selectedInspectApp.stipend}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Submission Date</span>
                  <span className="text-slate-600 font-semibold">{selectedInspectApp.appliedDate}</span>
                </div>
              </div>

              {selectedInspectApp.resumeUrl && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Attached Resume</span>
                  <a
                    href={selectedInspectApp.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#202960] font-bold hover:underline"
                  >
                    <FileText className="w-4 h-4 text-indigo-600" /> View Document Payload <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  handleAdminDecision(selectedInspectApp, "ACCEPTED");
                  setSelectedInspectApp(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full transition cursor-pointer"
              >
                Approve Offer
              </button>
              <button
                onClick={() => {
                  handleAdminDecision(selectedInspectApp, "REJECTED");
                  setSelectedInspectApp(null);
                }}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs rounded-full transition cursor-pointer"
              >
                Reject Application
              </button>
              <button
                onClick={() => setSelectedInspectApp(null)}
                className="px-5 py-2 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-100 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SuperAdmin Offer Letter Audit Modal */}
      {selectedOfferPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#3B3588]/15 rounded-[32px] w-full max-w-2xl p-6 sm:p-10 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex justify-between items-start pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg text-[#1E1B4B]">{selectedOfferPreview.company}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> System Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Official Internship Appointment Audit</p>
                </div>
              </div>
              <button onClick={() => setSelectedOfferPreview(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-slate-700 bg-[#F8F9FD] p-6 rounded-2xl border border-slate-200/80">
              <div className="flex justify-between items-center text-[11px] text-slate-500 pb-2 border-b border-slate-200/60">
                <span>Date: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                <span className="font-mono text-indigo-700 font-bold">REF: VIC-OFFER-{selectedOfferPreview.id}</span>
              </div>

              <p>Candidate: <strong className="text-[#1E1B4B]">{selectedOfferPreview.name}</strong> ({selectedOfferPreview.email})</p>
              <p>Position: <strong className="text-[#1E1B4B]">{selectedOfferPreview.role}</strong> at <strong className="text-[#1E1B4B]">{selectedOfferPreview.company}</strong>.</p>
              <p>Stipend: <strong className="text-emerald-700">{selectedOfferPreview.stipend}</strong></p>

              <div className="pt-4 border-t border-slate-200/60 flex justify-between items-end">
                <div>
                  <div className="font-bold text-[#1E1B4B]">{selectedOfferPreview.company} Authorized signatory</div>
                  <div className="text-[10px] text-slate-400">Audited via Visionary Interns Club SuperAdmin</div>
                </div>
                <div className="px-3 py-1 bg-emerald-100 text-emerald-800 font-black text-[10px] rounded-lg">
                  OFFICIAL OFFER ACTIVE
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => window.print()} className="px-4 py-2.5 rounded-full border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                <Printer className="w-3.5 h-3.5" /> Print Letter
              </button>
              <button onClick={() => setSelectedOfferPreview(null)} className="px-6 py-2.5 rounded-full bg-[#202960] text-white text-xs font-bold cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}