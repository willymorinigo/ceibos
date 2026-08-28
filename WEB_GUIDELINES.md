# Guía Base de Arquitectura y Funcionalidad para Proyectos Web

Este documento recopila las mejores prácticas, directrices de estructura y requisitos funcionales establecidos para garantizar el desarrollo de sitios web modernos, escalables y sin errores de compatibilidad. Sirve como plantilla o *prompt base* para futuros desarrollos.

---

## 1. Gestión de Recursos Multimedia (Assets)
**Regla de oro:** Vite debe ser el único responsable de procesar y generar las URLs finales de todos los assets para garantizar compatibilidad en cualquier entorno (Vercel, Hostinger, subcarpetas, etc.).

*   **Ubicación:** Todas las imágenes, videos, íconos y recursos que formen parte de la interfaz deben almacenarse estrictamente dentro de `src/assets/`.
    *   `src/assets/images/`
    *   `src/assets/videos/`
    *   `src/assets/icons/`
*   **Prohibiciones:** 
    *   NO usar el directorio `public/` para imágenes o videos consumidos por componentes React (reservar `public/` solo para el `favicon` o archivos estáticos ajenos al bundle).
    *   NO utilizar rutas absolutas en texto (ej. `/images/foto.jpg` o `/media/video.mp4`).
    *   NO utilizar URLs externas arbitrarias ni sistemas de fallback con múltiples rutas.
*   **Implementación en Código:** Los componentes React **deben** importar los assets de forma relativa directa.
    *   *Ejemplo individual:* `import heroImage from '../assets/images/hero.jpg';`
    *   *Ejemplo dinámico (Múltiples archivos):* Utilizar la importación dinámica de Vite: `const images = Object.values(import.meta.glob('../assets/images/*.jpg', { eager: true, import: 'default' }));`

## 2. Navegación UX y Comportamiento de Anclas
*   **Cabeceras Fijas (Sticky Headers):** Cuando se utilice un menú de navegación fijo en la parte superior, todas las secciones (etiquetas `<section>`) que funcionen como ancla (`id="seccion"`) deben tener un margen de desplazamiento interno.
    *   *Implementación (Tailwind):* Usar clases como `scroll-mt-24` o `scroll-mt-28` en las secciones para evitar que la cabecera "pise" u oculte los títulos al hacer scroll automático.
*   **Títulos y Jerarquía Visual:** Los títulos de las secciones principales deben tener un tamaño prominente (ej. `text-2xl` o superior) e indicadores visuales (como bordes laterales de color o subrayados) para facilitar el escaneo visual del usuario.

## 3. Panel de Administración y Seguridad
*   **Acceso Sutil (Easter Egg):** El enlace de acceso al panel de control/administración no debe ser ruidoso ni ensuciar la interfaz pública.
    *   *Implementación:* Ubicarlo en el pie de página (footer) como un ícono discreto (ej. un candado) que solo se hace visible (`opacity-100`) cuando el usuario pasa el cursor por encima del área exacta (`hover`).
*   **Pantalla de Login:** La pantalla de autenticación para el administrador debe mantener la identidad visual de la marca (incluyendo el logotipo centrado) y dar feedback claro en caso de error.

## 4. Edición de Contenido (Rich Text)
*   **Editor Moderno:** Para campos de texto donde el administrador deba dar formato (negritas, cursivas, listas, enlaces), **NO utilizar librerías obsoletas** como `react-quill` (que presentan incompatibilidades con React 19).
*   **Estándar adoptado:** Utilizar **Tiptap** (Headless Editor). Permite construir una barra de herramientas totalmente personalizada con iconos modernos (ej. `lucide-react`), es altamente estable y 100% compatible con las últimas versiones de React.

## 5. Diseño UI y Estilos
*   **Iconografía:** Utilizar siempre librerías consistentes y modernas, preferentemente `lucide-react`.
*   **Animaciones:** Utilizar transiciones suaves para el *hover* de botones e imágenes (ej. escalas sutiles `hover:scale-105 duration-700` en galerías).
*   **Responsive Design:** Garantizar que los componentes de navegación y visualización de recursos (sliders, grillas de galería) se adapten usando el esquema Mobile-First de Tailwind (`md:`, `lg:`).

## 6. Experiencia Móvil Tipo App y Header con Reducción en Scroll
*   **Header con Reducción en Scroll:**
    *   La cabecera superior debe contraerse suavemente al hacer scroll hacia abajo (`isScrolled`), reduciendo la altura (`h-24` -> `h-16`) y la escala del logo para maximizar el área de lectura sin perder el acceso a la navegación.
*   **Barra de Navegación Inferior (Mobile Bottom Navigation Bar):**
    *   En dispositivos móviles (`md:hidden`), implementar una barra inferior fija (`fixed bottom-0 left-0 right-0`) estilo App nativa con fondo traslúcido (`bg-white/95 backdrop-blur-lg`).
    *   Incluir accesos directos con iconos claros (Colegio, Propuesta, Anuncios con indicador de actividad, Galería y WhatsApp/Contacto).
    *   Acompañar con un Bottom Sheet / Menú inferior deslizable para acciones rápidas de contacto directo (Jardín, Primaria, Ubicación y Formulario).

