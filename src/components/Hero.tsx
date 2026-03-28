import { useState, useEffect } from "react";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Desktop/Tablet images
import heroImage1 from "@/assets/hero-1.webp";
import heroImage2 from "@/assets/hero-2.webp";
import heroImage3 from "@/assets/hero-3.webp";
import heroImage4 from "@/assets/hero-4.webp";
import heroImage7 from "@/assets/hero-7.webp";
import heroImage8 from "@/assets/hero-8.webp";

// Mobile images
import heroMobile1 from "@/assets/hero-mobile-1.webp";
import heroMobile2 from "@/assets/hero-mobile-2.webp";
import heroMobile3 from "@/assets/hero-mobile-3.webp";
import heroMobile4 from "@/assets/hero-mobile-4.webp";
import heroMobile5 from "@/assets/hero-mobile-5.webp";

const desktopHeroImages = [heroImage1, heroImage2, heroImage3, heroImage4, heroImage7, heroImage8];
const mobileHeroImages = [heroMobile1, heroMobile2, heroMobile3, heroMobile4, heroMobile5];

const navLinks = [
  { label: "Qué hacemos", href: "#que-hacemos" },
  { label: "Servicios", href: "#servicios" },
  { label: "Testimonios", href: "#testimonios" },
  { label: "Instalaciones", href: "#instalaciones" },
  { label: "Equipo", href: "#equipo" },
  { label: "Mayte Boutique", href: "https://maytepetboutique.com", external: true },
];

const Hero = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isMobile = useIsMobile();

  const heroImages = isMobile ? mobileHeroImages : desktopHeroImages;
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    setCurrentImageIndex(0);
    setLoadedImages(new Set([0]));
  }, [isMobile]);

  // Preload first hero image via <link> in head for LCP
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = heroImages[0];
    link.setAttribute("fetchpriority", "high");
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, [heroImages]);

  // Preload next image in sequence
  useEffect(() => {
    const nextIndex = (currentImageIndex + 1) % heroImages.length;
    if (!loadedImages.has(nextIndex)) {
      const img = new Image();
      img.src = heroImages[nextIndex];
      img.onload = () => {
        setLoadedImages((prev) => new Set(prev).add(nextIndex));
      };
    }
    if (!loadedImages.has(currentImageIndex)) {
      setLoadedImages((prev) => new Set(prev).add(currentImageIndex));
    }
  }, [currentImageIndex, heroImages, loadedImages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  const goToPrevious = () => {
    const prev = (currentImageIndex - 1 + heroImages.length) % heroImages.length;
    if (!loadedImages.has(prev)) {
      setLoadedImages((p) => new Set(p).add(prev));
    }
    setCurrentImageIndex(prev);
  };

  const goToNext = () => {
    const next = (currentImageIndex + 1) % heroImages.length;
    if (!loadedImages.has(next)) {
      setLoadedImages((p) => new Set(p).add(next));
    }
    setCurrentImageIndex(next);
  };

  return (
    <section className="relative min-h-screen flex flex-col">
      {/* Background Image Carousel - CSS-only transitions, no DOM reads */}
      {heroImages.map((image, index) => {
        if (!loadedImages.has(index) && index !== currentImageIndex) return null;
        return (
          <div
            key={index}
            aria-hidden={index !== currentImageIndex}
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              opacity: index === currentImageIndex ? 1 : 0,
              transition: "opacity 1s ease",
              willChange: index === currentImageIndex ? "opacity" : "auto",
              contain: "strict",
            }}
          >
            <div className="absolute inset-0 bg-black/40" />
          </div>
        );
      })}


      {/* Carousel Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
        aria-label="Imagen anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
        aria-label="Imagen siguiente"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Carousel Dot Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentImageIndex ? "bg-white" : "bg-white/50"
            }`}
            aria-label={`Ir a imagen ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="relative z-20 w-full">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <a href="#" className="flex items-center gap-2 text-white">
              <span className="text-xl font-bold">Mayte Pet Hotel</span>
            </a>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className="text-white hover:text-primary transition-colors font-medium"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <button
              className="md:hidden text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 bg-black/80 rounded-2xl p-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className="block py-3 text-white hover:text-primary transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-white text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Mayte Pet Hotel
            </h1>
            <p className="text-3xl md:text-4xl text-primary font-semibold">
              Cuidado como en Casa
            </p>
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
              Un espacio diseñado para que tu peludo se sienta tan amado como cuando está contigo
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
