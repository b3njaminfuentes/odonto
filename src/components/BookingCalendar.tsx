"use client";
import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { MessageCircle, ChevronRight, CheckCircle2 } from 'lucide-react';

const SERVICES = [
  "Implantes Dentales",
  "Diseño de Sonrisa y Carillas",
  "Ortopedia y Ortodoncia",
  "Rehabilitación Oral (Coronas/Puentes)",
  "Placas Totales y Parciales",
  "Blanqueamiento Dental",
  "Endodoncia",
  "Gingivoplastia",
  "Cirugía (Terceros Molares)",
  "Higiene y Revisión General"
];

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
];

export default function BookingCalendar() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("");

  const handleBooking = () => {
    if (!selectedService || !date || !time) return;
    
    const formattedDate = format(date, "EEEE d 'de' MMMM", { locale: es });
    const message = `Hola Dra. Villarroel, quiero reservar una cita.%0A%0A*Servicio:* ${selectedService}%0A*Fecha:* ${formattedDate}%0A*Hora:* ${time}%0A%0A¿Tienen disponibilidad?`;
    
    window.open(`https://wa.me/59172212402?text=${message}`, '_blank');
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-neutral/10 relative overflow-hidden">
      {/* Decorative top bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
      
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-serif text-primary">Reserva tu Cita</h3>
        <span className="text-xs font-medium bg-secondary text-primary px-2 py-1 rounded-md">
          Paso {step} de 3
        </span>
      </div>

      <div className="space-y-6">
        {/* Step 1: Service */}
        <div className={`transition-all duration-300 ${step === 1 ? 'block opacity-100' : 'hidden opacity-0'}`}>
          <p className="text-sm text-textMain/70 mb-4">¿Qué tratamiento necesitas?</p>
          <div className="grid grid-cols-1 gap-2">
            {SERVICES.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSelectedService(s);
                  setStep(2);
                }}
                className="text-left px-4 py-3 rounded-xl border border-neutral/20 hover:border-primary hover:bg-primary/5 transition-colors text-sm font-medium text-textMain flex items-center justify-between group"
              >
                {s}
                <ChevronRight size={16} className="text-neutral/30 group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Date */}
        <div className={`transition-all duration-300 ${step === 2 ? 'block opacity-100' : 'hidden opacity-0'}`}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-textMain/70">Selecciona el día</p>
            <button onClick={() => setStep(1)} className="text-xs text-primary underline">Cambiar servicio</button>
          </div>
          
          <div className="flex justify-center bg-primary/5 rounded-2xl p-4 border border-primary/10">
            <style>{`
              .rdp { --rdp-cell-size: 40px; --rdp-accent-color: #064E3B; --rdp-background-color: #d1fae5; margin: 0; }
              .rdp-day_selected { background-color: var(--rdp-accent-color); font-weight: bold; }
              .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: var(--rdp-background-color); }
            `}</style>
            <DayPicker
              mode="single"
              selected={date}
              onSelect={(d) => {
                if (d) {
                  setDate(d);
                  setStep(3);
                }
              }}
              locale={es}
              disabled={{ before: new Date(), dayOfWeek: [0, 6] }} // Disable weekends and past dates
              className="text-sm font-medium"
            />
          </div>
        </div>

        {/* Step 3: Time & Confirm */}
        <div className={`transition-all duration-300 ${step === 3 ? 'block opacity-100' : 'hidden opacity-0'}`}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-textMain/70">Horarios disponibles</p>
            <button onClick={() => setStep(2)} className="text-xs text-primary underline">Cambiar fecha</button>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-6">
            {TIME_SLOTS.map((t) => (
              <button
                key={t}
                onClick={() => setTime(t)}
                className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                  time === t 
                    ? 'bg-primary border-primary text-white shadow-md' 
                    : 'bg-white border-neutral/20 text-textMain hover:border-primary'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {time && (
            <div className="bg-green-50 rounded-xl p-4 border border-green-100 mb-6 animate-in slide-in-from-bottom-2 fade-in">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={18} />
                <div className="text-sm">
                  <p className="font-medium text-green-900">Resumen de tu cita</p>
                  <p className="text-green-700 mt-1">{selectedService}</p>
                  <p className="text-green-700 capitalize">
                    {date && format(date, "EEEE d 'de' MMMM", { locale: es })} a las {time}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleBooking}
            disabled={!time}
            className={`w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
              time 
                ? 'bg-primary text-white hover-scale shadow-xl shadow-primary/20' 
                : 'bg-neutral/10 text-textMain/40 cursor-not-allowed'
            }`}
          >
            <MessageCircle size={20} />
            Confirmar vía WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
