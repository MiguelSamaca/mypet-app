import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Día Hotel 24 h (1–3 días)",
    dailyPrice: "$55,000.00",
    monthlyPrice: "–",
    recommended: false,
  },
  {
    name: "Hotel 24h de 5–10 días",
    dailyPrice: "$47,000.00",
    monthlyPrice: "$470,000.00",
    recommended: false,
  },
  {
    name: "Hotel 24h de 11–15 días",
    dailyPrice: "$44,000.00",
    monthlyPrice: "$660,000.00",
    recommended: true,
  },
  {
    name: "Hotel 24h de 16–20 días",
    dailyPrice: "$40,000.00",
    monthlyPrice: "$800,000.00",
    recommended: false,
  },
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
                <thead>
                  <tr className="bg-primary/20">
                    <th className="px-6 py-4 text-left text-foreground font-semibold">Plan</th>
                    <th className="px-6 py-4 text-center text-foreground font-semibold">Día</th>
                    <th className="px-6 py-4 text-center text-foreground font-semibold">Mensual</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan, index) => (
                    <tr 
                      key={index} 
                      className={`border-b border-border last:border-b-0 ${
                        plan.recommended ? 'bg-success/20' : 'hover:bg-muted/20'
                      }`}
                    >
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <span className="text-foreground font-medium">{plan.name}</span>
                          {plan.recommended && (
                            <Badge className="bg-success text-success-foreground">
                              Plan recomendado
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center text-foreground font-medium">
                        {plan.dailyPrice}
                      </td>
                      <td className="px-6 py-6 text-center text-foreground font-medium">
                        {plan.monthlyPrice}
                      </td>
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
