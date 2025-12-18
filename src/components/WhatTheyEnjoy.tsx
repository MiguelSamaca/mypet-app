import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import gamesImage from "@/assets/games-interactive.jpg";
import socializationImage from "@/assets/socialization.jpg";
import sleeping1 from "@/assets/sleeping-1.webp";
import sleeping2 from "@/assets/sleeping-2.webp";
import sleeping3 from "@/assets/sleeping-3.webp";
import sleeping4 from "@/assets/sleeping-4.webp";
import sleeping5 from "@/assets/sleeping-5.webp";
import sleeping6 from "@/assets/sleeping-6.webp";

const sleepingImages = [sleeping1, sleeping2, sleeping3, sleeping4, sleeping5, sleeping6];

const features = [
  {
    title: "Juegos Interactivos",
    description: "Actividades físicas y mentales que estimulan su curiosidad y lo hacen pasar un día lleno de diversión, sacando sonrisas perrunas.",
    image: gamesImage,
    isCarousel: false,
  },
  {
    title: "Socialización con Amigos Cercanos",
    description: "No es un patio con muchos perros. Aquí seleccionamos compañeros tranquilos y compatibles. Amistades pequeñas, cercanas y bien cuidadas.",
    image: socializationImage,
    isCarousel: false,
  },
  {
    title: "Dormirá como en Casa",
    description: "Ya sea que duerma estirado como estrella de mar o enrollado como croissant, aquí encuentra su spot perfecto. Espacios suaves, cojines, sofás, camitas o cama de agua… elegirá su propio lugar favorito para descansar.",
    image: null,
    isCarousel: true,
  },
];

const SleepingCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % sleepingImages.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + sleepingImages.length) % sleepingImages.length);
  }, []);

  // Auto-advance every 4 seconds
  useEffect(() => {
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <div className="relative w-full h-64 overflow-hidden group">
      {sleepingImages.map((img, index) => (
        <img
          key={index}
          src={img}
          alt={`Zona de descanso ${index + 1}`}
          className={`absolute inset-0 w-full h-64 object-cover transition-opacity duration-500 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      
      {/* Navigation Arrows */}
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

      {/* Dots Indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {sleepingImages.map((_, index) => (
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

const WhatTheyEnjoy = () => {
  return (
    <section id="servicios" className="bg-primary/10 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center mb-6">¿Qué disfrutará tu peludo?</h2>
          <p className="text-center text-xl text-foreground mb-12 max-w-3xl mx-auto">
            Aquí no es un sitio lleno de perros desconocidos… es un hogar temporal que huele a tranquilidad y diversión.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-card rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                {feature.isCarousel ? (
                  <SleepingCarousel />
                ) : (
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-64 object-cover"
                  />
                )}
                <div className="p-6 space-y-4">
                  <h3 className="text-foreground">{feature.title}</h3>
                  <p className="text-foreground leading-relaxed">
                    {feature.description}
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

export default WhatTheyEnjoy;
