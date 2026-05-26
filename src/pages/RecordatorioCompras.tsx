import { useEffect } from "react";
import RepurchaseForm from "@/components/RepurchaseForm";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import WhatsAppButton from "@/components/WhatsAppButton";
import Seo from "@/components/Seo";

const RecordatorioCompras = () => {
  useEffect(() => {
    // scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="min-h-screen">
      <Seo
        title="Recordatorio de recompra de alimento | Mayte Pet Hotel"
        description="Registra tu compra y recibe un recordatorio antes de que se acabe el alimento de tu mascota. Servicio gratuito de Mayte Pet Hotel."
        path="/recordatorio-compras"
      />
      <RepurchaseForm />
      <Footer />
      <ScrollToTop />
      <WhatsAppButton />
    </main>
  );
};

export default RecordatorioCompras;
