"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X, Send, Bot } from "lucide-react";

type Message = {
  role: "user" | "model";
  text: string;
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: "¡Hola! Soy Muelita, el asistente de la Clínica Villarroel. ¿En qué te puedo ayudar hoy?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput("");
    
    // Add user message to UI immediately
    const newMessages: Message[] = [...messages, { role: "user", text: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: messages // pass history for context
        }),
      });

      const data = await response.json();
      
      if (data.reply) {
        setMessages(prev => [...prev, { role: "model", text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: "model", text: "Lo siento, tuve un problema de conexión." }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "model", text: "Ups, algo salió mal. Intenta contactarnos por WhatsApp." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Botón Flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'hidden' : 'flex'} w-[90px] h-[126px] bg-transparent border-none p-0 items-center justify-center cursor-pointer hover:scale-105 transition-transform z-50 drop-shadow-2xl`}
        aria-label="Abrir chat con Muelita"
        style={{ animation: "muelita-float 3.2s ease-in-out infinite" }}
      >
        <Image
          src="/muelita.svg"
          alt="Muelita, asistente virtual"
          width={90}
          height={126}
          priority
        />
        <style jsx>{`
          @keyframes muelita-float {
            0%,
            100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-14px);
            }
          }
        `}</style>
      </button>

      {/* Ventana de Chat */}
      {isOpen && (
        <div className="bg-white w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] rounded-3xl shadow-2xl flex flex-col border border-neutral/10 overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-primary text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-medium leading-none">Muelita</h3>
                <p className="text-xs text-white/70 mt-1">Asistente Virtual</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Area de mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral/5">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-sm' : 'bg-white border border-neutral/10 text-textMain rounded-tl-sm shadow-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-neutral/10 text-textMain/50 p-3 rounded-2xl rounded-tl-sm shadow-sm text-sm flex gap-1">
                  <span className="animate-bounce">•</span>
                  <span className="animate-bounce delay-100">•</span>
                  <span className="animate-bounce delay-200">•</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-neutral/10">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Escribe tu duda aquí..."
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-neutral/20 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 text-primary hover:text-accent transition-colors disabled:opacity-50 p-2"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
