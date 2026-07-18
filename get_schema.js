const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase.from('order_items').select('*').limit(1);
  if (error) {
    console.error("Query Error:", error.message);
  } else if (data && data.length > 0) {
    console.log("Columns found based on first row:", Object.keys(data[0]));
  } else {
    console.log("No data found, can't infer schema from empty result.");
  }
}
checkSchema();
