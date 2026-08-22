const gallery = [
  { title: "Learning Together", image: "/gallery/photo1.jpeg" },
  { title: "Group Discussion ", image: "/gallery/photo2.jpeg" },
  { title: "Mentorship & Growth", image: "/gallery/photo3.jpeg" },
  { title: "Career Opportunities", image: "/gallery/4.jpeg" },
];

export default function Gallery() {
  return (
    <section id="gallery" className="py-20">
      <div className="container-vic">
        <div className="text-center max-w-2xl mx-auto">
          <div className="font-bold uppercase tracking-[0.2em] text-[#1677FF]">Gallery</div>
          <h2 className="section-title mt-4">Moments that <span className="gradient-text">move us forward</span></h2>
          <p className="mt-5 text-[#60758A] leading-7">A glimpse into learning, collaboration, creativity, and the student journey at VIC.</p>
        </div>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {gallery.map((item, index) => (
            <div key={item.title} className={`group overflow-hidden rounded-[2rem] bg-white shadow-sm border border-[#E5E9FF] ${index === 1 ? "lg:translate-y-8" : ""}`}>
              <div className="h-72 overflow-hidden">
                <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              </div>
              <div className="p-5">
                <h3 className="font-black text-[#1E1B4B]">{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
