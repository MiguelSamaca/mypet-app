import { useEffect, useRef, useState } from "react";

const DayAtHotel = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="bg-background py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="mb-4">Así es un día en Mayte Pet Hotel</h2>
          <p className="text-lg text-foreground mb-8">
            Mira cómo disfrutan nuestros huéspedes peludos cada momento 🐾
          </p>
          
          <div className="relative w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl bg-card">
            <div className="aspect-[9/16]">
              {isVisible && (
                <iframe
                  src="https://www.youtube.com/embed/ES3a9KXFhOs?autoplay=1&mute=1&loop=1&playlist=ES3a9KXFhOs&controls=1&rel=0"
                  title="Un día en Mayte Pet Hotel"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DayAtHotel;
