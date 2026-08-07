const gallery = [
  { title: "Learning Together", image: "https://images.unsplash.com/photo1.jpeg?auto=format&fit=crop&w=900&q=80" },
  { title: "Building Projects", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80" },
  { title: "Mentorship & Growth", image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80" },
  { title: "Career Opportunities", image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=80" },
];

export default function Gallery() {
  return (
    <section id="gallery" className="py-28">
      <div className="container-vic">
        <div className="text-center max-w-2xl mx-auto">
          <div className="font-bold uppercase tracking-[0.2em] text-[#1677FF]">Gallery</div>
          <h2 className="section-title mt-4">Moments that <span className="gradient-text">move us forward.</span></h2>
          <p className="mt-5 text-[#60758A] leading-7">A glimpse into learning, collaboration, creativity, and the student journey at VIC.</p>
        </div>
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
