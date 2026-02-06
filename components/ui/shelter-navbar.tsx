import * as React from "react"
import Link from "next/link"
import { User, PawPrint, BarChart3, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function ShelterNavbar({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <header
      className={cn("w-full bg-white dark:bg-black border-b", className)}
      {...props}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-6">
        {/* Left: Logo */}
        <div className="shrink-0">
          <Link href="/shelter/dashboard" className="flex items-center gap-3">
            <span className="text-xl font-bold">Petbound</span>
          </Link>
        </div>
        
        {/* Right: Navigation Buttons */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild className="flex items-center gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Home
            </Link>
          </Button>
          <Button variant="ghost" asChild className="flex items-center gap-2">
            <Link href="/shelter/profile">
              <User className="h-4 w-4" />
              Profile
            </Link>
          </Button>
          <Button variant="ghost" asChild className="flex items-center gap-2">
            <Link href="/shelter/pets">
              <PawPrint className="h-4 w-4" />
              My Pets
            </Link>
          </Button>
          <Button variant="ghost" asChild className="flex items-center gap-2">
            <Link href="/shelter/analytics">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

export { ShelterNavbar }
