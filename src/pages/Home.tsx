import { useEffect, useState, useRef, useCallback } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { HeroSlider } from "../components/HeroSlider";
import { ContactForm } from "../components/ContactForm";
import { Reviews } from "../components/Reviews";
import { 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Heart, 
  Leaf, 
  Puzzle, 
  MonitorPlay, 
  PiggyBank, 
  Globe, 
  Dumbbell, 
  Palette, 
  GraduationCap, 
  X, 
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  ZoomIn
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import misionValoresVideo from "../assets/videos/mision_valores.mp4";

const staticGalleryImages = Object.values(import.meta.glob('../assets/images/galeria_*.jpg', { eager: true, import: 'default' })) as string[];

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: number;
  imageUrl?: string;
  isPopup?: boolean;
}

export function Home() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isVideoHovered, setIsVideoHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [activePopup, setActivePopup] = useState<Announcement | null>(null);

  // Gallery Lightbox State
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = useCallback(() => {
    setSelectedImageIndex(null);
    document.body.style.overflow = "unset";
  }, []);

  const nextImage = useCallback(() => {
    setSelectedImageIndex((prev) => {
      if (prev === null) return null;
      return (prev + 1) % staticGalleryImages.length;
    });
  }, []);

  const prevImage = useCallback(() => {
    setSelectedImageIndex((prev) => {
      if (prev === null) return null;
      return (prev - 1 + staticGalleryImages.length) % staticGalleryImages.length;
    });
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (selectedImageIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, closeLightbox, nextImage, prevImage]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const isSwipe = Math.abs(distance) > 40;
    if (isSwipe) {
      if (distance > 0) {
        nextImage(); // Swiped left -> next image
      } else {
        prevImage(); // Swiped right -> prev image
      }
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  useEffect(() => {
    const popup = announcements.find((a) => a.isPopup);
    if (popup && !sessionStorage.getItem("popupClosed_" + popup.id)) {
      setActivePopup(popup);
      setShowPopup(true);
    }
  }, [announcements]);

  const closePopup = () => {
    if (activePopup) {
      sessionStorage.setItem("popupClosed_" + activePopup.id, "true");
    }
    setShowPopup(false);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    const qAnnouncements = query(collection(db, "announcements"), orderBy("date", "desc"));
    const unsubAnnouncements = onSnapshot(qAnnouncements, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Announcement[];
      setAnnouncements(data);
    });

    return () => {
      unsubAnnouncements();
    };
  }, []);

  return (
    <div className="flex flex-col w-full relative">
      {showPopup && activePopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={closePopup}
              className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-sm transition-colors text-gray-700"
              aria-label="Cerrar ventana emergente"
            >
              <X className="w-5 h-5" />
            </button>
            {activePopup.imageUrl && (
              <div className="h-64 w-full bg-gray-100">
                <img src={activePopup.imageUrl} alt={activePopup.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-8">
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#22543d] uppercase mb-3 tracking-wider">
                <Calendar className="w-4 h-4" />
                {format(new Date(activePopup.date), "d MMM yyyy", { locale: es })}
              </div>
              <h3 className="text-[#333333] font-bold text-2xl mb-4">{activePopup.title}</h3>
              <div className="text-gray-600 text-sm leading-relaxed quill-content mb-6" dangerouslySetInnerHTML={{ __html: activePopup.content }} />
              <a 
                href={`https://wa.me/5492214288051?text=Hola!%20Me%20gustaría%20consultar%20sobre:%20${encodeURIComponent(activePopup.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#22543d] hover:bg-[#183c2b] text-white text-sm font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      <HeroSlider />

      {/* Institucional Section */}
      <section id="institucional" className="py-20 bg-[#f9fafb] scroll-mt-28">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-[#22543d] font-bold uppercase tracking-wider text-2xl mb-6 border-l-4 border-[#9b1c1c] pl-3">Nuestro Colegio</h2>
            <div className="space-y-6 text-[#333333] leading-relaxed text-sm">
              <p className="italic text-gray-600 font-medium text-base border-l-2 border-gray-200 pl-4">
                "¿Buscas un lugar donde tus hijos aprendan, se diviertan y se preparen de verdad para el futuro?"
              </p>
              
              <div className="space-y-4">
                <h3 className="font-bold text-[#333333] uppercase text-xs tracking-wider">Una propuesta única en La Plata</h3>
                <p className="text-gray-600">
                  Te damos la bienvenida al Colegio de Los Ceibos. Ofrecemos una propuesta educativa de vanguardia con <strong>Nivel Inicial y Primario en Jornada Doble Turno</strong>. Acompañamos los primeros pasos con amor y respeto, trabajando en conjunto con las familias.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-[#333333] uppercase text-xs tracking-wider">Crecimiento Continuo</h3>
                <p className="text-gray-600">
                  Estamos en constante evolución para seguir acompañando el desarrollo de nuestros alumnos: <strong>¡En el año 2028 ya contaremos con el Nivel Secundario!</strong>
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-[#333333] uppercase text-xs tracking-wider">Orientación Deportiva</h3>
                <ul className="space-y-3 text-xs text-gray-600 font-medium">
                  <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-[#9b1c1c] rounded-full flex-shrink-0"></span> Clases diarias de deportes.</li>
                  <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-[#22543d] rounded-full flex-shrink-0"></span> Gimnasio propio equipado.</li>
                  <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-[#9b1c1c] rounded-full flex-shrink-0"></span> Amplio campo de deportes.</li>
                  <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-[#22543d] rounded-full flex-shrink-0"></span> Salidas educativas constantes.</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="relative flex justify-center">
            <div 
              className="aspect-[4/5] max-w-sm w-full rounded overflow-hidden shadow-sm border border-gray-100 relative group"
              onMouseEnter={() => setIsVideoHovered(true)}
              onMouseLeave={() => setIsVideoHovered(false)}
            >
              <video 
                ref={videoRef}
                src={misionValoresVideo}
                autoPlay 
                muted={isMuted}
                loop 
                playsInline
                className="w-full h-full object-cover"
              />
              <div 
                className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full transition-opacity duration-300 ${isVideoHovered ? 'opacity-100' : 'opacity-0'}`}
              >
                <button 
                  onClick={togglePlay} 
                  className="text-white hover:text-green-300 transition-colors"
                  aria-label={isPlaying ? "Pausar" : "Reproducir"}
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                </button>
                <button 
                  onClick={toggleMute} 
                  className="text-white hover:text-green-300 transition-colors"
                  aria-label={isMuted ? "Activar sonido" : "Silenciar"}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Propuesta Educativa Section */}
      <section id="propuesta" className="py-20 bg-white scroll-mt-28">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-12 text-center">
            <h2 className="text-[#22543d] font-bold uppercase tracking-wider text-2xl mb-4 inline-block border-b-2 border-[#9b1c1c] pb-1">Desarrollo Integral</h2>
            <p className="text-xl md:text-2xl text-gray-800 font-bold max-w-2xl mx-auto">
              Potenciamos su crecimiento desde el primer día
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-[#f9fafb] p-8 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
              <Heart className="w-10 h-10 text-[#9b1c1c] mb-4" />
              <h3 className="font-bold text-[#333333] mb-3">Taller de Emociones</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Nuestros alumnos aprenden a conocerse, fortaleciendo su bienestar emocional y el respeto mutuo desde pequeños.
              </p>
            </div>
            
            <div className="bg-[#f9fafb] p-8 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
              <Globe className="w-10 h-10 text-[#22543d] mb-4" />
              <h3 className="font-bold text-[#333333] mb-3">Idiomas</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Les abrimos las puertas al mundo logrando un sólido nivel de <strong>Inglés</strong> con clases diarias, sumado a clases de <strong>Portugués</strong> para dominar más de un idioma de forma natural.
              </p>
            </div>

            <div className="bg-[#f9fafb] p-8 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
              <MonitorPlay className="w-10 h-10 text-[#9b1c1c] mb-4" />
              <h3 className="font-bold text-[#333333] mb-3">Habilidades para el Futuro</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Desarrollan habilidades claves a través de <strong>Educación Digital</strong>, y aprenden el valor de planificar desde chicos con <strong>Educación Financiera</strong>.
              </p>
            </div>

            <div className="bg-[#f9fafb] p-8 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
              <Leaf className="w-10 h-10 text-[#22543d] mb-4" />
              <h3 className="font-bold text-[#333333] mb-3">Naturaleza y Movimiento</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Conectan con la naturaleza en nuestro campo. Además estimulan su cuerpo con yoga y gimnasia artística.
              </p>
            </div>

            <div className="bg-[#f9fafb] p-8 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
              <Palette className="w-10 h-10 text-[#9b1c1c] mb-4" />
              <h3 className="font-bold text-[#333333] mb-3">Arte y Expresión</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Fomentamos su creatividad y autoexpresión mediante clases de <strong>teatro y música</strong>, piezas fundamentales de nuestra educación integral.
              </p>
            </div>

            <div className="bg-[#f9fafb] p-8 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
              <Puzzle className="w-10 h-10 text-[#22543d] mb-4" />
              <h3 className="font-bold text-[#333333] mb-3">Desafío Intelectual</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Desafían su mente con <strong>ajedrez</strong> y participan en constantes salidas educativas que transforman el aprendizaje en una verdadera aventura.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements */}
      {announcements.length > 0 && (
        <section id="anuncios" className="py-20 bg-white border-y border-gray-100 scroll-mt-28">
          <div className="max-w-7xl mx-auto px-8">
            <div className="mb-12">
              <h2 className="text-[#22543d] font-bold uppercase tracking-wider text-2xl mb-4 border-l-4 border-[#22543d] pl-3">Anuncios Semanales</h2>
              <p className="text-sm text-gray-600">Novedades e información importante para nuestra comunidad.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                  {announcement.imageUrl && (
                    <div className="h-40 overflow-hidden bg-gray-100">
                      <img src={announcement.imageUrl} alt={announcement.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#777777] uppercase mb-3 tracking-wider">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(announcement.date), "d MMM yyyy", { locale: es })}
                    </div>
                    <h3 className="text-[#333333] font-bold text-base mb-2">{announcement.title}</h3>
                    <div className="text-gray-600 text-xs flex-1 leading-relaxed quill-content line-clamp-4 mb-4" dangerouslySetInnerHTML={{ __html: announcement.content }} />
                    <a 
                      href={`https://wa.me/5492214288051?text=Hola!%20Me%20gustaría%20consultar%20sobre:%20${encodeURIComponent(announcement.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto bg-[#22543d] hover:bg-[#183c2b] text-white text-xs font-bold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Consultar por WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      <section id="galeria" className="py-20 bg-[#f9fafb] scroll-mt-28">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-12">
            <h2 className="text-[#22543d] font-bold uppercase tracking-wider text-2xl mb-4 border-l-4 border-[#9b1c1c] pl-3">Galería de Imágenes</h2>
            <p className="text-sm text-gray-600">Un recorrido visual por las actividades de nuestros alumnos. Tocá cualquier foto para ampliar.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {staticGalleryImages.map((src, idx) => (
              <button 
                key={`static-${idx}`} 
                onClick={() => openLightbox(idx)}
                aria-label={`Ver foto ${idx + 1} ampliada`}
                className="aspect-square rounded-xl overflow-hidden group relative bg-gray-100 border border-gray-200 shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-[#22543d] transition-all"
              >
                <img 
                  src={src} 
                  alt={`Galería foto ${idx + 1}`} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" 
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-white/90 text-gray-800 p-2.5 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <ZoomIn className="w-5 h-5" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Lightbox Modal with Infinite Loop Navigation */}
      {selectedImageIndex !== null && (
        <div 
          className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-lg flex flex-col items-center justify-between p-3 md:p-6 animate-in fade-in duration-200 select-none touch-none"
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Bar: Counter & Close Button */}
          <div 
            className="w-full max-w-6xl flex items-center justify-between z-20 pt-1 px-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white/15 backdrop-blur-md text-white text-xs md:text-sm font-semibold px-4 py-1.5 rounded-full border border-white/20 shadow-sm">
              Foto {selectedImageIndex + 1} de {staticGalleryImages.length}
            </div>

            <button 
              onClick={closeLightbox}
              className="bg-white/20 hover:bg-white/30 text-white p-2.5 rounded-full transition-all duration-200 border border-white/20 shadow-lg active:scale-95"
              aria-label="Cerrar galería ampliada"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Center Display: Previous Button, Active Image, Next Button */}
          <div className="relative w-full flex-1 flex items-center justify-center px-1 md:px-12 my-auto">
            {/* Prev Button (Looping) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-2 md:left-6 z-20 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-sm border border-white/10 shadow-xl transition-all active:scale-90 hover:scale-105"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
            </button>

            {/* Main Image */}
            <div 
              className="relative max-w-5xl max-h-[75vh] md:max-h-[80vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                key={selectedImageIndex}
                src={staticGalleryImages[selectedImageIndex]} 
                alt={`Galería foto ampliada ${selectedImageIndex + 1}`} 
                className="max-h-[75vh] md:max-h-[80vh] max-w-[90vw] md:max-w-4xl w-auto h-auto object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
              />
            </div>

            {/* Next Button (Looping) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-2 md:right-6 z-20 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-sm border border-white/10 shadow-xl transition-all active:scale-90 hover:scale-105"
              aria-label="Foto siguiente"
            >
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
            </button>
          </div>

          {/* Bottom Bar: Thumbnails preview & Hints */}
          <div 
            className="w-full max-w-3xl flex flex-col items-center gap-2 z-20 pb-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full px-4 py-1.5 scrollbar-none">
              {staticGalleryImages.map((thumbSrc, idx) => (
                <button
                  key={`thumb-${idx}`}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    selectedImageIndex === idx 
                      ? "border-emerald-400 scale-110 shadow-md ring-2 ring-emerald-400/40" 
                      : "border-white/30 opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`Ir a la foto ${idx + 1}`}
                >
                  <img src={thumbSrc} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 hidden md:block">
              Navegá con las flechas del teclado (← / →) o en loop con los botones · Tocá afuera o presiona Esc para cerrar
            </p>
          </div>
        </div>
      )}

      <Reviews />
      
      <ContactForm />

      {/* Location Map */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-8">
          <div className="bg-[#f3f4f6] rounded flex flex-col md:flex-row items-center p-6 gap-6 shadow-sm border border-gray-100">
            <div className="w-full md:w-1/2 h-64 md:h-48 rounded overflow-hidden relative border border-gray-200">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3271.748293976451!2d-57.93260242337671!3d-34.92346697284144!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95a2e99a21c57349%3A0x6312343737034d07!2sLos%20Ceibos%20-%20Jard%C3%ADn%20de%20Infantes%20y%20nivel%20primario!5e0!3m2!1sen!2sar!4v1714152000000!5m2!1sen!2sar" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 grayscale hover:grayscale-0 transition-all duration-700"
                title="Ubicación Los Ceibos"
              ></iframe>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-[#333333] font-bold mb-2 text-lg">Ubicación y Contacto</h3>
              <p className="text-sm text-gray-500 mb-2">C. 67 425, B1900 La Plata, Provincia de Buenos Aires</p>
              <p className="text-sm text-gray-600 font-medium mb-4">losceibosinstitucioneducativa@gmail.com</p>
              <a href="https://wa.me/5492216457046" target="_blank" rel="noopener noreferrer" className="inline-block bg-[#22543d] text-white px-6 py-2 rounded text-xs font-bold uppercase tracking-wider hover:bg-[#1a3a2a] transition-colors">
                Contactar Ahora
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
