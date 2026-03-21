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

const Index = () => {
  return (
    <main className="min-h-screen">
      <Hero />
      <WhatWeDo />
      <WhatTheyEnjoy />
      <DayAtHotel />
      <Testimonials />
      <Facilities />
      <Caregivers />
      <Requirements />
      <Pricing />
      <Footer />
      <ScrollToTop />
      <WhatsAppButton />
      <LeadPopup />
    </main>
  );
};

export default Index;
