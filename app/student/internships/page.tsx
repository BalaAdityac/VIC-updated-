"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getActiveInternships, Internship } from "@/lib/student-api";
import {
  Building2,
  Search,
  MapPin,
  ArrowUpRight,
  Loader2,
  Sparkles
} from "lucide-react";

export default function StudentInternshipsListingPage() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("ALL");
  const [location, setLocation] = useState("ALL");

  useEffect(() => {
    async function load() {
      try {
        const data = await getActiveInternships({ search, mode, location });
        setInternships(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [search, mode, location]);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1E1B4B]">Explore Live Openings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse verified institutional roles across partner organizations.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search roles, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#202960]" />
        </div>
      ) : internships.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-400">
          No matching internship roles found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {internships.map((job) => {
            const companyName =
              typeof job.company === "object" ? job.company?.companyName : job.company || "Partner Organization";

            return (
              <div
                key={job.id}
                className="bg-white border border-[#3B3588]/10 rounded-3xl p-5 space-y-4 flex flex-col justify-between hover:shadow-md transition"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="font-bold text-sm text-[#1E1B4B]">{job.title}</h2>
                      <p className="text-xs text-slate-600 font-medium flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" /> {companyName} • {job.location}
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black uppercase">
                      {job.mode}
                    </span>
                  </div>

                  {Array.isArray(job.skills) && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {job.skills.map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-[#F8F9FD] border border-slate-200 rounded text-[10px] font-semibold text-slate-600"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-black text-xs text-[#202960]">{job.stipend}</span>
                  <Link
                    href={`/student/internships/${job.id}`}
                    className="px-4 py-1.5 bg-[#202960] hover:bg-[#2E2A72] text-white font-bold text-xs rounded-full flex items-center gap-1 transition"
                  >
                    View Details <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}