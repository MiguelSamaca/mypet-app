import Hero from "@/components/Hero";
import WhatWeDo from "@/components/WhatWeDo";
import WhatTheyEnjoy from "@/components/WhatTheyEnjoy";
import DayAtHotel from "@/components/DayAtHotel";
import Testimonials from "@/components/Testimonials";
import Facilities from "@/components/Facilities";
import Caregivers from "@/components/Caregivers";
import Requirements from "@/components/Requirements";
import Pricing from "@/components/Pricing";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import WhatsAppButton from "@/components/WhatsAppButton";
import LeadPopup from "@/components/LeadPopup";
import Seo from "@/components/Seo";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Seo
        title="Mayte Pet Hotel - Hotel canino en Bogotá, cuidado como en casa"
        description="Hotel canino en Bogotá con atención personalizada 24/7. Tu peludo disfruta un espacio cálido, seguro y amoroso mientras estás fuera."
        path="/"
      />
      <Hero />
      <WhatWeDo />
      <WhatTheyEnjoy />
      <DayAtHotel />
      <Testimonials />
      <Facilities />
      <Caregivers />
      <Requirements />
      <Pricing />
      <Newsletter />
      <Footer />
      <ScrollToTop />
      <WhatsAppButton />
      <LeadPopup />
    </main>
  );
};

export default Index;
