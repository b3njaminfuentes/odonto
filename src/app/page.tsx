import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ReviewsSlider from "@/components/ReviewsSlider";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import BookingCalendar from "@/components/BookingCalendar";
import CertificatesGallery from "@/components/CertificatesGallery";
import { Star, CheckCircle, Clock, MapPin, Phone, Award, ArrowRight, ShieldCheck, Smile, Stethoscope, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-secondary">
      <Navbar />
      
      <Hero />
      
      {/* 3.3 Barra de confianza (Inmediata, sin scroll) */}
      <section className="border-b border-neutral/10 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-4 text-sm font-medium text-textMain/70">
          <div className="flex items-center gap-2 text-primary">
            <Star className="text-accent" fill="currentColor" size={18}/> 
            4.9 en Google (19+ reseñas reales)
          </div>
          <div className="hidden md:block w-1 h-1 rounded-full bg-neutral/30"></div>
          <div>500+ implantes realizados</div>
          <div className="hidden md:block w-1 h-1 rounded-full bg-neutral/30"></div>
          <div>20+ años de experiencia clínica</div>
          <div className="hidden md:block w-1 h-1 rounded-full bg-neutral/30"></div>
          <div>98% satisfacción de pacientes</div>
        </div>
      </section>

      {/* 3.4 Testimonios Marquee (ReviewsSlider) */}
      <section className="py-24 overflow-hidden bg-white/50">
        <div className="text-center mb-10 max-w-7xl mx-auto px-6 md:px-12">
          <h2 className="text-3xl md:text-5xl font-serif text-primary mb-6">Lo que dicen nuestros pacientes</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-textMain/70">
            <span className="font-medium text-primary">Reseñas de pacientes reales de Cochabamba</span>
            <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-neutral/30"></div>
            <div className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-medium border border-purple-100">
              <Award size={14} />
              Negocio liderado por mujeres
            </div>
          </div>
        </div>
        
        <ReviewsSlider />
      </section>

      {/* 3.5 Casos de Éxito (Antes y Después) */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif text-primary mb-4">Transformaciones Reales</h2>
          <p className="text-textMain/70 max-w-2xl mx-auto">Deslizá para ver el impacto de nuestros tratamientos en la vida de nuestros pacientes. (Usa tus fotos aquí)</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          {/* Aquí se cargarán "antes.jpg" y "despues.jpg" cuando las pongas en la carpeta */}
          <BeforeAfterSlider 
            beforeImage="/images/antes.jpg" 
            afterImage="/images/despues.jpg"
          />
          <div className="mt-8 text-center">
            <h3 className="text-xl font-medium text-primary">Ortodoncia y Alineación Dental</h3>
            <p className="text-textMain/70 mt-2">Transformación real con nuestros tratamientos personalizados</p>
          </div>
        </div>
      </section>

      {/* 3.6 Servicios (Grid tipo Apple) */}
      <section className="py-24 bg-white" id="servicios">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif text-primary mb-4">Especialidades Clínicas</h2>
            <p className="text-textMain/70 max-w-2xl mx-auto">Odontología moderna con estándares hospitalarios de esterilización.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Implantes Dentales", desc: "Recuperá la funcionalidad y estética con implantes de titanio de primera línea.", image: "/images/implantes.jpg", icon: <ShieldCheck size={24}/> },
              { title: "Diseño de Sonrisa y Carillas", desc: "Resultados naturales y duraderos. El cambio estético que siempre soñaste.", image: "/images/carillas.jpg", icon: <Smile size={24}/> },
              { title: "Ortopedia y Ortodoncia", desc: "Alineación dental para una mordida perfecta. Tu cambio empieza hoy.", image: "/images/ortodoncia.jpg", icon: <CheckCircle size={24}/> },
              { title: "Rehabilitación Oral", desc: "Coronas, puentes y placas (totales y parciales) con materiales de alta estética.", image: "/images/rehabilitacion.jpg", icon: <Star size={24}/> },
              { title: "Blanqueamiento Dental", desc: "Aclará varios tonos en una sola sesión de forma segura y sin dolor.", image: "/images/blanqueamiento.jpg", icon: <Sparkles size={24}/> },
              { title: "Endodoncia", desc: "Tratamiento de conductos especializado para salvar tus piezas dentales.", image: "/images/endodoncia.jpg", icon: <Stethoscope size={24}/> },
              { title: "Gingivoplastia", desc: "Contorneado de encías para armonizar el tamaño de tus dientes y tu sonrisa.", image: "/images/gingivoplastia.jpg", icon: <Smile size={24}/> },
              { title: "Cirugía (Terceros Molares)", desc: "Extracciones seguras y planificadas. Agenda tu valoración hoy mismo.", image: "/images/molares.jpg", icon: <Stethoscope size={24}/> },
              { title: "Higiene y Prevención", desc: "Limpieza profunda con ultrasonido para mantener tus encías sanas.", image: "/images/limpieza.jpg", icon: <ShieldCheck size={24}/> },
            ].map((service, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-secondary/30 border border-neutral/10 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                {/* Background image effect on hover if image exists */}
                {service.image && (
                  <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                     <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                )}
                
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-medium text-primary mb-3">{service.title}</h3>
                  <p className="text-textMain/70 mb-6 line-clamp-3">{service.desc}</p>
                  
                  {/* Si hay imagen promocional, la mostramos en móviles siempre, y en desktop solo al hacer hover */}
                  {service.image && (
                     <div className="w-full h-32 md:h-40 rounded-xl overflow-hidden mb-6 block md:hidden md:group-hover:block transition-all shadow-md">
                       <img src={service.image} alt={service.title} className="w-full h-full object-cover object-center" />
                     </div>
                  )}

                  <a href="https://wa.me/59172212402" className="inline-flex items-center gap-2 text-primary font-medium group-hover:text-accent transition-colors">
                    Conocer más <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3.10 El camino del paciente (Timeline Animado) */}
      <section className="py-24 bg-primary/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <h2 className="text-3xl md:text-5xl font-serif text-primary mb-16 text-center">Tu camino hacia una nueva sonrisa</h2>
          <div className="flex flex-col md:flex-row justify-between relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-primary/20 -translate-y-1/2 z-0"></div>
            {[
              { step: "1", title: "Reserva", desc: "Agendá tu turno online o por WhatsApp." },
              { step: "2", title: "Evaluación", desc: "Escaneo digital y diagnóstico preciso." },
              { step: "3", title: "Tratamiento", desc: "Procedimiento cómodo y sin dolor." },
              { step: "4", title: "Sonrisa Nueva", desc: "Recuperación rápida y seguimiento." }
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center max-w-[200px] mx-auto mb-8 md:mb-0">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-serif mb-4 shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-lg font-medium text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-textMain/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3.11 Tecnología (con la foto de los moldes) */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-serif text-primary mb-6">Precisión que marca la diferencia</h2>
            <p className="text-lg text-textMain/70 mb-8">Utilizamos tecnología de vanguardia para garantizar diagnósticos exactos y tratamientos menos invasivos.</p>
            <ul className="space-y-4">
              {[
                "Esterilización de nivel hospitalario",
                "Cirugía de implantes",
                "Materiales biocompatibles de alta gama"
              ].map((tech, i) => (
                <li key={i} className="flex items-center gap-3 text-textMain/80">
                  <CheckCircle className="text-accent" size={20} />
                  <span>{tech}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative h-[400px] rounded-3xl overflow-hidden border border-neutral/20 shadow-xl">
            <img src="/images/tecnologia.jpg" alt="Tecnología Dental" className="w-full h-full object-cover object-center bg-neutral/20" />
          </div>
        </div>
      </section>

      {/* 3.12 Sobre Nosotros */}
      <section className="py-24 bg-secondary/30" id="sobre-nosotros">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif text-primary mb-4">Sobre Nosotros</h2>
            <p className="text-textMain/70 max-w-2xl mx-auto">Nuestra filosofía de trabajo y compromiso con tu sonrisa.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral/5 hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-serif text-primary mb-4 flex items-center gap-3">
                <Star className="text-accent" size={24} /> Misión
              </h3>
              <p className="text-textMain/70 leading-relaxed">
                Brindar atención odontológica de excelencia en implantología y estética dental, combinando precisión técnica, tecnología de vanguardia y un trato cercano que haga sentir a cada paciente escuchado y seguro.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral/5 hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-serif text-primary mb-4 flex items-center gap-3">
                <Sparkles className="text-accent" size={24} /> Visión
              </h3>
              <p className="text-textMain/70 leading-relaxed">
                Ser la clínica de referencia en Cochabamba en implantes y diseño de sonrisa, reconocida por la confianza de sus pacientes y por formar parte de un estándar internacional de calidad clínica.
              </p>
            </div>
          </div>

          <div className="bg-primary text-white rounded-[3rem] p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-serif mb-10 text-center">Nuestros Valores</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: "Precisión clínica", desc: "Cada diagnóstico y procedimiento respaldado por tecnología digital." },
                { title: "Calidez humana", desc: "La paciente y su tranquilidad están primero." },
                { title: "Actualización constante", desc: "Formación continua a nivel internacional." },
                { title: "Transparencia", desc: "El paciente sabe en todo momento qué tratamiento tiene, qué debe y qué sigue." }
              ].map((valor, i) => (
                <div key={i} className="bg-white/10 p-6 rounded-2xl border border-white/10 hover:bg-white/15 transition-colors">
                  <h4 className="font-medium text-lg mb-3 flex items-center gap-2">
                    <CheckCircle className="text-accent" size={18} /> {valor.title}
                  </h4>
                  <p className="text-white/70 text-sm leading-relaxed">{valor.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3.8 Equipo / Doctora */}
      <section className="py-24 bg-white" id="clinica">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="bg-primary/5 rounded-[3rem] p-8 md:p-16 flex flex-col md:flex-row gap-12 items-center">
            <div className="w-full md:w-1/3 aspect-square rounded-full overflow-hidden border-4 border-white shadow-xl">
              {/* Foto Doctora */}
              <img src="/images/doctora.jpg" alt="Dra. Villarroel" className="w-full h-full object-cover object-center" />
            </div>
            <div className="w-full md:w-2/3">
              <div className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium mb-4">
                <Award size={14} /> Negocio liderado por mujeres
              </div>
              <h2 className="text-3xl md:text-5xl font-serif text-primary mb-4">Dra. Villarroel</h2>
              <h3 className="text-xl text-accent mb-6">Especialista en Ortopedia y Ortodoncia</h3>
              <div className="text-textMain/75 text-lg leading-relaxed space-y-4 mb-8">
                <p>
                  La Dra. Marisol Villarroel es una referente en odontología especializada con más de 20 años de trayectoria internacional. Formó su sólida base profesional en la Universidad Mayor de San Simón (UMSS) en Cochabamba, la facultad de odontología de mayor prestigio en Bolivia.
                </p>
                <p>
                  Movida por la excelencia, se especializó en Ortodoncia en el prestigioso IPENO, y continuó su formación académica con subespecialidades en Buenos Aires, Argentina. Su visión clínica global se enriqueció con experiencia directa en Washington D.C., Estados Unidos, y programas de perfeccionamiento avanzado en Brasil.
                </p>
                <p>
                  Hoy en día, combina su vasto recorrido académico con un enfoque vanguardista en implantología y estética dental de alta precisión, garantizando tratamientos que cumplen con los más rigurosos estándares clínicos internacionales.
                </p>
              </div>
              <a href="https://wa.me/59172212402" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full hover-scale">
                Hablar con la doctora
              </a>
            </div>
          </div>
          
          {/* Galería de Certificados */}
          <div className="mt-20">
            <h3 className="text-2xl md:text-3xl font-serif text-primary mb-12 text-center">Trayectoria y Certificaciones</h3>
            <CertificatesGallery />
          </div>
        </div>
      </section>

      {/* 3.9 Ubicación y Mapa Real */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12" id="contacto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-neutral/10">
          
          {/* Columna 1: Info y Formulario/Calendario Placeholder */}
          <div>
            <h2 className="text-3xl font-serif text-primary mb-4">Visitá nuestra clínica</h2>
            <p className="text-textMain/70 mb-8">Calle Man Césped #342 y Washington, Edificio El Porvenir, Cochabamba, Bolivia.</p>
            
            <div className="space-y-6 mb-10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="font-medium text-textMain">WhatsApp Directo</p>
                  <p className="text-textMain/70">+591 72212402</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="font-medium text-textMain">Horarios de Atención</p>
                  <p className="text-textMain/70">Lunes a Viernes<br/>Mañana: hasta 12:00 PM<br/>Tarde: desde 15:00 PM<br/>Sábados: Previa cita</p>
                </div>
              </div>
            </div>

            {/* Calendario Interactivo Real (Frontend to WhatsApp) */}
            <BookingCalendar />
          </div>

          {/* Columna 2: Google Maps Embed Real */}
          <div className="relative h-[400px] lg:h-full min-h-[400px] rounded-2xl overflow-hidden border border-neutral/20">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15229.076899479362!2d-66.1691238!3d-17.3986427!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x93e373f736c535cd%3A0x8e833481232822a1!2sJorge%20Washington%2C%20Cochabamba%2C%20Bolivia!5e0!3m2!1ses-419!2sar!4v1715000000000!5m2!1ses-419!2sar" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 grayscale-[20%] contrast-[1.1] hue-rotate-[-10deg]" // Filtro CSS para que el mapa combine mejor con los tonos verdes
            ></iframe>
            
            {/* Floating button on map */}
            <a 
              href="https://maps.app.goo.gl/s56cVLy2Rd7aGTG87"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-primary px-6 py-3 rounded-full font-medium shadow-xl flex items-center gap-2 hover:bg-secondary transition-colors whitespace-nowrap"
            >
              <MapPin size={18} />
              Cómo llegar (Google Maps)
            </a>
          </div>
        </div>
      </section>

      {/* 3.13 Banner de Conversión Final */}
      <section className="py-24 bg-primary text-center px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-serif text-white mb-8">Te vas a dar una razón más para sonreír.</h2>
          <a href="https://wa.me/59172212402" className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-full text-lg font-medium hover-scale shadow-2xl">
            Reservar por WhatsApp
          </a>
        </div>
      </section>

      {/* 3.14 Footer */}
      <footer className="bg-primary text-white/80 py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-serif text-white mb-4">Clínica Odontológica Villarroel</h3>
            <p className="max-w-sm mb-6">La clínica de implantes y estética dental de referencia en Cochabamba.</p>
            <div className="inline-flex items-center gap-1.5 bg-white/10 text-white px-3 py-1 rounded-full text-xs font-medium">
              <Award size={14} /> Negocio liderado por mujeres
            </div>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-3">
              <li><a href="#servicios" className="hover:text-white transition-colors">Servicios</a></li>
              <li><a href="#casos" className="hover:text-white transition-colors">Casos de Éxito</a></li>
              <li><a href="#sobre-nosotros" className="hover:text-white transition-colors">Sobre Nosotros</a></li>
              <li><a href="#clinica" className="hover:text-white transition-colors">La Clínica</a></li>
              <li><a href="#contacto" className="hover:text-white transition-colors">Contacto</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li>+591 72212402</li>
              <li>Calle Man Césped #342, Ed. El Porvenir, Cbba</li>
              <li>Lunes a Viernes (Sábados previa cita)</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center text-sm text-white/50 pt-8 border-t border-white/10">
          © {new Date().getFullYear()} Clínica Odontológica Villarroel. Todos los derechos reservados.
        </div>
      </footer>
    </main>
  );
}
