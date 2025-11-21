import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-dog.jpg";

const Hero = () => {
  return (
    <section className="bg-background min-h-[80vh] flex items-center">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-6 text-center md:text-left">
            <h1 className="text-foreground">Hotel Pet Care</h1>
            <p className="text-2xl md:text-3xl text-primary font-medium">
              Cuidado como en Casa
            </p>
            <p className="text-lg text-foreground max-w-lg mx-auto md:mx-0">
              Un espacio diseñado para que tu peludo se sienta tan amado como cuando está contigo
            </p>
          </div>
          <div className="relative">
            <img
              src={heroImage}
              alt="Perro feliz descansando en un sofá acogedor"
              className="rounded-3xl shadow-2xl w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
