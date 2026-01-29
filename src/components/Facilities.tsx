import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import photoSpotImage from "@/assets/photo-spot.jpg";
import walkingImage from "@/assets/walking.jpg";
import ballpit1 from "@/assets/ballpit-1.webp";
import ballpit2 from "@/assets/ballpit-2.webp";
import ballpit3 from "@/assets/ballpit-3.webp";
import ballpit4 from "@/assets/ballpit-4.webp";
import rest1 from "@/assets/rest-1.webp";
import rest2 from "@/assets/rest-2.webp";
import rest3 from "@/assets/rest-3.webp";
import rest4 from "@/assets/rest-4.webp";
import sunbath1 from "@/assets/sunbath-1.webp";
import sunbath2 from "@/assets/sunbath-2.webp";
import sunbath3 from "@/assets/sunbath-3.webp";

const ballpitImages = [ballpit1, ballpit2, ballpit3, ballpit4];
const restImages = [rest1, rest2, rest3, rest4];
const sunbathImages = [sunbath1, sunbath2, sunbath3];

interface ImageCarouselProps {
  images: string[];
  altPrefix: string;
}

const ImageCarousel = ({ images, altPrefix }: ImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <div className="relative w-full h-56 overflow-hidden group">
      {images.map((img, index) => (
        <img
          key={index}
          src={img}
          alt={`${altPrefix} ${index + 1}`}
          className={`absolute inset-0 w-full h-56 object-cover transition-opacity duration-500 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      
      <button
        onClick={prevSlide}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all opacity-0 group-hover:opacity-100"
        aria-label="Foto anterior"
      >
        <ChevronLeft className="w-5 h-5 text-foreground" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all opacity-0 group-hover:opacity-100"
        aria-label="Foto siguiente"
      >
        <ChevronRight className="w-5 h-5 text-foreground" />
      </button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? "bg-primary w-4" : "bg-white/70"
            }`}
            aria-label={`Ir a foto ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

const facilities = [
  {
    title: "Lugar para descansar",
    description: "Camitas cómodas, mantitas suaves y un espacio acogedor donde puede dormir profundamente. Un rincón donde el sueño le llega solito.",
    image: null,
    carouselType: "rest" as const,
  },
  {
    title: "Baño de Sol",
    description: "Un rincón favorito donde muchos perritos se recuestan a 'broncearse', cerrar los ojos y disfrutar el calorcito.",
    image: null,
    carouselType: "sunbath" as const,
  },
  {
    title: "Diversión sin límites — Piscina de Pelotas",
    description: "Sí, como niños: se tiran, buscan juguetes, y vuelven a tirarse.",
    image: null,
    carouselType: "ballpit" as const,
  },
  {
    title: "Spot de Foto",
    description: "Un espacio iluminado y acogedor para que tu peludo sea el protagonista de fotos hermosas. Porque tu peludo siempre tiene un lado bueno… ¡y nosotros sabemos capturarlo!",
    image: photoSpotImage,
    carouselType: null,
  },
  {
    title: "Paseo sin presión",
    description: "Caminatas a su ritmo, sin manada, sin estrés, solo ellos disfrutando como debe ser.",
    image: walkingImage,
    carouselType: null,
  },
];

const Facilities = () => {
  return (
    <section id="instalaciones" className="bg-secondary py-12 md:py-16 theme-vibrant:bg-[hsl(var(--section-bg-vibrant))]">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center mb-12 text-white text-4xl md:text-5xl font-bold">¿Dónde estará tu peludo?</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facilities.map((facility, index) => (
              <div 
                key={index} 
                className="bg-card rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border-b-4 border-primary/20"
              >
                {facility.carouselType === "rest" ? (
                  <ImageCarousel images={restImages} altPrefix="Lugar para descansar" />
                ) : facility.carouselType === "sunbath" ? (
                  <ImageCarousel images={sunbathImages} altPrefix="Baño de sol" />
                ) : facility.carouselType === "ballpit" ? (
                  <ImageCarousel images={ballpitImages} altPrefix="Piscina de pelotas" />
                ) : (
                  <img
                    src={facility.image!}
                    alt={facility.title}
                    className="w-full h-56 object-cover"
                  />
                )}
                <div className="p-6 space-y-3">
                  <h3 className="text-foreground text-lg">{facility.title}</h3>
                  <p className="text-foreground leading-relaxed">
                    {facility.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Facilities;
