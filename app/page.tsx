"use client";
import { useState, FormEvent } from "react";
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

interface Actividad {
  pregunta: string;
}

interface Tema {
  id: number;
  titulo: string;
  descripcion: string;
  material_texto: string;
  pdf_url?: string;
  actividades?: Actividad[];
  recursos: Recurso[];
  quiz: Pregunta[];
}

interface Asignatura {
  id: string;
  nombre: string;
  creditos: number;
  temas: Tema[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// --- COMPONENTE DE ACTIVIDADES Y EVALUACIÓN IA ---
function ActivitySection({ activities, context }: { activities: Actividad[]; context: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentActivity = activities[currentActivity];

  const handleSubmitActivity = async (e: FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;

    setIsLoading(true);
    setFeedback({ role: 'user', content: answer });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'evaluation',
          context: context,
          activity: currentActivity.pregunta,
          studentAnswer: answer
        }),
      });
      const data = await res.json();
      setFeedback({ role: 'assistant', content: data.answer });
    } catch (error) {
      setFeedback({ role: 'assistant', content: "Error al evaluar la actividad." });
    } finally {
      setIsLoading(false);
      setAnswer("");
    }
  };

  return (
    <div className="border-t border-slate-200 pt-6 mt-6">
      <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
        <span>📝</span> Espacio de Trabajo
      </h3>
      
      {activities.length > 1 && (
        <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
          {activities.map((_, idx) => (
            <button 
              key={idx} 
              onClick={() => { setCurrentIndex(idx); setFeedback(null); setAnswer(""); }}
              className={`px-3 py-1 text-xs rounded-full border whitespace-nowrap ${currentIndex === idx ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500'}`}
            >
              Actividad {idx + 1}
            </button>
          ))}
        </div>
      )}

      <div className="bg-slate-50 p-4 rounded-xl mb-4">
        <p className="text-sm font-semibold text-slate-700 mb-1">Instrucción:</p>
        <p className="text-sm text-slate-600">{currentActivity.pregunta}</p>
      </div>

      <form onSubmit={handleSubmitActivity}>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Escribe aquí tu desarrollo o respuesta..."
          className="w-full h-32 p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none mb-3"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={isLoading || !answer.trim()}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition text-sm"
        >
          {isLoading ? "Evaluando..." : "Enviar para Revisión del Tutor"}
        </button>
      </form>

      {feedback && (
        <div className={`mt-4 p-4 rounded-lg text-sm ${feedback.role === 'assistant' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-blue-50 border border-blue-200 text-blue-800'}`}>
          <div className="flex items-center gap-2 font-bold mb-1">
            <span>{feedback.role === 'assistant' ? '🎓 Evaluación del Tutor' : '📝 Tu respuesta'}</span>
          </div>
          <div className="whitespace-pre-wrap">{feedback.content}</div>
        </div>
      )}
    </div>
  );
}

// --- COMPONENTE CHAT TUTOR ---
function ChatTutor({ context }: { context: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¿Tienes alguna duda específica sobre el texto? Pregúntame.' }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if(!input.trim()) return;
    const userMsg = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input, context })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Error de conexión." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
     <div className="mt-6 pt-6 border-t border-slate-200">
       <h3 className="font-bold text-md text-slate-700 mb-3">💬 Chat con el Tutor</h3>
       <div className="flex flex-col h-48 bg-slate-50 rounded-lg p-3 mb-3 overflow-y-auto">
         {messages.map((msg, i) => (
           <div key={i} className={`mb-2 text-sm ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
             <span className={`inline-block px-3 py-1 rounded-lg ${msg.role === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-white border'}`}>
               {msg.content}
             </span>
           </div>
         ))}
         {isLoading && <div className="text-left text-sm text-slate-400 animate-pulse">Escribiendo...</div>}
       </div>
       <form onSubmit={handleSubmit} className="flex gap-2">
         <input value={input} onChange={e => setInput(e.target.value)} className="flex-1 border p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Escribe tu duda..." />
         <button className="bg-blue-600 text-white px-4 rounded text-sm font-medium hover:bg-blue-700">Enviar</button>
       </form>
     </div>
  );
}

// --- COMPONENTE QUIZ ---
function QuizModal({ quiz, onClose }: { quiz: Pregunta[]; onClose: () => void }) {
  const [indicePregunta, setIndicePregunta] = useState(0);
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  const [puntaje, setPuntaje] = useState(0);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  
  const preguntaActual = quiz[indicePregunta];

  const manejarRespuesta = (index: number) => {
    if (seleccionado !== null) return;
    setSeleccionado(index);
    if (index === preguntaActual.correcta) setPuntaje(puntaje + 1);
  };

  const siguiente = () => {
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
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-2xl">&times;</button>
        {!mostrarResultado ? (
          <>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Pregunta {indicePregunta + 1} de {quiz.length}</span>
            <p className="text-lg md:text-xl font-semibold text-gray-800 my-4">{preguntaActual.pregunta}</p>
            <div className="space-y-3">
              {preguntaActual.opciones.map((op, i) => (
                <button key={i} onClick={() => manejarRespuesta(i)}
                  className={`w-full text-left p-3 md:p-4 rounded-xl border transition-all text-sm
                    ${seleccionado === i 
                      ? (i === preguntaActual.correcta ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : 'bg-red-50 border-red-400 text-red-800') 
                      : 'bg-white hover:bg-slate-50 border-gray-200 text-gray-700'}`}>
                  {op}
                </button>
              ))}
            </div>
            {seleccionado !== null && (
              <div className="mt-6">
                <p className="text-sm p-3 bg-blue-50 rounded-lg text-blue-700 mb-3">{preguntaActual.explicacion || "¡Continuemos!"}</p>
                <button onClick={siguiente} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700">Continuar</button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <h3 className="text-2xl font-bold mb-2">¡Test Completado!</h3>
            <p className="text-4xl font-bold text-blue-600 my-4">{puntaje} / {quiz.length}</p>
            <button onClick={onClose} className="bg-gray-800 text-white px-8 py-3 rounded-xl font-semibold">Cerrar</button>
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openLesson = (tema: Tema) => setModal({ type: 'lesson', data: tema });
  const openVideo = (url: string) => {
    const embedUrl = url.includes("watch?v=") ? url.replace("watch?v=", "embed/") : url;
    setModal({ type: 'video', data: embedUrl });
  };
  const openQuiz = (quiz: Pregunta[]) => setModal({ type: 'quiz', data: quiz });
  const closeModal = () => setModal(null);
  
  const navigateTo = (view: string) => { setActiveView(view); setIsSidebarOpen(false); };
  const selectedSubject = (materias as Asignatura[]).find(m => m.id === activeView);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* MENU MÓVIL */}
      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="fixed top-4 left-4 z-50 bg-white p-2 rounded-full shadow-lg md:hidden">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
      {isSidebarOpen && <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-blue-600">ComuniTutor</h1>
          <p className="text-sm text-slate-400">Bienvenida, Gaby 👋</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <button onClick={() => navigateTo('home')} className={`w-full text-left px-4 py-2.5 rounded-lg font-medium mb-4 ${activeView === 'home' ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}>
            🏠 Inicio
          </button>
          <div className="border-l-2 border-slate-100 ml-3 pl-3 space-y-1">
            {(materias as Asignatura[]).map((asig) => (
              <button key={asig.id} onClick={() => navigateTo(asig.id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all truncate ${activeView === asig.id ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}>
                {asig.nombre}
              </button>
            ))}
          </div>
        </nav>
      </aside>

      {/* CONTENIDO */}
      <main className="p-4 md:p-8 md:ml-72 min-h-screen">
        {activeView === 'home' && (
          <div className="max-w-3xl mx-auto pt-12 text-center">
            <h2 className="text-4xl font-bold mb-3">¡Hola, Gaby!</h2>
            <p className="text-slate-500 mb-10">¿Qué quieres aprender hoy?</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {(materias as Asignatura[]).map((asig) => (
                <div key={asig.id} onClick={() => navigateTo(asig.id)} className="bg-white p-5 rounded-2xl border hover:shadow-md cursor-pointer group">
                  <h4 className="font-semibold group-hover:text-blue-600">{asig.nombre}</h4>
                  <p className="text-xs text-slate-400 mt-1">{asig.creditos} Créditos</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedSubject && (
          <div className="max-w-4xl mx-auto">
            <button onClick={() => navigateTo('home')} className="text-blue-600 text-sm font-medium mb-4">← Volver al inicio</button>
            <h2 className="text-3xl font-bold mb-6">{selectedSubject.nombre}</h2>
            <div className="space-y-6">
              {selectedSubject.temas.map((tema, i) => (
                <div key={tema.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                  <div className="p-6">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">{i + 1}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{tema.titulo}</h3>
                        <p className="text-slate-500 text-sm mb-4">{tema.descripcion}</p>
                        <div className="flex flex-wrap gap-3">
                          <button onClick={() => openLesson(tema)} className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg text-sm font-medium">📖 Lección Completa</button>
                          {tema.recursos?.find(r => r.tipo === 'video') && (
                            <button onClick={() => openVideo(tema.recursos.find(r => r.tipo === 'video')?.url || '#')} className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-medium">▶️ Ver Video</button>
                          )}
                          {tema.quiz && tema.quiz.length > 0 && (
                            <button onClick={() => openQuiz(tema.quiz)} className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-4 py-2 rounded-lg text-sm font-medium">✨ Hacer Test</button>
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

      {/* MODAL DE LECCIÓN (PDF, TEXTO, ACTIVIDADES, CHAT) */}
      {modal?.type === 'lesson' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative shadow-2xl">
            <div className="p-6 border-b bg-white sticky top-0 z-10">
              <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 text-2xl">&times;</button>
              <h2 className="text-xl font-bold">{(modal.data as Tema).titulo}</h2>
            </div>
            <div className="overflow-y-auto p-6 flex-1">
              
              {/* PDF */}
              {(modal.data as Tema).pdf_url && (
                <div className="mb-6 bg-blue-50 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
                  <span className="text-blue-700 font-medium text-sm">📄 Material de lectura disponible</span>
                  <div className="flex gap-2">
                    <a href={(modal.data as Tema).pdf_url} target="_blank" className="px-4 py-2 bg-white border text-blue-600 rounded-lg text-sm hover:bg-blue-100">👁️ Ver PDF</a>
                    <a href={(modal.data as Tema).pdf_url} download className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">⬇️ Descargar</a>
                  </div>
                </div>
              )}

              {/* INTRODUCCIÓN */}
              <div className="prose max-w-none text-slate-600 mb-8">
                <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">📖 Introducción</h3>
                <div className="whitespace-pre-line text-sm bg-slate-50 p-4 rounded-lg">{(modal.data as Tema).material_texto}</div>
              </div>

              {/* ACTIVIDADES */}
              {(modal.data as Tema).actividades && (modal.data as Tema).actividades!.length > 0 && (
                 <ActivitySection activities={(modal.data as Tema).actividades!} context={(modal.data as Tema).material_texto} />
              )}

              {/* CHAT */}
              <ChatTutor context={(modal.data as Tema).material_texto} />

            </div>
          </div>
        </div>
      )}

      {/* MODALES VIDEO Y QUIZ */}
      {modal?.type === 'video' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-2xl p-1 w-full max-w-4xl shadow-2xl relative">
            <button onClick={closeModal} className="absolute -top-10 right-0 text-white/50 hover:text-white text-2xl">&times;</button>
            <div className="relative rounded-xl overflow-hidden" style={{ paddingBottom: '56.25%', height: 0 }}>
              <iframe src={modal.data as string} className="absolute top-0 left-0 w-full h-full" frameBorder="0" allowFullScreen></iframe>
            </div>
          </div>
        </div>
      )}
      {modal?.type === 'quiz' && <QuizModal quiz={modal.data as Pregunta[]} onClose={closeModal} />}
    </div>
  );
}