import { Award, Briefcase, Users, Code2, Network, Target } from "lucide-react";

const features = [
  ["Real Internships", "Gain practical experience through meaningful projects and internship opportunities.", Briefcase],
  ["Certifications", "Build credibility with certifications that showcase your skills and achievements.", Award],
  ["Expert Mentorship", "Learn directly from professionals and experienced mentors.", Users],
  ["Real Projects", "Move beyond theory by working on projects that strengthen your portfolio.", Code2],
  ["Powerful Network", "Connect with students, mentors, recruiters, and companies.", Network],
  ["Career Guidance", "Get guidance to navigate your career journey with confidence.", Target],
];

export default function WhyChooseVIC() {
  return (
    <section id="why-us" className="py-18">
      <div className="container-vic">
        <div className="mx-auto max-w-3xl text-center">
          <div className="font-bold uppercase tracking-[0.2em] text-[#1677FF]"> Why Us </div>
          <h2 className="section-title mt-4">A vision built around <span className="gradient-text">your growth</span></h2>
          <p className="mt-5 text-[#60758A] leading-7">Our vision and mission are at the heart of everything we build for students and aspiring professionals</p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="rounded-[2.5rem] bg-white border border-[#E5E9FF] p-8 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#1677FF]">Our Vision</p>
            <h3 className="mt-4 text-2xl font-black text-[#1E1B4B]">A future where every student can access opportunity</h3>
            <p className="mt-4 text-[#60758A] leading-7">We envision an inclusive ecosystem where students can discover their strengths, build confidence, gain practical experience, and connect with opportunities that match their aspirations</p>
          </div>
          <div className="rounded-[2.5rem] bg-[#E5E9FF]/70 border border-white p-8 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#3B3588]">Our Mission</p>
            <h3 className="mt-4 text-2xl font-black text-[#1E1B4B]">Turn potential into skills, experience, and action</h3>
            <p className="mt-4 text-[#60758A] leading-7">Our mission is to make career preparation practical and accessible through internships, skill development, mentorship, projects, and a community that helps students move forward</p>
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map(([title, text, Icon]) => (
            <div key={title as string} className="glass rounded-[2rem] p-8 transition hover:-translate-y-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg">
                <Icon size={25} />
              </div>
              <h3 className="mt-6 text-xl font-black">{title as string}</h3>
              <p className="mt-3 leading-7 text-[#60758A]">{text as string}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
