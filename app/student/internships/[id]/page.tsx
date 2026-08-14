'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getInternshipDetails, applyToInternship, Internship } from '@/lib/student-api';

export default function InternshipDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [job, setJob] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Application Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getInternshipDetails(id);
        setJob(data);
      } catch (err: any) {
        setFetchError(err.message || 'Could not load internship details.');
      } finally {
        setLoading(false);
      }
    }
    if (id) loadData();
  }, [id]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const response = await applyToInternship({
        internshipId: id,
        resumeUrl,
        coverLetter,
        portfolioUrl,
        githubUrl
      });

      setSubmitSuccess(response.message || 'Application submitted successfully!');
      setTimeout(() => {
        router.push('/student/applications');
      }, 1500);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading opportunity details...</p>
      </div>
    );
  }

  if (fetchError || !job) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-2">Error Loading Internship</h2>
          <p className="text-sm mb-4">{fetchError || 'Internship posting not found'}</p>
          <Link href="/student/internships" className="text-blue-600 font-semibold underline">
            ← Back to all internships
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/student/internships" className="text-sm font-semibold text-gray-500 hover:text-gray-900 mb-6 inline-block">
        ← Back to Listings
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">{job.title}</h1>
            <p className="text-lg text-gray-700 font-medium mt-1">{job.company?.companyName}</p>
            {job.company?.website && (
              <a href={job.company.website} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
                {job.company.website}
              </a>
            )}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl shadow transition"
          >
            Apply for this Role
          </button>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-b">
          <div>
            <span className="block text-xs uppercase tracking-wider text-gray-400 font-bold">Location & Mode</span>
            <span className="text-base font-semibold text-gray-800">{job.location} ({job.mode})</span>
          </div>
          <div>
            <span className="block text-xs uppercase tracking-wider text-gray-400 font-bold">Stipend</span>
            <span className="text-base font-semibold text-green-700">{job.stipend ? `₹${job.stipend}/mo` : 'Unpaid / Open'}</span>
          </div>
          <div>
            <span className="block text-xs uppercase tracking-wider text-gray-400 font-bold">Duration</span>
            <span className="text-base font-semibold text-gray-800">{job.durationMonths ? `${job.durationMonths} Months` : 'Negotiable'}</span>
          </div>
          <div>
            <span className="block text-xs uppercase tracking-wider text-gray-400 font-bold">Application Deadline</span>
            <span className="text-base font-semibold text-gray-800">{job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Rolling'}</span>
          </div>
        </div>

        {/* Description & Responsibilities */}
        <div className="py-6 border-b space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Job Overview & Responsibilities</h2>
          <div className="text-gray-700 text-base whitespace-pre-line leading-relaxed">
            {job.description}
          </div>
        </div>

        {/* Skills */}
        <div className="py-6 border-b">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Required Technical Skills</h2>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill, index) => (
              <span key={index} className="bg-blue-50 text-blue-700 font-semibold px-3 py-1 rounded-lg text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Company Info */}
        {job.company?.description && (
          <div className="pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">About {job.company.companyName}</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{job.company.description}</p>
          </div>
        )}
      </div>

      {/* Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Apply: {job.title}</h2>
            <p className="text-sm text-gray-500 mb-6">{job.company?.companyName}</p>

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3.5 rounded-lg mb-4">
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3.5 rounded-lg mb-4 font-semibold">
                {submitSuccess}
              </div>
            )}

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Resume PDF Link *</label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/file/d/... or GitHub Raw URL"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Cover Note / Summary (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Highlight your project experience and why you are interested in this position..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Portfolio Link (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://myportfolio.dev"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">GitHub URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://github.com/my-profile"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}