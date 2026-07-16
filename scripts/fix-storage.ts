import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fix() {
  const { data, error } = await supabase.rpc('exec_sql', { sql: `
    DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
    CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (
      bucket_id = 'product-images' AND
      auth.role() = 'authenticated'
    );
  ` })
  console.log('Result:', data, error)
}

fix()
