import { Heart, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-primary to-primary/80 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 fill-white" />
              <h3 className="text-2xl font-bold">Mayte Pet Hotel</h3>
            </div>
            <p className="text-white/90">
              Cuidado como en Casa
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contacto</h4>
            <div className="space-y-3">
              <a href="tel:+573154148380" className="flex items-center gap-3 text-white/90 hover:text-white transition-colors">
                <Phone className="w-5 h-5" />
                <span>315 4148380</span>
              </a>
              <div className="flex items-start gap-3 text-white/90">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-1" />
                <span>Bogotá, Colombia</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Horario</h4>
            <div className="text-white/90 space-y-2">
              <p>Lunes a Domingo</p>
              <p className="font-semibold">Atención 24/7</p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/20 text-center text-white/80">
          <p>&copy; 2025 Mayte Pet Hotel. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
