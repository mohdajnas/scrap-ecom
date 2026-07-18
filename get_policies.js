const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.rpc('get_policies');
  if (error) {
    // If rpc doesn't exist, let's just query pg_policies using postgres connection if we had it, but we can't easily query pg_policies through REST unless exposed.
    console.log("Error or RPC not found", error);
  } else {
    console.log(data);
  }
}
run();
