import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import testimonial1 from "@/assets/testimonial-1.webp";
import testimonial2 from "@/assets/testimonial-2.webp";
import testimonial3 from "@/assets/testimonial-3.webp";
import testimonial4 from "@/assets/testimonial-4.webp";
import testimonial5 from "@/assets/testimonial-5.webp";
import testimonial6 from "@/assets/testimonial-6.webp";

const allTestimonials = [
  { src: testimonial1, alt: "Testimonio de cliente satisfecho" },
  { src: testimonial4, alt: "Testimonio sobre Abby" },
  { src: testimonial2, alt: "Testimonio sobre Brooklyn" },
  { src: testimonial5, alt: "Testimonio sobre Macgyver" },
  { src: testimonial3, alt: "Testimonio sobre Lucky" },
  { src: testimonial6, alt: "Testimonio sobre mascota feliz" },
];

// Desktop: 3 carruseles, cada uno con 2 fotos
const desktopCarousels = [
  [allTestimonials[0], allTestimonials[1]],
  [allTestimonials[2], allTestimonials[3]],
  [allTestimonials[4], allTestimonials[5]],
];

const DesktopCarousel = ({ images }: { images: typeof allTestimonials }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group">
      <img
        src={images[index].src}
        alt={images[index].alt}
        className="w-full h-auto object-cover transition-opacity duration-500"
      />
      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i === index
                ? "bg-white scale-110"
                : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Ir a imagen ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Mobile auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allTestimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? allTestimonials.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) =>
      prev === allTestimonials.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <section id="testimonios" className="bg-background py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center mb-12">Testimonios</h2>

          {/* Desktop: 3 carruseles side by side */}
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {desktopCarousels.map((images, idx) => (
              <DesktopCarousel key={idx} images={images} />
            ))}
          </div>

          {/* Mobile: single carousel with all images */}
          <div className="md:hidden relative">
            <div className="overflow-hidden rounded-2xl shadow-lg">
              <img
                src={allTestimonials[currentIndex].src}
                alt={allTestimonials[currentIndex].alt}
                className="w-full h-auto object-cover"
              />
            </div>

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

            <div className="flex justify-center gap-2 mt-4">
              {allTestimonials.map((_, index) => (
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
