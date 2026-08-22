"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { User, Mail, Lock, BookOpen, ArrowRight, AlertCircle, Sparkles, Building2, Globe, MapPin } from "lucide-react";
import { saveStudentSession } from "@/lib/authSession";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<"STUDENT" | "COMPANY">("STUDENT");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Student Form State
  const [studentForm, setStudentForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "Computer Science & Engineering"
  });

  // Company Form State
  const [companyForm, setCompanyForm] = useState({
    companyName: "",
    email: "",
    password: "",
    website: "",
    location: "Bengaluru, Karnataka, India"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (role === "STUDENT") {
      const email = studentForm.email.trim().toLowerCase();
      const registeredStudents = JSON.parse(localStorage.getItem("vic_registered_students") || "[]");
      const exists = registeredStudents.some((u: any) => u.email?.toLowerCase() === email);

      if (exists) {
        setError("A student account with this email already exists. Please sign in.");
        setLoading(false);
        return;
      }

      const newStudent = {
        id: `stud-${Date.now()}`,
        name: studentForm.name.trim(),
        email,
        department: studentForm.department,
        password: studentForm.password,
        bio: "Engineering student eager to contribute and learn.",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
        portfolioUrl: "https://portfolio.dev",
        skills: "React, TypeScript, Python"
      };

      localStorage.setItem("vic_registered_students", JSON.stringify([...registeredStudents, newStudent]));
      saveStudentSession(`student_token_${Date.now()}`, newStudent);
      router.push("/student/dashboard");
      return;
    }

    if (role === "COMPANY") {
      const email = companyForm.email.trim().toLowerCase();
      const registeredCompanies = JSON.parse(localStorage.getItem("vic_registered_companies") || "[]");
      const exists = registeredCompanies.some((c: any) => c.email?.toLowerCase() === email);

      if (exists) {
        setError("An organization with this recruiter email already exists. Please sign in.");
        setLoading(false);
        return;
      }

      const newCompany = {
        id: `comp-${Date.now()}`,
        companyName: companyForm.companyName.trim(),
        email,
        password: companyForm.password,
        website: companyForm.website.trim() || `https://${companyForm.companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
        location: companyForm.location,
        industry: "Enterprise Technology & Engineering",
        tagline: "Building scalable technology solutions with student talent.",
        registrationNumber: `CIN-U${Math.floor(10000 + Math.random() * 90000)}KA2026PTC`,
        description: "Official partner organization on Visionary Interns Club."
      };

      localStorage.setItem("vic_registered_companies", JSON.stringify([...registeredCompanies, newCompany]));
      localStorage.setItem("company_token", `company_token_${Date.now()}`);
      localStorage.setItem("company_data", JSON.stringify(newCompany));
      router.push("/company");
      return;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center p-4 font-sans">
      <div className="bg-white border border-[#3B3588]/10 rounded-[32px] p-8 sm:p-10 w-full max-w-md shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="relative w-12 h-12 mx-auto rounded-2xl overflow-hidden border border-[#3B3588]/10 shadow-sm flex items-center justify-center bg-white">
            <Image src="/logo.jpg" alt="VIC Logo" width={48} height={48} className="object-contain" priority />
          </div>
          <span className="text-base sm:text-lg font-black text-[#1E1B4B] uppercase tracking-wide whitespace-nowrap">
            Visionary Interns Club
          </span>
          {/* <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#202960]/5 text-[#202960] text-[10px] font-black uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> Registration Portal
          </div> */}
          <h1 className="text-2xl font-black text-[#1E1B4B]">Create an Account</h1>
          <p className="text-xs text-slate-500">Register as a student applicant or corporate hiring partner.</p>
        </div>

        {/* Dual Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-[#F8F9FD] rounded-2xl border border-slate-200/60 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setRole("STUDENT"); setError(null); }}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
              role === "STUDENT" ? "bg-[#202960] text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <User className="w-3.5 h-3.5" /> Student
          </button>
          <button
            type="button"
            onClick={() => { setRole("COMPANY"); setError(null); }}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
              role === "COMPANY" ? "bg-[#202960] text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Recruiter
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          {role === "STUDENT" ? (
            <>
              <div>
                <label className="block font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ashley Johnson"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F9FD] border border-[#3B3588]/15 focus:outline-none focus:ring-2 focus:ring-[#202960] text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="student@vic.edu"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F9FD] border border-[#3B3588]/15 focus:outline-none focus:ring-2 focus:ring-[#202960] text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">Branch / Department</label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Science & Engineering"
                    value={studentForm.department}
                    onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F9FD] border border-[#3B3588]/15 focus:outline-none focus:ring-2 focus:ring-[#202960] text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={studentForm.password}
                    onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F9FD] border border-[#3B3588]/15 focus:outline-none focus:ring-2 focus:ring-[#202960] text-slate-800"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">Company Name *</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Visionary Interns Club  "
                    value={companyForm.companyName}
                    onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F9FD] border border-[#3B3588]/15 focus:outline-none focus:ring-2 focus:ring-[#202960] text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">Recruiter Work Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="recruiter@vic.com"
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F9FD] border border-[#3B3588]/15 focus:outline-none focus:ring-2 focus:ring-[#202960] text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">Company Website Domain</label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="url"
                    placeholder="https://vic.in"
                    value={companyForm.website}
                    onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F9FD] border border-[#3B3588]/15 focus:outline-none focus:ring-2 focus:ring-[#202960] text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">Headquarters Location</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bengaluru, Karnataka"
                    value={companyForm.location}
                    onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F9FD] border border-[#3B3588]/15 focus:outline-none focus:ring-2 focus:ring-[#202960] text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={companyForm.password}
                    onChange={(e) => setCompanyForm({ ...companyForm, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F9FD] border border-[#3B3588]/15 focus:outline-none focus:ring-2 focus:ring-[#202960] text-slate-800"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#202960] hover:bg-[#2E2A72] text-white font-bold rounded-xl transition shadow-md shadow-[#202960]/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? "Creating..." : `Create ${role === "STUDENT" ? "Student" : "Recruiter"} Account`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already have an account?{" "}
          <Link href="/signin" className="font-bold text-[#202960] hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}