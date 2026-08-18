"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Search,
  Building2,
  GraduationCap,
  Sparkles,
  Eye,
  X,
  FileText,
  Mail,
  Calendar,
  CheckCircle2
} from "lucide-react";

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "STUDENT" | "RECRUITER">("ALL");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const [users] = useState([
    {
      id: "usr-1",
      name: "Bala Aditya C",
      email: "student.aditya@example.com",
      role: "STUDENT",
      department: "IoT & Full Stack Engineering",
      status: "ACTIVE",
      joinedAt: "Aug 10, 2026",
      applicationsCount: 3,
      recentApplication: "Full Stack Engineering Intern (Tech Innovations Corp)"
    },
    {
      id: "usr-2",
      name: "Disham N",
      email: "disham@nexus.com",
      role: "RECRUITER",
      department: "Nexus Autonomous Systems",
      status: "ACTIVE",
      joinedAt: "Aug 12, 2026",
      applicationsCount: 4,
      recentApplication: "Robotics Lead Hiring"
    },
    {
      id: "usr-3",
      name: "Sanjay Kumar",
      email: "sanjay@vic.edu",
      role: "STUDENT",
      department: "Computer Science & Engineering",
      status: "ACTIVE",
      joinedAt: "Aug 14, 2026",
      applicationsCount: 1,
      recentApplication: "AI Prompt Engineer (VIC Labs)"
    },
    {
      id: "usr-4",
      name: "Priya Sharma",
      email: "priya@tenar.com",
      role: "RECRUITER",
      department: "Tenar Systems HR",
      status: "ACTIVE",
      joinedAt: "Aug 08, 2026",
      applicationsCount: 2,
      recentApplication: "IoT Firmware Internship Postings"
    }
  ]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.department.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [users, searchQuery, roleFilter]);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-[#EDF0FF] via-white to-[#F8F9FD] border border-[#3B3588]/10 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#202960]/5 text-[#202960] text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> User Governance
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E1B4B] tracking-tight mt-1">
            Platform Users Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mt-1">
            Search, filter, and inspect student applicants and recruiter accounts across the institution.
          </p>
        </div>
      </section>

      {/* Directory Table */}
      <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRoleFilter("ALL")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                roleFilter === "ALL"
                  ? "bg-[#202960] text-white shadow-sm"
                  : "bg-[#F8F9FD] text-slate-600 hover:bg-[#EDF0FF]"
              }`}
            >
              All Users ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter("STUDENT")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                roleFilter === "STUDENT"
                  ? "bg-[#202960] text-white shadow-sm"
                  : "bg-[#F8F9FD] text-slate-600 hover:bg-[#EDF0FF]"
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setRoleFilter("RECRUITER")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                roleFilter === "RECRUITER"
                  ? "bg-[#202960] text-white shadow-sm"
                  : "bg-[#F8F9FD] text-slate-600 hover:bg-[#EDF0FF]"
              }`}
            >
              Recruiters
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search user, email..."
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
                <th className="pb-3.5 font-bold">Department / Org</th>
                <th className="pb-3.5 font-bold">Joined</th>
                <th className="pb-3.5 font-bold">Status</th>
                <th className="pb-3.5 font-bold text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsers.map((u) => (
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
                  <td className="py-4 text-slate-600 font-medium">{u.department}</td>
                  <td className="py-4 text-slate-400">{u.joinedAt}</td>
                  <td className="py-4">
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-[10px] font-black">
                      {u.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => setSelectedUser(u)}
                      className="px-3 py-1.5 rounded-full border border-[#202960]/20 text-[#202960] font-bold text-xs hover:bg-[#EDF0FF] transition inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#3B3588]/15 rounded-[32px] w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start pb-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#202960] text-white font-bold flex items-center justify-center text-sm shadow-md">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#1E1B4B]">{selectedUser.name}</h3>
                  <p className="text-xs text-slate-500">{selectedUser.role} Account</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs bg-[#F8F9FD] p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">{selectedUser.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>Department / Org: <strong>{selectedUser.department}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Member Since: {selectedUser.joinedAt}</span>
              </div>
            </div>

            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-1 text-xs">
              <div className="font-bold text-[#1E1B4B] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-700" /> Active Pipeline Activity
              </div>
              <p className="text-slate-600 text-[11px] mt-1">{selectedUser.recentApplication}</p>
              <div className="text-[10px] text-indigo-700 font-bold mt-1">
                {selectedUser.applicationsCount} Associated Records
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2 rounded-full bg-[#202960] text-white font-bold text-xs hover:bg-[#2E2A72] transition cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}