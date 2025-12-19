import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-24 right-4 z-40 p-2 rounded-full bg-foreground/10 hover:bg-foreground/20 backdrop-blur-sm transition-all duration-300 opacity-60 hover:opacity-100"
      aria-label="Volver arriba"
    >
      <ChevronUp className="w-5 h-5 text-foreground/70" />
    </button>
  );
};

export default ScrollToTop;
