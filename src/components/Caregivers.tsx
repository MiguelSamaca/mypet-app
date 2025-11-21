import { Heart, Shield, Brain, Users } from "lucide-react";
import caregiverImage from "@/assets/caregiver.jpg";

const qualities = [
  { icon: Heart, text: "Amor absoluto por los animales" },
  { icon: Shield, text: "Conocimiento en primeros auxilios" },
  { icon: Brain, text: "Técnicas de adiestramiento positivo" },
  { icon: Users, text: "Cuidado 100% personalizado y respetuoso" },
];

const Caregivers = () => {
  return (
    <section className="bg-background py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center mb-12">¿Quién los cuidará?</h2>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            <div className="relative">
              <img
                src={caregiverImage}
                alt="Cuidadora profesional con perro"
                className="rounded-3xl shadow-2xl w-full h-auto object-cover"
              />
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
