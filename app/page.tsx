import { Navbar } from "@/components/ui/navbar"
import { HeroCarousel } from "@/components/ui/hero-carousel"
import { HeroPetsContainer } from "@/components/ui/hero-pets-container"
import { Footer } from "@/components/ui/footer"

export default function Page() {
  return (
    <div className="m-0 p-0">
      <Navbar />
      <HeroCarousel />
      <HeroPetsContainer />
      <Footer />
    </div>
  )
}
