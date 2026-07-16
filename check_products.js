const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data: products } = await supabase.from('products').select('*');
  console.log('Products:', products ? products.length : 0);
  const { data: categories } = await supabase.from('categories').select('*');
  console.log('Categories:', categories ? categories.length : 0);
}
run();
