import gamesImage from "@/assets/games-interactive.jpg";
import socializationImage from "@/assets/socialization.jpg";
import sleepingImage from "@/assets/sleeping.jpg";

const features = [
  {
    title: "Juegos Interactivos",
    description: "Actividades físicas y mentales que estimulan su curiosidad y lo hacen pasar un día lleno de diversión, sacando sonrisas perrunas.",
    image: gamesImage,
  },
  {
    title: "Socialización con Amigos Cercanos",
    description: "No es un patio con muchos perros. Aquí seleccionamos compañeros tranquilos y compatibles. Amistades pequeñas, cercanas y bien cuidadas.",
    image: socializationImage,
  },
  {
    title: "Dormirá como en Casa",
    description: "Ya sea que duerma estirado como estrella de mar o enrollado como croissant, aquí encuentra su spot perfecto. Espacios suaves, cojines, sofás, camitas o cama de agua… elegirá su propio lugar favorito para descansar.",
    image: sleepingImage,
  },
];

const WhatTheyEnjoy = () => {
  return (
    <section className="bg-primary/10 py-12 md:py-16">
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
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-64 object-cover"
                />
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
