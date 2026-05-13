// app/learn-more/page.tsx
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShieldAlert, Globe, PawPrint, HeartHandshake, Pin, Megaphone, Search, HeartPulse } from "lucide-react"

export default function LearnMorePage() {
    return (
        <div className="flex min-h-screen justify-center bg-background p-4 sm:p-8">
            <div className="w-full max-w-4xl space-y-12">
                
                {/* 🌟 IMPROVED HEADER SECTION (Left-Aligned) 🌟 */}
                <header className="text-left pt-10 pb-6">
                    <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl">
                        <span className="text-primary">Petbound</span>
                    </h1>
                    <p className="mt-4 text-xl text-muted-foreground max-w-3xl">
                        Connecting the lifeline for pets who can't wait.
                    </p>
                </header>
                
                <Separator />

                {/* IMPROVED CORE PHILOSOPHY SECTION (Left-Aligned) */}
                <section className="space-y-6">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
                        <ShieldAlert className="w-6 h-6 mr-3 text-primary" />
                        Our Mission:
                    </h2>
                    <Card className="border-2">
                        <CardContent className="pt-8 space-y-6 flex flex-col items-start text-left">
                            <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
                                <p className="text-base italic text-foreground font-serif">
                                    “Approximately <strong>607,000</strong> shelter animals were euthanized in the U.S. in 2024. Most were simply due to overcrowding and lack of space.”
                                </p>
                                <p className="text-base font-bold ext-xl text-foreground">
                                    At Petbound, we believe we can change this number together.
                                </p>
                                <p className="text-base ext-xl text-muted-foreground">
                                    We built Petbound as an adoption platform that fosters critical connections between compassionate homes and animals running out of time. We partner directly with shelters to prioritize visibility for pets on euthanasia lists, ensuring those facing critical deadlines are seen before it’s too late. We exist to save these lives and bring them to the loving homes they deserve.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <Separator />

                {/* How Petbound Works Section (Kept Centered Headings for flow) */}
                <section className="space-y-8">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground text-center">
                        How Petbound Works
                    </h2>
                    
                    {/* Step 1: Shelter Integration */}
                    <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
                        <div className="shrink-0 w-full md:w-1/3 text-center">
                            <Search className="w-10 h-10 mx-auto text-primary mb-2" />
                            <h3 className="text-lg font-semibold text-foreground">1. Targeting the Urgent</h3>
                        </div>
                        <p className="text-muted-foreground md:w-2/3 leading-relaxed">
                            We retrieve real-time data from shelters, focusing on animals with the most urgent needs. By syncing photos, biographies, and critical risk status, we guarantee our platform remains a dedicated space for those who cannot wait.
                        </p>
                    </div>
                    
                    <Separator className="md:hidden" />

                    {/* Step 2: Global Reach */}
                    <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
                        <div className="shrink-0 w-full md:w-1/3 text-center">
                            <Globe className="w-10 h-10 mx-auto text-primary mb-2" />
                            <h3 className="text-lg font-semibold text-foreground">2. Maximizing Visibility</h3>
                        </div>
                        <p className="text-muted-foreground md:w-2/3 leading-relaxed">
                            Our platform is optimized for discovery, ensuring these pets are seen by a wide audience of potential adopters and foster homes. We streamline the initial contact process, getting the animals noticed fast.
                        </p>
                    </div>

                    <Separator className="md:hidden" />
                    
                    {/* Step 3: Match and Adoption */}
                    <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
                        <div className="shrink-0 w-full md:w-1/3 text-center">
                            <HeartHandshake className="w-10 h-10 mx-auto text-primary mb-2" />
                            <h3 className="text-lg font-semibold text-foreground">3. Securing the Connection</h3>
                        </div>
                        <p className="text-muted-foreground md:w-2/3 leading-relaxed">
                            We bridge the gap instantly by connecting you directly with our partnering shelters， ensuring every rescue has a swift, smooth transition to a forever home.
                        </p>
                    </div>
                </section>
                
                <Separator />

                {/* Call to Action / Impact (Kept Centered as this is a CTA) */}
                <section className="text-center pb-10">
                    <h2 className="text-2xl font-bold text-foreground">Your Role in the Mission</h2>
                    <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
                        By choosing Petbound, you are looking past the millions to focus on the soul that needs you most. Adopt, rescue, and empower a second chance at life by finding them a warm home and a best friend in you. 
                    </p>
                    <div className="mt-8">
                        <a href="/explore" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90">
                            Meet Your New Best Friend Here
                        </a>
                    </div>
                </section>
                
            </div>
        </div>
    )
}