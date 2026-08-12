'use client';

import React, { useState, useEffect } from 'react';
import { getMyApplications, Application } from '@/lib/student-api';

const STATUS_BADGES: Record<string, string> = {
  APPLIED: 'bg-blue-100 text-blue-800',
  SHORTLISTED: 'bg-purple-100 text-purple-800',
  INTERVIEWING: 'bg-amber-100 text-amber-800',
  OFFERED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  WITHDRAWN: 'bg-gray-100 text-gray-800'
};

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApps() {
      try {
        const data = await getMyApplications();
        setApplications(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchApps();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your applications...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Internship Applications</h1>

      {applications.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border text-center text-gray-500">
          You have not applied to any internships yet.
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-white border rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-gray-900">{app.internship.title}</h2>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGES[app.status] || 'bg-gray-100'}`}>
                    {app.status}
                  </span>
                </div>
                <p className="text-gray-600 font-medium text-sm">
                  {app.internship.company.companyName} • {app.internship.location}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Applied on {new Date(app.appliedAt).toLocaleDateString()}
                </p>
              </div>

              {/* Status Specific Details */}
              <div className="text-right">
                {app.status === 'INTERVIEWING' && app.interviews && app.interviews.length > 0 && (
                  <div className="text-xs bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    <p className="font-semibold text-amber-900">Upcoming Interview:</p>
                    <p className="text-amber-800">{app.interviews[0].roundName}</p>
                    <p className="text-amber-700">{new Date(app.interviews[0].scheduledAt).toLocaleString()}</p>
                  </div>
                )}

                {app.status === 'OFFERED' && app.offers && app.offers.length > 0 && (
                  <div className="text-xs bg-green-50 p-2.5 rounded-lg border border-green-200">
                    <p className="font-semibold text-green-900">Offer Received!</p>
                    <p className="text-green-800">Stipend: ₹{app.offers[0].stipendAmount}/mo</p>
                    <a
                      href={app.offers[0].offerLetterUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline text-green-700 font-bold mt-1 block"
                    >
                      View Offer Letter
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}