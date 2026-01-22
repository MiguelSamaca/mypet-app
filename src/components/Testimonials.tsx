import { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";

const testimonialImages = [
  { src: testimonial1, alt: "Testimonio de cliente satisfecho" },
  { src: testimonial2, alt: "Testimonio sobre Brooklyn" },
  { src: testimonial3, alt: "Testimonio sobre Lucky" },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? testimonialImages.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) => 
      prev === testimonialImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <section id="testimonios" className="bg-background py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center mb-12">Testimonios</h2>

          {/* Desktop: Show all 3 images */}
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {testimonialImages.map((image, index) => (
              <div 
                key={index} 
                className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <img 
                  src={image.src} 
                  alt={image.alt}
                  className="w-full h-auto object-cover"
                />
              </div>
            ))}
          </div>

          {/* Mobile: Carousel */}
          <div className="md:hidden relative">
            <div className="overflow-hidden rounded-2xl shadow-lg">
              <img 
                src={testimonialImages[currentIndex].src} 
                alt={testimonialImages[currentIndex].alt}
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Navigation arrows */}
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-6 h-6 text-primary" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-6 h-6 text-primary" />
            </button>

            {/* Dot indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {testimonialImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex 
                      ? "bg-primary scale-110" 
                      : "bg-primary/30 hover:bg-primary/50"
                  }`}
                  aria-label={`Ir a testimonio ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
