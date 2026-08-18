"use client";

import { useState } from "react";
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
  Briefcase
} from "lucide-react";

export default function AdminCompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);

  const [companies, setCompanies] = useState([
    {
      id: "comp-1",
      name: "Tenar Systems",
      website: "https://tenar.in",
      contactEmail: "admin@tenar.com",
      activeRoles: 2,
      status: "VERIFIED",
      description: "Embedded IoT firmware, smart hardware sensors, and cloud telemetry systems."
    },
    {
      id: "comp-2",
      name: "Nexus Autonomous",
      website: "https://nexusauto.io",
      contactEmail: "recruiter@nexus.com",
      activeRoles: 1,
      status: "VERIFIED",
      description: "Autonomous robotics, ROS2 software, and embedded real-time computing."
    },
    {
      id: "comp-3",
      name: "CloudScale Labs",
      website: "https://cloudscale.io",
      contactEmail: "hr@cloudscale.io",
      activeRoles: 1,
      status: "VERIFIED",
      description: "Cloud computing infrastructure, serverless architectures, and Next.js platforms."
    },
    {
      id: "comp-4",
      name: "NextGen Robotics",
      website: "https://nextgenrobotics.org",
      contactEmail: "contact@nextgenrobotics.org",
      activeRoles: 0,
      status: "BLOCKED",
      description: "Experimental robotics projects and drone teleoperation."
    }
  ]);

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

  const filtered = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-[#EDF0FF] via-white to-[#F8F9FD] border border-[#3B3588]/10 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#202960]/5 text-[#202960] text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> Recruiter Governance
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E1B4B] tracking-tight mt-1">
            Partner Companies & Recruiters
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mt-1">
            Review partner organizations, inspect recruiter details, and manage block/unblock status.
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
              placeholder="Search company, domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
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
                  <td className="py-4 font-bold text-[#1E1B4B] text-sm">{comp.name}</td>
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
                  <td className="py-4 font-semibold text-slate-600">{comp.activeRoles} Postings</td>
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
                        <Eye className="w-3.5 h-3.5" /> Inspect
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
        </div>
      </section>

      {/* Company Inspector Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#3B3588]/15 rounded-[32px] w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start pb-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#202960] text-white font-bold flex items-center justify-center text-sm shadow-md">
                  {selectedCompany.name.charAt(0)}
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
              <p className="text-slate-600 leading-relaxed">{selectedCompany.description}</p>
              <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-600">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <a href={selectedCompany.website} target="_blank" rel="noreferrer" className="text-[#202960] underline">
                    {selectedCompany.website}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <span>Active Job Board Postings: <strong>{selectedCompany.activeRoles} Roles</strong></span>
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