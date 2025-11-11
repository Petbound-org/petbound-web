import * as React from "react"
import Link from "next/link"
import { User, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

function Navbar({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <header
      className={cn("w-full border-b bg-white dark:bg-gray-900", className)}
      {...props}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-6">
        {/* Left: Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="text-xl font-bold">
            Petbound
          </Link>
        </div>
        {/* Center: Search bar */}
        <div className="flex-1 mx-8">
          <InputGroup>
            <InputGroupInput placeholder="Search..." />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>
        </div>
        {/* Right: Buttons */}
        <div className="flex items-center space-x-4">
          <Button variant="default" asChild>
            <Link href="/saved-pets">Saved</Link>
          </Button>
          <Button variant="outline" asChild className="flex items-center gap-1">
            <Link href="/login">
              <User className="h-4 w-4" />
              Login
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

export { Navbar }
