import sleepingImage from "@/assets/sleeping.jpg";
import sunbathingImage from "@/assets/sunbathing.jpg";
import ballPitImage from "@/assets/ball-pit.jpg";
import photoSpotImage from "@/assets/photo-spot.jpg";
import walkingImage from "@/assets/walking.jpg";

const facilities = [
  {
    title: "Lugar para descansar",
    description: "Camitas cómodas, mantitas suaves y un espacio acogedor donde puede dormir profundamente. Un rincón donde el sueño le llega solito.",
    image: sleepingImage,
  },
  {
    title: "Baño de Sol",
    description: "Un rincón favorito donde muchos perritos se recuestan a 'broncearse', cerrar los ojos y disfrutar el calorcito.",
    image: sunbathingImage,
  },
  {
    title: "Diversión sin límites — Piscina de Pelotas",
    description: "Sí, como niños: se tiran, buscan juguetes, y vuelven a tirarse.",
    image: ballPitImage,
  },
  {
    title: "Spot de Foto",
    description: "Un espacio iluminado y acogedor para que tu peludo sea el protagonista de fotos hermosas. Porque tu peludo siempre tiene un lado bueno… ¡y nosotros sabemos capturarlo!",
    image: photoSpotImage,
  },
  {
    title: "Paseo sin presión",
    description: "Caminatas a su ritmo, sin manada, sin estrés, solo ellos disfrutando como debe ser.",
    image: walkingImage,
  },
];

const Facilities = () => {
  return (
    <section id="instalaciones" className="bg-secondary py-12 md:py-16 theme-vibrant:bg-[hsl(var(--section-bg-vibrant))]">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center mb-12">¿Dónde estará tu peludo?</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facilities.map((facility, index) => (
              <div 
                key={index} 
                className="bg-card rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border-b-4 border-primary/20"
              >
                <img
                  src={facility.image}
                  alt={facility.title}
                  className="w-full h-56 object-cover"
                />
                <div className="p-6 space-y-3">
                  <h3 className="text-foreground text-lg">{facility.title}</h3>
                  <p className="text-foreground leading-relaxed">
                    {facility.description}
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

export default Facilities;
