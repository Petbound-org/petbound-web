import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Heart } from "lucide-react"

export default function PetNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            <div className="rounded-full bg-muted p-4">
              <AlertCircle className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold tracking-tight">404</h1>
              <p className="text-xl font-semibold">Pet Not Found</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            The pet you&apos;re looking for doesn&apos;t exist or may have been
            adopted already.
          </p>
          <Button asChild className="w-full">
            <Link href="/explore">
              <Heart className="w-4 h-4 mr-2" />
              Browse Available Pets
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
