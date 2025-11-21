import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check } from "lucide-react";

const requirements = [
  "Comida porcionada",
  "Carnet de vacunas (incluye Tos de la Perrera)",
  "Medicamentos (si los necesita)",
  "Collar con placa",
  "Correa o arnés",
  "Juguete favorito (opcional)",
  "Capa o protección para la lluvia (opcional)",
];

const additionalInfo = [
  "Diligenciar el formulario de ingreso",
  "Entrevista previa: conocerás las instalaciones, la manada y evaluaremos el comportamiento de tu peludo",
  "Foto del carnet de vacunas al día (incluida tos de la perrera)",
  "Antipulgas y desparasitación reciente",
  "No se reciben perritas en celo",
  "No podremos recibir perritos con síntomas como tos, diarrea o vómito por seguridad",
  "Se recomienda traer una cobija o prenda con olor familiar (sobre todo si son varios días)",
];

const Requirements = () => {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="requirements" className="border border-border rounded-2xl overflow-hidden">
              <AccordionTrigger className="bg-primary/20 hover:bg-primary/30 px-6 py-4 text-lg font-semibold">
                Requisitos para la estancia
              </AccordionTrigger>
              <AccordionContent className="bg-card px-6 py-6">
                <ul className="space-y-3">
                  {requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <span className="text-foreground">{req}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-center text-muted-foreground italic">
                  Esto nos permite cuidarlo como se merece 💖
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="additional-info" className="border border-border rounded-2xl overflow-hidden">
              <AccordionTrigger className="bg-primary/20 hover:bg-primary/30 px-6 py-4 text-lg font-semibold">
                Información adicional
              </AccordionTrigger>
              <AccordionContent className="bg-card px-6 py-6">
                <ul className="space-y-3">
                  {additionalInfo.map((info, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <span className="text-foreground">{info}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default Requirements;
