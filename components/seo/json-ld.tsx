/**
 * Renders a JSON-LD <script>. The payload includes scraped pet/shelter text
 * (names, descriptions), so we escape "<" to its unicode form; otherwise a
 * value containing a literal "</script>" would close the tag early and allow
 * markup injection (stored XSS). The escaped sequence is still valid JSON.
 */
export function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c")
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}
