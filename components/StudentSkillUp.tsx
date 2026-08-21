import Link from "next/link";

const skills = ["Technical Skills", "Communication", "Problem Solving", "Portfolio Building"];

export default function StudentSkillUp() {
  return (
    <section id="student-skill-up" className=" py-19">
      <div className="container-vic">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="font-bold uppercase tracking-[0.2em] text-[#1677FF]">Student Skill Up</div>
            <h2 className="section-title mt-4">Level up before you <span className="gradient-text">step in.</span></h2>
            <p className="mt-6 text-lg leading-8 text-[#60758A]">
              Build the confidence and practical skills you need to stand out in internship applications and make the most of your first professional experience.
            </p>
            <Link href="/signup" className="gradient-button mt-8 inline-flex rounded-full px-7 py-4 font-bold text-white">Start Skill Up</Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {skills.map((skill, index) => (
              <div key={skill} className="rounded-[2rem] bg-white border border-[#E5E9FF] p-7 shadow-sm hover:-translate-y-2 transition">
                <span className="text-4xl font-black text-[#3B3588]/20">0{index + 1}</span>
                <h3 className="mt-5 font-black text-[#1E1B4B]">{skill}</h3>
                <p className="mt-2 text-sm text-[#60758A]">Practice, improve, and showcase this skill through your VIC journey.</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
