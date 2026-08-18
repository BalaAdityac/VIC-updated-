"use client";

import { useState } from "react";
import { Building2, Search, ExternalLink, Sparkles } from "lucide-react";

export default function AdminCompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [companies, setCompanies] = useState([
    {
      id: "c1",
      name: "Tenar Systems",
      website: "https://tenar.in",
      activeRoles: 2,
      status: "VERIFIED"
    },
    {
      id: "c2",
      name: "Nexus Autonomous",
      website: "https://nexusauto.io",
      activeRoles: 1,
      status: "VERIFIED"
    },
    {
      id: "c3",
      name: "CloudScale Labs",
      website: "https://cloudscale.io",
      activeRoles: 1,
      status: "VERIFIED"
    },
    {
      id: "c4",
      name: "NextGen Robotics",
      website: "https://nextgenrobotics.org",
      activeRoles: 0,
      status: "PENDING"
    }
  ]);

  const handleVerify = (id: string, status: "VERIFIED" | "SUSPENDED") => {
    setCompanies(companies.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <section className="bg-gradient-to-br from-[#EDF0FF] via-white to-[#F8F9FD] border border-[#3B3588]/10 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#202960]/5 text-[#202960] text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> Organization Governance
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E1B4B] tracking-tight mt-1">
            Partner Companies & Recruiters
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mt-1">
            Authorize recruiter accounts, inspect active job board postings, and manage institutional partnership status.
          </p>
        </div>
      </section>

      <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-black text-[#1E1B4B]">Authorized Organizations ({filtered.length})</h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search company..."
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
                <th className="pb-3.5 font-bold">Live Roles</th>
                <th className="pb-3.5 font-bold">Status</th>
                <th className="pb-3.5 font-bold text-right">Action</th>
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
                  <td className="py-4 font-semibold text-slate-600">{comp.activeRoles} Postings</td>
                  <td className="py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                        comp.status === "VERIFIED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : comp.status === "SUSPENDED"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {comp.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => handleVerify(comp.id, comp.status === "VERIFIED" ? "SUSPENDED" : "VERIFIED")}
                      className={`px-3.5 py-1.5 rounded-full font-bold text-xs transition cursor-pointer ${
                        comp.status === "VERIFIED"
                          ? "bg-red-50 text-red-700 hover:bg-red-100"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                    >
                      {comp.status === "VERIFIED" ? "Suspend" : "Verify Partner"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}