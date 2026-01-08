import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Wrench, Mail, Heart } from "lucide-react"

export default function UnderConstruction() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-2 border-primary">
          <CardContent className="pt-8 pb-6 text-center space-y-6">

            {/* Header and Icon */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="rounded-full bg-muted p-4 border border-border">
                {/* Icon is Wrench, color relies on foreground for theme consistency */}
                <Wrench className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Platform Development</h1>
                <p className="text-lg font-medium text-muted-foreground">We're still under construction!</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Message for Users (Neutral, based on border/background contrast) */}
              <div className="bg-muted p-4 rounded-lg border border-border text-left">
                <h3 className="text-md font-semibold text-foreground flex items-center mb-1">
                    <Heart className="w-4 h-4 mr-2 text-primary" />
                    For Adopters
                </h3>
                <p className="text-sm text-muted-foreground">
                  Our core browsing features are operational. Please <strong>continue using the website without logging in</strong> to find your next companion. User accounts and login features are coming soon.
                </p>
              </div>

              {/* Message for Shelters (Neutral, based on border/background contrast) */}
              <div className="bg-muted p-4 rounded-lg border border-border text-left">
                <h3 className="text-md font-semibold text-foreground flex items-center mb-1">
                    <Mail className="w-4 h-4 mr-2 text-primary" />
                    For Shelters
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  We are actively onboarding new shelters. If you represent a shelter, please email us at petboundorg@gmail.com to set up your shelter account.
                </p>
                <p className="text-sm font-semibold text-primary/80">
                  petbounorg@gmail.com
                </p>
              </div>
            </div>

            {/* Call to Action Button */}
            <div className="pt-2">
              <Button asChild className="w-full">
                <a href="/explore">
                  Browse Available Pets
                  <Heart className="w-4 h-4 mr-2" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
}

