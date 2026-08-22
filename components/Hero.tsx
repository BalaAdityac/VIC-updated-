import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="home"
      className="pt-32 pb-20 px-6 max-w-6xl mx-auto relative overflow-hidden"
    >
      <div className="grid lg:grid-cols-12 gap-12 items-center">
        {/* Left Side */}
        <div className="lg:col-span-7 space-y-6">
          <h1 className="text-4xl sm:text-6xl font-black text-[#1E1B4B] leading-[1.15] tracking-tight">
            Build Your Skills <br />
            <span className="text-[#3B3588]">Find Opportunity</span> <br />
            Launch Your Career
          </h1>

          <p className="text-base sm:text-lg font-medium text-[#1E1B4B]/70 max-w-lg leading-relaxed">
            A student-first career network connecting ambitious learners with
            internships, practical learning, mentorship, and real-world
            opportunities.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/signup"
              className="px-8 py-4 bg-[#2E2A72] hover:bg-[#3B3588] text-white font-bold text-sm rounded-2xl shadow-xl shadow-[#2E2A72]/20 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
            >
              Apply for Opportunity
              <ArrowRight size={17} />
            </Link>

            <Link
              href="#about"
              className="px-8 py-4 bg-[#E5E9FF] hover:bg-[#D9DFFF] text-[#2E2A72] font-bold text-sm rounded-2xl transition-all"
            >
              Explore Overview
            </Link>
          </div>

          <div className="pt-4 flex flex-wrap gap-4 text-xs font-bold text-[#1E1B4B]/80">
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

        {/* Right Side */}
        <div className="lg:col-span-5 relative flex justify-center">
          <div className="bg-[#D9DFFF]/60 rounded-[3rem] p-6 shadow-2xl border border-white max-w-sm w-full space-y-5 animate-float">
            <div className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
              <div className="w-16 h-16 bg-[#E5E9FF] rounded-2xl flex items-center justify-center text-[#2E2A72]">
                <Sparkles size={32} />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#3B3588]">
                  VISIONARY INTERNS CLUB
                </p>

                <h3 className="text-2xl font-black text-[#1E1B4B] mt-2">
                  Launch Your Dream
                </h3>

                <p className="text-sm font-medium text-[#1E1B4B]/60 mt-2 leading-relaxed">
                  Learn, connect, build your portfolio, and discover your next
                  internship opportunity.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/80 rounded-2xl p-4">
                <p className="text-2xl font-black text-[#2E2A72]">01</p>
                <p className="text-xs font-bold text-[#1E1B4B]/60 mt-1">
                  Create Profile
                </p>
              </div>

              <div className="bg-white/80 rounded-2xl p-4">
                <p className="text-2xl font-black text-[#3B3588]">02</p>
                <p className="text-xs font-bold text-[#1E1B4B]/60 mt-1">
                  Find Your Path
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}