import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "María González",
    text: "Mi perrita volvió súper feliz. Se nota que la cuidaron con mucho amor. ¡Definitivamente volveremos!",
  },
  {
    name: "Carlos Ramírez",
    text: "Excelente atención. Me mandaban fotos todos los días y mi peludo estaba súper relajado cuando lo recogí.",
  },
  {
    name: "Ana Sofía Torres",
    text: "El mejor hotel canino que he encontrado. Mi perro es ansioso y aquí lo trataron con paciencia y cariño.",
  },
];

const Testimonials = () => {
  return (
    <section id="testimonios" className="bg-background py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center mb-12">Testimonios</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow relative"
              >
                <Quote className="w-12 h-12 text-primary/40 mb-4" />
                <p className="text-foreground leading-relaxed mb-6 italic">
                  "{testimonial.text}"
                </p>
                <p className="text-foreground font-semibold">— {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
