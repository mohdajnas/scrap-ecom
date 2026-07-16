import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const categories = [
  { slug: 'engine-parts', name: 'Engine Parts', description: 'Engine components like pistons, valves, blocks.' },
  { slug: 'transmission', name: 'Transmission & Gearbox', description: 'Manual and automatic transmissions, clutches.' },
  { slug: 'brakes', name: 'Brakes & Suspension', description: 'Brake pads, rotors, shocks, and struts.' },
  { slug: 'electrical', name: 'Electrical & Lighting', description: 'Batteries, alternators, headlights.' },
  { slug: 'body-parts', name: 'Body & Exteriors', description: 'Doors, bumpers, mirrors, and hoods.' },
  { slug: 'interiors', name: 'Interiors', description: 'Seats, dashboards, steering wheels.' },
]

async function seedCategories() {
  console.log("Seeding categories...")
  
  for (const cat of categories) {
    const { data, error } = await supabase
      .from('categories')
      .upsert(cat, { onConflict: 'slug' })
      
    if (error) {
      console.error(`Error inserting ${cat.slug}:`, error.message)
    } else {
      console.log(`Inserted/Updated ${cat.name}`)
    }
  }
  
  console.log("Seeding complete.")
}

seedCategories()
