"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, ArrowRight, AlertCircle, Sparkles, User, Building2 } from "lucide-react";
import { saveStudentSession } from "@/lib/authSession";

export default function SigninPage() {
  const router = useRouter();
  const [role, setRole] = useState<"STUDENT" | "COMPANY">("STUDENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    if (role === "STUDENT") {
      const registeredStudents = JSON.parse(localStorage.getItem("vic_registered_students") || "[]");
      const matchedStudent = registeredStudents.find(
        (u: any) => u.email?.toLowerCase() === cleanEmail && u.password === password
      );

      if (matchedStudent) {
        const token = `student_token_${Date.now()}`;
        saveStudentSession(token, matchedStudent);
        router.push("/student/dashboard");
        return;
      }

      // Default Developer Fallback Account
      if (cleanEmail === "sukruthi@gmail.com" && password === "password123") {
        const defaultUser = {
          name: "Sukruthi",
          email: "sukruthi@gmail.com",
          department: "Computer Science & Engineering",
          bio: "Passionate engineer focusing on embedded architectures and modern full-stack systems.",
          linkedinUrl: "https://linkedin.com",
          githubUrl: "https://github.com",
          portfolioUrl: "https://portfolio.dev",
          skills: "React, Next.js, Node.js, Python, PostgreSQL"
        };
        saveStudentSession(`student_token_${Date.now()}`, defaultUser);
        router.push("/student/dashboard");
        return;
      }

      setError("Invalid student email or password.");
      setLoading(false);
      return;
    }

    if (role === "COMPANY") {
      const registeredCompanies = JSON.parse(localStorage.getItem("vic_registered_companies") || "[]");
      const matchedCompany = registeredCompanies.find(
        (c: any) => c.email?.toLowerCase() === cleanEmail && c.password === password
      );

      if (matchedCompany) {
        const token = `company_token_${Date.now()}`;
        localStorage.setItem("company_token", token);
        localStorage.setItem("company_data", JSON.stringify(matchedCompany));
        router.push("/company");
        return;
      }

      // Default Developer Fallback Account for Recruiter
      if (cleanEmail === "recruiter@nexus.com" && password === "password123") {
        const defaultCompany = {
          companyName: "Nexus Autonomous",
          email: "recruiter@nexus.com",
          website: "https://nexus.io",
          location: "Bengaluru, Karnataka, India",
          industry: "Embedded Systems, Full-Stack & Artificial Intelligence",
          tagline: "Building scalable intelligent software and edge hardware solutions.",
          registrationNumber: "CIN-U72200KA2026PTC109",
          description: "Global enterprise technology partner on Visionary Interns Club."
        };
        localStorage.setItem("company_token", `company_token_${Date.now()}`);
        localStorage.setItem("company_data", JSON.stringify(defaultCompany));
        router.push("/company");
        return;
      }

      setError("Invalid company recruiter email or password.");
      setLoading(false);
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
            <Sparkles className="w-3 h-3" /> Secure Access Portal
          </div> */}
          <h1 className="text-2xl font-black text-[#1E1B4B]">Sign In </h1>
          <p className="text-xs text-slate-500">Access your Student applications or Post Jobs / Internships </p>
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
          <div>
            <label className="block font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
              {role === "STUDENT" ? "Student Email Address" : "Corporate Work Email"}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              <input
                type="email"
                required
                placeholder={role === "STUDENT" ? "student@vic.edu" : "recruiter@company.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F9FD] border border-[#3B3588]/15 focus:outline-none focus:ring-2 focus:ring-[#202960] text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F9FD] border border-[#3B3588]/15 focus:outline-none focus:ring-2 focus:ring-[#202960] text-slate-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#202960] hover:bg-[#2E2A72] text-white font-bold rounded-xl transition shadow-md shadow-[#202960]/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? "Signing in..." : `Sign In as ${role === "STUDENT" ? "Student" : "Recruiter"}`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don&apos;t have an account yet?{" "}
          <Link href="/signup" className="font-bold text-[#202960] hover:underline">
            Register new account
          </Link>
        </div>
      </div>
    </div>
  );
}