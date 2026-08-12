'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getInternships, Internship } from '@/lib/student-api';

export default function InternshipListingPage() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState('');
  const [location, setLocation] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await getInternships({ search, mode, location });
      setInternships(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [mode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Explore Internships</h1>

      {/* Search & Filter Bar */}
      <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <input
          type="text"
          placeholder="Search title or skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Filter location..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Work Modes</option>
          <option value="REMOTE">Remote</option>
          <option value="HYBRID">Hybrid</option>
          <option value="ON_SITE">On-Site</option>
        </select>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Search Jobs
        </button>
      </form>

      {/* Internship Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading active internships...</div>
      ) : internships.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No internships found matching your search.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((job) => (
            <div key={job.id} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">
                    {job.mode}
                  </span>
                  {job.stipend && (
                    <span className="text-sm font-bold text-green-600">
                      ₹{job.stipend.toLocaleString()}/mo
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">{job.title}</h2>
                <p className="text-sm text-gray-600 mb-4">{job.company.companyName} • {job.location}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {job.skills.map((skill, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                <span className="text-xs text-gray-400">
                  {job.deadline ? `Deadline: ${new Date(job.deadline).toLocaleDateString()}` : 'Open enrollment'}
                </span>
                <Link
                  href={`/student/internships/${job.id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}