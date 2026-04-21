import { useEffect } from "react";
import RepurchaseForm from "@/components/RepurchaseForm";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import WhatsAppButton from "@/components/WhatsAppButton";

const RecordatorioCompras = () => {
  useEffect(() => {
    document.title = "Recordatorio de recompra | Mayte Pet Hotel";
    const desc =
      "Registra tu compra y recibe un recordatorio antes de que se acabe el producto de tu mascota.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/recordatorio-compras`);
  }, []);

  return (
    <main className="min-h-screen">
      <RepurchaseForm />
      <Footer />
      <ScrollToTop />
      <WhatsAppButton />
    </main>
  );
};

export default RecordatorioCompras;
