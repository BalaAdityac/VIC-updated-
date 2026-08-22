import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="home"
      className="pt-24 pb-12 px-6 max-w-6xl mx-auto relative overflow-hidden"
    >
      <div className="max-w-4xl mx-auto text-center">

        {/* Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E5E9FF] text-[#2E2A72] text-xs font-bold rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#3B3588] animate-pulse" />
            Career Platform for Students
          </div>
        </div>

        {/* Heading */}
        <h1 className="mt-5 text-4xl sm:text-6xl lg:text-7xl font-black text-[#1E1B4B] leading-[1.08] tracking-tight">
          Build Your Skills.
          <br />
          <span className="text-[#3B3588]">
            Find Opportunity.
          </span>
          <br />
          Launch Your Career.
        </h1>

        {/* Description */}
        <p className="mt-5 mx-auto max-w-2xl text-base sm:text-lg font-medium text-[#1E1B4B]/70 leading-relaxed">
          A student-first career network connecting ambitious learners with
          internships, practical learning, mentorship, and real-world
          opportunities.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center items-center gap-4 pt-5">
          <Link
            href="/signup"
            className="px-8 py-4 bg-[#2E2A72] hover:bg-[#3B3588] text-white font-bold text-sm rounded-2xl shadow-xl shadow-[#2E2A72]/20 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
          >
            Apply for Opportunity
            <ArrowRight size={17} />
          </Link>

          <Link
            href="#internship-search"
            className="px-8 py-4 bg-[#E5E9FF] hover:bg-[#D9DFFF] text-[#2E2A72] font-bold text-sm rounded-2xl transition-all"
          >
            Search Internships
          </Link>
        </div>

        {/* Highlights */}
        <div className="pt-5 flex flex-wrap justify-center gap-4 text-xs font-bold text-[#1E1B4B]/80">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-[#E5E9FF]">
            🎓 Student Focused
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-[#E5E9FF]">
            🤝 Expert Mentors
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-[#E5E9FF]">
            💻 Real Projects
          </div>
        </div>

      </div>
    </section>
  );
}