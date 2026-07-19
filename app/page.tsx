import { HeroCarousel } from "@/components/ui/hero-carousel"
import { HeroPetsContainer } from "@/components/ui/hero-pets-container"
import { HomeHubLinks } from "@/components/ui/home-hub-links"

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
