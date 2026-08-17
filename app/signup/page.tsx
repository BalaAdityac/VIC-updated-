"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Building2,
  Mail,
  Lock,
  User,
  Globe,
  FileText,
  ArrowRight,
  Loader2,
} from "lucide-react";
import logoImg from "../../public/logo.jpg";

export default function SignUpPage() {
  const router = useRouter();
  const [role, setRole] = useState<"STUDENT" | "COMPANY">("STUDENT");
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    email: "",
    password: "",
    website: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (role === "COMPANY") {
        const res = await fetch("http://127.0.0.1:3000/api/company/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyName: formData.companyName,
            email: formData.email,
            password: formData.password,
            website: formData.website || undefined,
            description: formData.description || undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || data.error || "Company registration failed");

        if (data.token) {
          localStorage.setItem("company_token", data.token);
          localStorage.setItem("company_data", JSON.stringify(data.company));
        }

        router.push("/company");
      } else {
        // Student signup flow
        const res = await fetch("http://127.0.0.1:3000/api/student/dev-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Student registration failed");

        if (data.token) {
          localStorage.setItem("student_token", data.token);
          localStorage.setItem(
            "student_data",
            JSON.stringify({ ...data.student, name: formData.fullName })
          );
        }

        router.push("/student/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      {/* Brand Header */}
      <Link href="/" className="flex items-center gap-3 mb-6 group">
        <div className="relative w-11 h-11 rounded-2xl overflow-hidden flex items-center justify-center bg-white border border-[#3B3588]/10 shadow-sm transition-transform group-hover:scale-105">
          <Image
            src={logoImg}
            alt="Visionary Interns Club Logo"
            width={44}
            height={44}
            className="object-contain"
            priority
          />
        </div>
        <span className="text-xl font-black text-[#1E1B4B] tracking-tight uppercase">
          Visionary Interns Club
        </span>
      </Link>

      {/* Main Card */}
      <div className="w-full max-w-lg bg-white border border-[#3B3588]/10 rounded-[32px] shadow-xl p-8 sm:p-10">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E1B4B] tracking-tight">
            Create an Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Join the network as a student or register as a hiring company.
          </p>
        </div>

        {/* Role Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#EDF0FF] rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setRole("STUDENT");
              setError(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
              role === "STUDENT"
                ? "bg-[#202960] text-white shadow-md shadow-[#202960]/20"
                : "text-slate-600 hover:text-[#202960]"
            }`}
          >
            <GraduationCap className="w-4 h-4" /> Student
          </button>
          <button
            type="button"
            onClick={() => {
              setRole("COMPANY");
              setError(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
              role === "COMPANY"
                ? "bg-[#202960] text-white shadow-md shadow-[#202960]/20"
                : "text-slate-600 hover:text-[#202960]"
            }`}
          >
            <Building2 className="w-4 h-4" /> Company / Recruiter
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {role === "STUDENT" ? (
            <div>
              <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ash"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#202960] text-slate-800 transition"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-2">
                Company Name *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Tech Innovations Corp"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#202960] text-slate-800 transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-2">
              {role === "COMPANY" ? "Work Email Address *" : "Email Address *"}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
              <input
                type="email"
                required
                placeholder={role === "COMPANY" ? "hr@company.com" : "student@example.com"}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#202960] text-slate-800 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-2">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#202960] text-slate-800 transition"
              />
            </div>
          </div>

          {role === "COMPANY" && (
            <>
              <div>
                <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-2">
                  Company Website
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
                  <input
                    type="url"
                    placeholder="https://company.example.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#202960] text-slate-800 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-2">
                  About Organization
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
                  <textarea
                    rows={2}
                    placeholder="Brief description of your company's core focus..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#202960] text-slate-800 transition"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-full bg-[#202960] hover:bg-[#2E2A72] text-white font-bold text-sm shadow-lg shadow-[#202960]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Register as {role === "COMPANY" ? "Recruiter" : "Student"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500 space-y-3">
          <div>
            Already have an account?{" "}
            <Link href="/signin" className="font-bold text-[#202960] hover:underline">
              Sign In
            </Link>
          </div>
          <div>
            <Link href="/" className="text-slate-400 hover:text-slate-600 transition">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}