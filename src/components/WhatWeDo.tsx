import { Heart, Bone, PawPrint, Stethoscope, Home, Clock } from "lucide-react";

const benefits = [
  { icon: Heart, text: "Nos adaptamos a las necesidades de tu peludo" },
  { icon: Bone, text: "Podemos cocinar su comida como la prefiere" },
  { icon: PawPrint, text: "Caminatas según su edad y energía (paso suave, moderado o aventurero)" },
  { icon: Stethoscope, text: "Cuidado de salud personalizado" },
  { icon: Home, text: "Espacios cómodos, cálidos y familiares" },
  { icon: Clock, text: "Acompañamiento constante 24/7" },
];

const WhatWeDo = () => {
  return (
    <section id="que-hacemos" className="bg-background py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center mb-4">¿Qué hacemos?</h2>
          <h3 className="text-center text-primary mb-8">
            Cuidado y atención Personalizada
          </h3>

          <div className="mb-12">
            <p className="text-lg leading-relaxed text-foreground text-center max-w-4xl mx-auto">
              En el Hotel Pet Care tu peludo llega a un espacio diseñado para que se sienta 
              tan amado como cuando está contigo. Nos adaptamos a sus gustos, rutinas y 
              energía para que ni note que te fuiste. Aquí cada perrito recibe cuidado uno 
              a uno, con atención real, humana y amorosa.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div 
                    key={index} 
                    className="flex items-start gap-4 bg-secondary/50 p-4 rounded-2xl hover:shadow-md transition-shadow"
                  >
                    <div className="bg-primary rounded-full p-3 flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <p className="text-foreground pt-2">{benefit.text}</p>
                  </div>
                );
              })}
          </div>

          <div className="bg-secondary rounded-3xl p-8 text-center shadow-lg">
            <p className="text-xl font-medium text-foreground">
              En resumen: Nos ajustamos a su rutina para que tu peludo no sienta tu ausencia 💖
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatWeDo;
