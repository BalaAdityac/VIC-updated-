const scenarios = [
  ["01", "Discover", "A student joins VIC, creates a profile, and identifies the skills and interests they want to develop."],
  ["02", "Skill Up", "They learn through practical projects, mentorship, and focused skill-building activities."],
  ["03", "Get Matched", "Their growing profile helps them explore internship opportunities aligned with their goals."],
  ["04", "Launch", "They apply, gain experience, build confidence, and take the next step toward their career."],
];

export default function Scenario() {
  return (
    <section id="scenario" className="py-10">
      <div className="container-vic">
        <div className="rounded-[3rem] bg-gradient-to-br from-[#DDF7FF] via-[#EFFFFA] to-[#EEE8FF] p-8 md:p-16">
          <div className="mx-auto max-w-2xl text-center">
            <div className="font-bold uppercase tracking-[0.2em] text-[#1677FF]">Scenario</div>
            <h2 className="section-title mt-4">See how a student <span className="gradient-text">moves forward.</span></h2>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-4">
            {scenarios.map(([num, title, text]) => (
              <div key={num} className="rounded-3xl bg-white/70 p-6 backdrop-blur transition hover:-translate-y-2">
                <div className="text-sm font-black text-[#1677FF]">{num}</div>
                <h3 className="mt-5 font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#60758A]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
