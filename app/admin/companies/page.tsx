"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Building2,
  Search,
  ExternalLink,
  Sparkles,
  Ban,
  CheckCircle,
  Eye,
  X,
  Globe,
  Briefcase,
  Mail,
  MapPin,
  FileCheck,
  Loader2
} from "lucide-react";
import { getAdminToken } from "@/lib/adminAuth";

export default function AdminCompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCompanies() {
      setLoading(true);
      try {
        const token = await getAdminToken();
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch("http://127.0.0.1:3000/api/admin/companies", { headers }).catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          setCompanies(data.companies || []);
        } else {
          const storedComp = localStorage.getItem("company_data");
          const customJobs = JSON.parse(localStorage.getItem("vic_custom_jobs") || "[]");

          const parsed = storedComp ? JSON.parse(storedComp) : null;
          const companyList: any[] = [];

          if (parsed) {
            companyList.push({
              id: "comp-live",
              name: parsed.companyName || "Tenar Systems",
              website: parsed.website || "https://tenar.in",
              contactEmail: parsed.email || "admin@tenar.com",
              location: parsed.location || "Bengaluru, Karnataka, India",
              registrationNumber: parsed.registrationNumber || "CIN-U72200KA2024PTC189",
              activeRoles: customJobs.length,
              status: "VERIFIED",
              description: parsed.description || "Pioneering embedded hardware architectures, smart sensor nodes, and real-time RTOS firmware telemetry."
            });
          }

          setCompanies(companyList);
        }
      } catch (e) {} finally {
        setLoading(false);
      }
    }

    loadCompanies();
  }, []);

  const handleToggleStatus = (id: string) => {
    setCompanies((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextStatus = c.status === "VERIFIED" ? "BLOCKED" : "VERIFIED";
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  const filtered = useMemo(() => {
    return companies.filter(
      (c) =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contactEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [companies, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-[#EDF0FF] via-white to-[#F8F9FD] border border-[#3B3588]/10 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#202960]/5 text-[#202960] text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> Recruiter Governance
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E1B4B] tracking-tight mt-1">
            Partner Companies & Organizations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mt-1">
            Review partner organizations, inspect registration details, and manage permissions.
          </p>
        </div>
      </section>

      {/* Companies Table */}
      <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-black text-[#1E1B4B]">Authorized Organizations ({filtered.length})</h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search company, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#202960]" /> Loading organizations...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No companies currently registered.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase font-bold text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="pb-3.5 font-bold">Company</th>
                  <th className="pb-3.5 font-bold">Website</th>
                  <th className="pb-3.5 font-bold">Contact Email</th>
                  <th className="pb-3.5 font-bold">Active Roles</th>
                  <th className="pb-3.5 font-bold">Status</th>
                  <th className="pb-3.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((comp) => (
                  <tr key={comp.id} className="hover:bg-[#F8F9FD]/60 transition">
                    <td className="py-4">
                      <div className="font-bold text-[#1E1B4B] text-sm">{comp.name}</div>
                      <div className="text-slate-400 text-[10px]">{comp.location}</div>
                    </td>
                    <td className="py-4 text-slate-500">
                      <a
                        href={comp.website}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-[#202960] hover:underline flex items-center gap-1"
                      >
                        {comp.website} <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    </td>
                    <td className="py-4 text-slate-500">{comp.contactEmail}</td>
                    <td className="py-4 font-semibold text-slate-600">{comp.activeRoles || 0} Postings</td>
                    <td className="py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                          comp.status === "VERIFIED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {comp.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => setSelectedCompany(comp)}
                          className="px-3 py-1.5 rounded-full border border-[#202960]/20 text-[#202960] font-bold text-xs hover:bg-[#EDF0FF] transition flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </button>

                        <button
                          onClick={() => handleToggleStatus(comp.id)}
                          className={`px-3.5 py-1.5 rounded-full font-bold text-xs transition cursor-pointer flex items-center gap-1 ${
                            comp.status === "VERIFIED"
                              ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                              : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                          }`}
                        >
                          {comp.status === "VERIFIED" ? (
                            <>
                              <Ban className="w-3 h-3" /> Block
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3" /> Unblock
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Company Inspector Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#3B3588]/15 rounded-[32px] w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start pb-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#202960] text-white font-bold flex items-center justify-center text-sm shadow-md">
                  {selectedCompany.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#1E1B4B]">{selectedCompany.name}</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                      selectedCompany.status === "VERIFIED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {selectedCompany.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs bg-[#F8F9FD] p-4 rounded-2xl border border-slate-100">
              <p className="text-slate-600 leading-relaxed font-medium">{selectedCompany.description}</p>

              <div className="pt-3 border-t border-slate-200/60 space-y-2">
                <div className="flex items-center gap-2 text-slate-600">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <a href={selectedCompany.website} target="_blank" rel="noreferrer" className="text-[#202960] underline font-semibold">
                    {selectedCompany.website}
                  </a>
                </div>

                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>Official Email: <strong>{selectedCompany.contactEmail}</strong></span>
                </div>

                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>Headquarters: <strong>{selectedCompany.location}</strong></span>
                </div>

                <div className="flex items-center gap-2 text-slate-600">
                  <FileCheck className="w-4 h-4 text-slate-400" />
                  <span>Registration ID: <strong>{selectedCompany.registrationNumber}</strong></span>
                </div>

                <div className="flex items-center gap-2 text-slate-600">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <span>Active Positions: <strong>{selectedCompany.activeRoles || 0} Roles</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => {
                  handleToggleStatus(selectedCompany.id);
                  setSelectedCompany(null);
                }}
                className={`px-5 py-2 rounded-full font-bold text-xs transition cursor-pointer ${
                  selectedCompany.status === "VERIFIED"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                {selectedCompany.status === "VERIFIED" ? "Confirm Block Organization" : "Authorize / Unblock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}