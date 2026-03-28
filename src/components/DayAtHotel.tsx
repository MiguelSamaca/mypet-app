import { useState } from "react";

const VIDEO_ID = "ES3a9KXFhOs";
const THUMBNAIL_URL = `https://img.youtube.com/vi/${VIDEO_ID}/maxresdefault.jpg`;

const DayAtHotel = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="bg-background py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="mb-4">Así es un día en Mayte Pet Hotel</h2>
          <p className="text-lg text-foreground mb-8">
            Mira cómo disfrutan nuestros huéspedes peludos cada momento 🐾
          </p>

          <div className="relative w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl bg-card">
            <div className="aspect-[9/16]">
              {isPlaying ? (
                <iframe
                  src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1`}
                  title="Un día en Mayte Pet Hotel"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <button
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 w-full h-full cursor-pointer group"
                  aria-label="Reproducir video"
                >
                  <img
                    src={THUMBNAIL_URL}
                    alt="Un día en Mayte Pet Hotel - Reproducir video"
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  {/* YouTube-style play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-11 bg-[#FF0000] rounded-xl flex items-center justify-center group-hover:bg-[#CC0000] transition-colors shadow-lg">
                      <svg viewBox="0 0 24 24" className="w-7 h-7 text-white fill-current ml-1">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DayAtHotel;
