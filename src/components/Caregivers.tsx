import { useState, useEffect } from "react";
import { Heart, Shield, Brain, Users, ChevronLeft, ChevronRight } from "lucide-react";
import caregiver1 from "@/assets/caregiver-1.jpg";
import caregiver2 from "@/assets/caregiver-2.jpg";
import caregiver3 from "@/assets/caregiver-3.jpg";
import caregiver4 from "@/assets/caregiver-4.jpg";

const qualities = [
  { icon: Heart, text: "Amor absoluto por los animales" },
  { icon: Shield, text: "Conocimiento en primeros auxilios" },
  { icon: Brain, text: "Técnicas de adiestramiento positivo" },
  { icon: Users, text: "Cuidado 100% personalizado y respetuoso" },
];

const caregiverImages = [caregiver1, caregiver2, caregiver3, caregiver4];

const Caregivers = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % caregiverImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + caregiverImages.length) % caregiverImages.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % caregiverImages.length);
  };

  return (
    <section id="equipo" className="bg-background py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center mb-12">¿Quién los cuidará?</h2>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            {/* Carousel */}
            <div className="relative group">
              <div className="overflow-hidden rounded-3xl shadow-2xl">
                <img
                  src={caregiverImages[currentIndex]}
                  alt={`Cuidadora profesional ${currentIndex + 1}`}
                  className="w-full h-auto max-h-[500px] object-contain transition-all duration-500"
                />
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={goToPrevious}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                aria-label="Siguiente imagen"
              >
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>

              {/* Dot Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {caregiverImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "bg-primary w-6"
                        : "bg-white/70 hover:bg-white"
                    }`}
                    aria-label={`Ir a imagen ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-lg leading-relaxed text-foreground">
                Detrás del Hotel Pet Care hay personas que aman a los peludos en todas sus 
                formas: viejitos, gorditos, juguetones, sensibles, nerviosos y consentidos.
              </p>

              <div className="space-y-4">
                {qualities.map((quality, index) => {
                  const Icon = quality.icon;
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <div className="bg-primary rounded-full p-3 flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <p className="text-foreground font-medium">{quality.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-primary/20 rounded-3xl p-8 text-center shadow-lg">
            <p className="text-xl font-semibold text-foreground">
              Aquí tu peludo llega como huésped… y se va como familia 💕
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Caregivers;
