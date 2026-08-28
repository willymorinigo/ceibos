import { Outlet, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Lock } from "lucide-react";
import logoImage from "../assets/images/logo_h.svg";

export function Layout() {
  const [activeSection, setActiveSection] = useState("");
  const [hasAnnouncements, setHasAnnouncements] = useState(false);
  const [isWaMenuOpen, setIsWaMenuOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "announcements"), limit(1));
    const unsub = onSnapshot(q, (snapshot) => {
      setHasAnnouncements(!snapshot.empty);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["institucional", "propuesta", "anuncios", "galeria", "contacto"];
      const scrollPosition = window.scrollY + 120; // Offset for header

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
          setActiveSection(section);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getNavLinkClass = (section: string) => 
    `px-4 py-2 rounded-lg font-bold transition-all duration-200 active:scale-95 ${
      activeSection === section 
        ? "bg-[#22543d] text-white shadow-md" 
        : "text-[#777777] hover:text-[#22543d] hover:bg-green-50"
    }`;

  return (
    <div className="min-h-screen flex flex-col font-sans text-[#333333] bg-[#f9fafb]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
          <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2">
            <img src={logoImage} alt="Los Ceibos" className="h-20 object-contain" />
          </Link>
          
          <nav className="hidden md:flex items-center gap-2 text-base">
            <a href="#institucional" className={getNavLinkClass("institucional")}>Institucional</a>
            <a href="#propuesta" className={getNavLinkClass("propuesta")}>Propuesta</a>
            {hasAnnouncements && (
              <a href="#anuncios" className={getNavLinkClass("anuncios")}>Anuncios</a>
            )}
            <a href="#galeria" className={getNavLinkClass("galeria")}>Galería</a>
            <a href="#contacto" className={getNavLinkClass("contacto")}>Contacto</a>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <footer className="h-auto md:h-20 py-4 bg-white border-t border-gray-100 flex flex-col md:flex-row items-center justify-between px-8 text-[10px] text-[#777777] font-medium flex-shrink-0">
        <div className="flex items-center gap-4 mb-2 md:mb-0">
          <span>© {new Date().getFullYear()} Instituto Educativo Los Ceibos. Todos los derechos reservados.</span>
          <Link to="/admin" className="opacity-0 hover:opacity-100 p-2 text-gray-400 hover:text-[#333333] transition-all duration-300" aria-label="Acceso Admin">
            <Lock className="w-3 h-3" />
          </Link>
        </div>
        <div className="flex gap-4 items-center pr-0 md:pr-24">
          <a href="mailto:losceibosinstitucioneducativa@gmail.com" className="hover:text-[#22543d] transition-colors">
            Mail: losceibosinstitucioneducativa@gmail.com
          </a>
        </div>
      </footer>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {isWaMenuOpen && (
          <div className="flex flex-col gap-2 mb-1 animate-in slide-in-from-bottom-2 fade-in duration-200">
            <a
              href="https://wa.me/5492214288051?text=Hola!%20Me%20gustar%C3%ADa%20recibir%20m%C3%A1s%20informaci%C3%B3n%20sobre%20el%20nivel%20Jard%C3%ADn."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white px-4 py-2 rounded-lg shadow-lg text-sm font-bold text-[#22543d] border border-green-100 hover:bg-green-50 transition-colors flex items-center gap-2 whitespace-nowrap"
              onClick={() => setIsWaMenuOpen(false)}
            >
              🎨 Consulta Jardín
            </a>
            <a
              href="https://wa.me/5492216807128?text=Hola!%20Me%20gustar%C3%ADa%20recibir%20m%C3%A1s%20informaci%C3%B3n%20sobre%20el%20nivel%20Primaria."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white px-4 py-2 rounded-lg shadow-lg text-sm font-bold text-[#22543d] border border-green-100 hover:bg-green-50 transition-colors flex items-center gap-2 whitespace-nowrap"
              onClick={() => setIsWaMenuOpen(false)}
            >
              📚 Consulta Primaria
            </a>
          </div>
        )}
        {!isWaMenuOpen && (
          <div className="bg-white px-3 py-1 rounded shadow-lg text-[10px] font-bold text-[#22543d] border border-green-100">
            ¡Hola! Consultá por WhatsApp
          </div>
        )}
        <button
          onClick={() => setIsWaMenuOpen(!isWaMenuOpen)}
          className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform"
          aria-label="Contactar por WhatsApp"
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
