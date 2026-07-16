const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  try {
    // Get the first user to act as seller
    const { data: profiles, error: profileErr } = await supabase.from('profiles').select('id').limit(1);
    if (profileErr || !profiles || profiles.length === 0) {
      console.error('No profiles found to use as seller_id.');
      return;
    }
    const seller_id = profiles[0].id;

    // Get categories to link products to them
    const { data: categories, error: catErr } = await supabase.from('categories').select('id, slug');
    if (catErr || !categories) {
      console.error('Failed to fetch categories.');
      return;
    }
    
    const categoryMap = {};
    categories.forEach(c => categoryMap[c.slug] = c.id);

    const products = [
      {
        seller_id,
        category_id: categoryMap['brakes'] || categories[0].id,
        title: 'High Performance Cross-Drilled Brake Rotors',
        description: 'Upgrade your stopping power with these premium cross-drilled and slotted brake rotors. Designed to run cooler and stop faster under extreme conditions.',
        price: 189.99,
        condition: 'used',
        vehicle_make: 'Universal',
        stock_qty: 15,
        status: 'approved',
        images: ['/products/brake_rotors.png']
      },
      {
        seller_id,
        category_id: categoryMap['electrical'] || categories[0].id,
        title: 'Aggressive LED Headlight Assembly',
        description: 'Sleek, modern aftermarket LED headlights providing superior illumination and an aggressive stance. Direct plug-and-play fitment.',
        price: 349.50,
        condition: 'used',
        vehicle_make: 'Ford',
        stock_qty: 8,
        status: 'approved',
        images: ['/products/led_headlights.png']
      },
      {
        seller_id,
        category_id: categoryMap['body-parts'] || categories[0].id,
        title: 'Forged Alloy 19" Wheel Rim',
        description: 'Lightweight forged alloy wheel with a stunning metallic finish. Reduces unsprung weight for better handling and acceleration.',
        price: 299.00,
        condition: 'used',
        vehicle_make: 'BMW',
        stock_qty: 20,
        status: 'approved',
        images: ['/products/alloy_wheels.png']
      },
      {
        seller_id,
        category_id: categoryMap['engine-parts'] || categories[0].id,
        title: 'Stainless Steel Performance Exhaust',
        description: 'Cat-back dual tip exhaust system engineered for maximum flow and a deep, aggressive exhaust note.',
        price: 549.99,
        condition: 'used',
        vehicle_make: 'Honda',
        stock_qty: 5,
        status: 'approved',
        images: ['/products/exhaust_system.png']
      }
    ];

    const { data, error } = await supabase.from('products').insert(products).select();
    
    if (error) {
      console.error('Failed to insert products:', error.message);
    } else {
      console.log('Successfully inserted featured products:', data.length);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}
run();
