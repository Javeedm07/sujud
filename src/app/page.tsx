
"use client";

import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface FeatureDetail {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageSrc: string;
  imageAlt: string;
  aiHint: string;
}

const newFeaturesData: FeatureDetail[] = [
  {
    title: "Daily Salah Tracker",
    description: "Mark each of your five daily prayers. A gently way to hold yourself accountable without judgement.",
    buttonText: "Get Started for Free",
    buttonLink: "/login",
    imageSrc: "https://placehold.co/600x450.png",
    imageAlt: "Illustration of daily salah tracking on a mobile app",
    aiHint: "prayer tracking app",
  },
  {
    title: "Insightful Analytics",
    description: "Reflect on your progress, notice your patterns, and gently realign your intentions.",
    buttonText: "Get Started for Free",
    buttonLink: "/login",
    imageSrc: "https://placehold.co/600x450.png",
    imageAlt: "Charts and graphs showing prayer analytics",
    aiHint: "analytics charts dashboard",
  },
  {
    title: "Personalised guidance for improvement",
    description: "Receive faith-rooted tips and practices tailored to your journey to help you improve your Salah.",
    buttonText: "Get Started for Free",
    buttonLink: "/login",
    imageSrc: "https://placehold.co/600x450.png",
    imageAlt: "Illustration of personalized guidance for spiritual improvement",
    aiHint: "guidance meditation",
  },
];

export default function LandingPage() {
  const howItWorksSteps = [
    { title: "Sign Up", description: "Start your journey by creating an account and setting a pure niyyah to stay consistent in your daily prayers." },
    { title: "Track Your Salah", description: "Easily log your five daily prayers and hold yourself accountable with every Salah you complete." },
    { title: "Reflect Through Insights", description: "View simple, insightful analytics that help you recognize patterns, celebrate consistency, and stay motivated without guilt." },
    { title: "Personalized Guidance", description: "Based on your habits and rhythm, receive spiritually grounded, personalized tips to improve your salah." },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <PublicNavbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-gradient-to-br from-[#01A6F6] to-[#2D5AFA]">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Left Content */}
            <div className="md:w-3/5 lg:w-1/2 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline text-white mb-6">
                Your personal companion to remain steadfast in Salah
              </h1>
              <p className="text-lg md:text-xl text-gray-100 mb-10 max-w-2xl mx-auto md:mx-0">
                Let Sujud help you build consistency in your daily salah
              </p>
              <Button
                size="lg"
                asChild
                className="bg-white text-primary hover:bg-gray-100 shadow-lg hover:shadow-xl transition-shadow rounded-full"
              >
                <Link href="/signup">
                  Get started for free
                  <ArrowRight className="ml-2 h-5 w-5 text-primary" />
                </Link>
              </Button>
            </div>

            {/* Right Image */}
            <div className="md:w-2/5 lg:w-1/2 mt-12 md:mt-0 flex justify-center md:justify-end">
              <div className="relative w-full max-w-md lg:max-w-lg aspect-[4/3] rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src="https://placehold.co/600x450.png"
                  alt="SUJUD App Interface Screenshot"
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint="app interface"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Redesigned */}
        <section id="features" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-center text-foreground mb-16 md:mb-20">
              Everything you need for a fulfilling Salah journey
            </h2>
            <div className="space-y-16 md:space-y-24">
              {newFeaturesData.map((feature, index) => (
                <div key={feature.title} className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
                  {/* Text Content Column */}
                  <div className={index % 2 === 0 ? "md:order-1" : "md:order-2"}> {/* Alternating order for text */}
                    <h3 className="text-2xl md:text-3xl font-bold font-headline text-primary mb-4">{feature.title}</h3>
                    <p className="text-lg text-muted-foreground mb-8">{feature.description}</p>
                    <Button
                      asChild
                      size="lg"
                      className="bg-gradient-to-br from-[#01A6F6] to-[#2D5AFA] text-primary-foreground hover:opacity-90 rounded-full"
                    >
                      <Link href={feature.buttonLink}>
                        {feature.buttonText}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                  {/* Image Column */}
                  <div className={index % 2 === 0 ? "md:order-2" : "md:order-1"}> {/* Alternating order for image */}
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden transition-shadow duration-300">
                      <Image
                        src={feature.imageSrc}
                        alt={feature.imageAlt}
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint={feature.aiHint}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 md:py-24 bg-secondary/30">
          <div className="container mx-auto px-4 text-center"> {/* Added text-center for the button */}
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-center text-foreground mb-16">
              Simple steps to spiritual growth
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"> {/* Added mb-12 for spacing */}
              {howItWorksSteps.map((step, index) => (
                <div key={index} className="flex flex-col items-center text-center p-6 rounded-lg bg-card shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                  {/* Button removed from here */}
                </div>
              ))}
            </div>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-br from-[#01A6F6] to-[#2D5AFA] text-primary-foreground hover:opacity-90 rounded-full"
            >
              <Link href="/login">
                Get Started for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
        
        {/* Testimonials Section - Removed */}

        {/* Call to Action Section */}
        <section className="py-20 md:py-32 bg-gradient-to-br from-[#01A6F6] to-[#2D5AFA] text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary-foreground mb-6">
              Embark on your path to consistent prayer today
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
              Join SUJUD and transform your spiritual routine. It's free to start, and the rewards are eternal.
            </p>
            <Button size="lg" variant="default" asChild className="bg-white text-primary hover:bg-gray-100 shadow-lg hover:shadow-xl transition-shadow rounded-full">
              <Link href="/signup">Sign Up Now <ArrowRight className="ml-2 h-5 w-5 text-primary" /></Link>
            </Button>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

