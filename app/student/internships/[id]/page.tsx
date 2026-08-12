'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getInternshipById, applyToInternship, Internship } from '@/lib/student-api';

export default function InternshipDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [job, setJob] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Form State
  const [resumeUrl, setResumeUrl] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    async function loadJob() {
      try {
        const data = await getInternshipById(id);
        setJob(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadJob();
  }, [id]);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const result = await applyToInternship({
        internshipId: id,
        resumeUrl,
        coverLetter,
        portfolioUrl,
        githubUrl
      });

      setSuccessMessage(result.message);
      setTimeout(() => {
        router.push('/student/applications');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Application submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading details...</div>;
  if (!job) return <div className="p-8 text-center text-red-500">Internship posting not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white border rounded-xl p-8 shadow-sm mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-lg text-gray-600 font-medium">{job.company.companyName}</p>
          </div>
          <button
            onClick={() => setShowApplyModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
          >
            Apply Now
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 my-4 border-y text-sm">
          <div>
            <span className="block text-gray-500">Location</span>
            <span className="font-semibold">{job.location} ({job.mode})</span>
          </div>
          <div>
            <span className="block text-gray-500">Stipend</span>
            <span className="font-semibold text-green-600">{job.stipend ? `₹${job.stipend}/month` : 'Unpaid / N/A'}</span>
          </div>
          <div>
            <span className="block text-gray-500">Duration</span>
            <span className="font-semibold">{job.durationMonths ? `${job.durationMonths} Months` : 'Flexible'}</span>
          </div>
          <div>
            <span className="block text-gray-500">Deadline</span>
            <span className="font-semibold">{job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2">Job Description</h2>
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">{job.description}</p>
        </div>

        <div>
          <h2 className="text-lg font-bold mb-2">Required Skills</h2>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill, idx) => (
              <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl relative">
            <h2 className="text-xl font-bold mb-4">Apply for {job.title}</h2>

            {errorMessage && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 border border-red-200">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg mb-4 border border-green-200">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Resume PDF URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/your-resume.pdf"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Cover Letter (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Why are you a good fit for this role?"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Portfolio URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://yourportfolio.com"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">GitHub Profile URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://github.com/username"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 border text-gray-600 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}