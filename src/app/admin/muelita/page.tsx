'use client'

import React from 'react'
import { useChat } from '@ai-sdk/react'
import { Bot, Send, Sparkles, User, Database, TrendingUp } from 'lucide-react'

export default function MuelitaAIPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: '1',
        role: 'assistant',
        content: '¡Hola Dra. Villarroel! Soy Muelita, tu asistente personal de inteligencia artificial. ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre tus citas, pacientes, finanzas o pedirme que redacte mensajes para pacientes.'
      }
    ]
  })

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-3xl font-serif text-gray-900 tracking-tight flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <Bot className="w-8 h-8" />
          </div>
          Muelita AI Dashboard
        </h1>
        <p className="text-gray-500 ml-14">
          Tu asistente inteligente conectado a toda la clínica.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Chat Principal */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden relative">
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((m) => (
              <div 
                key={m.id} 
                className={`flex gap-4 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  m.role === 'user' ? 'bg-primary/10 text-primary' : 'bg-gradient-to-br from-primary to-primary-dark text-white shadow-sm'
                }`}>
                  {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-6 h-6" />}
                </div>
                
                <div className={`p-4 rounded-2xl ${
                  m.role === 'user' 
                  ? 'bg-primary/5 border border-primary/10 text-gray-800 rounded-tr-sm' 
                  : 'bg-gray-50 border border-gray-100 text-gray-700 rounded-tl-sm'
                }`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4 max-w-[85%]">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-sm flex items-center justify-center flex-shrink-0">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex gap-1 items-center rounded-tl-sm">
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <input
                value={input || ''}
                onChange={handleInputChange}
                placeholder="Escribe un mensaje para Muelita..."
                className="w-full pl-6 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none shadow-sm"
              />
              <button 
                type="submit" 
                disabled={!input?.trim() || isLoading}
                className="absolute right-3 p-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:hover:bg-primary"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </form>
          </div>
        </div>

        {/* Panel de Sugerencias */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          <div className="bg-surface rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              Sugerencias
            </h3>
            <div className="space-y-3">
              <button onClick={() => handleInputChange({ target: { value: 'Resume mi agenda de hoy' } } as any)} className="w-full text-left p-3 text-sm text-gray-600 hover:bg-gray-50 border border-gray-100 rounded-xl transition-colors">
                "Resume mi agenda de hoy"
              </button>
              <button onClick={() => handleInputChange({ target: { value: '¿Cuántos ingresos tuvimos este mes?' } } as any)} className="w-full text-left p-3 text-sm text-gray-600 hover:bg-gray-50 border border-gray-100 rounded-xl transition-colors">
                "¿Cuántos ingresos tuvimos este mes?"
              </button>
              <button onClick={() => handleInputChange({ target: { value: 'Redacta un mensaje de WhatsApp para recordar cita' } } as any)} className="w-full text-left p-3 text-sm text-gray-600 hover:bg-gray-50 border border-gray-100 rounded-xl transition-colors">
                "Redacta un mensaje de WhatsApp para recordar cita"
              </button>
            </div>
          </div>

          <div className="bg-surface rounded-2xl p-6 shadow-sm border border-gray-100 flex-1">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-gray-400" />
              Capacidades
            </h3>
            <ul className="space-y-4 text-sm text-gray-600">
              <li className="flex gap-3">
                <div className="mt-0.5"><TrendingUp className="w-4 h-4 text-success" /></div>
                <span>Análisis financiero en tiempo real.</span>
              </li>
              <li className="flex gap-3">
                <div className="mt-0.5"><User className="w-4 h-4 text-info" /></div>
                <span>Búsqueda rápida de expedientes de pacientes.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  )
}
