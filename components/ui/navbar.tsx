"use client"

import * as React from "react"
import Link from "next/link"
import { Heart, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"
import { useFavorites } from "@/lib/favorites-context"

const SCROLL_THRESHOLD_PX = 12

function Navbar({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const { favorites, isReady } = useFavorites()
  const count = isReady ? favorites.length : 0

  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > SCROLL_THRESHOLD_PX)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "w-full sticky top-0 z-40 transition-[background-color,backdrop-filter,border-color,box-shadow] duration-300 ease-out",
        scrolled
          ? "border-b border-border/40 bg-background/70 backdrop-blur-sm supports-backdrop-filter:bg-background/62"
          : "border-b border-transparent bg-background shadow-none backdrop-blur-0",
        className,
      )}
      {...props}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-8 py-4">
        <div className="shrink-0">
          <Link
            href="/"
            className="flex items-center gap-3 text-xl font-bold tracking-tight"
          >
            <span className="text-primary">Petbound</span>
          </Link>
        </div>

        <div className="hidden md:flex flex-1 max-w-xl">
          <InputGroup
            className={cn(
              "transition-[background-color,box-shadow,border-color] duration-300",
              scrolled
                ? "border-border/80 bg-background shadow-sm dark:border-border dark:bg-card"
                : "dark:bg-input/30",
            )}
          >
            <InputGroupInput placeholder="Search…" />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="default" asChild>
            <Link href="/explore">Explore</Link>
          </Button>
          <Button
            variant="outline"
            asChild
            className="relative flex items-center gap-1.5"
            aria-label={`Saved pets${count > 0 ? `, ${count} item${count === 1 ? "" : "s"}` : ""}`}
          >
            <Link href="/saved">
              <Heart
                className={cn(
                  "h-4 w-4",
                  count > 0 && "text-red-500 fill-red-500",
                )}
              />
              <span className="hidden sm:inline">Saved</span>
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs font-semibold flex items-center justify-center">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

export { Navbar }
