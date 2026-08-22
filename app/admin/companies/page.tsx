"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  Globe,
  Mail,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Lock,
  Unlock,
  CheckCheck,
  Search,
  Eye,
  X,
  MapPin,
  FileCheck,
  Loader2,
  ArrowUpRight
} from "lucide-react";

const isTestCorp = (name: string) => /backend\s*test\s*corp|testcorp/i.test(name || "");

export default function AdminCompaniesPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [blockedEntities, setBlockedEntities] = useState<string[]>([]);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [inspectedCompany, setInspectedCompany] = useState<any | null>(null);

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

  const loadCompaniesData = useCallback(() => {
    if (typeof window === "undefined") return;
    setLoading(true);
    const compMap = new Map<string, any>();

    // 1. Safely Load Blocked Entities
    let blockedList: string[] = [];
    try {
      blockedList = JSON.parse(localStorage.getItem("vic_blocked_entities") || "[]");
      setBlockedEntities(blockedList);
    } catch {}

    // 2. Load Directly Registered Companies
    try {
      const regCompanies = JSON.parse(localStorage.getItem("vic_registered_companies") || "[]");
      if (Array.isArray(regCompanies)) {
        regCompanies.forEach((c: any) => {
          const cName = String(c.companyName || "").trim();
          if (cName && !isTestCorp(cName)) {
            compMap.set(cName.toLowerCase(), {
              id: c.id || `comp-${cName.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
              companyName: cName,
              website: c.website || `https://${cName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
              email: c.email || `recruiter@${cName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
              location: c.location || "Bengaluru, Karnataka",
              industry: c.industry || "Technology & Software",
              tagline: c.tagline || "Enterprise Hiring Partner",
              registrationNumber: c.registrationNumber || "CIN-U72200KA2026PTC",
              description: c.description || "Verified corporate recruitment partner.",
              status: blockedList.includes(cName.toLowerCase()) ? "SUSPENDED" : "VERIFIED"
            });
          }
        });
      }
    } catch {}

    // 3. Extract from Custom Jobs
    try {
      const customJobs = JSON.parse(localStorage.getItem("vic_custom_jobs") || "[]");
      if (Array.isArray(customJobs)) {
        customJobs.forEach((job: any) => {
          const cName = String(job.company || "").trim();
          if (cName && !isTestCorp(cName) && !compMap.has(cName.toLowerCase())) {
            compMap.set(cName.toLowerCase(), {
              id: `comp-${cName.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
              companyName: cName,
              website: `https://${cName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
              email: `recruiter@${cName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
              location: job.location || "Bengaluru, Karnataka",
              industry: "Technology & Software",
              tagline: "Corporate Recruitment Partner",
              registrationNumber: "CIN-VERIFIED",
              description: "Active hiring partner on Visionary Interns Club.",
              status: blockedList.includes(cName.toLowerCase()) ? "SUSPENDED" : "VERIFIED"
            });
          }
        });
      }
    } catch {}

    // 4. Extract from Applications
    try {
      const apps = JSON.parse(localStorage.getItem("vic_applications") || "[]");
      if (Array.isArray(apps)) {
        apps.forEach((app: any) => {
          const cName = String(app.company || "").trim();
          if (cName && !isTestCorp(cName) && !compMap.has(cName.toLowerCase())) {
            compMap.set(cName.toLowerCase(), {
              id: `comp-${cName.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
              companyName: cName,
              website: `https://${cName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
              email: `recruiter@${cName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
              location: "Bengaluru, Karnataka",
              industry: "Technology & Software",
              tagline: "Recruitment Partner",
              registrationNumber: "CIN-VERIFIED",
              description: "Active hiring partner.",
              status: blockedList.includes(cName.toLowerCase()) ? "SUSPENDED" : "VERIFIED"
            });
          }
        });
      }
    } catch {}

    // 5. Default Authorized Partners
    const defaultPartners = [
      {
        name: "Accenture",
        email: "recruitment@accenture.com",
        website: "https://accenture.com",
        location: "Bengaluru, Karnataka",
        industry: "IT Services & Consulting",
        tagline: "Let there be change",
        registrationNumber: "CIN-U72900MH2001PTC132"
      },
      {
        name: "Nexus Autonomous",
        email: "recruiter@nexus.com",
        website: "https://nexus.io",
        location: "Bengaluru, Karnataka",
        industry: "Embedded Telemetry & Edge AI",
        tagline: "Intelligent autonomous telemetry and edge systems",
        registrationNumber: "CIN-U72200KA2026PTC109"
      },
      {
        name: "Tenar Systems",
        email: "admin@tenar.com",
        website: "https://tenar.in",
        location: "Bengaluru, Karnataka",
        industry: "Enterprise Full-Stack Cloud",
        tagline: "Scalable modern systems infrastructure",
        registrationNumber: "CIN-U72200KA2025PTC098"
      }
    ];

    defaultPartners.forEach((p) => {
      if (!compMap.has(p.name.toLowerCase())) {
        compMap.set(p.name.toLowerCase(), {
          id: `comp-${p.name.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
          companyName: p.name,
          website: p.website,
          email: p.email,
          location: p.location,
          industry: p.industry,
          tagline: p.tagline,
          registrationNumber: p.registrationNumber,
          description: "Official authorized partner organization.",
          status: blockedList.includes(p.name.toLowerCase()) ? "SUSPENDED" : "VERIFIED"
        });
      }
    });

    setCompanies(Array.from(compMap.values()));
    setLoading(false);
  }, []);

  useEffect(() => {
    setMounted(true);
    loadCompaniesData();

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        bc = new BroadcastChannel("vic_realtime_pipeline");
        bc.onmessage = () => loadCompaniesData();
      }
    } catch {}

    const handleSync = () => loadCompaniesData();
    window.addEventListener("vic_pipeline_sync", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      if (bc) bc.close();
      window.removeEventListener("vic_pipeline_sync", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [loadCompaniesData]);

  const handleToggleBlockCompany = (companyName: string, isBlocked: boolean) => {
    const target = companyName.toLowerCase().trim();
    let currentBlocked: string[] = JSON.parse(localStorage.getItem("vic_blocked_entities") || "[]");

    if (isBlocked) {
      currentBlocked = currentBlocked.filter((b) => b !== target);
    } else {
      if (!currentBlocked.includes(target)) currentBlocked.push(target);
    }

    localStorage.setItem("vic_blocked_entities", JSON.stringify(currentBlocked));
    setBlockedEntities(currentBlocked);
    notifyPipeline({ type: "GOVERNANCE_BLOCK_UPDATED", data: { entity: target, blocked: !isBlocked } });

    setActionSuccessMsg(`Organization "${companyName}" has been ${isBlocked ? "REINSTATED" : "SUSPENDED"}.`);
    setTimeout(() => setActionSuccessMsg(null), 3000);
    loadCompaniesData();
  };

  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return companies;
    const q = searchQuery.toLowerCase().trim();
    return companies.filter(
      (c) =>
        c.companyName?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.location?.toLowerCase().includes(q) ||
        c.website?.toLowerCase().includes(q) ||
        c.industry?.toLowerCase().includes(q)
    );
  }, [companies, searchQuery]);

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
            <Sparkles className="w-3.5 h-3.5" /> Corporate Partner Governance
          </div> */}
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E1B4B] tracking-tight">
            Partner Companies & Organizations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Review partner organizations, inspect registration details, audit live job openings, and manage recruitment authorizations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadCompaniesData}
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
          <div>
            <h2 className="text-lg font-black text-[#1E1B4B]">Authorized Organizations ({filteredCompanies.length})</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live directory of corporate partners actively recruiting on the platform.
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search company, industry, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">No partner organizations found matching query.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase font-bold text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="pb-3.5 font-bold">Company Name</th>
                  <th className="pb-3.5 font-bold">Website Domain</th>
                  <th className="pb-3.5 font-bold">Recruiter Email</th>
                  <th className="pb-3.5 font-bold">Location</th>
                  <th className="pb-3.5 font-bold">Status</th>
                  <th className="pb-3.5 font-bold text-right">SuperAdmin Authority Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredCompanies.map((comp) => {
                  const isBlocked = blockedEntities.includes(comp.companyName.toLowerCase());

                  return (
                    <tr key={comp.id} className="hover:bg-[#F8F9FD]/60 transition">
                      <td className="py-4 font-bold text-[#1E1B4B] text-sm flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" /> {comp.companyName}
                      </td>
                      <td className="py-4 text-slate-500">
                        <a
                          href={comp.website}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-[#202960] hover:underline flex items-center gap-1 font-medium"
                        >
                          {comp.website} <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      </td>
                      <td className="py-4 text-slate-600 font-medium">{comp.email}</td>
                      <td className="py-4 text-slate-500">{comp.location}</td>
                      <td className="py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                            isBlocked ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {isBlocked ? "SUSPENDED" : "VERIFIED"}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectedCompany(comp)}
                            className="p-1.5 rounded-lg bg-[#EDF0FF] text-[#202960] hover:bg-[#202960] hover:text-white transition cursor-pointer"
                            title="Audit Organization Record"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleBlockCompany(comp.companyName, isBlocked)}
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

      {/* Organization Inspection Drawer */}
      {inspectedCompany && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-xl p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#1E1B4B]">{inspectedCompany.companyName}</h3>
                  <p className="text-xs text-slate-500">Corporate Record & Organization Profile</p>
                </div>
              </div>
              <button
                onClick={() => setInspectedCompany(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#F8F9FD] p-5 rounded-2xl text-xs space-y-3 text-slate-700">
              <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-200/60">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Contact Recruiter Email</span>
                  <span className="font-semibold text-slate-800">{inspectedCompany.email}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Corporate Registration (CIN)</span>
                  <span className="font-mono text-indigo-800 font-bold">{inspectedCompany.registrationNumber || "CIN-U72200KA2026PTC109"}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-200/60">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Industry & Domain</span>
                  <span className="font-semibold">{inspectedCompany.industry || "Software & Cloud Architecture"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Headquarters</span>
                  <span className="font-semibold">{inspectedCompany.location || "Bengaluru, Karnataka"}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Corporate Tagline</span>
                <p className="italic text-slate-600">&ldquo;{inspectedCompany.tagline || "Innovating technology solutions."}&rdquo;</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Official Website</span>
                <a
                  href={inspectedCompany.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#202960] font-bold hover:underline inline-flex items-center gap-1"
                >
                  {inspectedCompany.website} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setInspectedCompany(null)}
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