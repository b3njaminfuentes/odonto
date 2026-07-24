import Image from "next/image";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ReviewsSlider from "@/components/ReviewsSlider";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import BookingCalendar from "@/components/BookingCalendar";
import CertificatesGallery from "@/components/CertificatesGallery";
import { Star, CheckCircle, Clock, MapPin, Phone, Award, ArrowRight, ShieldCheck, Smile, Stethoscope, Sparkles } from "lucide-react";

// Lucide no incluye logos de marcas por diseño: usamos SVGs propios para redes sociales.
function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7.6h2.55l.38-2.96h-2.93V8.53c0-.86.24-1.44 1.47-1.44h1.57V4.46A21 21 0 0 0 14.3 4.3c-2.17 0-3.66 1.32-3.66 3.75v2.4H8.09v2.95h2.55V21h2.86Z" />
    </svg>
  );
}
function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.82c-1.02-.9-1.6-2.16-1.6-3.51h-3.1v13.6c0 1.56-1.27 2.83-2.83 2.83a2.83 2.83 0 1 1 0-5.66c.28 0 .55.04.8.12V9.9a5.8 5.8 0 0 0-.8-.05A5.93 5.93 0 0 0 3.14 15.8a5.93 5.93 0 0 0 5.93 5.93c3.27 0 5.93-2.66 5.93-5.93V9.1a8.6 8.6 0 0 0 4.6 1.34V7.35c-1.1 0-2.13-.35-2.99-.94-.02-.01-.02-.59-.01-.59Z" />
    </svg>
  );
}

const SOCIALS = [
  { href: "https://www.instagram.com/clinicaodontologicavillarroel?igsh=aWJyMmtkcnhtbG03&utm_source=qr", label: "Instagram", icon: InstagramIcon },
  { href: "https://www.facebook.com/share/1Cthbe9Rt5/?mibextid=wwXIfr", label: "Facebook", icon: FacebookIcon },
  { href: "https://www.tiktok.com/@clinicavillarroel?_r=1&_t=ZS-98EATdcxCzZ", label: "TikTok", icon: TikTokIcon },
];

const services = [
  { title: "Implantes Dentales", desc: "Recuperá la funcionalidad y estética con implantes de titanio de primera línea.", image: "/images/implantes.jpg", icon: <ShieldCheck size={22} /> },
  { title: "Diseño de Sonrisa y Carillas", desc: "Resultados naturales y duraderos. El cambio estético que siempre soñaste.", image: "/images/carillas.jpg", icon: <Smile size={22} /> },
  { title: "Ortopedia y Ortodoncia", desc: "Alineación dental para una mordida perfecta. Tu cambio empieza hoy.", image: "/images/ortodoncia.jpg", icon: <CheckCircle size={22} /> },
  { title: "Rehabilitación Oral", desc: "Coronas, puentes y placas con materiales de alta estética.", image: "/images/rehabilitacion.jpg", icon: <Star size={22} /> },
  { title: "Blanqueamiento Dental", desc: "Aclará varios tonos en una sola sesión de forma segura y sin dolor.", image: "/images/blanqueamiento.jpg", icon: <Sparkles size={22} /> },
  { title: "Endodoncia", desc: "Tratamiento de conductos especializado para salvar tus piezas dentales.", image: "/images/endodoncia.jpg", icon: <Stethoscope size={22} /> },
  { title: "Gingivoplastia", desc: "Contorneado de encías para armonizar el tamaño de tus dientes y tu sonrisa.", image: "/images/gingivoplastia.jpg", icon: <Smile size={22} /> },
  { title: "Cirugía (Terceros Molares)", desc: "Extracciones seguras y planificadas. Agenda tu valoración hoy mismo.", image: "/images/molares.jpg", icon: <Stethoscope size={22} /> },
  { title: "Higiene y Prevención", desc: "Limpieza profunda con ultrasonido para mantener tus encías sanas.", image: "/images/limpieza.jpg", icon: <ShieldCheck size={22} /> },
];

const steps = [
  { step: "1", title: "Reserva", desc: "Agendá tu turno online o por WhatsApp." },
  { step: "2", title: "Evaluación", desc: "Escaneo digital y diagnóstico preciso." },
  { step: "3", title: "Tratamiento", desc: "Procedimiento cómodo y sin dolor." },
  { step: "4", title: "Sonrisa Nueva", desc: "Recuperación rápida y seguimiento." },
];

const values = [
  { title: "Precisión clínica", desc: "Cada diagnóstico y procedimiento respaldado por tecnología digital." },
  { title: "Calidez humana", desc: "La paciente y su tranquilidad están primero." },
  { title: "Actualización constante", desc: "Formación continua a nivel internacional." },
  { title: "Transparencia", desc: "El paciente sabe en todo momento qué tratamiento tiene, qué debe y qué sigue." },
];

const wa = "https://wa.me/59172212402?text=Hola%2C%20quiero%20reservar%20una%20consulta.";

export default function Home() {
  return (
    <main className="min-h-screen bg-bg">
      <Navbar />
      <Hero />

      {/* Barra de confianza */}
      <section className="border-y border-border bg-surface">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap items-center justify-center md:justify-between gap-x-6 gap-y-3 text-sm font-medium text-muted">
          <div className="flex items-center gap-2 text-text">
            <Star className="text-accent" fill="currentColor" size={18} /> 4.9 en Google (19+ reseñas reales)
          </div>
          <Dot /><span>500+ implantes realizados</span>
          <Dot /><span>20+ años de experiencia clínica</span>
          <Dot /><span>98% satisfacción de pacientes</span>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-24 overflow-hidden">
        <div className="text-center mb-10 max-w-7xl mx-auto px-6 md:px-12">
          <span className="eyebrow mb-4">Testimonios</span>
          <h2 className="text-3xl md:text-5xl font-serif text-text mt-3 mb-5">Lo que dicen nuestros pacientes</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-muted">
            <span className="font-medium text-brand">Reseñas reales de pacientes de Cochabamba</span>
            <Dot />
            <span className="chip bg-accent-soft text-accent">
              <Award size={14} /> Negocio liderado por mujeres
            </span>
          </div>
        </div>
        <ReviewsSlider />
      </section>

      {/* Antes y después */}
      <section id="casos" className="py-24 max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <span className="eyebrow mb-4">Resultados</span>
          <h2 className="text-3xl md:text-5xl font-serif text-text mt-3 mb-4">Transformaciones reales</h2>
          <p className="text-muted max-w-2xl mx-auto">Deslizá para ver el impacto de nuestros tratamientos en la vida de nuestros pacientes.</p>
        </div>
        <div className="max-w-4xl mx-auto">
          <BeforeAfterSlider beforeImage="/images/antes.jpg" afterImage="/images/despues.jpg" beforePosition="center 82%" afterPosition="center 50%" />
          <div className="mt-8 text-center">
            <h3 className="text-xl font-serif text-brand">Ortodoncia y alineación dental</h3>
            <p className="text-muted mt-2">Transformación real con tratamientos personalizados</p>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section className="py-24 bg-surface border-y border-border" id="servicios">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <span className="eyebrow mb-4">Especialidades</span>
            <h2 className="text-3xl md:text-5xl font-serif text-text mt-3 mb-4">Especialidades clínicas</h2>
            <p className="text-muted max-w-2xl mx-auto">Odontología moderna con estándares hospitalarios de esterilización.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <div key={i} className="group card-interactive p-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500">
                  <Image src={service.image} alt="" fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="relative">
                  <div className="w-14 h-14 bg-brand-soft rounded-2xl flex items-center justify-center text-brand mb-6 group-hover:scale-110 transition-transform">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-serif text-text mb-3">{service.title}</h3>
                  <p className="text-muted mb-6 line-clamp-3">{service.desc}</p>
                  <div className="relative w-full h-36 rounded-xl overflow-hidden mb-6 md:hidden">
                    <Image src={service.image} alt={service.title} fill sizes="100vw" className="object-cover" />
                  </div>
                  <a href={wa} className="inline-flex items-center gap-2 text-brand font-medium group-hover:gap-3 group-hover:text-accent transition-all">
                    Conocer más <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Camino del paciente */}
      <section className="py-24 bg-brand-soft/40">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <span className="eyebrow mb-4">El proceso</span>
            <h2 className="text-3xl md:text-5xl font-serif text-text mt-3">Tu camino hacia una nueva sonrisa</h2>
          </div>
          <div className="flex flex-col md:flex-row justify-between relative gap-8 md:gap-0">
            <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-brand/20 z-0" />
            {steps.map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center max-w-[220px] mx-auto">
                <div className="w-16 h-16 bg-brand text-brand-fg rounded-2xl flex items-center justify-center text-2xl font-serif mb-4 shadow-soft">
                  {item.step}
                </div>
                <h3 className="text-lg font-serif text-text mb-2">{item.title}</h3>
                <p className="text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tecnología */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="eyebrow mb-4">Tecnología</span>
            <h2 className="text-3xl md:text-5xl font-serif text-text mt-3 mb-6">Precisión que marca la diferencia</h2>
            <p className="text-lg text-muted mb-8">Tecnología de vanguardia para garantizar diagnósticos exactos y tratamientos menos invasivos.</p>
            <ul className="space-y-4">
              {["Esterilización de nivel hospitalario", "Cirugía de implantes guiada", "Materiales biocompatibles de alta gama"].map((tech, i) => (
                <li key={i} className="flex items-center gap-3 text-text">
                  <span className="grid place-items-center h-7 w-7 rounded-full bg-success-soft text-success shrink-0">
                    <CheckCircle size={16} />
                  </span>
                  <span>{tech}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative h-[420px] rounded-3xl overflow-hidden ring-1 ring-border shadow-lift">
            <Image src="/images/tecnologia.jpg" alt="Tecnología dental" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Sobre nosotros */}
      <section className="py-24 bg-surface border-y border-border" id="sobre-nosotros">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <span className="eyebrow mb-4">Filosofía</span>
            <h2 className="text-3xl md:text-5xl font-serif text-text mt-3 mb-4">Sobre nosotros</h2>
            <p className="text-muted max-w-2xl mx-auto">Nuestra filosofía de trabajo y compromiso con tu sonrisa.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card p-8">
              <h3 className="text-2xl font-serif text-text mb-4 flex items-center gap-3">
                <Star className="text-accent" size={22} /> Misión
              </h3>
              <p className="text-muted leading-relaxed">
                Brindar atención odontológica de excelencia en implantología y estética dental, combinando precisión técnica, tecnología de vanguardia y un trato cercano que haga sentir a cada paciente escuchado y seguro.
              </p>
            </div>
            <div className="card p-8">
              <h3 className="text-2xl font-serif text-text mb-4 flex items-center gap-3">
                <Sparkles className="text-accent" size={22} /> Visión
              </h3>
              <p className="text-muted leading-relaxed">
                Ser la clínica de referencia en Cochabamba en implantes y diseño de sonrisa, reconocida por la confianza de sus pacientes y por un estándar internacional de calidad clínica.
              </p>
            </div>
          </div>
          <div className="bg-brand text-brand-fg rounded-3xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-serif mb-10 text-center">Nuestros valores</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((valor, i) => (
                <div key={i} className="bg-brand-fg/10 p-6 rounded-2xl border border-brand-fg/10 hover:bg-brand-fg/15 transition-colors">
                  <h4 className="font-medium text-lg mb-3 flex items-center gap-2">
                    <CheckCircle className="text-accent" size={18} /> {valor.title}
                  </h4>
                  <p className="text-brand-fg/75 text-sm leading-relaxed">{valor.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Equipo / Doctora */}
      <section className="py-24" id="equipo">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="bg-brand-soft/40 rounded-3xl p-8 md:p-16 flex flex-col md:flex-row gap-12 items-center">
            <div className="relative w-56 h-56 md:w-72 md:h-72 rounded-full overflow-hidden ring-4 ring-surface shadow-lift shrink-0">
              <Image src="/images/doctora.jpg" alt="Dra. Villarroel" fill sizes="288px" className="object-cover" />
            </div>
            <div className="flex-1">
              <span className="chip bg-accent-soft text-accent mb-4">
                <Award size={14} /> Negocio liderado por mujeres
              </span>
              <h2 className="text-3xl md:text-5xl font-serif text-text mb-2">Dra. Villarroel</h2>
              <h3 className="text-xl text-brand mb-6">Especialista en Ortopedia y Ortodoncia</h3>
              <div className="text-muted text-lg leading-relaxed space-y-4 mb-8">
                <p>La Dra. Marisol Villarroel es una referente en odontología especializada con más de 20 años de trayectoria internacional. Formó su base profesional en la Universidad Mayor de San Simón (UMSS) en Cochabamba.</p>
                <p>Se especializó en Ortodoncia en el IPENO y continuó su formación con subespecialidades en Buenos Aires, experiencia directa en Washington D.C. y programas de perfeccionamiento avanzado en Brasil.</p>
                <p>Hoy combina su recorrido académico con un enfoque vanguardista en implantología y estética dental de alta precisión, con los más rigurosos estándares clínicos internacionales.</p>
              </div>
              <a href={wa} className="btn-primary px-6 py-3 rounded-full">Hablar con la doctora</a>
            </div>
          </div>

          <div className="mt-20">
            <div className="text-center mb-12">
              <span className="eyebrow mb-4">Trayectoria</span>
              <h3 className="text-2xl md:text-4xl font-serif text-text mt-3">Trayectoria y certificaciones</h3>
            </div>
            <CertificatesGallery />
          </div>
        </div>
      </section>

      {/* Ubicación */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12" id="contacto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 card p-8 md:p-12">
          <div>
            <span className="eyebrow mb-4">Contacto</span>
            <h2 className="text-3xl font-serif text-text mt-3 mb-4">Visitá nuestra clínica</h2>
            <p className="text-muted mb-8">Calle Man Césped #342 y Washington, Edificio El Porvenir, Cochabamba, Bolivia.</p>
            <div className="space-y-6 mb-10">
              <ContactRow icon={<Phone size={18} />} title="WhatsApp directo" value="+591 72212402" />
              <ContactRow icon={<Clock size={18} />} title="Horarios de atención" value={<>Lunes a Viernes<br />Mañana: hasta 12:00 · Tarde: desde 15:00<br />Sábados: previa cita</>} />
            </div>
            <BookingCalendar />
          </div>
          <div className="relative h-[400px] lg:h-full min-h-[400px] rounded-2xl overflow-hidden ring-1 ring-border">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15229.076899479362!2d-66.1691238!3d-17.3986427!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x93e373f736c535cd%3A0x8e833481232822a1!2sJorge%20Washington%2C%20Cochabamba%2C%20Bolivia!5e0!3m2!1ses-419!2sar!4v1715000000000!5m2!1ses-419!2sar"
              width="100%" height="100%" style={{ border: 0 }} allowFullScreen={false} loading="lazy"
              referrerPolicy="no-referrer-when-downgrade" className="absolute inset-0"
            />
            <a href="https://maps.app.goo.gl/s56cVLy2Rd7aGTG87" target="_blank" rel="noopener noreferrer"
              className="absolute bottom-6 left-1/2 -translate-x-1/2 btn bg-surface text-brand shadow-lift rounded-full whitespace-nowrap">
              <MapPin size={18} /> Cómo llegar
            </a>
          </div>
        </div>
      </section>

      {/* Banner final */}
      <section className="py-24 bg-brand text-center px-6">
        <div className="max-w-3xl mx-auto">
          <span className="eyebrow justify-center mb-5 text-brand-fg/70">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Tu sonrisa, nuestra prioridad
          </span>
          <h2 className="text-3xl md:text-5xl font-serif text-brand-fg mb-4">Dale a tu sonrisa la clínica que se merece.</h2>
          <p className="text-brand-fg/80 text-lg mb-8 max-w-xl mx-auto">
            Escribinos hoy y coordinamos tu primera consulta. Sin vueltas, con la calidez de siempre.
          </p>
          <a href={wa} className="btn bg-surface text-brand text-lg px-8 py-4 rounded-full shadow-lift">
            Reservar por WhatsApp
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-hover text-brand-fg/80 py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-serif text-brand-fg mb-4">Clínica Villarroel</h3>
            <p className="max-w-sm mb-6">La clínica de implantes y estética dental de referencia en Cochabamba.</p>
            <span className="chip bg-brand-fg/10 text-brand-fg mb-6">
              <Award size={14} /> Negocio liderado por mujeres
            </span>
            <div className="flex items-center gap-3">
              {SOCIALS.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-brand-fg/10 hover:bg-brand-fg/20 flex items-center justify-center text-brand-fg transition-colors"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-brand-fg font-medium mb-4">Enlaces rápidos</h4>
            <ul className="space-y-3">
              {[["#servicios", "Servicios"], ["#casos", "Casos de éxito"], ["#sobre-nosotros", "Sobre nosotros"], ["#equipo", "Equipo"], ["#contacto", "Contacto"]].map(([h, l]) => (
                <li key={h}><a href={h} className="hover:text-brand-fg transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-brand-fg font-medium mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li>+591 72212402</li>
              <li>Calle Man Césped #342, Ed. El Porvenir, Cbba</li>
              <li>Lunes a Viernes (Sábados previa cita)</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center text-sm text-brand-fg/50 pt-8 border-t border-brand-fg/10">
          © {new Date().getFullYear()} Clínica Odontológica Villarroel. Todos los derechos reservados.
        </div>
      </footer>
    </main>
  );
}

function Dot() {
  return <span className="hidden md:block w-1 h-1 rounded-full bg-faint/50" />;
}

function ContactRow({ icon, title, value }: { icon: React.ReactNode; title: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-brand-soft flex items-center justify-center text-brand shrink-0">{icon}</div>
      <div>
        <p className="font-medium text-text">{title}</p>
        <p className="text-muted">{value}</p>
      </div>
    </div>
  );
}
