'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getActiveInternships, Internship } from '@/lib/student-api';

export default function StudentInternshipDiscoveryPage() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [mode, setMode] = useState('');
  const [location, setLocation] = useState('');

  const loadInternships = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getActiveInternships({ search, mode, location });
      setInternships(data);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to backend service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInternships();
  }, [mode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadInternships();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Explore Internships</h1>
          <p className="text-gray-600 text-sm mt-1">Discover real-world opportunities posted by verified companies.</p>
        </div>
        <Link
          href="/student/applications"
          className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          View My Applications →
        </Link>
      </div>

      {/* Filter Bar */}
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-8">
        <input
          type="text"
          placeholder="Search by title or skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <input
          type="text"
          placeholder="Location (e.g. Bengaluru)..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="border rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="">All Work Modes</option>
          <option value="REMOTE">Remote</option>
          <option value="HYBRID">Hybrid</option>
          <option value="ON_SITE">On-Site</option>
        </select>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-sm transition"
        >
          Search Opportunities
        </button>
      </form>

      {/* Loading & Error States */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 font-medium">Fetching active internships...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
          <p className="font-semibold">Failed to load listings</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Listings Grid */}
      {!loading && !error && internships.length === 0 && (
        <div className="bg-white border rounded-xl p-12 text-center text-gray-500">
          <p className="text-lg font-medium mb-1">No active internships found</p>
          <p className="text-sm">Try adjusting your filters or search keywords.</p>
        </div>
      )}

      {!loading && !error && internships.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((job) => (
            <div key={job.id} className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col justify-between hover:shadow-lg transition">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md">
                    {job.mode}
                  </span>
                  {job.stipend ? (
                    <span className="text-sm font-bold text-green-700">₹{job.stipend.toLocaleString()}/mo</span>
                  ) : (
                    <span className="text-xs text-gray-400">Stipend: Unpaid / Performance</span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-900 mt-1">{job.title}</h2>
                <p className="text-sm text-gray-600 font-medium mb-3">{job.company?.companyName} • {job.location}</p>
                <p className="text-sm text-gray-500 line-clamp-3 mb-4">{job.description}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {job.skills.map((skill, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                <span className="text-xs text-gray-400">
                  {job.deadline ? `Closes: ${new Date(job.deadline).toLocaleDateString()}` : 'Rolling recruitment'}
                </span>
                <Link
                  href={`/student/internships/${job.id}`}
                  className="text-sm font-bold text-blue-600 hover:text-blue-800"
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