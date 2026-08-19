import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Gallery from "@/components/Gallery";
import WhyChooseVIC from "@/components/WhyChooseVIC";
import ExploreVIC from "@/components/ExploreVIC";
import Scenario from "@/components/Scenario";
import StudentSkillUp from "@/components/StudentSkillUp";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8F9FD] text-[#1E1B4B] font-sans selection:bg-[#D9DFFF]">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Gallery />
        <WhyChooseVIC />
        <ExploreVIC />
        <Scenario />
        <StudentSkillUp />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}