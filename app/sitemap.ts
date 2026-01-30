export const revalidate = 86400; // 24 hours

import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabaseClient";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch pet data from Supabase
  const { data: pets, error } = await supabase
    .from("pets")
    .select("id, updated_at");

  if (error) {
    console.error("Sitemap Supabase Error:", error);
  } else {
    console.log("Sitemap Pets Data:", pets?.length ?? 0);
  }

  // Static pages
  const staticPaths = ["/", "/learn-more", "/about-us", "/explore", "/login"];
  const staticPages = staticPaths.map((path) => ({
    url: `https://petbound.org${path}`,
    lastModified: new Date(),
  }));

  // Dynamic pet pages
  const petPages = (pets || []).map((p: { id: number; updated_at: string | null }) => ({
    url: `https://petbound.org/pets/${p.id}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
  }));

  return [...staticPages, ...petPages];
}
