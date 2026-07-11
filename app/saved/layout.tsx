import type { Metadata } from "next"

// The saved list lives in localStorage, so this page is device-specific and
// has no indexable content — keep it out of search results.
export const metadata: Metadata = {
  title: "Saved Pets",
  description: "Pets you've saved on this device.",
  robots: { index: false, follow: true },
}

export default function SavedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
