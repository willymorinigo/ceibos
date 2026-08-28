import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot, writeBatch } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../lib/firebase";
import { LogOut, Trash2, Edit2, Image as ImageIcon, MessageSquare, Plus, Upload, ArrowLeft, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { TiptapEditor } from "../components/TiptapEditor";
import logoImage from "../assets/images/logo_h.svg";

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  // Forms
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [announcementImage, setAnnouncementImage] = useState("");
  const [announcementFile, setAnnouncementFile] = useState<File | null>(null);
  const [announcementIsPopup, setAnnouncementIsPopup] = useState(false);
  const [uploadingA, setUploadingA] = useState(false);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);

  // Data
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    // Only load if authenticated
    if (!isAuthenticated) return;
    
    const qA = query(collection(db, "announcements"), orderBy("date", "desc"));
    const unsubA = onSnapshot(qA, (snap) => setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    return () => { unsubA(); };
  }, [isAuthenticated]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Very simple access code
    if (password !== "ceibos2026" && password !== "ceibos") {
      setError("Contraseña de acceso incorrecta");
      return;
    }

    setIsAuthenticated(true);
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadingA(true);
    try {
      let finalUrl = announcementImage;
      if (announcementFile) {
        finalUrl = await compressImage(announcementFile);
      }

      if (announcementIsPopup) {
        const batch = writeBatch(db);
        announcements.forEach(a => {
          if (a.isPopup && a.id !== editingAnnouncementId) {
            batch.update(doc(db, "announcements", a.id), { isPopup: false });
          }
        });
        await batch.commit();
      }

      const announcementData = {
        title: announcementTitle,
        content: announcementContent,
        imageUrl: finalUrl,
        date: editingAnnouncementId ? announcements.find(a => a.id === editingAnnouncementId)?.date : Date.now(),
        isPopup: announcementIsPopup
      };

      if (editingAnnouncementId) {
        await updateDoc(doc(db, "announcements", editingAnnouncementId), announcementData);
        alert("Anuncio actualizado exitosamente");
      } else {
        await addDoc(collection(db, "announcements"), announcementData);
        alert("Anuncio publicado exitosamente");
      }

      setAnnouncementTitle("");
      setAnnouncementContent("");
      setAnnouncementImage("");
      setAnnouncementFile(null);
      setAnnouncementIsPopup(false);
      setEditingAnnouncementId(null);
    } catch (err) {
      console.error(err);
      alert("Error al guardar el anuncio");
    } finally {
      setUploadingA(false);
    }
  };

  const handleEditAnnouncement = (a: any) => {
    setEditingAnnouncementId(a.id);
    setAnnouncementTitle(a.title);
    setAnnouncementContent(a.content);
    setAnnouncementImage(a.imageUrl || "");
    setAnnouncementIsPopup(a.isPopup || false);
    setAnnouncementFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTogglePopup = async (a: any) => {
    try {
      const newValue = !a.isPopup;
      if (newValue) {
        const batch = writeBatch(db);
        announcements.forEach(ann => {
          if (ann.isPopup) {
            batch.update(doc(db, "announcements", ann.id), { isPopup: false });
          }
        });
        batch.update(doc(db, "announcements", a.id), { isPopup: true });
        await batch.commit();
      } else {
        await updateDoc(doc(db, "announcements", a.id), { isPopup: false });
      }
    } catch (err) {
      console.error(err);
      alert("Error al actualizar estado del anuncio");
    }
  };

  const handleDelete = async (collectionName: string, id: string) => {
    if (!confirm("¿Estás seguro de eliminar este elemento?")) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
      alert("Elemento eliminado correctamente");
    } catch (err) {
      console.error(err);
      alert("Error al eliminar");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-slate-100 relative">
          <Link to="/" className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
          <div className="text-center mb-8 mt-4">
            <img src={logoImage} alt="Los Ceibos" className="h-20 object-contain mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-800">Panel de Administración</h1>
            <p className="text-slate-500 text-sm mt-2">Instituto Educativo Los Ceibos</p>
          </div>
          
          <form onSubmit={handleAuth} className="space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña de acceso</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none" />
              <p className="text-xs text-slate-500 mt-2">La contraseña actual es: <strong>ceibos</strong></p>
            </div>
            
            <button type="submit" className="w-full bg-[#22543d] hover:bg-[#183c2b] text-white font-medium py-2 rounded-lg transition-colors">
              Ingresar al Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-slate-400 hover:text-green-600 transition-colors" title="Volver a la web">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-slate-800">Panel Admin - Los Ceibos</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">Administrador</span>
            <button onClick={() => setIsAuthenticated(false)} className="text-slate-600 hover:text-red-600 flex items-center gap-2 text-sm font-medium transition-colors">
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
        
        {/* Anuncios Manager */}
        <section className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-6 text-green-700">
              <MessageSquare className="w-6 h-6" />
              <h2 className="text-xl font-bold">{editingAnnouncementId ? "Editar Anuncio" : "Publicar Anuncio"}</h2>
            </div>
            
            <form onSubmit={handleAddAnnouncement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                <input required type="text" value={announcementTitle} onChange={e => setAnnouncementTitle(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contenido (Estilos disponibles)</label>
                <TiptapEditor value={announcementContent} onChange={setAnnouncementContent} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Imagen (Archivo)</label>
                <input type="file" accept="image/*" onChange={e => setAnnouncementFile(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
              </div>
              <div className="flex items-center gap-2">
                <hr className="flex-1" />
                <span className="text-xs text-slate-400">O ingresar URL</span>
                <hr className="flex-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL de Imagen (Opcional si subiste archivo)</label>
                <input type="url" value={announcementImage} onChange={e => setAnnouncementImage(e.target.value)} placeholder="https://..." className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none" disabled={!!announcementFile} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isPopup" checked={announcementIsPopup} onChange={e => setAnnouncementIsPopup(e.target.checked)} className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-600" />
                <label htmlFor="isPopup" className="text-sm font-medium text-slate-700">Mostrar como ventana emergente (Popup) en el Inicio</label>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={uploadingA} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
                  {uploadingA ? "Guardando..." : <><Plus className="w-4 h-4" /> {editingAnnouncementId ? "Guardar Cambios" : "Publicar Anuncio"}</>}
                </button>
                {editingAnnouncementId && (
                  <button type="button" onClick={() => {
                    setEditingAnnouncementId(null);
                    setAnnouncementTitle("");
                    setAnnouncementContent("");
                    setAnnouncementImage("");
                    setAnnouncementIsPopup(false);
                  }} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors">
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4">Anuncios Publicados</h3>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {announcements.map(a => (
                <div key={a.id} className={`border p-4 rounded-xl flex justify-between items-start gap-4 ${a.isPopup ? 'border-yellow-400 bg-yellow-50' : 'border-slate-100'}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-800">{a.title}</h4>
                      {a.isPopup && <span className="text-[10px] bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold uppercase">Popup Activo</span>}
                    </div>
                    <div className="text-sm text-slate-500 line-clamp-2 mt-1" dangerouslySetInnerHTML={{ __html: a.content }} />
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleTogglePopup(a)} className={`p-2 rounded-lg transition-colors ${a.isPopup ? 'text-yellow-600 hover:bg-yellow-100' : 'text-gray-400 hover:bg-gray-100'}`} title={a.isPopup ? "Quitar Popup" : "Hacer Popup"}>
                      <Star className="w-4 h-4" fill={a.isPopup ? "currentColor" : "none"} />
                    </button>
                    <button onClick={() => handleEditAnnouncement(a)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors" title="Editar">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete("announcements", a.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {announcements.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No hay anuncios</p>}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
