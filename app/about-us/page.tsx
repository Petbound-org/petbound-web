import Link from "next/link"
import { ShieldAlert, Globe, PawPrint, HeartHandshake } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "About Us — Petbound",
  description:
    "Petbound exists to give animals on euthanasia watchlists a second chance through urgent, focused visibility.",
}

export default function AboutUsPage() {
  return (
    <div className="flex min-h-screen justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-4xl space-y-12">
        <header className="text-left pt-10 pb-6">
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl">
            <span className="text-primary">Petbound</span>
          </h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-3xl">
            Giving animals at risk of euthanasia a second chance at life.
          </p>
        </header>

        <Separator />

        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <ShieldAlert className="w-6 h-6 mr-3 text-primary" />
            Our Mission: A Critical Lifeline
          </h2>
          <Card className="border-2">
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-xl font-semibold text-foreground">
                Why Petbound Exists
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Petbound is an adoption platform{" "}
                <strong>exclusively dedicated</strong> to listing animals whose
                time is running out. We partner directly with shelters and
                rescues to prioritize visibility for pets on{" "}
                <strong>euthanasia watch lists</strong> or those facing critical
                deadlines due to limited space or resources.
              </p>
              <p className="text-sm font-medium text-primary/90">
                This focused approach ensures every connection made through
                Petbound is a potentially life-saving match, diverting attention
                solely to the most vulnerable pets.
              </p>
            </CardContent>
          </Card>
        </section>

        <Separator />

        <section className="space-y-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground text-center">
            How Petbound Works
          </h2>

          <Step
            icon={<PawPrint className="w-10 h-10 mx-auto text-primary mb-2" />}
            title="1. Urgent Listings"
            body="Shelters provide Petbound with real-time data on animals with the most pressing need. This includes photos, biographies, and, critically, their current risk status. We do not list low-risk animals."
          />

          <Separator className="md:hidden" />

          <Step
            icon={<Globe className="w-10 h-10 mx-auto text-primary mb-2" />}
            title="2. Maximum Visibility"
            body="Our platform is optimized for discovery, ensuring these pets are seen by a wide audience of potential adopters and foster homes. We streamline the initial contact process so animals get noticed fast."
          />

          <Separator className="md:hidden" />

          <Step
            icon={
              <HeartHandshake className="w-10 h-10 mx-auto text-primary mb-2" />
            }
            title="3. Life-Saving Connections"
            body="When you express interest in a Petbound animal, we connect you directly with the partnering shelter to finalize the adoption process, ensuring a smooth transition to a forever home."
          />
        </section>

        <Separator />

        <section className="text-center pb-10">
          <h2 className="text-2xl font-bold text-foreground">
            Your Role in the Mission
          </h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            By browsing Petbound, you are looking past millions of low-risk
            animals to focus on the ones that need you the most. Thank you for
            choosing to save a life.
          </p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/explore">View Pets Needing Urgent Adoption</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}

function Step({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
      <div className="shrink-0 w-full md:w-1/3 text-center">
        {icon}
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-muted-foreground md:w-2/3 leading-relaxed">{body}</p>
    </div>
  )
}
