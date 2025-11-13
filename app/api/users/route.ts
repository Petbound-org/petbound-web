import { NextResponse } from "next/server"

// Example: Handle GET requests (e.g. /api/pets)
export async function GET() {
  const pets = [
    { id: 1, name: "Bella", breed: "Golden Retriever" },
    { id: 2, name: "Max", breed: "German Shepherd" },
  ]

  return NextResponse.json(pets)
}

// Example: Handle POST requests (e.g. add a new pet)
export async function POST(request: Request) {
  const body = await request.json() // parse request body
  const { name, breed } = body

  // normally you'd insert into DB here
  const newPet = { id: 3, name, breed }

  return NextResponse.json(newPet, { status: 201 })
}
