import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const ThemeToggle = () => {
  const [isVibrant, setIsVibrant] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isVibrant) {
      root.classList.add('theme-vibrant');
    } else {
      root.classList.remove('theme-vibrant');
    }
  }, [isVibrant]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={() => setIsVibrant(!isVibrant)}
        size="lg"
        className="shadow-xl flex items-center gap-2"
      >
        <Palette className="w-5 h-5" />
        {isVibrant ? "Paleta Original" : "Paleta Vibrante"}
      </Button>
    </div>
  );
};

export default ThemeToggle;
