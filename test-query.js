const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  const { data: patient, error } = await supabase
    .from('Patient')
    .select(`
      *,
      appointments:Appointment(startsAt, endsAt, treatmentType, status),
      history:ClinicalHistory(medicalHistory),
      treatments:Treatment(id, status),
      media:CaseMedia(id)
    `)
    .limit(1)
    .single();

  console.log('Error:', error);
  console.log('Patient:', patient);
}

test();
