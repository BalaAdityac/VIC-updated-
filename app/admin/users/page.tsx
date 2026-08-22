"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  RefreshCw,
  Sparkles,
  Lock,
  Unlock,
  CheckCheck,
  Building2,
  GraduationCap,
  Eye,
  X,
  Loader2,
  Mail,
  Phone,
  Globe,
  Github,
  Linkedin,
  ArrowUpRight
} from "lucide-react";

const isTestCorp = (name: string) => /backend\s*test\s*corp|testcorp/i.test(name || "");

export default function AdminUsersPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [filterRole, setFilterRole] = useState<"ALL" | "STUDENT" | "RECRUITER">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [blockedEntities, setBlockedEntities] = useState<string[]>([]);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [inspectedUser, setInspectedUser] = useState<any | null>(null);

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

  const loadUsersData = useCallback(() => {
    if (typeof window === "undefined") return;
    setLoading(true);
    const userMap = new Map<string, any>();

    // 1. Safely parse blocklist
    let blockedList: string[] = [];
    try {
      blockedList = JSON.parse(localStorage.getItem("vic_blocked_entities") || "[]");
      setBlockedEntities(blockedList);
    } catch {}

    // 2. Extract Directly Registered Students
    try {
      const regStudents = JSON.parse(localStorage.getItem("vic_registered_students") || "[]");
      if (Array.isArray(regStudents)) {
        regStudents.forEach((s: any) => {
          const email = String(s.email || "").toLowerCase().trim();
          if (email && !userMap.has(email)) {
            userMap.set(email, {
              id: s.id || `stud-${email}`,
              name: s.name || "Student User",
              email: email,
              role: "STUDENT",
              entity: s.department || "Computer Science & Engineering",
              phone: s.phone || "Not specified",
              gradYear: s.gradYear || "2026",
              cgpa: s.cgpa || "8.5",
              skills: s.skills || "React, TypeScript, Python",
              linkedinUrl: s.linkedinUrl || "https://linkedin.com",
              githubUrl: s.githubUrl || "https://github.com",
              portfolioUrl: s.portfolioUrl || "https://portfolio.dev",
              status: blockedList.includes(email) ? "BLOCKED" : "ACTIVE"
            });
          }
        });
      }
    } catch {}

    // 3. Extract Students from Global Applications
    try {
      const localApps = JSON.parse(localStorage.getItem("vic_applications") || "[]");
      if (Array.isArray(localApps)) {
        localApps.forEach((app: any) => {
          const email = String(app.email || "").toLowerCase().trim();
          const name = app.name || email.split("@")[0];

          if (email && !isTestCorp(name) && !userMap.has(email)) {
            userMap.set(email, {
              id: `stud-${email}`,
              name: name,
              email: email,
              role: "STUDENT",
              entity: "Engineering Student",
              phone: "Not specified",
              gradYear: "2026",
              cgpa: "8.5",
              skills: "Engineering",
              linkedinUrl: "https://linkedin.com",
              githubUrl: "https://github.com",
              portfolioUrl: "https://portfolio.dev",
              status: blockedList.includes(email) ? "BLOCKED" : "ACTIVE"
            });
          }
        });
      }
    } catch {}

    // 4. Extract Directly Registered Companies & Recruiters
    try {
      const regCompanies = JSON.parse(localStorage.getItem("vic_registered_companies") || "[]");
      if (Array.isArray(regCompanies)) {
        regCompanies.forEach((c: any) => {
          const email = String(c.email || "").toLowerCase().trim();
          const cName = c.companyName || "Partner";
          if (email && !isTestCorp(cName) && !userMap.has(email)) {
            userMap.set(email, {
              id: c.id || `rec-${email}`,
              name: `${cName} Recruitment Lead`,
              email: email,
              role: "RECRUITER",
              entity: cName,
              location: c.location || "Bengaluru, Karnataka",
              website: c.website || "https://company.io",
              industry: c.industry || "Software & Cloud Architecture",
              status: blockedList.includes(cName.toLowerCase()) || blockedList.includes(email) ? "BLOCKED" : "ACTIVE"
            });
          }
        });
      }
    } catch {}

    // 5. Extract Recruiters from Job Postings
    try {
      const localJobs = JSON.parse(localStorage.getItem("vic_custom_jobs") || "[]");
      if (Array.isArray(localJobs)) {
        localJobs.forEach((job: any) => {
          const cName = String(job.company || "Partner").trim();
          if (cName && !isTestCorp(cName)) {
            const email = `recruiter@${cName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
            if (!userMap.has(email)) {
              userMap.set(email, {
                id: `rec-${email}`,
                name: `${cName} Recruitment Lead`,
                email: email,
                role: "RECRUITER",
                entity: cName,
                location: job.location || "Bengaluru, Karnataka",
                website: `https://${cName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
                industry: "Enterprise Technology",
                status: blockedList.includes(cName.toLowerCase()) || blockedList.includes(email) ? "BLOCKED" : "ACTIVE"
              });
            }
          }
        });
      }
    } catch {}

    // 6. Hardcode Default Authorized Recruiter Accounts
    const defaultRecruiters = [
      { name: "Accenture Recruitment Lead", email: "recruitment@accenture.com", org: "Accenture", website: "https://accenture.com", location: "Bengaluru" },
      { name: "Nexus Autonomous Team", email: "recruiter@nexus.com", org: "Nexus Autonomous", website: "https://nexus.io", location: "Bengaluru" },
      { name: "Tenar Systems Admin", email: "admin@tenar.com", org: "Tenar Systems", website: "https://tenar.in", location: "Bengaluru" }
    ];

    defaultRecruiters.forEach((rec) => {
      if (!userMap.has(rec.email.toLowerCase())) {
        userMap.set(rec.email.toLowerCase(), {
          id: `default-${rec.email}`,
          name: rec.name,
          email: rec.email,
          role: "RECRUITER",
          entity: rec.org,
          website: rec.website,
          location: rec.location,
          industry: "Technology & Software",
          status: blockedList.includes(rec.email.toLowerCase()) || blockedList.includes(rec.org.toLowerCase()) ? "BLOCKED" : "ACTIVE"
        });
      }
    });

    setUsers(Array.from(userMap.values()));
    setLoading(false);
  }, []);

  useEffect(() => {
    setMounted(true);
    loadUsersData();

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        bc = new BroadcastChannel("vic_realtime_pipeline");
        bc.onmessage = () => loadUsersData();
      }
    } catch {}

    const handleSync = () => loadUsersData();
    window.addEventListener("vic_pipeline_sync", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      if (bc) bc.close();
      window.removeEventListener("vic_pipeline_sync", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [loadUsersData]);

  const handleToggleBlock = (email: string, isBlocked: boolean) => {
    const target = email.toLowerCase().trim();
    let currentBlocked: string[] = JSON.parse(localStorage.getItem("vic_blocked_entities") || "[]");

    if (isBlocked) {
      currentBlocked = currentBlocked.filter((b) => b !== target);
    } else {
      if (!currentBlocked.includes(target)) currentBlocked.push(target);
    }

    localStorage.setItem("vic_blocked_entities", JSON.stringify(currentBlocked));
    setBlockedEntities(currentBlocked);
    notifyPipeline({ type: "GOVERNANCE_BLOCK_UPDATED", data: { entity: target, blocked: !isBlocked } });

    setActionSuccessMsg(`Account ${email} is now ${isBlocked ? "UNBLOCKED" : "BLOCKED / SUSPENDED"}.`);
    setTimeout(() => setActionSuccessMsg(null), 3000);
    loadUsersData();
  };

  const studentCount = users.filter((u) => u.role === "STUDENT").length;
  const recruiterCount = users.filter((u) => u.role === "RECRUITER").length;

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchRole = filterRole === "ALL" || u.role === filterRole;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.entity?.toLowerCase().includes(q);
      return matchRole && matchQuery;
    });
  }, [users, filterRole, searchQuery]);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-[#202960]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-12">
      {/* Central Header */}
      <section className="bg-gradient-to-br from-[#EDF0FF] via-white to-[#F8F9FD] border border-[#3B3588]/10 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          {/* <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#202960]/5 text-[#202960] text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Identity & Access Governance
          </div> */}
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E1B4B] tracking-tight">
             Users Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Live institutional accounts for registered students and verified corporate recruiters.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadUsersData}
            disabled={loading}
            className="p-3 rounded-2xl bg-white border border-[#3B3588]/15 text-slate-600 hover:text-[#202960] transition cursor-pointer shadow-sm"
            title="Refresh Directory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/admin/dashboard"
            className="px-5 py-3 rounded-2xl bg-[#202960] hover:bg-[#2E2A72] text-white font-bold text-xs shadow-md shadow-[#202960]/20 flex items-center gap-1.5 transition cursor-pointer"
          >
            Back to Oversight <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCheck className="w-4 h-4 text-emerald-600" /> {actionSuccessMsg}
        </div>
      )}

      {/* Directory Table */}
      <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 p-1.5 bg-[#F8F9FD] rounded-2xl border border-slate-200/60 text-xs font-bold">
            <button
              onClick={() => setFilterRole("ALL")}
              className={`px-4 py-2 rounded-xl transition cursor-pointer ${
                filterRole === "ALL" ? "bg-[#202960] text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All Accounts ({users.length})
            </button>
            <button
              onClick={() => setFilterRole("STUDENT")}
              className={`px-4 py-2 rounded-xl transition cursor-pointer ${
                filterRole === "STUDENT" ? "bg-[#202960] text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Students ({studentCount})
            </button>
            <button
              onClick={() => setFilterRole("RECRUITER")}
              className={`px-4 py-2 rounded-xl transition cursor-pointer ${
                filterRole === "RECRUITER" ? "bg-[#202960] text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Recruiters ({recruiterCount})
            </button>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search user, email, org..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">No user accounts found matching your query.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase font-bold text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="pb-3.5 font-bold">User Name</th>
                  <th className="pb-3.5 font-bold">Email Address</th>
                  <th className="pb-3.5 font-bold">Account Role</th>
                  <th className="pb-3.5 font-bold">Organization / Branch</th>
                  <th className="pb-3.5 font-bold">Status</th>
                  <th className="pb-3.5 font-bold text-right">SuperAdmin Authority Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.map((u) => {
                  const isBlocked = blockedEntities.includes(u.email.toLowerCase());

                  return (
                    <tr key={u.id} className="hover:bg-[#F8F9FD]/60 transition">
                      <td className="py-4 font-bold text-[#1E1B4B] text-sm flex items-center gap-2">
                        {u.role === "RECRUITER" ? (
                          <Building2 className="w-4 h-4 text-slate-400" />
                        ) : (
                          <GraduationCap className="w-4 h-4 text-slate-400" />
                        )}
                        {u.name}
                      </td>
                      <td className="py-4 text-slate-500 font-medium">{u.email}</td>
                      <td className="py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                            u.role === "RECRUITER" ? "bg-sky-50 text-sky-700 border-sky-200" : "bg-indigo-50 text-indigo-700 border-indigo-200"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 text-slate-600 font-medium">{u.entity}</td>
                      <td className="py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                            isBlocked ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {isBlocked ? "SUSPENDED" : "ACTIVE"}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectedUser(u)}
                            className="p-1.5 rounded-lg bg-[#EDF0FF] text-[#202960] hover:bg-[#202960] hover:text-white transition cursor-pointer"
                            title="Audit User Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleBlock(u.email, isBlocked)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer inline-flex items-center gap-1 ${
                              isBlocked
                                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                                : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                            }`}
                          >
                            {isBlocked ? (
                              <>
                                <Unlock className="w-3 h-3" /> Reinstate
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3" /> Suspend
                              </>
                            )}
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

      {/* User Inspection Modal */}
      {inspectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-xl p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  {inspectedUser.role === "RECRUITER" ? <Building2 className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#1E1B4B]">{inspectedUser.name}</h3>
                  <p className="text-xs text-slate-500">{inspectedUser.role} Account Profile</p>
                </div>
              </div>
              <button
                onClick={() => setInspectedUser(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#F8F9FD] p-5 rounded-2xl text-xs space-y-3 text-slate-700">
              <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-200/60">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Email Address</span>
                  <span className="font-semibold text-slate-800">{inspectedUser.email}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    {inspectedUser.role === "STUDENT" ? "Academic Branch" : "Organization"}
                  </span>
                  <span className="font-semibold">{inspectedUser.entity}</span>
                </div>
              </div>

              {inspectedUser.role === "STUDENT" ? (
                <>
                  <div className="grid grid-cols-3 gap-3 pb-2 border-b border-slate-200/60">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Contact</span>
                      <span>{inspectedUser.phone || "Not provided"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Graduation</span>
                      <span>{inspectedUser.gradYear || "2026"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">CGPA</span>
                      <span>{inspectedUser.cgpa || "8.5"}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Technical Skills</span>
                    <span className="font-semibold text-indigo-950">{inspectedUser.skills || "React, TypeScript, Python"}</span>
                  </div>

                  <div className="flex gap-4 pt-2">
                    {inspectedUser.linkedinUrl && (
                      <a href={inspectedUser.linkedinUrl} target="_blank" rel="noreferrer" className="text-[#202960] hover:underline inline-flex items-center gap-1 font-bold">
                        <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                      </a>
                    )}
                    {inspectedUser.githubUrl && (
                      <a href={inspectedUser.githubUrl} target="_blank" rel="noreferrer" className="text-[#202960] hover:underline inline-flex items-center gap-1 font-bold">
                        <Github className="w-3.5 h-3.5" /> GitHub
                      </a>
                    )}
                    {inspectedUser.portfolioUrl && (
                      <a href={inspectedUser.portfolioUrl} target="_blank" rel="noreferrer" className="text-[#202960] hover:underline inline-flex items-center gap-1 font-bold">
                        <Globe className="w-3.5 h-3.5" /> Portfolio
                      </a>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-200/60">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Industry Focus</span>
                      <span>{inspectedUser.industry || "Technology & Software"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Location</span>
                      <span>{inspectedUser.location || "Bengaluru, Karnataka"}</span>
                    </div>
                  </div>
                  {inspectedUser.website && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Corporate Website</span>
                      <a href={inspectedUser.website} target="_blank" rel="noreferrer" className="text-[#202960] font-bold hover:underline">
                        {inspectedUser.website}
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setInspectedUser(null)}
                className="px-6 py-2.5 bg-[#202960] text-white text-xs font-bold rounded-full cursor-pointer hover:bg-[#2E2A72]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}