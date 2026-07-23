'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useChat } from '@ai-sdk/react'
import { MessageCircle, X, Send, User, Bot, Loader2 } from 'lucide-react'

export function MuelitaChat() {
  const [isOpen, setIsOpen] = useState(false)
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    onError: (err) => {
      console.error('Chat error:', err)
      alert('Error de conexión o sesión expirada.')
    }
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom whenever messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-16 h-16 bg-brand text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-brand/90 transition-all hover:scale-105 z-50 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        style={{ animation: isOpen ? 'none' : 'float 3s ease-in-out infinite' }}
        aria-label="Hablar con Muelita"
      >
        <MessageCircle className="w-8 h-8" />
        <div className="absolute top-0 right-0 w-4 h-4 bg-danger border-2 border-white rounded-full animate-pulse"></div>
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 sm:w-[400px] w-[calc(100vw-3rem)] h-[600px] max-h-[80vh] bg-surface rounded-2xl shadow-2xl border border-border flex flex-col z-50 transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="bg-brand text-white p-4 rounded-t-2xl flex justify-between items-center shrink-0 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-8 w-24 h-24 bg-surface/10 rounded-full"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-surface/20 rounded-full flex items-center justify-center shadow-sm">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold font-serif text-lg leading-tight">Muelita IA</h3>
              <p className="text-brand-foreground/80 text-xs">Asistente Virtual Seguro</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 bg-surface/10 hover:bg-surface/20 rounded-full transition-colors relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-elevated/50">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-70">
              <Bot className="w-12 h-12 text-brand" />
              <div>
                <p className="font-semibold text-text">¡Hola! Soy Muelita 🦷</p>
                <p className="text-sm text-muted max-w-[250px]">
                  Pregúntame sobre tus próximas citas, o tu historial médico. Tus datos están 100% protegidos.
                </p>
              </div>
            </div>
          )}

          {messages.map(m => (
            <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm ${m.role === 'user' ? 'bg-elevated text-white' : 'bg-brand/10 text-brand'}`}>
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
              </div>
              <div 
                className={`px-4 py-3 rounded-2xl max-w-[75%] text-sm shadow-sm ${
                  m.role === 'user' 
                  ? 'bg-bg text-white rounded-tr-sm' 
                  : 'bg-surface border border-border text-text rounded-tl-sm'
                }`}
              >
                {/* Renderizar saltos de línea básicos */}
                {m.content.split('\\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-5 h-5" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-surface border border-border text-text rounded-tl-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-brand" />
                <span className="text-sm text-muted">Muelita está escribiendo...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 bg-surface border-t border-border rounded-b-2xl shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-2 relative">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Escribe tu mensaje aquí..."
              disabled={isLoading}
              className="flex-1 pl-4 pr-12 py-3 bg-elevated border border-border rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all text-sm disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={isLoading || !input?.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors disabled:opacity-50 shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-muted font-medium">Secured by Supabase RLS & Gemini</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </>
  )
}
