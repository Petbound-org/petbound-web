import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShelterNavbar } from "@/components/ui/shelter-navbar"
import { Building2 } from "lucide-react"

export default function ShelterDashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <ShelterNavbar />
      
      <div className="p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Shelter Dashboard</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Welcome</CardTitle>
              <CardDescription>
                You&apos;re signed in as a shelter. Manage your listings and profile from here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Shelter-specific features (e.g. listing pets, editing your profile) will appear here.
              </p>
              <Button asChild variant="outline">
                <Link href="/">Back to home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
