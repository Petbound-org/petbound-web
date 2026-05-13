"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import useEmblaCarousel from "embla-carousel-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const HERO_IMAGES = [
  "/images/home-image-1.jpg",
  "/images/home-image-2.jpg",
  "/images/home-image-3.jpg",
  "/images/home-image-4.jpg",
  "/images/home-image-5.jpg",
] as const

export function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    containScroll: "trimSnaps",
    dragFree: false,
  })
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  React.useEffect(() => {
    if (!emblaApi) return
    const interval = window.setInterval(() => {
      emblaApi.scrollNext()
    }, 5000)
    return () => window.clearInterval(interval)
  }, [emblaApi])

  React.useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    onSelect()
    emblaApi.on("select", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi])

  return (
    <section className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden">
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex items-center h-full gap-4 px-4 md:px-8">
          {HERO_IMAGES.map((src, idx) => (
            <div
              key={src}
              className="relative shrink-0 w-[90%] md:w-[90%] h-full rounded-xl overflow-hidden"
              style={{ flex: "0 0 90%" }}
            >
              <div className="absolute inset-0 bg-black/55 z-10 rounded-xl" />
              <Image
                src={src}
                alt={`Petbound hero image ${idx + 1}`}
                fill
                priority={idx === 0}
                sizes="90vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4 z-20">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">
          Find Your New Best Friend
        </h1>
        <p className="text-lg md:text-2xl mb-6 drop-shadow-md max-w-3xl">
          Adopt an animal at risk of euthanasia today and save a life.
        </p>
        <div className="flex gap-4 pointer-events-auto">
          <Button size="lg" asChild>
            <Link href="/explore">Explore</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="bg-white/10 text-white border-white/40 hover:bg-white/20 hover:text-white"
          >
            <Link href="/about-us">Learn More</Link>
          </Button>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {HERO_IMAGES.map((_, idx) => (
          <button
            key={idx}
            aria-label={`Go to slide ${idx + 1}`}
            onClick={() => emblaApi?.scrollTo(idx)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              selectedIndex === idx
                ? "bg-white w-6"
                : "bg-white/50 hover:bg-white/80",
            )}
          />
        ))}
      </div>
    </section>
  )
}
