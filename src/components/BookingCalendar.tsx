"use client";
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { MessageCircle, ChevronRight, CheckCircle2, Loader2, PartyPopper } from 'lucide-react';
import { requestAppointment, getBookedSlots } from '@/app/booking-actions';

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
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [booked, setBooked] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Cargar horarios ocupados al elegir fecha
  useEffect(() => {
    if (!date) return;
    setBooked([]);
    getBookedSlots(date.toISOString()).then(setBooked).catch(() => setBooked([]));
  }, [date]);

  const waMessage = () => {
    const formattedDate = date ? format(date, "EEEE d 'de' MMMM", { locale: es }) : "";
    return `Hola Dra. Villarroel, quiero reservar una cita.%0A%0A*Servicio:* ${selectedService}%0A*Fecha:* ${formattedDate}%0A*Hora:* ${time}%0A*Nombre:* ${name}`;
  };

  const handleConfirm = async () => {
    if (!selectedService || !date || !time) return;
    setSubmitting(true);
    setError(null);
    const res = await requestAppointment({
      service: selectedService,
      dateISO: date.toISOString(),
      time,
      name,
      phone,
    });
    setSubmitting(false);
    if ('error' in res) { setError(res.error); return; }
    setDone(true);
  };

  if (done) {
    return (
      <div className="bg-surface rounded-3xl p-8 shadow-lift border border-border text-center">
        <div className="w-14 h-14 rounded-2xl bg-success-soft text-success grid place-items-center mx-auto mb-4">
          <PartyPopper className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-serif text-text mb-2">¡Solicitud enviada!</h3>
        <p className="text-muted text-sm mb-6">
          Registramos tu solicitud para <strong className="text-text">{selectedService}</strong> el{" "}
          <span className="capitalize">{date && format(date, "EEEE d 'de' MMMM", { locale: es })}</span> a las {time}.
          La clínica te confirmará a la brevedad.
        </p>
        <a
          href={`https://wa.me/59172212402?text=${waMessage()}`}
          target="_blank" rel="noopener noreferrer"
          className="btn-accent w-full py-3 rounded-xl mb-2"
        >
          <MessageCircle size={18} /> Confirmar también por WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-3xl p-6 shadow-lift border border-border relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand via-accent to-brand" />

      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-serif text-text">Reserva tu cita</h3>
        <span className="text-xs font-medium bg-brand-soft text-brand px-2 py-1 rounded-md">Paso {step} de 3</span>
      </div>

      <div className="space-y-6">
        {/* Paso 1: Servicio */}
        <div className={step === 1 ? 'block' : 'hidden'}>
          <p className="text-sm text-muted mb-4">¿Qué tratamiento necesitas?</p>
          <div className="grid grid-cols-1 gap-2">
            {SERVICES.map((s) => (
              <button
                key={s}
                onClick={() => { setSelectedService(s); setStep(2); }}
                className="text-left px-4 py-3 rounded-xl border border-border hover:border-brand hover:bg-brand-soft transition-colors text-sm font-medium text-text flex items-center justify-between group"
              >
                {s}
                <ChevronRight size={16} className="text-faint group-hover:text-brand transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Paso 2: Fecha */}
        <div className={step === 2 ? 'block' : 'hidden'}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted">Selecciona el día</p>
            <button onClick={() => setStep(1)} className="text-xs text-brand underline">Cambiar servicio</button>
          </div>
          <div className="flex justify-center bg-brand-soft/50 rounded-2xl p-4 border border-brand/10">
            <style>{`
              .rdp { --rdp-cell-size: 40px; --rdp-accent-color: hsl(150 26% 40%); --rdp-background-color: hsl(150 32% 90%); margin: 0; }
              .rdp-day_selected { background-color: var(--rdp-accent-color); font-weight: bold; }
              .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: var(--rdp-background-color); }
            `}</style>
            <DayPicker
              mode="single"
              selected={date}
              onSelect={(d) => { if (d) { setDate(d); setTime(""); setStep(3); } }}
              locale={es}
              disabled={{ before: new Date(), dayOfWeek: [0, 6] }}
              className="text-sm font-medium"
            />
          </div>
        </div>

        {/* Paso 3: Hora + datos */}
        <div className={step === 3 ? 'block' : 'hidden'}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted">Horarios disponibles</p>
            <button onClick={() => setStep(2)} className="text-xs text-brand underline">Cambiar fecha</button>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-5">
            {TIME_SLOTS.map((t) => {
              const isBooked = booked.includes(t);
              return (
                <button
                  key={t}
                  disabled={isBooked}
                  onClick={() => setTime(t)}
                  className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                    isBooked
                      ? 'bg-elevated border-border text-faint line-through cursor-not-allowed'
                      : time === t
                        ? 'bg-brand border-brand text-brand-fg shadow-soft'
                        : 'bg-surface border-border text-text hover:border-brand'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" className="input" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Tu teléfono" type="tel" className="input" />
          </div>

          {time && name && (
            <div className="bg-success-soft rounded-xl p-4 border border-success/30 mb-5 animate-in slide-in-from-bottom-2 fade-in">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-success shrink-0 mt-0.5" size={18} />
                <div className="text-sm">
                  <p className="font-medium text-success">Resumen de tu cita</p>
                  <p className="text-success mt-1">{selectedService}</p>
                  <p className="text-success capitalize">
                    {date && format(date, "EEEE d 'de' MMMM", { locale: es })} a las {time}
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && <div className="mb-4 p-3 bg-danger-soft border border-danger/30 rounded-xl text-danger text-sm">{error}</div>}

          <button
            onClick={handleConfirm}
            disabled={!time || !name || !phone || submitting}
            className={`w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
              time && name && phone
                ? 'bg-accent text-accent-fg hover:bg-accent-hover shadow-lift'
                : 'bg-border text-faint cursor-not-allowed'
            }`}
          >
            {submitting ? <><Loader2 size={20} className="animate-spin" /> Enviando…</> : <>Solicitar cita</>}
          </button>
        </div>
      </div>
    </div>
  );
}
