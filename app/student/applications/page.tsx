'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getMyApplications, ApplicationRecord } from '@/lib/student-api';

const STATUS_THEMES: Record<string, { bg: string; text: string }> = {
  APPLIED: { bg: 'bg-blue-100', text: 'text-blue-800' },
  SHORTLISTED: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  INTERVIEWING: { bg: 'bg-amber-100', text: 'text-amber-900' },
  OFFERED: { bg: 'bg-green-100', text: 'text-green-800' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-800' },
  WITHDRAWN: { bg: 'bg-gray-100', text: 'text-gray-700' }
};

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const apps = await getMyApplications();
        setApplications(apps);
      } catch (err: any) {
        setError(err.message || 'Unable to retrieve your application records.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">My Applications</h1>
          <p className="text-sm text-gray-500 mt-1">Track your recruitment milestones, scheduled rounds, and offers.</p>
        </div>
        <Link
          href="/student/internships"
          className="text-sm font-semibold text-blue-600 hover:text-blue-800"
        >
          + Discover More Internships
        </Link>
      </div>

      {loading && (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-500 text-sm">Loading applications...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && applications.length === 0 && (
        <div className="bg-white border rounded-2xl p-12 text-center">
          <h3 className="text-lg font-bold text-gray-800 mb-2">No applications submitted yet</h3>
          <p className="text-gray-500 text-sm mb-6">Explore our active openings to apply for internships.</p>
          <Link
            href="/student/internships"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm inline-block"
          >
            Browse Internships
          </Link>
        </div>
      )}

      {!loading && !error && applications.length > 0 && (
        <div className="space-y-6">
          {applications.map((app) => {
            const theme = STATUS_THEMES[app.status] || { bg: 'bg-gray-100', text: 'text-gray-800' };

            return (
              <div key={app.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-gray-900">{app.internship.title}</h2>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${theme.bg} ${theme.text}`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 font-medium mt-1">
                      {app.internship.company.companyName} • {app.internship.location} ({app.internship.mode})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 block">Applied On</span>
                    <span className="text-sm font-semibold text-gray-700">{new Date(app.appliedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Scheduled Interviews Box */}
                {app.interviews && app.interviews.length > 0 && (
                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                      <span>📅</span> Scheduled Interview Rounds
                    </h3>
                    <div className="mt-2 space-y-2">
                      {app.interviews.map((interview) => (
                        <div key={interview.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-3 rounded-lg border border-amber-100 text-sm">
                          <div>
                            <span className="font-bold text-gray-900">Round {interview.roundNumber}: {interview.roundName}</span>
                            <span className="text-xs text-gray-500 block">
                              Scheduled for: {new Date(interview.scheduledAt).toLocaleString()}
                            </span>
                          </div>
                          {interview.meetingUrl ? (
                            <a
                              href={interview.meetingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1.5 rounded-md text-xs inline-block"
                            >
                              Join Meeting →
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400 italic mt-2 sm:mt-0">Meeting link will be shared soon</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Offer Letter Box */}
                {app.offers && app.offers.length > 0 && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-green-900 flex items-center gap-2">
                      <span>🎉</span> Offer Extended
                    </h3>
                    <div className="mt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-3 rounded-lg border border-green-100 text-sm">
                      <div>
                        <p className="font-bold text-gray-900">Stipend: ₹{app.offers[0].stipendAmount.toLocaleString()}/month</p>
                        <p className="text-xs text-gray-500">Expected Joining: {new Date(app.offers[0].joiningDate).toLocaleDateString()}</p>
                      </div>
                      <a
                        href={app.offers[0].offerLetterUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 sm:mt-0 bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-1.5 rounded-md text-xs"
                      >
                        Download Offer Letter 📄
                      </a>
                    </div>
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