import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, MapPin, Phone } from "lucide-react"

import type { Shelter } from "@/lib/types/shelter.interface"

/**
 * Shelter contact block shared by the pet detail page and the shelter/city
 * hub pages. When `href` is given the title links to the shelter's hub page.
 */
export function ShelterContactCard({
  shelter,
  href,
}: {
  shelter: Shelter
  href?: string
}) {
  const title = shelter.name ?? "Partner Shelter"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          {href ? (
            <Link href={href} className="hover:underline">
              {title}
            </Link>
          ) : (
            title
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {(shelter.address || shelter.city || shelter.state) && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  [shelter.address, shelter.city, shelter.state]
                    .filter(Boolean)
                    .join(", "),
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {shelter.address && <div>{shelter.address}</div>}
                {(shelter.city || shelter.state) && (
                  <div>
                    {[shelter.city, shelter.state].filter(Boolean).join(", ")}
                  </div>
                )}
              </a>
            </div>
          )}

          {shelter.phone_number && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <a
                href={`tel:${shelter.phone_number}`}
                className="hover:underline"
              >
                {shelter.phone_number}
              </a>
            </div>
          )}

          {shelter.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <a
                href={`mailto:${shelter.email}`}
                className="hover:underline break-all"
              >
                {shelter.email}
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
