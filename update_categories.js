const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Need service role to bypass RLS for direct updates
);

async function run() {
  const updates = [
    { slug: 'engine-parts', image_url: '/category-images/engine-parts.png' },
    { slug: 'transmission', image_url: '/category-images/transmission.png' },
    { slug: 'brakes', image_url: '/category-images/brakes.png' },
    { slug: 'electrical', image_url: '/category-images/electrical.png' },
    { slug: 'body-parts', image_url: '/category-images/body-parts.png' },
    { slug: 'interiors', image_url: '/category-images/interiors.png' }
  ];

  for (const update of updates) {
    const { data, error } = await supabase
      .from('categories')
      .update({ image_url: update.image_url })
      .eq('slug', update.slug);
      
    if (error) {
      console.error(`Error updating ${update.slug}:`, error.message);
    } else {
      console.log(`Successfully updated ${update.slug}`);
    }
  }
}
run();
