const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase URL or Service Role Key");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function createAdmin() {
  const email = '2001@clinicavillarroel.com'; // Derived from pseudo code logic
  const password = 'marisoltequila';

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: { role: 'admin', name: 'Dra. Marisol Villarroel' }
  });

  if (error) {
    console.error("Error creando usuaria administradora:", error.message);
  } else {
    console.log("Usuaria administradora creada exitosamente:", data.user.id);
  }
}

createAdmin();
