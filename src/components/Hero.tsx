import { useState } from "react";
import { Menu, X, Heart } from "lucide-react";
import heroImage from "@/assets/hero-dog.jpg";

const navLinks = [
  { label: "Qué hacemos", href: "#que-hacemos" },
  { label: "Servicios", href: "#servicios" },
  { label: "Testimonios", href: "#testimonios" },
  { label: "Instalaciones", href: "#instalaciones" },
  { label: "Equipo", href: "#equipo" },
];

const Hero = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <section className="relative min-h-screen flex flex-col">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 w-full">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="#" className="flex items-center gap-2 text-white">
              <Heart className="w-6 h-6 fill-white" />
              <span className="text-xl font-bold">Mayte Pet Hotel</span>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-white hover:text-primary transition-colors font-medium"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 bg-black/80 rounded-2xl p-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
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
