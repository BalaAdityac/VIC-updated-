"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyApplications, ApplicationRecord } from "@/lib/student-api";
import {
  FileText,
  Building2,
  Calendar,
  Clock,
  Video,
  ExternalLink,
  Award,
  Loader2,
  ArrowLeft,
  CheckCircle2
} from "lucide-react";

export default function StudentApplicationsPage() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getMyApplications();
        setApplications(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-[#202960]" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/student/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#202960] mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-black text-[#1E1B4B]">My Submitted Applications</h1>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-400">
          No applications submitted yet.
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const companyName =
              typeof app.company === "object"
                ? app.company?.companyName
                : app.internship?.company?.companyName || app.company || "Partner Organization";

            const roleTitle = app.internship?.title || app.role || "Engineering Intern";
            const locationText = app.internship?.location || app.location || "Bengaluru";
            const modeText = app.internship?.mode || "HYBRID";
            const dateStr = app.appliedAt || app.appliedDate || "";

            return (
              <div
                key={app.id}
                className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-bold text-[#1E1B4B]">{roleTitle}</h2>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {companyName} • {locationText} ({modeText})
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                      app.status === "ACCEPTED" || app.status === "OFFERED" || app.status === "HIRED / ACCEPTED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : app.status === "REJECTED"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-indigo-50 text-indigo-700 border-indigo-200"
                    }`}
                  >
                    {app.status}
                  </span>
                </div>

                <div className="flex items-center gap-6 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Applied:{" "}
                    <span className="font-semibold text-slate-700">
                      {dateStr ? new Date(dateStr).toLocaleDateString() : "Recent"}
                    </span>
                  </div>
                  <div>
                    Stipend: <strong className="text-[#202960]">{app.stipend}</strong>
                  </div>
                </div>

                {/* Interviews List */}
                {Array.isArray(app.interviews) && app.interviews.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="text-xs font-bold text-[#1E1B4B]">Scheduled Evaluations:</div>
                    {app.interviews.map((interview: any, idx: number) => (
                      <div
                        key={interview.id || idx}
                        className="p-3 bg-[#F8F9FD] rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs"
                      >
                        <div>
                          <span className="font-bold text-[#1E1B4B]">
                            Round {interview.roundNumber || idx + 1}: {interview.roundName}
                          </span>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            Scheduled for:{" "}
                            {interview.scheduledAt
                              ? new Date(interview.scheduledAt).toLocaleString()
                              : interview.time || "Upcoming"}
                          </p>
                        </div>
                        {interview.meetingUrl && (
                          <a
                            href={interview.meetingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-[#202960] text-white text-[11px] font-bold rounded-full flex items-center gap-1 self-start sm:self-auto"
                          >
                            <Video className="w-3 h-3" /> Join Room
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Offers List */}
                {Array.isArray(app.offers) && app.offers.length > 0 && (
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <Award className="w-4 h-4 text-emerald-600" /> Official Offer Extended!
                    </div>
                    <p className="font-bold text-slate-900">
                      Stipend: ₹{Number(app.offers[0].stipendAmount || 25000).toLocaleString()}/month
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      Expected Joining:{" "}
                      {app.offers[0].joiningDate
                        ? new Date(app.offers[0].joiningDate).toLocaleDateString()
                        : "September 2026"}
                    </p>
                    {app.offers[0].offerLetterUrl && (
                      <a
                        href={app.offers[0].offerLetterUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#202960] font-bold underline text-[11px] mt-1"
                      >
                        <FileText className="w-3.5 h-3.5" /> View Formal Appointment Letter
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}