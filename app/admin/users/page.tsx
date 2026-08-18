"use client";

import { useState } from "react";
import { Users, Search, Shield, GraduationCap, CheckCircle2, MoreVertical, Sparkles } from "lucide-react";

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users] = useState([
    {
      id: "usr-1",
      name: "Bala Aditya C",
      email: "student.aditya@example.com",
      role: "STUDENT",
      department: "IoT & Full Stack Engineering",
      status: "ACTIVE",
      joinedAt: "Aug 10, 2026"
    },
    {
      id: "usr-2",
      name: "Disham N",
      email: "disham@nexus.com",
      role: "RECRUITER",
      company: "Nexus Autonomous",
      status: "ACTIVE",
      joinedAt: "Aug 12, 2026"
    },
    {
      id: "usr-3",
      name: "Sanjay Kumar",
      email: "sanjay@vic.edu",
      role: "STUDENT",
      department: "Computer Science",
      status: "ACTIVE",
      joinedAt: "Aug 14, 2026"
    }
  ]);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <section className="bg-gradient-to-br from-[#EDF0FF] via-white to-[#F8F9FD] border border-[#3B3588]/10 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#202960]/5 text-[#202960] text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> User Directory
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E1B4B] tracking-tight mt-1">
            Platform Users Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mt-1">
            Manage authenticated students, institutional accounts, and recruiter credentials across the network.
          </p>
        </div>
      </section>

      <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-black text-[#1E1B4B]">Registered Accounts ({filtered.length})</h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search user name, email..."
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
                <th className="pb-3.5 font-bold">User</th>
                <th className="pb-3.5 font-bold">Role</th>
                <th className="pb-3.5 font-bold">Department / Organization</th>
                <th className="pb-3.5 font-bold">Joined</th>
                <th className="pb-3.5 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-[#F8F9FD]/60 transition">
                  <td className="py-4">
                    <div className="font-bold text-[#1E1B4B] text-sm">{u.name}</div>
                    <div className="text-slate-400 text-[11px]">{u.email}</div>
                  </td>
                  <td className="py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                        u.role === "STUDENT"
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                          : "bg-purple-50 text-purple-700 border-purple-200"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 text-slate-600 font-medium">
                    {u.department || u.company || "General"}
                  </td>
                  <td className="py-4 text-slate-400">{u.joinedAt}</td>
                  <td className="py-4">
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-[10px] font-black">
                      {u.status}
                    </span>
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