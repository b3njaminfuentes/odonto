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
        <h1 className="text-3xl font-serif text-text tracking-tight flex items-center gap-3">
          <div className="p-2 bg-brand/10 rounded-xl text-brand">
            <Bot className="w-8 h-8" />
          </div>
          Muelita AI Dashboard
        </h1>
        <p className="text-muted ml-14">
          Tu asistente inteligente conectado a toda la clínica.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Chat Principal */}
        <div className="flex-1 bg-surface rounded-2xl shadow-sm border border-border flex flex-col overflow-hidden relative">
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((m) => (
              <div 
                key={m.id} 
                className={`flex gap-4 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  m.role === 'user' ? 'bg-brand/10 text-brand' : 'bg-gradient-to-br from-primary to-primary-dark text-white shadow-sm'
                }`}>
                  {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-6 h-6" />}
                </div>
                
                <div className={`p-4 rounded-2xl ${
                  m.role === 'user' 
                  ? 'bg-brand/5 border border-brand/10 text-text rounded-tr-sm' 
                  : 'bg-elevated border border-border text-muted rounded-tl-sm'
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
                <div className="p-4 rounded-2xl bg-elevated border border-border flex gap-1 items-center rounded-tl-sm">
                  <span className="w-2 h-2 bg-border rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-border rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-border rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-surface border-t border-border">
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <input
                value={input || ''}
                onChange={handleInputChange}
                placeholder="Escribe un mensaje para Muelita..."
                className="w-full pl-6 pr-14 py-4 bg-elevated border border-border rounded-2xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all resize-none shadow-sm"
              />
              <button 
                type="submit" 
                disabled={!input?.trim() || isLoading}
                className="absolute right-3 p-2 bg-brand text-white rounded-xl hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:hover:bg-brand"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </form>
          </div>
        </div>

        {/* Panel de Sugerencias */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border">
            <h3 className="font-bold text-text mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              Sugerencias
            </h3>
            <div className="space-y-3">
              <button onClick={() => handleInputChange({ target: { value: 'Resume mi agenda de hoy' } } as any)} className="w-full text-left p-3 text-sm text-muted hover:bg-elevated border border-border rounded-xl transition-colors">
                "Resume mi agenda de hoy"
              </button>
              <button onClick={() => handleInputChange({ target: { value: '¿Cuántos ingresos tuvimos este mes?' } } as any)} className="w-full text-left p-3 text-sm text-muted hover:bg-elevated border border-border rounded-xl transition-colors">
                "¿Cuántos ingresos tuvimos este mes?"
              </button>
              <button onClick={() => handleInputChange({ target: { value: 'Redacta un mensaje de WhatsApp para recordar cita' } } as any)} className="w-full text-left p-3 text-sm text-muted hover:bg-elevated border border-border rounded-xl transition-colors">
                "Redacta un mensaje de WhatsApp para recordar cita"
              </button>
            </div>
          </div>

          <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border flex-1">
            <h3 className="font-bold text-text mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-faint" />
              Capacidades
            </h3>
            <ul className="space-y-4 text-sm text-muted">
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
