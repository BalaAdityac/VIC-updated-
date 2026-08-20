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
  FileCheck
} from "lucide-react";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "jobs" | "applications" | "interviews" | "profile">("overview");

  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // Notifications State
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Modal & Posting State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

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

  // Job-Specific View Applicants Modal State
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState<any | null>(null);

  // Schedule Interview Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [interviewForm, setInterviewForm] = useState({
    roundName: "Technical Systems Round",
    date: "2026-08-20",
    time: "14:30",
    meetingUrl: "https://meet.google.com/vic-recruitment-room"
  });

  // Company Profile Form State
  const [profile, setProfile] = useState({
    companyName: "Accenture",
    email: "accenture@gmail.com",
    website: "https://accenture.com",
    location: "Bengaluru, Karnataka, India",
    industry: "Enterprise Software, Cloud & Consulting",
    tagline: "Let there be change.",
    registrationNumber: "CIN-U72200KA2026PTC109",
    description: "Global management consulting and professional services firm."
  });

  const [profileSaved, setProfileSaved] = useState(false);

  // Real-time Data Arrays
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

  // Cross-Tab Broadcast Helper
  const notifyPipeline = useCallback((payload: { type: string; data?: any }) => {
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const bc = new BroadcastChannel("vic_realtime_pipeline");
        bc.postMessage(payload);
        setTimeout(() => bc.close(), 100);
      }
    } catch (e) {}
    window.dispatchEvent(new CustomEvent("vic_pipeline_sync", { detail: payload }));
  }, []);

  // SYNCHRONIZED PIPELINE (Strictly Company-Scoped & Deduplicated)
  const syncPipelineData = useCallback(async () => {
    const safeCompanyName = String(profile.companyName || "").trim().toLowerCase();

    // 1. Resolve Applicants (Strictly Scoped)
    let myLiveApplicants: any[] = [];
    try {
      const storedApps = JSON.parse(localStorage.getItem("vic_applications") || "[]");
      myLiveApplicants = storedApps.filter((a: any) => {
        const appCompany = String(a.company || "").trim().toLowerCase();
        return appCompany === safeCompanyName || (safeCompanyName === "accenture" && appCompany.includes("accenture"));
      });
    } catch (e) {}
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
            role: app.role || "Engineering Intern",
            company: app.company || profile.companyName,
            roundName: intv.roundName,
            date: formatDateSafe(intv.date || intv.scheduledAt),
            time: intv.time || (intv.scheduledAt ? formatDateTimeSafe(intv.scheduledAt) : "2:30 PM"),
            meetingUrl: intv.meetingUrl,
            status: intv.status || "SCHEDULED"
          });
        });
      }
    });
    setInterviews(aggregatedInterviews);

    // 3. Resolve Jobs (Backend + Local with Composite Deduplication)
    let backendJobs: any[] = [];
    try {
      const jobsRes = await fetch("http://127.0.0.1:3000/api/internships?status=ACTIVE").catch(() => null);
      if (jobsRes && jobsRes.ok) {
        const jobsData = await jobsRes.json();
        if (Array.isArray(jobsData.internships)) {
          backendJobs = jobsData.internships
            .filter((j: any) => {
              const comp = String(j.company?.companyName || "").trim().toLowerCase();
              return comp === safeCompanyName || (safeCompanyName === "accenture" && comp.includes("accenture"));
            })
            .map((j: any) => ({
              id: j.id,
              title: j.title,
              company: j.company?.companyName || profile.companyName,
              location: j.location || "Bengaluru",
              mode: j.mode || "HYBRID",
              stipend: formatStipend(j.stipend),
              durationMonths: j.durationMonths || 6,
              deadline: "Open until filled",
              description: j.description || "",
              skills: Array.isArray(j.skills) ? j.skills : ["General Engineering"],
              status: j.status || "ACTIVE"
            }));
        }
      }
    } catch (e) {}

    let localJobs: any[] = [];
    try {
      const customJobsStr = localStorage.getItem("vic_custom_jobs");
      if (customJobsStr) {
        const parsed = JSON.parse(customJobsStr);
        if (Array.isArray(parsed)) {
          localJobs = parsed.filter((j: any) => {
            const comp = String(j.company || "").trim().toLowerCase();
            return comp === safeCompanyName || (safeCompanyName === "accenture" && comp.includes("accenture"));
          });
        }
      }
    } catch (e) {}

    const deletedIds = new Set(JSON.parse(localStorage.getItem("vic_deleted_jobs") || "[]"));

    const mergedJobsMap = new Map();
    [...backendJobs, ...localJobs].forEach((job) => {
      if (!deletedIds.has(job.id)) {
        const dedupeKey = String(job.title).trim().toLowerCase();
        mergedJobsMap.set(dedupeKey, job);
      }
    });

    let finalJobs = Array.from(mergedJobsMap.values());

    // Accurately compute applicants count per job
    finalJobs = finalJobs.map((job) => {
      const matchCount = myLiveApplicants.filter(
        (app) =>
          String(app.internshipId).trim() === String(job.id).trim() ||
          String(app.role || "").trim().toLowerCase() === String(job.title || "").trim().toLowerCase()
      ).length;
      return { ...job, applicantsCount: matchCount };
    });

    setJobs(finalJobs);
  }, [profile.companyName]);

  useEffect(() => {
    const storedCompany = localStorage.getItem("company_data");
    if (storedCompany) {
      try {
        const parsed = JSON.parse(storedCompany);
        setProfile((prev) => ({
          ...prev,
          companyName: parsed.companyName || prev.companyName,
          email: parsed.email || prev.email,
          website: parsed.website || prev.website,
          location: parsed.location || prev.location,
          industry: parsed.industry || prev.industry,
          tagline: parsed.tagline || prev.tagline,
          registrationNumber: parsed.registrationNumber || prev.registrationNumber,
          description: parsed.description || prev.description
        }));
      } catch (e) {}
    }

    syncPipelineData();

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        bc = new BroadcastChannel("vic_realtime_pipeline");
        bc.onmessage = (event) => {
          syncPipelineData();
          if (event.data?.type === "APPLICATION_SUBMITTED" && event.data?.data?.name) {
            setNotifications((prev) => [
              {
                id: Date.now(),
                text: `New application received from ${event.data.data.name} for ${event.data.data.role}!`,
                time: "Just now",
                read: false
              },
              ...prev
            ]);
          }
        };
      }
    } catch (e) {}

    const handleLocalSync = () => syncPipelineData();
    window.addEventListener("vic_pipeline_sync", handleLocalSync);
    window.addEventListener("storage", handleLocalSync);

    return () => {
      if (bc) bc.close();
      window.removeEventListener("vic_pipeline_sync", handleLocalSync);
      window.removeEventListener("storage", handleLocalSync);
    };
  }, [syncPipelineData, profile.companyName]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("company_data", JSON.stringify(profile));
    setProfileSaved(true);
    notifyPipeline({ type: "COMPANY_PROFILE_UPDATED", data: profile });
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleDecision = (candidate: any, newStatus: "ACCEPTED" | "REJECTED") => {
    try {
      const storedApps: any[] = JSON.parse(localStorage.getItem("vic_applications") || "[]");
      const updatedApps = storedApps.map((app) => {
        if (
          app.id === candidate.id ||
          (String(app.email).toLowerCase() === String(candidate.email).toLowerCase() && app.role === candidate.role)
        ) {
          return { ...app, status: newStatus };
        }
        return app;
      });

      localStorage.setItem("vic_applications", JSON.stringify(updatedApps));

      const studentNotifs: any[] = JSON.parse(localStorage.getItem("vic_student_notifications") || "[]");
      const decisionNotif = {
        id: Date.now(),
        candidateEmail: candidate.email,
        text:
          newStatus === "ACCEPTED"
            ? `🎉 Congratulations ${candidate.name}! ${profile.companyName} has reviewed your interview and issued an official Offer for "${candidate.role}"!`
            : `Application update: Your candidacy with ${profile.companyName} for "${candidate.role}" has concluded.`,
        time: "Just now",
        read: false,
        type: newStatus
      };
      localStorage.setItem("vic_student_notifications", JSON.stringify([decisionNotif, ...studentNotifs]));

      notifyPipeline({
        type: "DECISION_UPDATED",
        data: { candidateEmail: candidate.email, newStatus, role: candidate.role }
      });

      setNotifications((prev) => [
        {
          id: Date.now(),
          text: `Candidate ${candidate.name} marked as ${newStatus} for ${candidate.role}.`,
          time: "Just now",
          read: false
        },
        ...prev
      ]);

      syncPipelineData();
    } catch (err) {}
  };

  const handleOpenEditModal = (job: any) => {
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
    if (!editingJob) return;

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
  };

  const handleConfirmDeleteJob = async () => {
    if (!jobToDelete) return;

    const token = localStorage.getItem("company_token");
    if (token && !String(jobToDelete.id).startsWith("job-")) {
      try {
        await fetch(`http://127.0.0.1:3000/api/internships/${jobToDelete.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => null);
      } catch (e) {}
    }

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
    if (!selectedCandidate) return;

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
        text: `📅 ${profile.companyName} has scheduled "${interviewForm.roundName}" with you for ${interviewForm.date} at ${interviewForm.time}.`,
        time: "Just now",
        read: false
      };
      localStorage.setItem("vic_student_notifications", JSON.stringify([intvNotif, ...studentNotifs]));
    } catch (err) {}

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
      (j) =>
        j.title?.toLowerCase().includes(q) ||
        j.location?.toLowerCase().includes(q) ||
        j.mode?.toLowerCase().includes(q)
    );
  }, [jobs, searchQuery]);

  const filteredApplicants = useMemo(() => {
    if (!searchQuery.trim()) return applicants;
    const q = searchQuery.toLowerCase();
    return applicants.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        a.role?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q)
    );
  }, [applicants, searchQuery]);

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

  const handlePostRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPosting(true);
    setPostError(null);

    const token = localStorage.getItem("company_token");
    const skillList = formData.skills
      ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
      : ["React", "TypeScript"];

    try {
      if (token) {
        await fetch("http://127.0.0.1:3000/api/internships", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description || "Hands-on internship position with direct team mentorship.",
            location: formData.location,
            mode: formData.mode,
            stipend: Number(formData.stipend),
            durationMonths: Number(formData.durationMonths),
            skills: skillList,
            status: "ACTIVE"
          })
        }).catch(() => null);
      }

      const formattedMode =
        formData.mode === "HYBRID" ? "Hybrid" : formData.mode === "REMOTE" ? "Remote" : "On-Site";

      const createdJob = {
        id: `job-${Date.now()}`,
        title: formData.title,
        company: profile.companyName,
        mode: formattedMode,
        location: formData.location,
        stipend: formatStipend(formData.stipend),
        applicantsCount: 0,
        status: "ACTIVE",
        postedAt: "Just now",
        deadline: "Open until filled",
        skills: skillList,
        description: formData.description
      };

      const existingCustom = JSON.parse(localStorage.getItem("vic_custom_jobs") || "[]");
      const updatedCustom = [createdJob, ...existingCustom];
      localStorage.setItem("vic_custom_jobs", JSON.stringify(updatedCustom));

      notifyPipeline({ type: "JOB_POSTED", data: { title: createdJob.title } });

      setNotifications([
        {
          id: Date.now(),
          text: `Position "${formData.title}" published successfully to student job board`,
          time: "Just now",
          read: false
        },
        ...notifications
      ]);

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
      setActiveTab("jobs");
    } catch (err: any) {
      setPostError(err.message || "Failed to post internship role");
    } finally {
      setIsPosting(false);
    }
  };

  const companyInitials = useMemo(() => {
    if (!profile.companyName) return "CO";
    const parts = profile.companyName.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : profile.companyName.substring(0, 2).toUpperCase();
  }, [profile.companyName]);

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-slate-800 flex flex-col md:flex-row font-sans">
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 md:w-64 border-r border-[#3B3588]/10 bg-white p-6 flex flex-col justify-between shadow-2xl md:shadow-sm transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-2xl overflow-hidden flex items-center justify-center bg-white border border-[#3B3588]/10 shadow-sm transition-transform group-hover:scale-105">
                <Image
                  src="/logo.jpg"
                  alt="Visionary Interns Club Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <div className="font-black text-sm tracking-tight text-[#1E1B4B] uppercase">
                  Visionary Interns
                </div>
                <div className="text-[11px] font-bold text-[#3B3588]">Company Portal</div>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100"
            >
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
                <div className="font-bold text-xs text-[#1E1B4B] truncate max-w-[120px]">{profile.companyName}</div>
                <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  ● Verified Partner
                </div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <nav className="space-y-1.5 text-xs font-bold">
            <button
              onClick={() => {
                setActiveTab("overview");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeTab === "overview"
                  ? "bg-[#202960] text-white shadow-md shadow-[#202960]/20"
                  : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF] hover:text-[#202960]"
              }`}
            >
              <Building2 className="w-4 h-4" /> Overview
            </button>

            <button
              onClick={() => {
                setActiveTab("jobs");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeTab === "jobs"
                  ? "bg-[#202960] text-white shadow-md shadow-[#202960]/20"
                  : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF] hover:text-[#202960]"
              }`}
            >
              <Briefcase className="w-4 h-4" /> Job Postings ({jobs.length})
            </button>

            <button
              onClick={() => {
                setActiveTab("applications");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeTab === "applications"
                  ? "bg-[#202960] text-white shadow-md shadow-[#202960]/20"
                  : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF] hover:text-[#202960]"
              }`}
            >
              <Users className="w-4 h-4" /> Applicants ({applicants.length})
            </button>

            <button
              onClick={() => {
                setActiveTab("interviews");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeTab === "interviews"
                  ? "bg-[#202960] text-white shadow-md shadow-[#202960]/20"
                  : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF] hover:text-[#202960]"
              }`}
            >
              <Video className="w-4 h-4" /> Scheduled Rounds ({interviews.length})
            </button>

            <button
              onClick={() => {
                setActiveTab("profile");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeTab === "profile"
                  ? "bg-[#202960] text-white shadow-md shadow-[#202960]/20"
                  : "text-[#1E1B4B]/70 hover:bg-[#EDF0FF] hover:text-[#202960]"
              }`}
            >
              <FileCheck className="w-4 h-4" /> Company Profile
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-[#3B3588]/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#202960] text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {companyInitials}
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-[#1E1B4B] truncate max-w-[110px]" title={profile.companyName}>
                {profile.companyName}
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[110px]" title={profile.email}>
                {profile.email}
              </div>
            </div>
          </div>
          <Link
            href="/"
            onClick={() => {
              localStorage.removeItem("company_token");
              localStorage.removeItem("company_data");
            }}
            className="p-2 text-slate-400 hover:text-red-600 transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* Main Header & Body */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 md:h-18 px-4 sm:px-8 border-b border-[#3B3588]/10 bg-white flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-[#202960] hover:bg-[#EDF0FF] transition"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <span className="hidden sm:inline">Company</span>
              <span className="hidden sm:inline">/</span>
              <span className="text-[#1E1B4B] capitalize">
                {activeTab === "profile" ? "Company Profile" : activeTab}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search candidates, roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-44 sm:w-64 pl-10 pr-8 py-2 rounded-full bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960] text-slate-800 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2.5 rounded-full bg-[#F8F9FD] border border-[#3B3588]/15 text-slate-600 hover:text-[#202960] transition cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-[#3B3588]/15 rounded-3xl shadow-2xl p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#1E1B4B]">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-[#EDF0FF] text-[#202960] text-[10px] font-black">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotifsRead}
                        className="text-[11px] font-bold text-[#202960] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-2xl text-xs transition ${
                            n.read ? "bg-[#F8F9FD] text-slate-500" : "bg-[#EDF0FF]/60 text-slate-800 font-medium"
                          }`}
                        >
                          <p className="line-clamp-2">{n.text}</p>
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
              className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-[#202960] hover:bg-[#2E2A72] text-white font-bold text-xs shadow-md shadow-[#202960]/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Post New Role</span>
              <span className="sm:hidden">Post</span>
            </button>
          </div>
        </header>

        {/* Dynamic Content Views */}
        <div className="p-4 sm:p-8 space-y-8 max-w-7xl">
          {searchQuery && (
            <div className="p-3 bg-[#EDF0FF] rounded-2xl border border-[#3B3588]/15 text-xs text-[#1E1B4B] flex items-center justify-between">
              <span>
                Filtering results for: <strong>&ldquo;{searchQuery}&rdquo;</strong>
              </span>
              <button onClick={() => setSearchQuery("")} className="font-bold text-[#202960] hover:underline text-xs">
                Clear filter
              </button>
            </div>
          )}

          {/* 1. OVERVIEW TAB */}
          {activeTab === "overview" && (
            <>
              <section className="bg-gradient-to-br from-[#EDF0FF] via-white to-[#F8F9FD] border border-[#3B3588]/10 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#202960]/5 text-[#202960] text-[11px] font-black uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" /> ATS Recruitment Suite
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#1E1B4B] tracking-tight">
                    Welcome back, {profile.companyName}.
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
                    Review candidate submissions, evaluate interview rounds, and manage your partner profile.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-5 py-3 rounded-full bg-[#202960] text-white font-bold text-xs hover:bg-[#2E2A72] transition shadow-md shadow-[#202960]/20 cursor-pointer"
                >
                  Create New Position
                </button>
              </section>

              <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                <div
                  onClick={() => setActiveTab("jobs")}
                  className="bg-white border border-[#3B3588]/10 p-5 sm:p-6 rounded-3xl shadow-sm hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Roles</span>
                    <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                      <Briefcase className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#1E1B4B]">{jobs.length}</div>
                  <div className="text-[11px] text-emerald-600 font-bold mt-1">● Live on Job Board</div>
                </div>

                <div
                  onClick={() => setActiveTab("applications")}
                  className="bg-white border border-[#3B3588]/10 p-5 sm:p-6 rounded-3xl shadow-sm hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Applicants</span>
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#1E1B4B]">{applicants.length}</div>
                  <div className="text-[11px] text-indigo-600 font-bold mt-1">Real-time Submissions</div>
                </div>

                <div
                  onClick={() => setActiveTab("interviews")}
                  className="bg-white border border-[#3B3588]/10 p-5 sm:p-6 rounded-3xl shadow-sm hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Interviews</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Video className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#1E1B4B]">{interviews.length}</div>
                  <div className="text-[11px] text-amber-600 font-bold mt-1">Rounds scheduled</div>
                </div>

                <div className="bg-white border border-[#3B3588]/10 p-5 sm:p-6 rounded-3xl shadow-sm hover:shadow-md transition">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Offers Sent</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <ClipboardCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#1E1B4B]">
                    {applicants.filter((a) => a.status === "ACCEPTED" || a.status === "OFFERED").length}
                  </div>
                  <div className="text-[11px] text-purple-600 font-bold mt-1">Hired Candidates</div>
                </div>
              </section>

              <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-black text-[#1E1B4B]">Live Internship Postings</h2>
                    <p className="text-xs text-slate-500">Live positions open for student applications.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("jobs")}
                    className="text-xs font-bold text-[#202960] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    View All <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  {filteredJobs.length === 0 ? (
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
                            <td className="py-4 text-slate-500">
                              {j.location} • {j.mode}
                            </td>
                            <td className="py-4 font-bold text-[#202960]">{formatStipend(j.stipend)}</td>
                            <td className="py-4 font-semibold text-slate-600">
                              <button
                                onClick={() => setSelectedJobForApplicants(j)}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EDF0FF] hover:bg-[#202960] text-[#202960] hover:text-white font-bold text-xs transition cursor-pointer"
                              >
                                {j.applicantsCount || 0} Applicants <ArrowUpRight className="w-3 h-3" />
                              </button>
                            </td>
                            <td className="py-4">
                              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-[10px] font-black">
                                {j.status}
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

          {/* 2. JOB POSTINGS TAB */}
          {activeTab === "jobs" && (
            <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-black text-[#1E1B4B]">Job Postings Management</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Create, edit, delete, and inspect candidates for each internship role.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#202960] text-white font-bold text-xs shadow-md shadow-[#202960]/20 hover:bg-[#2E2A72] transition"
                >
                  <Plus className="w-4 h-4" /> Create New Role
                </button>
              </div>

              {filteredJobs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No job postings created yet. Click &ldquo;Create New Role&rdquo; to publish your first internship.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-5 rounded-2xl border border-[#3B3588]/10 bg-[#F8F9FD] space-y-3 flex flex-col justify-between hover:shadow-md transition"
                    >
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-sm text-[#1E1B4B]">{job.title}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {job.location} • {job.mode}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-[10px] font-black">
                              {job.status || "ACTIVE"}
                            </span>

                            <button
                              onClick={() => handleOpenEditModal(job)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#202960] hover:bg-white transition"
                              title="Edit Internship"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                setJobToDelete(job);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                              title="Delete Internship"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {(Array.isArray(job.skills) ? job.skills : []).map((s: string, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold text-slate-600"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-[#3B3588]/10 text-xs">
                        <span className="font-black text-[#202960]">{formatStipend(job.stipend)}</span>

                        <button
                          type="button"
                          onClick={() => setSelectedJobForApplicants(job)}
                          className="font-bold text-[#202960] bg-[#EDF0FF] hover:bg-[#202960] hover:text-white px-3 py-1.5 rounded-full text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
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

          {/* 3. APPLICANTS TAB */}
          {activeTab === "applications" && (
            <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-black text-[#1E1B4B]">Candidate Submissions ({filteredApplicants.length})</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Evaluate candidates, schedule interviews, and issue Accept (Offer) or Reject decisions in real time.
                </p>
              </div>

              <div className="overflow-x-auto">
                {filteredApplicants.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    No candidate applications received yet. Applications will appear here automatically when students apply.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="text-[11px] uppercase font-bold text-slate-400 border-b border-slate-100">
                      <tr>
                        <th className="pb-3.5 font-bold">Candidate Name</th>
                        <th className="pb-3.5 font-bold">Applied Role</th>
                        <th className="pb-3.5 font-bold">Date Applied</th>
                        <th className="pb-3.5 font-bold">Resume / Profile</th>
                        <th className="pb-3.5 font-bold">Status</th>
                        <th className="pb-3.5 font-bold text-right">Recruitment Decision</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredApplicants.map((app) => {
                        const isDecided = app.status === "ACCEPTED" || app.status === "OFFERED" || app.status === "REJECTED";

                        return (
                          <tr key={app.id} className="hover:bg-[#F8F9FD]/60 transition">
                            <td className="py-4">
                              <div className="font-bold text-[#1E1B4B] text-sm">{app.name}</div>
                              <div className="text-slate-400 text-[11px]">{app.email}</div>
                            </td>
                            <td className="py-4 text-slate-600 font-semibold">{app.role}</td>
                            <td className="py-4 text-slate-500">{app.appliedAt || app.appliedDate}</td>
                            <td className="py-4">
                              <a
                                href={app.resumeUrl || "#"}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[#202960] font-bold text-xs hover:underline"
                              >
                                <FileText className="w-3.5 h-3.5 text-indigo-600" /> View Resume
                              </a>
                            </td>
                            <td className="py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                                  app.status === "ACCEPTED" || app.status === "OFFERED"
                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                    : app.status === "REJECTED"
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : app.status === "INTERVIEWING"
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-indigo-50 text-indigo-700 border-indigo-200"
                                }`}
                              >
                                {app.status}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              {isDecided ? (
                                <span
                                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold ${
                                    app.status === "ACCEPTED" || app.status === "OFFERED"
                                      ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                                      : "text-red-700 bg-red-50 border border-red-200"
                                  }`}
                                >
                                  {app.status === "ACCEPTED" || app.status === "OFFERED" ? (
                                    <>
                                      <CheckCircle className="w-3 h-3" /> Offer Extended
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-3 h-3" /> Candidate Rejected
                                    </>
                                  )}
                                </span>
                              ) : (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleDecision(app, "ACCEPTED")}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-full transition shadow-sm flex items-center gap-1 cursor-pointer"
                                    title="Accept candidate and issue offer"
                                  >
                                    <CheckCircle className="w-3 h-3" /> Accept
                                  </button>

                                  <button
                                    onClick={() => handleDecision(app, "REJECTED")}
                                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold rounded-full transition flex items-center gap-1 cursor-pointer"
                                    title="Reject application"
                                  >
                                    <XCircle className="w-3 h-3" /> Reject
                                  </button>

                                  <button
                                    onClick={() => {
                                      setSelectedCandidate(app);
                                      setIsScheduleModalOpen(true);
                                    }}
                                    className="px-3.5 py-1.5 bg-[#202960] hover:bg-[#2E2A72] text-white text-xs font-bold rounded-full transition shadow-sm cursor-pointer"
                                  >
                                    Schedule
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          )}

          {/* 4. SCHEDULED ROUNDS TAB */}
          {activeTab === "interviews" && (
            <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-black text-[#1E1B4B]">Scheduled Interview Rounds</h2>
                <p className="text-xs text-slate-500 mt-1">Live interview schedules, meet links, and candidate evaluations.</p>
              </div>

              {interviews.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No interview rounds scheduled yet. Use the Schedule Round button in the Applicants tab to create meetings.
                </div>
              ) : (
                <div className="space-y-4">
                  {interviews.map((intv) => (
                    <div
                      key={intv.id}
                      className="p-5 rounded-2xl border border-[#3B3588]/10 bg-[#F8F9FD] flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#1E1B4B]">{intv.candidateName}</span>
                          <span className="text-xs text-slate-400">• {intv.role}</span>
                        </div>
                        <p className="text-xs font-semibold text-[#202960]">{intv.roundName}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> {intv.time}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={intv.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 bg-[#202960] hover:bg-[#2E2A72] text-white text-xs font-bold rounded-full flex items-center gap-1.5 transition"
                        >
                          Join Room <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* 5. COMPANY PROFILE TAB */}
          {activeTab === "profile" && (
            <section className="bg-white border border-[#3B3588]/10 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 max-w-4xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-[#1E1B4B]">Company Profile & Organization Details</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage your organization identity, recruitment contact, verification credentials, and bio.
                  </p>
                </div>
                {profileSaved && (
                  <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Organization Profile Saved!
                  </div>
                )}
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-2">
                      Company Name *
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={profile.companyName}
                        onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960] font-semibold text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-2">
                      Official Contact Email *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960] font-semibold text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-2">
                      Official Website URL
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
                      <input
                        type="url"
                        placeholder="https://company.io"
                        value={profile.website}
                        onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960] font-semibold text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-2">
                      Headquarters Location *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Bengaluru, Karnataka, India"
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960] font-semibold text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-2">
                      Industry & Specialization
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Embedded Systems, Artificial Intelligence, SaaS"
                      value={profile.industry}
                      onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960] font-semibold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-2">
                      Corporate Registration ID (CIN / GST)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CIN-U72200KA2026PTC109"
                      value={profile.registrationNumber}
                      onChange={(e) => setProfile({ ...profile, registrationNumber: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960] font-semibold text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-2">
                    Company Tagline / One-Liner
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Innovating embedded telemetry and scalable modern platforms."
                    value={profile.tagline}
                    onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960] font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-2">
                    About the Organization
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe your engineering teams, product ecosystem, and internship mentorship culture..."
                    value={profile.description}
                    onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960] leading-relaxed text-slate-800 font-medium"
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-full bg-[#202960] hover:bg-[#2E2A72] text-white text-xs font-bold shadow-md shadow-[#202960]/20 flex items-center gap-2 transition cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Save Profile Details
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>
      </main>

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
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditRoleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                  Role Title *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                    Work Mode
                  </label>
                  <select
                    value={editFormData.mode}
                    onChange={(e) => setEditFormData({ ...editFormData, mode: e.target.value })}
                    className="w-full px-3 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
                  >
                    <option value="HYBRID">Hybrid</option>
                    <option value="REMOTE">Remote</option>
                    <option value="ON_SITE">On-Site</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                    Monthly Stipend (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editFormData.stipend}
                    onChange={(e) => setEditFormData({ ...editFormData, stipend: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                    Duration (Months)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={editFormData.durationMonths}
                    onChange={(e) => setEditFormData({ ...editFormData, durationMonths: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                  Required Skills (Comma separated)
                </label>
                <input
                  type="text"
                  value={editFormData.skills}
                  onChange={(e) => setEditFormData({ ...editFormData, skills: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                  Role Description
                </label>
                <textarea
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingJob(null);
                  }}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-100 transition"
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
                Are you sure you want to delete{" "}
                <strong className="text-slate-800">&ldquo;{jobToDelete.title}&rdquo;</strong>? This role will be
                removed immediately from the student explore board.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setJobToDelete(null);
                }}
                className="w-1/2 py-2.5 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-100 transition"
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
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
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
                  const isDecided = cand.status === "ACCEPTED" || cand.status === "OFFERED" || cand.status === "REJECTED";

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
                            cand.status === "ACCEPTED" || cand.status === "OFFERED"
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
                              cand.status === "ACCEPTED" || cand.status === "OFFERED"
                                ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                                : "text-red-700 bg-red-50 border border-red-200"
                            }`}
                          >
                            {cand.status === "ACCEPTED" || cand.status === "OFFERED" ? "Offer Given" : "Rejected"}
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleDecision(cand, "ACCEPTED")}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full transition shadow-sm cursor-pointer"
                            >
                              Accept
                            </button>

                            <button
                              onClick={() => handleDecision(cand, "REJECTED")}
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
                className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE INTERVIEW MODAL */}
      {isScheduleModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#3B3588]/15 rounded-[32px] w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-[#1E1B4B]">Schedule Interview</h3>
                <p className="text-xs text-slate-500">
                  Candidate: {selectedCandidate.name} &bull; {selectedCandidate.role}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsScheduleModalOpen(false);
                  setSelectedCandidate(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleInterviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                  Interview Round Title *
                </label>
                <input
                  type="text"
                  required
                  value={interviewForm.roundName}
                  onChange={(e) => setInterviewForm({ ...interviewForm, roundName: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={interviewForm.date}
                    onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                    Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={interviewForm.time}
                    onChange={(e) => setInterviewForm({ ...interviewForm, time: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                  Meeting Video URL (Google Meet / Zoom) *
                </label>
                <input
                  type="url"
                  required
                  value={interviewForm.meetingUrl}
                  onChange={(e) => setInterviewForm({ ...interviewForm, meetingUrl: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsScheduleModalOpen(false);
                    setSelectedCandidate(null);
                  }}
                  className="px-4 py-2 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#202960] hover:bg-[#2E2A72] text-white text-xs font-bold shadow-md shadow-[#202960]/20 flex items-center gap-2 cursor-pointer transition"
                >
                  Confirm & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POST NEW ROLE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#3B3588]/15 rounded-[32px] w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-[#1E1B4B]">Post New Internship Role</h3>
                <p className="text-xs text-slate-500">Publish position to active students on Visionary Interns Club</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {postError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                {postError}
              </div>
            )}

            <form onSubmit={handlePostRole} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                  Role Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Systems Engineer Intern"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                    Work Mode
                  </label>
                  <select
                    value={formData.mode}
                    onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                    className="w-full px-3 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
                  >
                    <option value="HYBRID">Hybrid</option>
                    <option value="REMOTE">Remote</option>
                    <option value="ON_SITE">On-Site</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bengaluru"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                    Monthly Stipend (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="25000"
                    value={formData.stipend}
                    onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                    Duration (Months)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={formData.durationMonths}
                    onChange={(e) => setFormData({ ...formData, durationMonths: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                  Required Skills (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Next.js, Node.js, PostgreSQL"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FD] border border-[#3B3588]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#202960]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPosting}
                  className="px-6 py-2.5 rounded-full bg-[#202960] hover:bg-[#2E2A72] text-white text-xs font-bold shadow-md shadow-[#202960]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition"
                >
                  {isPosting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isPosting ? "Publishing..." : "Publish Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}