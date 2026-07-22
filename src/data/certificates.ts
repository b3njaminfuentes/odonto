export type CertificateCategory = 
  | 'Especialidad'
  | 'Diplomado'
  | 'Certificación'
  | 'Título Universitario'
  | 'Curso Internacional'

export interface Certificate {
  id: string
  title: string
  institution: string
  year: string
  category: CertificateCategory
  filename: string
  rotationClass?: string // CSS class para arreglar las fotos volcadas automáticamente
  description?: string
}

export const certificatesData: Certificate[] = [
  {
    id: 'tit-1',
    title: 'Cirujano Dentista (Provisión Nacional)',
    institution: 'Universidad Mayor de San Simón',
    year: '1999',
    category: 'Título Universitario',
    filename: 'cirujano-nacional.jpg',
  },
  {
    id: 'tit-2',
    title: 'Cirujano Dentista (Diploma Académico)',
    institution: 'Universidad Mayor de San Simón',
    year: '1998',
    category: 'Título Universitario',
    filename: 'cirujano-academico.jpg',
  },
  {
    id: 'esp-1',
    title: 'Máster en Ortodoncia y Ortopedia Maxilar',
    institution: 'Univ. Juan Misael Saracho / IPENO',
    year: '2013',
    category: 'Especialidad',
    filename: 'master-ortodoncia.jpg',
    rotationClass: 'rotate-180',
  },
  {
    id: 'esp-2',
    title: 'Especialización en Prótesis Dental',
    institution: 'Centro Universitario do Norte Paulista (Brasil)',
    year: '2017',
    category: 'Especialidad',
    filename: 'protesis-brasil.jpg',
    rotationClass: 'rotate-180',
  },
  {
    id: 'dip-1',
    title: 'Diplomado Intercept - Nivel 5 (Diamante)',
    institution: 'Odontología Sin Fronteras',
    year: '2024',
    category: 'Diplomado',
    filename: 'intercept-diamante.jpg',
    rotationClass: '-rotate-90',
  },
  {
    id: 'dip-2',
    title: 'Diplomado Intercept - Nivel 2 (Zafiro)',
    institution: 'Odontología Sin Fronteras',
    year: '2024',
    category: 'Diplomado',
    filename: 'intercept-zafiro.jpg',
    rotationClass: '-rotate-90',
  },
  {
    id: 'dip-3',
    title: 'Diplomado Intercept - Nivel 1 (Perla)',
    institution: 'Odontología Sin Fronteras',
    year: '2024',
    category: 'Diplomado',
    filename: 'intercept-perla.jpg',
    rotationClass: '-rotate-90',
  },
  {
    id: 'cert-1',
    title: 'Certificación de Alineadores Invisibles',
    institution: 'See U Smile',
    year: '2023',
    category: 'Certificación',
    filename: 'see-u-smile.jpg',
    rotationClass: 'rotate-180',
  },
  {
    id: 'cert-2',
    title: 'Certificación Avanzada CA Clear Aligner',
    institution: 'Clear Aligner Academy',
    year: '2018',
    category: 'Certificación',
    filename: 'clear-aligner-avanzado.jpg',
    rotationClass: 'rotate-90',
  },
  {
    id: 'cert-3',
    title: 'Certificación Inicial CA Clear Aligner',
    institution: 'Clear Aligner Academy',
    year: '2018',
    category: 'Certificación',
    filename: 'clear-aligner-inicial.jpg',
    rotationClass: 'rotate-90',
  },
  {
    id: 'cur-1',
    title: 'Sistema Damon - Módulo II',
    institution: 'Ormco / UNIFRANZ',
    year: '2016',
    category: 'Curso Internacional',
    filename: 'damon-modulo2.jpg',
    rotationClass: 'rotate-180',
  },
  {
    id: 'cur-2',
    title: 'Curso Intensivo Técnica Damon',
    institution: 'Ormco / UNIFRANZ',
    year: '2016',
    category: 'Curso Internacional',
    filename: 'damon-intensivo.jpg',
    rotationClass: 'rotate-180',
  },
  {
    id: 'cur-3',
    title: 'Carillas Lente de Contacto',
    institution: 'Odontología Mendizabal',
    year: '2015',
    category: 'Curso Internacional',
    filename: 'carillas.jpg',
    rotationClass: 'rotate-180',
  },
  {
    id: 'cur-4',
    title: 'Cirugía y Traumatología Bucomaxilofacial',
    institution: 'Hospital Interzonal Eva Perón (Argentina)',
    year: '2000',
    category: 'Curso Internacional',
    filename: 'cirugia-maxilofacial.jpg',
    rotationClass: 'rotate-90',
  },
  {
    id: 'cur-5',
    title: 'Oseointegración y Prótesis en Implantología',
    institution: 'Procera & RX',
    year: '2008',
    category: 'Curso Internacional',
    filename: 'implantologia.jpg',
    rotationClass: 'rotate-180',
  },
  {
    id: 'cur-6',
    title: 'Microimplantes en Ortodoncia',
    institution: 'Instituto Geodent (Chile)',
    year: '2017',
    category: 'Curso Internacional',
    filename: 'microimplantes.jpg',
    rotationClass: 'rotate-180',
  },
  {
    id: 'cur-7',
    title: 'Mejores Resultados en Ortodoncia Moderna',
    institution: 'FDILA',
    year: '2011',
    category: 'Curso Internacional',
    filename: 'ortodoncia-moderna.jpg',
    rotationClass: 'rotate-180',
  },
  {
    id: 'cur-8',
    title: 'Blanqueamiento Dental',
    institution: 'FGM',
    year: '2023',
    category: 'Curso Internacional',
    filename: 'blanqueamiento.jpg',
    rotationClass: 'rotate-180',
  },
  {
    id: 'cur-9',
    title: 'Resinas Compuestas Anteriores',
    institution: 'Arauco Odontología (Brasil)',
    year: '2023',
    category: 'Curso Internacional',
    filename: 'resinas.jpg',
    rotationClass: '-rotate-90',
  }
]
