import { createClient } from '@supabase/supabase-js' // Import your DB client here

// Create a function to fetch data directly
async function getPetData(id: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // Use the *read-only* key here, or a service role key if securely stored
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  )

  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    // throw an error or handle the case gracefully
    console.error(error)
    return null // Indicate that data wasn't found
  }
  return data
}


export default async function PetPage({ params }: { params: { id: string } }) {
  // Call the function directly instead of using fetch()
  const data = await getPetData(params.id) 

  if (!data) {
    return <div>Not found</div>
  }

  // data is now your "prop"
  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.breed}</p>
      <p>{data.age}</p>
    </div>
  )
}
// You can now delete the /api/pets/[id]/route.ts file if it's only used by this page.