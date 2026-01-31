import { Button } from "@/components/ui/button";

const hotelPlans = [
  { name: "Día Hotel 24 h (1 - 3 Días)", hotel: "$60,000.00", manada: "$108,000.00" },
  { name: "Hotel 24h de 5-10 Días", hotel: "$54,000.00", manada: "$97,200.00" },
  { name: "Hotel 24h de 11-15 Días", hotel: "$48,000.00", manada: "$86,400.00" },
  { name: "Hotel 24h de 16-20 Días", hotel: "$42,000.00", manada: "$75,600.00" },
];

const dayCarePlans = [
  { name: "Cuidado por hora (1 a 5 horas)", hotel: "$8,000.00", manada: "$14,400.00" },
  { name: "Pasadía hora (6 a 10 horas)", hotel: "$44,000.00", manada: "$79,200.00" },
  { name: "Día Hotel 24 h (1-3 Días)", hotel: "$60,000.00", manada: "$108,000.00" },
];

const monthlyPlans = [
  { name: "DAY CARE 2 Días por semana (8 al mes)", hotel: "$334,400.00", manada: "$601,920.00" },
  { name: "DAY CARE 3 Días por semana (12 al mes)", hotel: "$475,200.00", manada: "$855,360.00" },
];

const Pricing = () => {
  return (
    <section className="bg-secondary py-12 md:py-16 theme-vibrant:bg-[hsl(var(--section-bg-vibrant))]">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center mb-4">Planes y tarifas del Hotel</h2>
          <p className="text-center text-xl text-foreground mb-12">
            Incluye 1 paseo al día y/o cuidado especial
          </p>

          <div className="bg-card rounded-3xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Header */}
                <thead>
                  <tr className="bg-primary/20">
                    <th className="px-6 py-4 text-left text-foreground font-semibold"></th>
                    <th className="px-6 py-4 text-center text-foreground font-semibold">HOTEL</th>
                    <th className="px-6 py-4 text-center text-foreground font-semibold">
                      PLAN MANADA 🐶🐶
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* DÍA Section */}
                  <tr className="bg-muted/30">
                    <td colSpan={3} className="px-6 py-3 text-center font-semibold text-foreground">
                      DÍA
                    </td>
                  </tr>
                  {hotelPlans.map((plan, index) => (
                    <tr 
                      key={`hotel-${index}`} 
                      className="border-b border-border last:border-b-0 hover:bg-muted/20"
                    >
                      <td className="px-6 py-4 text-foreground">{plan.name}</td>
                      <td className="px-6 py-4 text-center text-foreground font-medium">{plan.hotel}</td>
                      <td className="px-6 py-4 text-center text-foreground font-medium">{plan.manada}</td>
                    </tr>
                  ))}

                  {/* DAY CARE Section */}
                  <tr className="bg-muted/30">
                    <td colSpan={3} className="px-6 py-3 text-center font-semibold text-foreground">
                      DAY CARE
                    </td>
                  </tr>
                  {dayCarePlans.map((plan, index) => (
                    <tr 
                      key={`daycare-${index}`} 
                      className="border-b border-border last:border-b-0 hover:bg-muted/20"
                    >
                      <td className="px-6 py-4 text-foreground">{plan.name}</td>
                      <td className="px-6 py-4 text-center text-foreground font-medium">{plan.hotel}</td>
                      <td className="px-6 py-4 text-center text-foreground font-medium">{plan.manada}</td>
                    </tr>
                  ))}

                  {/* MENSUALIDAD Section */}
                  <tr className="bg-muted/30">
                    <td colSpan={3} className="px-6 py-3 text-center font-semibold text-foreground">
                      MENSUALIDAD
                    </td>
                  </tr>
                  {monthlyPlans.map((plan, index) => (
                    <tr 
                      key={`monthly-${index}`} 
                      className="border-b border-border last:border-b-0 hover:bg-muted/20"
                    >
                      <td className="px-6 py-4 text-foreground">{plan.name}</td>
                      <td className="px-6 py-4 text-center text-foreground font-medium">{plan.hotel}</td>
                      <td className="px-6 py-4 text-center text-foreground font-medium">{plan.manada}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-8 text-center">
              <a 
                href="https://api.whatsapp.com/send?phone=573154148380&text=Hola%20%F0%9F%90%B6!%0A%0AMe%20gustar%C3%ADa%20conocer%20m%C3%A1s%20del%20Hotel%F0%9F%90%95%E2%80%8D%F0%9F%A6%BA%F0%9F%A6%AE%F0%9F%8F%A9%0A%0APor%20favor%20me%20das%20informaci%C3%B3n%F0%9F%9B%8F%EF%B8%8F%F0%9F%90%95"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button 
                  size="lg" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-lg font-semibold shadow-lg"
                >
                  Quiero reservar este plan
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
