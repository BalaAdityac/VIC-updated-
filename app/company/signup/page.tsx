"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "../../../components/Logo";
import { Building2, Mail, Lock, Globe, FileText, ArrowRight, Loader2 } from "lucide-react";

export default function CompanySignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    password: "",
    website: "",
    description: "",
    address: "",
    gstNumber: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://127.0.0.1:3000/api/company/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Registration failed");

      if (data.token) {
        localStorage.setItem("company_token", data.token);
        localStorage.setItem("company_data", JSON.stringify(data.company));
      }

      router.push("/company");
    } catch (err: any) {
      setError(err.message || "Failed to register company");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-lg bg-white border border-[#3B3588]/10 rounded-[32px] shadow-xl p-8 sm:p-10">
        <div className="flex justify-center mb-6">
          <Logo showText={false} />
        </div>

        <div className="text-center space-y-1 mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E1B4B] tracking-tight">
            Register Company
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Create an ATS recruiter account to post internships and hire talent.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-2">
              Work Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
              <input
                type="email"
                required
                placeholder="recruiter@company.com"
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
                placeholder="Brief description of your hiring team and domains..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#202960] text-slate-800 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-full bg-[#202960] hover:bg-[#2E2A72] text-white font-bold text-sm shadow-lg shadow-[#202960]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Complete Recruiter Registration
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