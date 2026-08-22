"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getInternshipDetails, applyToInternship, Internship } from "@/lib/student-api";
import {
  Building2,
  MapPin,
  Clock,
  ArrowLeft,
  Loader2,
  Globe,
  Briefcase,
  CheckCircle2,
  FileText
} from "lucide-react";

export default function InternshipDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [job, setJob] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState("I am excited to contribute my engineering skills to your organization.");
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const data = await getInternshipDetails(id);
        setJob(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !job) return;
    setApplying(true);

    try {
      await applyToInternship(id, {
        coverLetter,
        resumeUrl: "https://storage.vic.edu/resumes/resume.pdf",
        resumeFileName: "resume.pdf"
      });
      setAppliedSuccess(true);
      setTimeout(() => router.push("/student/applications"), 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-[#202960]" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center space-y-4 font-sans">
        <h2 className="text-xl font-bold text-slate-800">Internship role not found</h2>
        <Link href="/student/internships" className="text-xs font-bold text-[#202960] underline">
          Browse active internships
        </Link>
      </div>
    );
  }

  const companyName =
    typeof job.company === "object" ? job.company?.companyName : job.company || "Partner Organization";
  const companyWebsite = typeof job.company === "object" ? job.company?.website : undefined;
  const companyDescription = typeof job.company === "object" ? job.company?.description : undefined;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6 font-sans">
      <Link
        href="/student/internships"
        className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#202960]"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Live Openings
      </Link>

      <div className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-2xl font-black text-[#1E1B4B]">{job.title}</h1>
            <p className="text-sm text-slate-600 font-medium mt-1 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-400" /> {companyName}
            </p>
            {companyWebsite && (
              <a
                href={companyWebsite}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-600 hover:underline flex items-center gap-1 mt-1"
              >
                <Globe className="w-3 h-3" /> {companyWebsite}
              </a>
            )}
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-black uppercase">
            {job.mode}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-[#F8F9FD] rounded-2xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Monthly Stipend</span>
            <span className="text-sm font-black text-[#202960]">{job.stipend}</span>
          </div>
          <div className="p-3.5 bg-[#F8F9FD] rounded-2xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Location</span>
            <span className="text-sm font-bold text-slate-800">{job.location}</span>
          </div>
          <div className="p-3.5 bg-[#F8F9FD] rounded-2xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Duration</span>
            <span className="text-sm font-bold text-slate-800">{job.durationMonths || 6} Months</span>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-bold text-[#1E1B4B] uppercase tracking-wider">Role Description</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {job.description || "Hands-on engineering position with direct architect mentorship and active project assignments."}
          </p>
        </div>

        {Array.isArray(job.skills) && job.skills.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-[#1E1B4B] uppercase tracking-wider">Required Skills</h2>
            <div className="flex flex-wrap gap-1.5">
              {job.skills.map((skill: string, index: number) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-700 shadow-2xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {companyDescription && (
          <div className="space-y-1.5 pt-4 border-t border-slate-100">
            <h2 className="text-sm font-bold text-[#1E1B4B]">About {companyName}</h2>
            <p className="text-xs text-slate-500 leading-relaxed">{companyDescription}</p>
          </div>
        )}

        {/* Apply Section */}
        <form onSubmit={handleApply} className="pt-6 border-t border-slate-100 space-y-4 text-xs">
          {appliedSuccess && (
            <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Application submitted successfully! Redirecting...
            </div>
          )}

          <div>
            <label className="block font-bold text-[#1E1B4B] mb-1">Cover Note to Recruiter</label>
            <textarea
              rows={3}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full p-3 rounded-2xl bg-[#F8F9FD] border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={applying || appliedSuccess}
              className="px-6 py-2.5 bg-[#202960] hover:bg-[#2E2A72] text-white font-bold rounded-full transition shadow-md cursor-pointer disabled:opacity-50"
            >
              {applying ? "Submitting..." : "Apply for Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}