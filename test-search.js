const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  console.log('--- TEST: PACIENTES TOTALES ---');
  const { count: totalCount } = await supabase.from('Patient').select('*', { count: 'exact', head: true });
  console.log('Total pacientes en DB:', totalCount);

  if (totalCount < 25) {
    console.log('No hay suficientes pacientes para probar el caso #25. Creando pacientes dummy...');
    for (let i = 0; i < 25; i++) {
       await supabase.from('Patient').insert({
         firstName: `TestPaciente${i}`,
         lastName: 'Prueba',
         patientCode: `TST-${i}-${Date.now()}`,
         dob: new Date().toISOString()
       });
    }
    const { count: newCount } = await supabase.from('Patient').select('*', { count: 'exact', head: true });
    console.log('Nuevos pacientes totales:', newCount);
  }

  console.log('\n--- TEST: BUSCANDO AL PACIENTE #25 VÍA ILIKE ---');
  const q = 'TestPaciente24';
  
  let query = supabase.from('Patient').select('id, firstName, lastName').or(`firstName.ilike.%${q}%,lastName.ilike.%${q}%`);
  
  const { data } = await query;
  console.log('Resultado de la búsqueda para "TestPaciente24":', data);
}
test();
