import { ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function About() {
  return (
    <section className="py-0">
  <div className="container-vic">
    <div className="flex justify-center">
      <div className="animate-fade-up mx-auto max-w-3xl text-center">

        <div className="mb-1 font-bold uppercase tracking-[0.2em] text-[#1677FF]">
          About Us
        </div>

        <h2 className="section-title">
          Where ambition meets{" "}
          <span className="gradient-text">opportunity</span>
        </h2>

        <p className="mt-3 text-lg leading-8 text-[#60758A]">
          Visionary Interns Club is a student-focused career community
          designed to turn potential into practical skills, meaningful
          experiences, and career opportunities.
        </p>

        <p className="mt-1 leading-7 text-[#60758A]">
          We bring together internships, skill development, mentorship,
          projects, certifications, and industry connections in one
          supportive ecosystem.
        </p>

        <Link
          href="#why-us"
          className="gradient-button mt-4 inline-flex items-center gap-2 rounded-full px-7 py-4 font-bold text-white transition"
        >
          Discover VIC <ArrowUpRight size={18} />
        </Link>

      </div>
    </div>
  </div>
</section>
  )
}