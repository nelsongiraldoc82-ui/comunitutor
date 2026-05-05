"use client";
import { useState } from "react";
import materias from "@/data/semestre1.json";

// --- DEFINICIÓN DE TIPOS (INTERFACES) ---
interface Pregunta {
  pregunta: string;
  opciones: string[];
  correcta: number;
  explicacion?: string;
}

interface Recurso {
  tipo: string;
  url: string;
  titulo: string;
}

interface Tema {
  id: number;
  titulo: string;
  descripcion: string;
  material_texto: string;
  recursos: Recurso[];
  quiz: Pregunta[];
}

interface Asignatura {
  id: string;
  nombre: string;
  creditos: number;
  temas: Tema[];
}

// --- COMPONENTE DEL QUIZ (Ventana Emergente) ---
function QuizModal({ quiz, onClose }: { quiz: Pregunta[]; onClose: () => void }) {
  const [indicePregunta, setIndicePregunta] = useState(0);
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  const [puntaje, setPuntaje] = useState(0);
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const preguntaActual = quiz[indicePregunta];

  const manejarRespuesta = (index: number) => {
    if (seleccionado !== null) return;
    setSeleccionado(index);
    if (index === preguntaActual.correcta) {
      setPuntaje(puntaje + 1);
    }
  };

  const siguientePregunta = () => {
    if (indicePregunta < quiz.length - 1) {
      setIndicePregunta(indicePregunta + 1);
      setSeleccionado(null);
    } else {
      setMostrarResultado(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative my-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-2xl font-light">&times;</button>
        
        {!mostrarResultado ? (
          <>
            <div className="mb-6">
              <span className="text-xs font-bold text-blue-600 tracking-wide uppercase">Pregunta {indicePregunta + 1} de {quiz.length}</span>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${((indicePregunta + 1) / quiz.length) * 100}%` }}></div>
              </div>
            </div>

            <p className="text-lg md:text-xl font-semibold text-gray-800 mb-6 leading-relaxed">{preguntaActual.pregunta}</p>
            
            <div className="space-y-3">
              {preguntaActual.opciones.map((opcion, index) => (
                <button
                  key={index}
                  onClick={() => manejarRespuesta(index)}
                  className={`w-full text-left p-3 md:p-4 rounded-xl border transition-all duration-300 text-sm md:text-base
                    ${seleccionado === index 
                      ? (index === preguntaActual.correcta 
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-200' 
                          : 'bg-red-50 border-red-400 text-red-800 ring-2 ring-red-200') 
                      : 'bg-white hover:bg-slate-50 border-gray-200 hover:border-blue-300 text-gray-700'}`}
                >
                  {opcion}
                </button>
              ))}
            </div>

            {seleccionado !== null && (
              <div className="mt-6 animate-fade-in">
                <div className={`p-4 rounded-lg text-xs md:text-sm mb-4 ${seleccionado === preguntaActual.correcta ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  💡 {preguntaActual.explicacion || (seleccionado === preguntaActual.correcta ? "¡Excelente trabajo!" : "Analiza bien esta respuesta.")}
                </div>
                <button 
                  onClick={siguientePregunta}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                >
                  Continuar
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6 md:py-8">
            <div className="text-5xl md:text-6xl mb-4">🎓</div>
            <h3 className="text-xl md:text-2xl font-bold mb-2 text-gray-800">¡Test Completado!</h3>
            <p className="text-4xl font-bold text-blue-600 my-4">{puntaje} / {quiz.length}</p>
            <p className="text-gray-400 mb-6 text-sm">Respuestas correctas</p>
            <button onClick={onClose} className="bg-gray-800 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-900 transition">Cerrar</button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL ---
export default function Home() {
  const [activeView, setActiveView] = useState<string>('home');
  const [modal, setModal] = useState<{ type: string; data: unknown } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Estado para menú móvil

  const openVideo = (url: string) => {
    let embedUrl = url;
    if (url.includes("watch?v=")) {
      embedUrl = url.replace("watch?v=", "embed/");
    }
    setModal({ type: 'video', data: embedUrl });
  };

  const openRead = (texto: string, recursos: Recurso[]) => {
    setModal({ type: 'read', data: { texto, recursos } });
  };

  const openQuiz = (quiz: Pregunta[]) => {
    setModal({ type: 'quiz', data: quiz });
  };

  const closeModal = () => setModal(null);
  
  // Navegación segura (cierra menú en móvil al seleccionar)
  const navigateTo = (view: string) => {
    setActiveView(view);
    setIsSidebarOpen(false);
  }

  const selectedSubject = (materias as Asignatura[]).find(m => m.id === activeView);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* --- BOTÓN DE MENÚ MÓVIL (Solo visible en móviles) --- */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 bg-white p-2 rounded-full shadow-lg border border-slate-200 md:hidden"
      >
        {/* Icono de Hamburguesa */}
        <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* --- OVERLAY OSCURO (Para cerrar menú en móvil) --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0`}
      >
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold text-blue-600 tracking-tight">ComuniTutor</h1>
          <p className="text-sm text-slate-400 mt-1">Bienvenida, Gaby 👋</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            <button 
              onClick={() => navigateTo('home')}
              className={`w-full text-left px-4 py-2.5 rounded-lg transition-all font-medium flex items-center gap-3 ${activeView === 'home' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <span>🏠</span> Inicio
            </button>

            <div className="pt-4">
              <div className="flex justify-between items-center px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>Semestre 1</span>
                <span>▼</span>
              </div>
              
              <div className="mt-2 space-y-1 border-l-2 border-slate-100 ml-3 pl-3">
                {(materias as Asignatura[]).map((asig) => (
                  <button
                    key={asig.id}
                    onClick={() => navigateTo(asig.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 truncate
                      ${activeView === asig.id 
                        ? 'bg-blue-50 text-blue-600 font-semibold border-l-2 border-blue-600 -ml-[2px] pl-[calc(0.75rem+2px)]' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                  >
                    {asig.nombre}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </nav>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="p-4 md:p-8 md:ml-72 min-h-screen">
        
        {activeView === 'home' && (
          <div className="max-w-3xl mx-auto pt-12 md:pt-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">¡Hola, Gaby!</h2>
              <p className="text-slate-500 text-base md:text-lg">¿Qué quieres aprender hoy?</p>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white shadow-xl mb-10">
              <h3 className="text-lg md:text-xl font-bold mb-2">Continúa donde lo dejaste</h3>
              <p className="opacity-90 text-sm md:text-base mb-4">Te recomendamos seguir con: <span className="font-semibold">Lectura, escritura y oralidad</span></p>
              <button 
                onClick={() => navigateTo('lectura-escritura-1')}
                className="bg-white text-blue-600 px-5 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition shadow-lg text-sm"
              >
                Ir a la asignatura
              </button>
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-4">Tus asignaturas este semestre</h3>
            {/* Grid responsivo: 1 columna en móvil, 2 en desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(materias as Asignatura[]).map((asig) => (
                <div 
                  key={asig.id}
                  onClick={() => navigateTo(asig.id)}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all group"
                >
                  <h4 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors text-sm md:text-base">{asig.nombre}</h4>
                  <p className="text-xs text-slate-400 mt-1">{asig.creditos} Créditos</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedSubject && (
          <div className="max-w-4xl mx-auto">
            <header className="mb-6 md:mb-8">
              <button onClick={() => navigateTo('home')} className="text-blue-600 text-xs md:text-sm font-medium mb-2 flex items-center gap-1 hover:gap-2 transition-all">
                ← Volver al inicio
              </button>
              <div className="flex flex-col md:flex-row justify-between items-start gap-2">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded">Semestre 1</span>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">{selectedSubject.nombre}</h2>
                </div>
                <span className="text-slate-400 font-medium text-xs md:text-sm">{selectedSubject.creditos} Créditos</span>
              </div>
            </header>

            <div className="space-y-4 md:space-y-6">
              {selectedSubject.temas.map((tema, index) => (
                <div key={tema.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-4 md:p-6">
                    <div className="flex gap-3 md:gap-4">
                      <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm md:text-base">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-base md:text-lg text-slate-800 mb-1">{tema.titulo}</h3>
                        <p className="text-slate-500 text-xs md:text-sm mb-4 leading-relaxed">{tema.descripcion}</p>
                        
                        <div className="flex flex-wrap gap-2 md:gap-3">
                          <button 
                            onClick={() => openRead(tema.material_texto, tema.recursos)}
                            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors"
                          >
                            <span>📖</span> Leer teoría
                          </button>
                          
                          {tema.recursos && tema.recursos.filter(r => r.tipo === 'video').length > 0 && (
                            <button 
                              onClick={() => openVideo(tema.recursos.find(r => r.tipo === 'video')?.url || '#')}
                              className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors"
                            >
                              <span>▶️</span> Ver video
                            </button>
                          )}

                          {tema.quiz && tema.quiz.length > 0 && (
                            <button 
                              onClick={() => openQuiz(tema.quiz)}
                              className="inline-flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors"
                            >
                              <span>✨</span> Hacer Test ({tema.quiz.length} preguntas)
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* --- MODALES (Misma lógica) --- */}
      {modal?.type === 'read' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative animate-fade-in">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-300 hover:text-gray-800 text-2xl transition-colors">&times;</button>
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-slate-800">Apuntes de Clase</h2>
            <div className="prose text-slate-600 whitespace-pre-line mb-6 leading-relaxed text-sm md:text-base">
              {(modal.data as { texto: string }).texto}
            </div>
            <div className="border-t border-slate-100 pt-4 mt-4">
              <h4 className="font-semibold mb-3 text-xs md:text-sm text-slate-500 uppercase tracking-wide">Recursos adjuntos</h4>
              <ul className="space-y-2">
                {(modal.data as { recursos: Recurso[] }).recursos.map((r, i) => (
                  <li key={i}>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium hover:underline flex items-center gap-2 text-sm">
                      🔗 {r.titulo}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {modal?.type === 'video' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-2xl p-1 w-full max-w-4xl shadow-2xl relative">
            <button onClick={closeModal} className="absolute -top-10 right-0 text-white/50 hover:text-white text-2xl font-light transition-colors">&times;</button>
            <div className="relative rounded-xl overflow-hidden" style={{ paddingBottom: '56.25%', height: 0 }}>
              <iframe 
                src={modal.data as string} 
                className="absolute top-0 left-0 w-full h-full" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {modal?.type === 'quiz' && (
        <QuizModal quiz={modal.data as Pregunta[]} onClose={closeModal} />
      )}
    </div>
  );
}