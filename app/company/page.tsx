"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Briefcase,
  Users,
  Video,
  ClipboardCheck,
  Building2,
  Plus,
  Search,
  Bell,
  LogOut,
  ChevronDown,
  ArrowUpRight,
  Sparkles,
  Menu,
  X,
  Clock,
  ExternalLink,
  Loader2,
  CheckCheck,
  FileText,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Award,
  Globe,
  Mail,
  MapPin,
  Save,
  CheckCircle2,
  FileCheck,
  Filter,
  Eye,
  Send,
  Phone,
  ShieldCheck,
  ShieldAlert,
  Lock
} from "lucide-react";
import { clearCompanySession } from "@/lib/authSession";

function formatDateSafe(dateInput: any): string {
  if (!dateInput) return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  if (typeof dateInput === "string" && dateInput.includes("Invalid")) {
    return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  const parsed = new Date(dateInput);
  if (isNaN(parsed.getTime())) {
    return typeof dateInput === "string" && dateInput.length > 3
      ? dateInput
      : new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTimeSafe(dateInput: any): string {
  if (!dateInput) return new Date().toLocaleString();
  const parsed = new Date(dateInput);
  if (isNaN(parsed.getTime())) return String(dateInput);
  return parsed.toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
}

function formatStipend(val: any): string {
  if (val === null || val === undefined || val === "") return "₹0 / mo";
  if (typeof val === "string" && (val.includes("₹") || val.includes("/ mo") || val.includes("/mo"))) {
    return val;
  }
  const numeric = typeof val === "number" ? val : parseFloat(String(val).replace(/[^0-9.]/g, ""));
  if (isNaN(numeric) || numeric === 0) return "₹0 / mo";
  return `₹${numeric.toLocaleString("en-IN")} / mo`;
}

export default function CompanyDashboard() {
  const [mounted, setMounted] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "jobs" | "applications" | "interviews" | "profile">("overview");

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Post Role Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // Edit Role Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    mode: "HYBRID",
    location: "Bengaluru",
    stipend: "",
    durationMonths: "6",
    skills: "",
    status: "ACTIVE",
    description: ""
  });

  // Delete Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<any | null>(null);
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState<any | null>(null);

  // Deep Candidate Inspection Drawer
  const [inspectedCandidate, setInspectedCandidate] = useState<any | null>(null);

  // Custom Offer Modal State
  const [offerModalCandidate, setOfferModalCandidate] = useState<any | null>(null);
  const [offerFormData, setOfferFormData] = useState({
    stipend: "25000",
    joiningDate: "2026-09-01",
    customNote: "We were impressed by your technical interview performance and are excited to welcome you to our team."
  });

  // Schedule Interview Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [interviewForm, setInterviewForm] = useState({
    roundName: "Technical Systems Round",
    date: "2026-08-28",
    time: "14:30",
    meetingUrl: "https://meet.google.com/vic-recruitment-room"
  });

  // Company Profile State
  const [profile, setProfile] = useState({
    companyName: "",
    email: "",
    phone: "",
    website: "",
    location: "",
    industry: "",
    companySize: "11-50 Employees",
    foundedYear: "2026",
    registrationNumber: "",
    tagline: "",
    linkedinUrl: "",
    twitterUrl: "",
    cultureBenefits: "",
    techStack: "",
    description: ""
  });

  const [profileSaved, setProfileSaved] = useState(false);

  // Live Scoped State Arrays
  const [jobs, setJobs] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);

  // Post Role Form State
  const [formData, setFormData] = useState({
    title: "",
    mode: "HYBRID",
    location: "Bengaluru",
    stipend: "",
    durationMonths: "6",
    skills: "",
    description: ""
  });

  const notifyPipeline = useCallback((payload: { type: string; data?: any }) => {
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const bc = new BroadcastChannel("vic_realtime_pipeline");
        bc.postMessage(payload);
        setTimeout(() => bc.close(), 100);
      }
    } catch {}
    window.dispatchEvent(new CustomEvent("vic_pipeline_sync", { detail: payload }));
  }, []);

  const checkSuspensionStatus = useCallback((compName: string, compEmail: string) => {
    try {
      const blockedList: string[] = JSON.parse(localStorage.getItem("vic_blocked_entities") || "[]");
      const isNameBlocked = compName ? blockedList.includes(compName.trim().toLowerCase()) : false;
      const isEmailBlocked = compEmail ? blockedList.includes(compEmail.trim().toLowerCase()) : false;
      setIsSuspended(isNameBlocked || isEmailBlocked);
    } catch {
      setIsSuspended(false);
    }
  }, []);

  // SYNCHRONIZED PIPELINE
  const syncPipelineData = useCallback(() => {
    if (typeof window === "undefined") return;

    let activeCompName = "";
    let activeEmail = "";
    try {
      const stored = localStorage.getItem("company_data");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.companyName) activeCompName = parsed.companyName;
        if (parsed.email) activeEmail = parsed.email;
      }
    } catch {}

    checkSuspensionStatus(activeCompName, activeEmail);

    const rawName = activeCompName.trim().toLowerCase();

    // 1. Resolve Applicants
    let myLiveApplicants: any[] = [];
    if (rawName) {
      try {
        const storedApps = JSON.parse(localStorage.getItem("vic_applications") || "[]");
        myLiveApplicants = storedApps.filter((a: any) => {
          const appComp = String(a.company || "").trim().toLowerCase();
          return appComp === rawName;
        });
      } catch {}
    }
    setApplicants(myLiveApplicants);

    // 2. Resolve Interviews
    const aggregatedInterviews: any[] = [];
    myLiveApplicants.forEach((app) => {
      if (Array.isArray(app.interviews) && app.interviews.length > 0) {
        app.interviews.forEach((intv: any) => {
          aggregatedInterviews.push({
            id: intv.id,
            applicationId: app.id,
            candidateName: app.name || "Candidate",
            candidateEmail: app.email,
            role: app.role || "Engineering Intern",
            company: app.company || activeCompName,
            roundName: intv.roundName,
            date: formatDateSafe(intv.date || intv.scheduledAt),
            time: intv.time || (intv.scheduledAt ? formatDateTimeSafe(intv.scheduledAt) : "2:30 PM"),
            meetingUrl: intv.meetingUrl || "https://meet.google.com/vic-recruitment-room",
            status: intv.status || "SCHEDULED",
            feedback: intv.feedback || ""
          });
        });
      }
    });
    setInterviews(aggregatedInterviews);

    // 3. Resolve Custom Jobs
    let localJobs: any[] = [];
    if (rawName) {
      try {
        const customJobsStr = localStorage.getItem("vic_custom_jobs");
        if (customJobsStr) {
          const parsed = JSON.parse(customJobsStr);
          if (Array.isArray(parsed)) {
            localJobs = parsed.filter((j: any) => {
              const comp = String(j.company || "").trim().toLowerCase();
              return comp === rawName;
            });
          }
        }
      } catch {}
    }

    const deletedIds = new Set(JSON.parse(localStorage.getItem("vic_deleted_jobs") || "[]"));
    const mergedJobsMap = new Map();

    localJobs.forEach((job) => {
      if (!deletedIds.has(job.id)) {
        const dedupeKey = String(job.title).trim().toLowerCase();
        mergedJobsMap.set(dedupeKey, job);
      }
    });

    let finalJobs = Array.from(mergedJobsMap.values());
    finalJobs = finalJobs.map((job) => {
      const matchCount = myLiveApplicants.filter(
        (app) =>
          String(app.internshipId).trim() === String(job.id).trim() ||
          String(app.role || "").trim().toLowerCase() === String(job.title || "").trim().toLowerCase()
      ).length;
      return { ...job, applicantsCount: matchCount };
    });

    setJobs(finalJobs);
  }, [checkSuspensionStatus]);

  useEffect(() => {
    setMounted(true);

    const storedCompany = localStorage.getItem("company_data");
    if (storedCompany) {
      try {
        const parsed = JSON.parse(storedCompany);
        setProfile({
          companyName: parsed.companyName || "",
          email: parsed.email || "",
          phone: parsed.phone || "",
          website: parsed.website || "",
          location: parsed.location || "Bengaluru, Karnataka, India",
          industry: parsed.industry || "Software & Technology Services",
          companySize: parsed.companySize || "11-50 Employees",
          foundedYear: parsed.foundedYear || "2026",
          registrationNumber: parsed.registrationNumber || "",
          tagline: parsed.tagline || "",
          linkedinUrl: parsed.linkedinUrl || "",
          twitterUrl: parsed.twitterUrl || "",
          cultureBenefits: parsed.cultureBenefits || "Direct mentorship, certificate of completion, pre-placement offer (PPO) opportunities.",
          techStack: parsed.techStack || "React, TypeScript, Node.js, Python",
          description: parsed.description || ""
        });
      } catch {}
    }

    syncPipelineData();

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        bc = new BroadcastChannel("vic_realtime_pipeline");
        bc.onmessage = (event) => {
          syncPipelineData();
        };
      }
    } catch {}

    const handleLocalSync = () => syncPipelineData();
    window.addEventListener("vic_pipeline_sync", handleLocalSync);
    window.addEventListener("storage", handleLocalSync);

    return () => {
      if (bc) bc.close();
      window.removeEventListener("vic_pipeline_sync", handleLocalSync);
      window.removeEventListener("storage", handleLocalSync);
    };
  }, [syncPipelineData]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSuspended) return;

    localStorage.setItem("company_data", JSON.stringify(profile));

    try {
      const regCompanies = JSON.parse(localStorage.getItem("vic_registered_companies") || "[]");
      const updated = regCompanies.map((c: any) => {
        if (c.email?.toLowerCase() === profile.email.toLowerCase()) {
          return { ...c, ...profile };
        }
        return c;
      });
      localStorage.setItem("vic_registered_companies", JSON.stringify(updated));
    } catch {}

    setProfileSaved(true);
    notifyPipeline({ type: "COMPANY_PROFILE_UPDATED", data: profile });
    setTimeout(() => setProfileSaved(false), 3000);
    syncPipelineData();
  };

  const handleDispatchOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSuspended || !offerModalCandidate) return;

    try {
      const storedApps: any[] = JSON.parse(localStorage.getItem("vic_applications") || "[]");
      const updatedApps = storedApps.map((app) => {
        if (
          app.id === offerModalCandidate.id ||
          (String(app.email).toLowerCase() === String(offerModalCandidate.email).toLowerCase() &&
            app.role === offerModalCandidate.role)
        ) {
          return {
            ...app,
            status: "OFFERED",
            stipend: formatStipend(offerFormData.stipend),
            joiningDate: formatDateSafe(offerFormData.joiningDate),
            offerNote: offerFormData.customNote
          };
        }
        return app;
      });

      localStorage.setItem("vic_applications", JSON.stringify(updatedApps));

      const studentNotifs: any[] = JSON.parse(localStorage.getItem("vic_student_notifications") || "[]");
      const decisionNotif = {
        id: Date.now(),
        candidateEmail: offerModalCandidate.email,
        text: `Official Offer Issued! ${profile.companyName} has extended an appointment for "${offerModalCandidate.role}" with monthly stipend ${formatStipend(offerFormData.stipend)}.`,
        time: "Just now",
        read: false,
        type: "ACCEPTED"
      };
      localStorage.setItem("vic_student_notifications", JSON.stringify([decisionNotif, ...studentNotifs]));

      notifyPipeline({
        type: "DECISION_UPDATED",
        data: { candidateEmail: offerModalCandidate.email, newStatus: "ACCEPTED", role: offerModalCandidate.role }
      });

      setOfferModalCandidate(null);
      syncPipelineData();
    } catch {}
  };

  const handleRejectCandidate = (candidate: any) => {
    if (isSuspended) return;
    try {
      const storedApps: any[] = JSON.parse(localStorage.getItem("vic_applications") || "[]");
      const updatedApps = storedApps.map((app) => {
        if (
          app.id === candidate.id ||
          (String(app.email).toLowerCase() === String(candidate.email).toLowerCase() && app.role === candidate.role)
        ) {
          return { ...app, status: "REJECTED" };
        }
        return app;
      });

      localStorage.setItem("vic_applications", JSON.stringify(updatedApps));

      const studentNotifs: any[] = JSON.parse(localStorage.getItem("vic_student_notifications") || "[]");
      const decisionNotif = {
        id: Date.now(),
        candidateEmail: candidate.email,
        text: `Application update: Your candidacy with ${profile.companyName} for "${candidate.role}" has concluded.`,
        time: "Just now",
        read: false,
        type: "REJECTED"
      };
      localStorage.setItem("vic_student_notifications", JSON.stringify([decisionNotif, ...studentNotifs]));

      notifyPipeline({
        type: "DECISION_UPDATED",
        data: { candidateEmail: candidate.email, newStatus: "REJECTED", role: candidate.role }
      });

      syncPipelineData();
    } catch {}
  };

  const handleUpdateInterviewEvaluation = (interviewId: string, evaluation: "PASSED" | "FAILED") => {
    if (isSuspended) return;
    try {
      const storedApps: any[] = JSON.parse(localStorage.getItem("vic_applications") || "[]");
      const updatedApps = storedApps.map((app) => {
        if (Array.isArray(app.interviews)) {
          const matched = app.interviews.some((i: any) => i.id === interviewId);
          if (matched) {
            const updatedIntvs = app.interviews.map((i: any) =>
              i.id === interviewId ? { ...i, status: evaluation === "PASSED" ? "ROUND_PASSED" : "ROUND_FAILED" } : i
            );
            return {
              ...app,
              interviews: updatedIntvs,
              status: evaluation === "PASSED" ? "INTERVIEW_PASSED" : "REJECTED"
            };
          }
        }
        return app;
      });

      localStorage.setItem("vic_applications", JSON.stringify(updatedApps));
      notifyPipeline({ type: "INTERVIEW_EVALUATED", data: { interviewId, evaluation } });
      syncPipelineData();
    } catch {}
  };

  const handleOpenEditModal = (job: any) => {
    if (isSuspended) return;
    setEditingJob(job);
    const rawStipend = typeof job.stipend === "string" ? job.stipend.replace(/[^0-9]/g, "") : String(job.stipend || "");
    setEditFormData({
      title: job.title || "",
      mode: (job.mode || "HYBRID").toUpperCase().replace("-", "_"),
      location: job.location || profile.location || "Bengaluru",
      stipend: rawStipend,
      durationMonths: String(job.durationMonths || 6),
      skills: Array.isArray(job.skills) ? job.skills.join(", ") : job.skills || "",
      status: job.status || "ACTIVE",
      description: job.description || ""
    });
    setIsEditModalOpen(true);
  };

  const handleEditRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSuspended || !editingJob) return;

    const skillList = editFormData.skills
      ? editFormData.skills.split(",").map((s) => s.trim()).filter(Boolean)
      : ["General Engineering"];

    const formattedMode =
      editFormData.mode === "HYBRID" ? "Hybrid" : editFormData.mode === "REMOTE" ? "Remote" : "On-Site";

    const allCustomJobs = JSON.parse(localStorage.getItem("vic_custom_jobs") || "[]");
    const updatedJobList = allCustomJobs.map((j: any) => {
      if (j.id === editingJob.id) {
        return {
          ...j,
          title: editFormData.title,
          mode: formattedMode,
          location: editFormData.location,
          stipend: formatStipend(editFormData.stipend),
          durationMonths: Number(editFormData.durationMonths),
          skills: skillList,
          status: editFormData.status,
          description: editFormData.description
        };
      }
      return j;
    });

    localStorage.setItem("vic_custom_jobs", JSON.stringify(updatedJobList));
    notifyPipeline({ type: "JOB_UPDATED", data: { title: editFormData.title } });

    setIsEditModalOpen(false);
    setEditingJob(null);
    syncPipelineData();
  };

  const handleConfirmDeleteJob = () => {
    if (isSuspended || !jobToDelete) return;

    const deletedIds = JSON.parse(localStorage.getItem("vic_deleted_jobs") || "[]");
    if (!deletedIds.includes(jobToDelete.id)) {
      deletedIds.push(jobToDelete.id);
      localStorage.setItem("vic_deleted_jobs", JSON.stringify(deletedIds));
    }

    const allCustomJobs = JSON.parse(localStorage.getItem("vic_custom_jobs") || "[]");
    const updatedJobList = allCustomJobs.filter((j: any) => j.id !== jobToDelete.id);
    localStorage.setItem("vic_custom_jobs", JSON.stringify(updatedJobList));

    notifyPipeline({ type: "JOB_DELETED", data: { id: jobToDelete.id, title: jobToDelete.title } });

    setIsDeleteModalOpen(false);
    setJobToDelete(null);
    syncPipelineData();
  };

  const handleScheduleInterviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSuspended || !selectedCandidate) return;

    const newInterview = {
      id: `intv-${Date.now()}`,
      roundName: interviewForm.roundName,
      date: formatDateSafe(interviewForm.date),
      time: `${interviewForm.date} • ${interviewForm.time}`,
      scheduledAt: `${interviewForm.date}T${interviewForm.time}:00`,
      meetingUrl: interviewForm.meetingUrl,
      status: "SCHEDULED"
    };

    try {
      const storedApps: any[] = JSON.parse(localStorage.getItem("vic_applications") || "[]");
      const updatedApps = storedApps.map((app) => {
        if (
          app.id === selectedCandidate.id ||
          (String(app.email).toLowerCase() === String(selectedCandidate.email).toLowerCase() &&
            app.role === selectedCandidate.role)
        ) {
          const prevInterviews = Array.isArray(app.interviews) ? app.interviews : [];
          return {
            ...app,
            status: "INTERVIEWING",
            interviews: [newInterview, ...prevInterviews]
          };
        }
        return app;
      });

      localStorage.setItem("vic_applications", JSON.stringify(updatedApps));

      const studentNotifs: any[] = JSON.parse(localStorage.getItem("vic_student_notifications") || "[]");
      const intvNotif = {
        id: Date.now(),
        candidateEmail: selectedCandidate.email,
        text: `Interview Scheduled: ${profile.companyName} has invited you to "${interviewForm.roundName}" on ${interviewForm.date} at ${interviewForm.time}.`,
        time: "Just now",
        read: false
      };
      localStorage.setItem("vic_student_notifications", JSON.stringify([intvNotif, ...studentNotifs]));
    } catch {}

    notifyPipeline({
      type: "INTERVIEW_SCHEDULED",
      data: { candidate: selectedCandidate.name, role: selectedCandidate.role }
    });

    syncPipelineData();
    setIsScheduleModalOpen(false);
    setSelectedCandidate(null);
    setSelectedJobForApplicants(null);
    setActiveTab("interviews");
  };

  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs;
    const q = searchQuery.toLowerCase();
    return jobs.filter(
      (j) => j.title?.toLowerCase().includes(q) || j.location?.toLowerCase().includes(q) || j.mode?.toLowerCase().includes(q)
    );
  }, [jobs, searchQuery]);

  const filteredApplicants = useMemo(() => {
    return applicants.filter((a) => {
      const matchRole = roleFilter === "ALL" || a.role === roleFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        a.name?.toLowerCase().includes(q) ||
        a.role?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q);
      return matchRole && matchQuery;
    });
  }, [applicants, roleFilter, searchQuery]);

  const jobSpecificApplicants = useMemo(() => {
    if (!selectedJobForApplicants) return [];
    return applicants.filter(
      (app) =>
        String(app.internshipId).trim() === String(selectedJobForApplicants.id).trim() ||
        app.role?.toLowerCase() === selectedJobForApplicants.title?.toLowerCase()
    );
  }, [applicants, selectedJobForApplicants]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllNotifsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handlePostRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSuspended) return;
    setIsPosting(true);

    const skillList = formData.skills
      ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
      : ["React", "TypeScript"];

    const formattedMode =
      formData.mode === "HYBRID" ? "Hybrid" : formData.mode === "REMOTE" ? "Remote" : "On-Site";

    const createdJob = {
      id: `job-${Date.now()}`,
      title: formData.title,
      company: profile.companyName || "Organization",
      mode: formattedMode,
      location: formData.location || "Bengaluru",
      stipend: formatStipend(formData.stipend),
      applicantsCount: 0,
      status: "ACTIVE",
      postedAt: "Just now",
      deadline: "Open until filled",
      skills: skillList,
      description: formData.description
    };

    const existingCustom = JSON.parse(localStorage.getItem("vic_custom_jobs") || "[]");
    localStorage.setItem("vic_custom_jobs", JSON.stringify([createdJob, ...existingCustom]));

    notifyPipeline({ type: "JOB_POSTED", data: { title: createdJob.title } });

    setFormData({
      title: "",
      mode: "HYBRID",
      location: "Bengaluru",
      stipend: "",
      durationMonths: "6",
      skills: "",
      description: ""
    });
    setIsCreateModalOpen(false);
    setIsPosting(false);
    syncPipelineData();
    setActiveTab("jobs");
  };

  const companyInitials = useMemo(() => {
    if (!profile.companyName) return "CO";
    const parts = profile.companyName.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : profile.companyName.substring(0, 2).toUpperCase();
  }, [profile.companyName]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#202960]" />
      </div>
    );
  }

  // SUSPENSION LOCKOUT VIEW
  if (isSuspended) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] text-slate-800 flex flex-col md:flex-row font-sans">
        <aside className="w-72 border-r border-red-200 bg-white p-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 shrink-0 rounded-xl overflow-hidden flex items-center justify-center bg-white border border-red-200 shadow-sm">
                <Image src="/logo.jpg" alt="Logo" width={36} height={36} className="object-contain" priority />
              </div>
              <div className="min-w-0">
                <div className="font-black text-xs tracking-tight text-[#1E1B4B] uppercase whitespace-nowrap">Visionary Interns Club</div>
                <div className="text-[10px] font-bold text-red-600 whitespace-nowrap">Company Portal</div>
              </div>
            </Link>

            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200">
              <div className="font-bold text-xs text-red-900">{profile.companyName || "Organization"}</div>
              <div className="text-[10px] text-red-600 font-bold uppercase mt-0.5">Account Suspended</div>
            </div>
          </div>

          <div className="pt-4 border-t border-red-100 flex items-center justify-between">
            <div className="text-xs text-slate-400">{profile.email}</div>
            <Link
              href="/"
              onClick={() => clearCompanySession()}
              className="p-2 text-slate-400 hover:text-red-600 transition cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </aside>

        <main className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-lg bg-white border-2 border-red-200 rounded-[32px] p-8 sm:p-10 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-sm">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-[#1E1B4B]">Organization Account Suspended</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Recruitment authorization for <strong className="text-slate-800">{profile.companyName}</strong> has been temporarily suspended by the SuperAdmin Governance Council.
              </p>
            </div>

            <div className="p-4 bg-red-50/60 border border-red-200 rounded-2xl text-xs text-red-800 text-left space-y-1.5 font-medium">
              <div className="flex items-center gap-2 font-bold text-red-900">
                <Lock className="w-3.5 h-3.5" /> Enforcement Restrictions:
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-red-700">
                <li>All active job vacancies have been hidden from student explorers.</li>
                <li>Candidate applications and evaluation actions are locked.</li>
                <li>Offer dispatch capabilities are disabled.</li>
              </ul>
            </div>

            <div className="pt-2">
              <Link
                href="/"
                onClick={() => clearCompanySession()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#202960] hover:bg-[#2E2A72] text-white text-xs font-bold rounded-full transition shadow-md"
              >
                <LogOut className="w-4 h-4" /> Sign Out from Portal
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-slate-800 flex flex-col md:flex-row font-sans">
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 md:w-64 border-r border-[#3B3588]/10 bg-white p-6 flex flex-col justify-between shadow-2xl md:shadow-sm transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 shrink-0 rounded-xl overflow-hidden flex items-center justify-center bg-white border border-[#3B3588]/10 shadow-sm">
                <Image src="/logo.jpg" alt="Logo" width={36} height={36} className="object-contain" priority />
              </div>
              <div className="min-w-0">
                <div className="font-black text-xs tracking-tight text-[#1E1B4B] uppercase whitespace-nowrap">Visionary Interns Club</div>
                <div className="text-[10px] font-bold text-[#3B3588] whitespace-nowrap">Company Portal</div>
              </div>
            </Link>

            <button onClick={() => setMobileMenuOpen(false)} className="md:hidden p-2 rounded-xl text-slate-500 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            onClick={() => setActiveTab("profile")}
            className="p-3.5 rounded-2xl bg-[#EDF0FF] border border-[#3B3588]/10 flex items-center justify-between cursor-pointer hover:border-[#202960]/30 transition"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#202960] text-white font-bold flex items-center justify-center text-xs shadow-sm">
                {companyInitials}
              </div>
              <div className="text-left">
                <div className="font-bold text-xs text-[#1E1B4B] truncate max-w-[120px]">
                  {profile.companyName || "Organization"}
                </div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <nav className="space-y-1.5 text-xs font-bold">
            <button
              onClick={() => { setActiveTab("overview"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition cursor-pointer ${
                activeTab === "overview" ? "bg-[#202960] text-white shadow-md" : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF]"
              }`}
            >
              <Building2 className="w-4 h-4" /> Overview
            </button>

            <button
              onClick={() => { setActiveTab("jobs"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition cursor-pointer ${
                activeTab === "jobs" ? "bg-[#202960] text-white shadow-md" : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF]"
              }`}
            >
              <Briefcase className="w-4 h-4" /> Job Postings ({jobs.length})
            </button>

            <button
              onClick={() => { setActiveTab("applications"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition cursor-pointer ${
                activeTab === "applications" ? "bg-[#202960] text-white shadow-md" : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF]"
              }`}
            >
              <Users className="w-4 h-4" /> Applicants ({applicants.length})
            </button>

            <button
              onClick={() => { setActiveTab("interviews"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition cursor-pointer ${
                activeTab === "interviews" ? "bg-[#202960] text-white shadow-md" : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF]"
              }`}
            >
              <Video className="w-4 h-4" /> Scheduled Rounds ({interviews.length})
            </button>

            <button
              onClick={() => { setActiveTab("profile"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition cursor-pointer ${
                activeTab === "profile" ? "bg-[#202960] text-white shadow-md" : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF]"
              }`}
            >
              <FileCheck className="w-4 h-4" /> Company Profile
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-[#3B3588]/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#202960] text-white font-bold text-xs flex items-center justify-center">
              {companyInitials}
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-[#1E1B4B] truncate max-w-[110px]">{profile.companyName || "Organization"}</div>
              <div className="text-[10px] text-slate-400 truncate max-w-[110px]">{profile.email}</div>
            </div>
          </div>
          <Link
            href="/"
            onClick={() => clearCompanySession()}
            className="p-2 text-slate-400 hover:text-red-600 transition cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 md:h-18 px-4 sm:px-8 border-b border-[#3B3588]/10 bg-white flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 rounded-xl text-[#202960] cursor-pointer">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <span>Company</span>
              <span>/</span>
              <span className="text-[#1E1B4B] capitalize">{activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search candidate, role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-44 sm:w-64 pl-10 pr-8 py-2 rounded-full bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2.5 rounded-full bg-[#F8F9FD] border border-[#3B3588]/15 text-slate-600 hover:text-[#202960] cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-[#3B3588]/15 rounded-3xl shadow-2xl p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                    <span className="font-bold text-sm text-[#1E1B4B]">Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllNotifsRead} className="text-[11px] font-bold text-[#202960] hover:underline flex items-center gap-1 cursor-pointer">
                        <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">No notifications yet.</div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="p-3 rounded-2xl bg-[#EDF0FF]/60 text-slate-800 font-medium text-xs">
                          <p>{n.text}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-[#202960] hover:bg-[#2E2A72] text-white font-bold text-xs shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post New Role</span>
            </button>
          </div>
        </header>

        <div className="p-4 sm:p-8 space-y-8 max-w-7xl">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <>
              <section className="bg-gradient-to-br from-[#EDF0FF] via-white to-[#F8F9FD] border border-[#3B3588]/10 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#1E1B4B]">
                    Welcome, {profile.companyName || "Partner"}!
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
                    Review candidate submissions, evaluate technical rounds, and issue verified appointment offers.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-5 py-3 rounded-full bg-[#202960] text-white font-bold text-xs hover:bg-[#2E2A72] shadow-md cursor-pointer"
                >
                  Create New Position
                </button>
              </section>

              <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div onClick={() => setActiveTab("jobs")} className="bg-white border border-[#3B3588]/10 p-5 rounded-3xl cursor-pointer hover:shadow-md transition">
                  <div className="text-xs font-bold text-slate-500 uppercase">Active Roles</div>
                  <div className="text-2xl font-black text-[#1E1B4B] mt-1">{jobs.length}</div>
                </div>
                <div onClick={() => setActiveTab("applications")} className="bg-white border border-[#3B3588]/10 p-5 rounded-3xl cursor-pointer hover:shadow-md transition">
                  <div className="text-xs font-bold text-slate-500 uppercase">Applicants</div>
                  <div className="text-2xl font-black text-[#1E1B4B] mt-1">{applicants.length}</div>
                </div>
                <div onClick={() => setActiveTab("interviews")} className="bg-white border border-[#3B3588]/10 p-5 rounded-3xl cursor-pointer hover:shadow-md transition">
                  <div className="text-xs font-bold text-slate-500 uppercase">Interviews</div>
                  <div className="text-2xl font-black text-[#1E1B4B] mt-1">{interviews.length}</div>
                </div>
                <div onClick={() => setActiveTab("applications")} className="bg-white border border-[#3B3588]/10 p-5 rounded-3xl cursor-pointer hover:shadow-md transition">
                  <div className="text-xs font-bold text-slate-500 uppercase">Offers Sent</div>
                  <div className="text-2xl font-black text-[#1E1B4B] mt-1">
                    {applicants.filter((a) => a.status === "OFFERED" || a.status === "HIRED / ACCEPTED").length}
                  </div>
                </div>
              </section>

              <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-black text-[#1E1B4B] mb-4">Active Vacancies</h2>
                <div className="overflow-x-auto">
                  {jobs.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs">
                      No internship roles posted yet. Click &ldquo;+ Post New Role&rdquo; to publish your first position.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="text-[11px] uppercase font-bold text-slate-400 border-b border-slate-100">
                        <tr>
                          <th className="pb-3.5 font-bold">Role Title</th>
                          <th className="pb-3.5 font-bold">Work Mode</th>
                          <th className="pb-3.5 font-bold">Stipend</th>
                          <th className="pb-3.5 font-bold">Submissions</th>
                          <th className="pb-3.5 font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {filteredJobs.map((j) => (
                          <tr key={j.id} className="hover:bg-[#F8F9FD]/60 transition">
                            <td className="py-4 font-bold text-[#1E1B4B] text-sm">{j.title}</td>
                            <td className="py-4 text-slate-500">{j.location} • {j.mode}</td>
                            <td className="py-4 font-bold text-[#202960]">{formatStipend(j.stipend)}</td>
                            <td className="py-4 font-semibold text-slate-600">
                              <button
                                onClick={() => setSelectedJobForApplicants(j)}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EDF0FF] text-[#202960] font-bold text-xs cursor-pointer hover:bg-[#202960] hover:text-white transition"
                              >
                                {j.applicantsCount || 0} Applicants <ArrowUpRight className="w-3 h-3" />
                              </button>
                            </td>
                            <td className="py-4">
                              <span className="px-3 py-1 rounded-full text-[10px] font-black border bg-emerald-50 text-emerald-700 border-emerald-200">
                                {j.status || "ACTIVE"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>
            </>
          )}

          {/* JOBS TAB */}
          {activeTab === "jobs" && (
            <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-[#1E1B4B]">Job Postings ({filteredJobs.length})</h2>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#202960] text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Create New Role
                </button>
              </div>

              {filteredJobs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No job postings created yet. Click &ldquo;Create New Role&rdquo; to publish your first internship vacancy.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredJobs.map((job) => (
                    <div key={job.id} className="p-5 rounded-2xl border border-[#3B3588]/10 bg-[#F8F9FD] space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-sm text-[#1E1B4B]">{job.title}</h3>
                            <p className="text-xs text-slate-500">{job.location} • {job.mode}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(job)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#202960] hover:bg-white cursor-pointer"
                              title="Edit Role"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => { setJobToDelete(job); setIsDeleteModalOpen(true); }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                              title="Delete Role"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {(job.skills || []).map((s: string, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-white text-[10px] font-semibold text-slate-600 border border-slate-200">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-[#3B3588]/10 text-xs">
                        <span className="font-black text-[#202960]">{formatStipend(job.stipend)}</span>
                        <button
                          onClick={() => setSelectedJobForApplicants(job)}
                          className="font-bold text-[#202960] bg-[#EDF0FF] hover:bg-[#202960] hover:text-white px-3 py-1.5 rounded-full text-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{job.applicantsCount || 0} Applicants</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* APPLICANTS TAB */}
          {activeTab === "applications" && (
            <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-black text-[#1E1B4B]">Candidate Submissions ({filteredApplicants.length})</h2>
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs font-bold text-[#1E1B4B]"
                  >
                    <option value="ALL">All Roles ({applicants.length})</option>
                    {jobs.map((j) => (
                      <option key={j.id} value={j.title}>{j.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                {filteredApplicants.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    No candidate applications received yet. Applications will appear automatically when students apply.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="text-[11px] uppercase font-bold text-slate-400 border-b border-slate-100">
                      <tr>
                        <th className="pb-3.5 font-bold">Candidate</th>
                        <th className="pb-3.5 font-bold">Applied Role</th>
                        <th className="pb-3.5 font-bold">Applied Date</th>
                        <th className="pb-3.5 font-bold">Status</th>
                        <th className="pb-3.5 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredApplicants.map((app) => (
                        <tr key={app.id} className="hover:bg-[#F8F9FD]/60 transition">
                          <td className="py-4">
                            <div className="font-bold text-[#1E1B4B] text-sm">{app.name}</div>
                            <div className="text-slate-400 text-[11px]">{app.email}</div>
                          </td>
                          <td className="py-4 font-semibold text-slate-600">{app.role}</td>
                          <td className="py-4 text-slate-500">{app.appliedAt || app.appliedDate}</td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                              app.status === "OFFERED" || app.status === "HIRED / ACCEPTED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : app.status === "REJECTED"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-indigo-50 text-indigo-700 border-indigo-200"
                            }`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setInspectedCandidate(app)}
                                className="p-1.5 rounded-lg bg-[#EDF0FF] text-[#202960] hover:bg-[#202960] hover:text-white transition cursor-pointer"
                                title="Audit Profile Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {app.status !== "OFFERED" && app.status !== "HIRED / ACCEPTED" && app.status !== "REJECTED" && (
                                <>
                                  <button
                                    onClick={() => {
                                      setOfferModalCandidate(app);
                                      setOfferFormData((prev) => ({ ...prev, stipend: String(app.stipend || "25000").replace(/[^0-9]/g, "") }));
                                    }}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-full transition cursor-pointer flex items-center gap-1"
                                  >
                                    <Send className="w-3 h-3" /> Issue Offer
                                  </button>
                                  <button
                                    onClick={() => handleRejectCandidate(app)}
                                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold rounded-full cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedCandidate(app);
                                      setIsScheduleModalOpen(true);
                                    }}
                                    className="px-3.5 py-1.5 bg-[#202960] text-white text-[11px] font-bold rounded-full cursor-pointer"
                                  >
                                    Schedule
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          )}

          {/* INTERVIEWS TAB */}
          {activeTab === "interviews" && (
            <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-black text-[#1E1B4B]">Scheduled Interview Evaluations</h2>
              {interviews.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">No technical rounds active.</div>
              ) : (
                <div className="space-y-4">
                  {interviews.map((intv) => (
                    <div key={intv.id} className="p-5 rounded-2xl border border-[#3B3588]/10 bg-[#F8F9FD] flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#1E1B4B]">{intv.candidateName}</span>
                          <span className="text-xs text-slate-400">• {intv.role}</span>
                        </div>
                        <p className="text-xs font-semibold text-[#202960]">{intv.roundName}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {intv.time}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <a href={intv.meetingUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-[#202960] text-white text-xs font-bold rounded-full flex items-center gap-1.5">
                          Join Room <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        {intv.status === "SCHEDULED" && (
                          <>
                            <button onClick={() => handleUpdateInterviewEvaluation(intv.id, "PASSED")} className="px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold rounded-full cursor-pointer">
                              Pass Round ✓
                            </button>
                            <button onClick={() => handleUpdateInterviewEvaluation(intv.id, "FAILED")} className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold rounded-full cursor-pointer">
                              Fail ✗
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* 5. COMPLETE COMPANY PROFILE TAB */}
          {activeTab === "profile" && (
            <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 max-w-4xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-[#1E1B4B]">Company Profile & Branding</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage your organizational identity, corporate registration, contact details, tech stack, and intern perks.
                  </p>
                </div>
                {profileSaved && (
                  <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Organization Profile Saved!
                  </div>
                )}
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-8 text-xs font-medium">
                {/* 1. Basic Company Information */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-indigo-950 tracking-wider">
                    1. Basic Organization Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                        Company Name *
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={profile.companyName}
                          onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F8F9FD] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#202960] font-semibold text-slate-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                        Industry & Specialization *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. IT Services, Cloud Architecture, Edge AI"
                        value={profile.industry}
                        onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FD] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#202960]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                        Company Size
                      </label>
                      <select
                        value={profile.companySize}
                        onChange={(e) => setProfile({ ...profile, companySize: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FD] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#202960] text-slate-800"
                      >
                        <option value="1-10 Employees">1-10 Employees (Early Startup)</option>
                        <option value="11-50 Employees">11-50 Employees (Seed Stage)</option>
                        <option value="51-200 Employees">51-200 Employees (Growth Stage)</option>
                        <option value="201-1,000 Employees">201-1,000 Employees (Mid-Market)</option>
                        <option value="1,001-10,000 Employees">1,001-10,000 Employees (Enterprise)</option>
                        <option value="10,000+ Employees">10,000+ Employees (Global Conglomerate)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                        Founded Year
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 2026"
                        value={profile.foundedYear}
                        onChange={(e) => setProfile({ ...profile, foundedYear: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FD] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#202960]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Official Contact & Verification */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h3 className="text-xs font-black uppercase text-indigo-950 tracking-wider">
                    2. Recruitment Contact & Compliance
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                        Official Recruiter Email *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F8F9FD] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#202960]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                        Corporate Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="tel"
                          placeholder="+91 80 1234 5678"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F8F9FD] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#202960]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                        Corporate ID (CIN / GST / Tax ID)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. CIN-U72200KA2026PTC109"
                        value={profile.registrationNumber}
                        onChange={(e) => setProfile({ ...profile, registrationNumber: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FD] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#202960] font-mono text-indigo-900 font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Location & Web Presence */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h3 className="text-xs font-black uppercase text-indigo-950 tracking-wider">
                    3. Headquarters & Online Presence
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                        Headquarters Location *
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Bengaluru, Karnataka, India"
                          value={profile.location}
                          onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F8F9FD] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#202960]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                        Website URL
                      </label>
                      <div className="relative">
                        <Globe className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="url"
                          placeholder="https://company.com"
                          value={profile.website}
                          onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F8F9FD] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#202960]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                        LinkedIn Profile URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/company/..."
                        value={profile.linkedinUrl}
                        onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FD] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#202960]"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Tech Stack & Intern Perks */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h3 className="text-xs font-black uppercase text-indigo-950 tracking-wider">
                    4. Engineering Ecosystem & Culture
                  </h3>
                  <div>
                    <label className="block font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                      Core Technology Stack (Comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. React, Next.js, Node.js, Python, Java, AWS, Kubernetes"
                      value={profile.techStack}
                      onChange={(e) => setProfile({ ...profile, techStack: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FD] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#202960]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                      Internship Perks & Mentorship Benefits
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Pre-Placement Offer (PPO), direct architect mentorship, flexible hybrid schedule"
                      value={profile.cultureBenefits}
                      onChange={(e) => setProfile({ ...profile, cultureBenefits: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FD] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#202960]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                      Company Tagline / Value Proposition
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Navigate your next with intelligent cloud and digital platforms."
                      value={profile.tagline}
                      onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FD] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#202960]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                      About the Organization & Mission
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Describe your engineering teams, products, and culture..."
                      value={profile.description}
                      onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                      className="w-full p-3 rounded-xl bg-[#F8F9FD] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#202960] leading-relaxed"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#202960] hover:bg-[#2E2A72] text-white font-bold rounded-full transition shadow-md shadow-[#202960]/20 flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Save Organization Profile
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>
      </main>

      {/* CANDIDATE DEEP INSPECTION DRAWER */}
      {inspectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-xl p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-[#1E1B4B]">{inspectedCandidate.name}</h3>
                <p className="text-xs text-slate-500">Applicant for {inspectedCandidate.role}</p>
              </div>
              <button onClick={() => setInspectedCandidate(null)} className="p-2 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#F8F9FD] p-4 rounded-2xl text-xs space-y-3">
              <div><strong className="text-slate-400 uppercase text-[10px] block">Candidate Email</strong>{inspectedCandidate.email}</div>
              <div><strong className="text-slate-400 uppercase text-[10px] block">Cover Note to Recruiter</strong>{inspectedCandidate.coverLetter || "No cover note provided."}</div>
              <div>
                <strong className="text-slate-400 uppercase text-[10px] block">Resume Attachment</strong>
                <a href={inspectedCandidate.resumeUrl || "#"} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline flex items-center gap-1 mt-1">
                  <FileText className="w-3.5 h-3.5" /> View Attached Resume
                </a>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setInspectedCandidate(null)} className="px-5 py-2 text-xs font-bold text-slate-500 cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM OFFER DISPATCH MODAL */}
      {offerModalCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-[#1E1B4B]">Issue Official Offer</h3>
              <button onClick={() => setOfferModalCandidate(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleDispatchOfferSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#1E1B4B] mb-1">Monthly Stipend (INR)</label>
                <input type="number" required value={offerFormData.stipend} onChange={(e) => setOfferFormData({ ...offerFormData, stipend: e.target.value })} className="w-full p-2.5 bg-[#F8F9FD] border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-[#1E1B4B] mb-1">Expected Joining Date</label>
                <input type="date" required value={offerFormData.joiningDate} onChange={(e) => setOfferFormData({ ...offerFormData, joiningDate: e.target.value })} className="w-full p-2.5 bg-[#F8F9FD] border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-[#1E1B4B] mb-1">Personalized Offer Note</label>
                <textarea rows={3} value={offerFormData.customNote} onChange={(e) => setOfferFormData({ ...offerFormData, customNote: e.target.value })} className="w-full p-2.5 bg-[#F8F9FD] border border-slate-200 rounded-xl" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOfferModalCandidate(null)} className="px-4 py-2 font-bold text-slate-500">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer">
                  <Send className="w-3.5 h-3.5" /> Dispatch Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE INTERVIEW MODAL */}
      {isScheduleModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-[#1E1B4B]">Schedule Interview Round</h3>
              <button onClick={() => setIsScheduleModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleScheduleInterviewSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#1E1B4B] mb-1">Round Title</label>
                <input type="text" required value={interviewForm.roundName} onChange={(e) => setInterviewForm({ ...interviewForm, roundName: e.target.value })} className="w-full p-2.5 bg-[#F8F9FD] border border-slate-200 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#1E1B4B] mb-1">Date</label>
                  <input type="date" required value={interviewForm.date} onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })} className="w-full p-2.5 bg-[#F8F9FD] border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-[#1E1B4B] mb-1">Time</label>
                  <input type="time" required value={interviewForm.time} onChange={(e) => setInterviewForm({ ...interviewForm, time: e.target.value })} className="w-full p-2.5 bg-[#F8F9FD] border border-slate-200 rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block font-bold text-[#1E1B4B] mb-1">Meeting URL</label>
                <input type="url" required value={interviewForm.meetingUrl} onChange={(e) => setInterviewForm({ ...interviewForm, meetingUrl: e.target.value })} className="w-full p-2.5 bg-[#F8F9FD] border border-slate-200 rounded-xl" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="px-4 py-2 font-bold text-slate-500">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#202960] text-white font-bold rounded-xl cursor-pointer">Confirm Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ROLE MODAL */}
      {isEditModalOpen && editingJob && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#3B3588]/15 rounded-[32px] w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-[#1E1B4B]">Edit Internship Role</h3>
                <p className="text-xs text-slate-500">Update role specifications and requirements</p>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingJob(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditRoleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                  Role Title *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 focus:outline-none focus:ring-2 focus:ring-[#202960]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                    Work Mode
                  </label>
                  <select
                    value={editFormData.mode}
                    onChange={(e) => setEditFormData({ ...editFormData, mode: e.target.value })}
                    className="w-full px-3 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 focus:outline-none focus:ring-2 focus:ring-[#202960]"
                  >
                    <option value="HYBRID">Hybrid</option>
                    <option value="REMOTE">Remote</option>
                    <option value="ON_SITE">On-Site</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 focus:outline-none focus:ring-2 focus:ring-[#202960]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                    Monthly Stipend (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editFormData.stipend}
                    onChange={(e) => setEditFormData({ ...editFormData, stipend: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 focus:outline-none focus:ring-2 focus:ring-[#202960]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                    Duration (Months)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={editFormData.durationMonths}
                    onChange={(e) => setEditFormData({ ...editFormData, durationMonths: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 focus:outline-none focus:ring-2 focus:ring-[#202960]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                  Required Skills (Comma separated)
                </label>
                <input
                  type="text"
                  value={editFormData.skills}
                  onChange={(e) => setEditFormData({ ...editFormData, skills: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 focus:outline-none focus:ring-2 focus:ring-[#202960]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                  Role Description
                </label>
                <textarea
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 focus:outline-none focus:ring-2 focus:ring-[#202960]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingJob(null);
                  }}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#202960] hover:bg-[#2E2A72] text-white text-xs font-bold shadow-md shadow-[#202960]/20 transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && jobToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#3B3588]/15 rounded-[32px] w-full max-w-sm p-6 sm:p-8 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-[#1E1B4B]">Delete Internship?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete <strong className="text-slate-800">&ldquo;{jobToDelete.title}&rdquo;</strong>? This role will be removed immediately from the student explore board.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setJobToDelete(null);
                }}
                className="w-1/2 py-2.5 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteJob}
                className="w-1/2 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition cursor-pointer"
              >
                Delete Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JOB-SPECIFIC APPLICANTS MODAL */}
      {selectedJobForApplicants && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#3B3588]/15 rounded-[32px] w-full max-w-2xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase">
                  {selectedJobForApplicants.mode}
                </span>
                <h3 className="text-lg font-black text-[#1E1B4B] mt-1">
                  Applicants for &ldquo;{selectedJobForApplicants.title}&rdquo;
                </h3>
                <p className="text-xs text-slate-500">
                  {jobSpecificApplicants.length} candidate(s) have submitted applications for this position.
                </p>
              </div>
              <button
                onClick={() => setSelectedJobForApplicants(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-80 space-y-3">
              {jobSpecificApplicants.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No applications received yet for this specific opening.
                </div>
              ) : (
                jobSpecificApplicants.map((cand) => {
                  const isDecided = cand.status === "ACCEPTED" || cand.status === "OFFERED" || cand.status === "HIRED / ACCEPTED" || cand.status === "REJECTED";

                  return (
                    <div
                      key={cand.id}
                      className="p-4 rounded-2xl border border-[#3B3588]/10 bg-[#F8F9FD] flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-[#1E1B4B] text-sm">{cand.name}</div>
                        <div className="text-slate-400 text-xs">{cand.email}</div>
                        <div className="text-slate-500 text-[11px]">
                          Applied: {cand.appliedAt || cand.appliedDate}
                        </div>
                        {cand.resumeUrl && (
                          <a
                            href={cand.resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[#202960] font-bold text-xs hover:underline mt-1"
                          >
                            <FileText className="w-3.5 h-3.5 text-indigo-600" /> View Candidate Resume
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                            cand.status === "ACCEPTED" || cand.status === "OFFERED" || cand.status === "HIRED / ACCEPTED"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : cand.status === "REJECTED"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : cand.status === "INTERVIEWING"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-indigo-50 text-indigo-700 border-indigo-200"
                          }`}
                        >
                          {cand.status}
                        </span>

                        {isDecided ? (
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                              cand.status === "REJECTED"
                                ? "text-red-700 bg-red-50 border border-red-200"
                                : "text-emerald-700 bg-emerald-50 border border-emerald-200"
                            }`}
                          >
                            {cand.status === "REJECTED" ? "Rejected" : "Offer Given ✓"}
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setOfferModalCandidate(cand);
                                setOfferFormData((prev) => ({ ...prev, stipend: String(cand.stipend || "25000").replace(/[^0-9]/g, "") }));
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full transition shadow-sm cursor-pointer"
                            >
                              Issue Offer
                            </button>

                            <button
                              onClick={() => handleRejectCandidate(cand)}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-full transition cursor-pointer"
                            >
                              Reject
                            </button>

                            <button
                              onClick={() => {
                                setSelectedCandidate(cand);
                                setIsScheduleModalOpen(true);
                              }}
                              className="px-4 py-1.5 bg-[#202960] hover:bg-[#2E2A72] text-white text-xs font-bold rounded-full transition shadow-sm cursor-pointer"
                            >
                              Schedule
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedJobForApplicants(null)}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-100 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POST NEW ROLE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-[#1E1B4B]">Post Internship Vacancy</h3>
              <button onClick={() => setIsCreateModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handlePostRole} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#1E1B4B] mb-1">Role Designation *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Telemetry Engineer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 bg-[#F8F9FD] border border-slate-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#1E1B4B] mb-1">Mode</label>
                  <select
                    value={formData.mode}
                    onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                    className="w-full p-2.5 bg-[#F8F9FD] border border-slate-200 rounded-xl"
                  >
                    <option value="HYBRID">Hybrid</option>
                    <option value="REMOTE">Remote</option>
                    <option value="ON_SITE">On-Site</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#1E1B4B] mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full p-2.5 bg-[#F8F9FD] border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#1E1B4B] mb-1">Monthly Stipend (INR)</label>
                  <input
                    type="number"
                    required
                    placeholder="25000"
                    value={formData.stipend}
                    onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                    className="w-full p-2.5 bg-[#F8F9FD] border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1E1B4B] mb-1">Duration (Months)</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.durationMonths}
                    onChange={(e) => setFormData({ ...formData, durationMonths: e.target.value })}
                    className="w-full p-2.5 bg-[#F8F9FD] border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-[#1E1B4B] mb-1">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  placeholder="React, Node.js, Python"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full p-2.5 bg-[#F8F9FD] border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-[#1E1B4B] mb-1">Job Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-[#F8F9FD] border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 font-bold text-slate-500">Cancel</button>
                <button type="submit" disabled={isPosting} className="px-5 py-2 bg-[#202960] text-white font-bold rounded-xl cursor-pointer">
                  {isPosting ? "Posting..." : "Publish Vacancy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
