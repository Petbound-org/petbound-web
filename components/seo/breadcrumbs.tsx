import Link from "next/link"
import React from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { JsonLd } from "@/components/seo/json-ld"
import { breadcrumbJsonLd, type BreadcrumbItemInput } from "@/lib/seo/schema"

/**
 * Breadcrumb trail with matching BreadcrumbList JSON-LD. The last item is
 * treated as the current page and rendered without a link.
 */
export function Breadcrumbs({ items }: { items: BreadcrumbItemInput[] }) {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(items)} />
      <Breadcrumb>
        <BreadcrumbList>
          {items.map((item, i) => (
            <React.Fragment key={`${item.name}-${i}`}>
              {i > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {item.href && i < items.length - 1 ? (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.name}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.name}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  )
}
