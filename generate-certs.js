const fs = require('fs');
const path = require('path');

const certsDir = path.join(__dirname, 'public', 'certificates');
const files = fs.readdirSync(certsDir).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'));

const certs = files.map((f, i) => ({
  id: `cert-${i}`,
  filename: f,
  title: '',
  category: 'Certificado',
  institution: '',
  year: '',
  rotationClass: ''
}));

const content = `export type CertificateCategory = 'Certificado';
export interface Certificate {
  id: string;
  title: string;
  institution: string;
  year: string;
  category: CertificateCategory;
  filename: string;
  description?: string;
  rotationClass?: string;
}

export const certificatesData: Certificate[] = ${JSON.stringify(certs, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, 'src', 'data', 'certificates.ts'), content);
console.log('Done generating certificates.ts');
