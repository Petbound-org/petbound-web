import Link from "next/link"
import { ShelterNavbar } from "@/components/ui/shelter-navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { BarChart3, Construction } from "lucide-react"

export default function ShelterAnalyticsPage() {
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <ShelterNavbar />
      
      {/* Breadcrumb Section */}
      <div className="border-b">
        <div className="px-8 py-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/shelter/dashboard">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Analytics</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-8 py-6 flex items-center justify-center">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Analytics Dashboard</CardTitle>
            <CardDescription className="text-base mt-2">
              Coming Soon
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
              <Construction className="h-5 w-5" />
              <p className="text-sm font-medium">Under Construction</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We&apos;re currently working on building comprehensive analytics features 
              to help you track pet adoption rates, engagement metrics, and shelter performance. 
              This feature will be available soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
