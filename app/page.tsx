import { HeroCarousel } from "@/components/ui/hero-carousel"
import { HeroPetsContainer } from "@/components/ui/hero-pets-container"
import { HomeHubLinks } from "@/components/ui/home-hub-links"

// The nearby grid is cached now, so the homepage no longer has to be rendered
// per request. Matches CACHE_TTL.nearbyPets.
export const revalidate = 60

export const metadata = {
  alternates: { canonical: "/" },
}

export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      <HeroPetsContainer />
      <HomeHubLinks />
    </>
  )
}
