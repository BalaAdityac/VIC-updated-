'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getStudentDashboardSummary, StudentDashboardSummary } from '@/lib/student-api';

const STATUS_THEMES: Record<string, string> = {
  APPLIED: 'bg-blue-100 text-blue-800',
  SHORTLISTED: 'bg-indigo-100 text-indigo-800',
  INTERVIEWING: 'bg-amber-100 text-amber-900',
  OFFERED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  WITHDRAWN: 'bg-gray-100 text-gray-700'
};

export default function StudentDashboardPage() {
  const [summary, setSummary] = useState<StudentDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await getStudentDashboardSummary();
        setSummary(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load student dashboard metrics.');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 font-medium">Loading Dashboard Metrics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          <p className="font-bold">Dashboard Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Student Portal Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Track your internship pipeline, interview calls, and job offers.</p>
        </div>
        <Link
          href="/student/internships"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition shadow"
        >
          Explore Open Internships →
        </Link>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Applied</span>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">{summary?.totalApplications || 0}</p>
          <span className="text-xs text-blue-600 font-medium mt-1 inline-block">Active Submissions</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Upcoming Interviews</span>
          <p className="text-3xl font-extrabold text-amber-600 mt-2">{summary?.activeInterviewsCount || 0}</p>
          <span className="text-xs text-amber-700 font-medium mt-1 inline-block">Scheduled Rounds</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Offers Extended</span>
          <p className="text-3xl font-extrabold text-green-600 mt-2">{summary?.offersCount || 0}</p>
          <span className="text-xs text-green-700 font-medium mt-1 inline-block">Direct Placements</span>
        </div>
      </div>

      {/* Upcoming Interviews Section */}
      {summary && summary.upcomingInterviews.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold text-amber-950 mb-3 flex items-center gap-2">
            <span>📅</span> Urgent: Action Required for Upcoming Interviews
          </h2>
          <div className="space-y-3">
            {summary.upcomingInterviews.map((intv) => (
              <div key={intv.id} className="bg-white p-4 rounded-xl border border-amber-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <h3 className="font-bold text-gray-900">{intv.internshipTitle} ({intv.companyName})</h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Round {intv.roundNumber}: {intv.roundName} • Scheduled for {new Date(intv.scheduledAt).toLocaleString()}
                  </p>
                </div>
                {intv.meetingUrl ? (
                  <a
                    href={intv.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition"
                  >
                    Join Video Call →
                  </a>
                ) : (
                  <span className="text-xs text-gray-400 italic">Meeting Link Pending</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Applications Feed */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Applications</h2>
          <Link href="/student/applications" className="text-sm font-semibold text-blue-600 hover:underline">
            View All ({summary?.totalApplications || 0})
          </Link>
        </div>

        {summary?.recentApplications.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-sm">
            You haven't submitted any internship applications yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {summary?.recentApplications.map((app) => (
              <div key={app.id} className="py-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{app.internship.title}</h3>
                  <p className="text-xs text-gray-500">{app.internship.company.companyName} • Applied on {new Date(app.appliedAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${STATUS_THEMES[app.status] || 'bg-gray-100 text-gray-700'}`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}