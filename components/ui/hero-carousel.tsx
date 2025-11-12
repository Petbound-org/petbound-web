"use client"

import * as React from "react"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import { Button } from "@/components/ui/button"

const heroImages = [
  "/images/home-image-1.jpg",
  "/images/home-image-2.jpg",
  "/images/home-image-3.jpg",
  "/images/home-image-4.jpg",
  "/images/home-image-5.jpg",
]

export function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    containScroll: "trimSnaps",
    dragFree: false,
  })

  // Auto scroll
  React.useEffect(() => {
    if (!emblaApi) return
    const interval = setInterval(() => {
      emblaApi.scrollNext()
    }, 4000)
    return () => clearInterval(interval)
  }, [emblaApi])

  return (
    <section className="relative w-full h-[80vh] overflow-hidden">
      {/* Carousel */}
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex items-center h-full gap-4 px-4 md:px-8">
          {heroImages.map((src, idx) => (
            <div
              key={idx}
              className="relative flex-shrink-0 w-[80%] md:w-[65%] h-full rounded-xl overflow-hidden"
              style={{ flex: "0 0 70%" }} // ensures the width doesn't shrink
            >
              <Image
                src={src}
                alt={`Slide ${idx + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Overlay content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4 md:px-0">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">
          Find Your New Best Friend
        </h1>
        <p className="text-lg md:text-2xl mb-6 drop-shadow-md">
          Adopt a pet today and give them a loving home
        </p>
        <div className="flex gap-4">
          <Button variant="default" asChild>
            <a href="/adopt">Adopt Now</a>
          </Button>
          <Button
            variant="outline"
            asChild
            className="text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900"
          >
            <a href="/learn-more">Learn More</a>
          </Button>
        </div>
      </div>
    </section>
  )
}
