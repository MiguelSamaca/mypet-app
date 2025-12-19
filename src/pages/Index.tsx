import Hero from "@/components/Hero";
import WhatWeDo from "@/components/WhatWeDo";
import WhatTheyEnjoy from "@/components/WhatTheyEnjoy";
import Testimonials from "@/components/Testimonials";
import Facilities from "@/components/Facilities";
import Caregivers from "@/components/Caregivers";
import Requirements from "@/components/Requirements";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import WhatsAppButton from "@/components/WhatsAppButton";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Hero />
      <WhatWeDo />
      <WhatTheyEnjoy />
      <Testimonials />
      <Facilities />
      <Caregivers />
      <Requirements />
      <Pricing />
      <Footer />
      <ScrollToTop />
      <WhatsAppButton />
    </main>
  );
};

export default Index;
