import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-dog.jpg";

const Hero = () => {
  return (
    <section className="bg-background min-h-[90vh] flex items-center">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-6 text-center md:text-left">
            <h1 className="text-foreground">Hotel Pet Care</h1>
            <p className="text-2xl md:text-3xl text-primary font-medium">
              Cuidado como en Casa
            </p>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto md:mx-0">
              Un espacio diseñado para que tu peludo se sienta tan amado como cuando está contigo
            </p>
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-lg font-semibold shadow-lg"
            >
              Reserva tu entrevista
            </Button>
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
