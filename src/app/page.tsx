
"use client";

import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, Sparkles, BookOpenText, BarChart3, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  const features = [
    {
      icon: <CheckSquare className="h-10 w-10 text-primary" />,
      title: "Daily prayer checklist",
      description: "Easily mark your five daily prayers. Stay accountable and build a consistent habit.",
    },
    {
      icon: <BarChart3 className="h-10 w-10 text-primary" />,
      title: "Track your progress",
      description: "Visualize your prayer consistency over time with insightful statistics and charts.",
    },
    {
      icon: <Sparkles className="h-10 w-10 text-primary" />,
      title: "Daily inspiration",
      description: "Start your day with uplifting Islamic quotes and verses from the Quran to enlighten your path.",
    },
    {
      icon: <BookOpenText className="h-10 w-10 text-primary" />,
      title: "Personalized verse suggestion",
      description: "Facing a challenge? Share your thoughts and receive relevant Quranic verses for guidance and comfort.",
    },
  ];

  const howItWorksSteps = [
    { title: "Sign up for free", description: "Create your SUJUD account in seconds and start your journey." },
    { title: "Track your prayers", description: "Use the intuitive daily checklist to mark your completed Salah." },
    { title: "Seek guidance", description: "Explore daily inspirations and get personalized Quranic verses." },
    { title: "Observe your growth", description: "Monitor your progress and consistency on your personal dashboard." },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <PublicNavbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 md:py-32 text-center bg-gradient-to-br from-[#01A6F6] to-[#2D5AFA]">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold font-headline text-white mb-6">
              Your personal companion to remain steadfast in Salah
            </h1>
            <p className="text-lg md:text-xl text-gray-100 mb-10 max-w-3xl mx-auto">
              Let Sujud help you build consistency in your daily salah
            </p>
            <Button size="lg" variant="secondary" asChild className="shadow-lg hover:shadow-xl transition-shadow">
              <Link href="/signup" className="text-primary">Get started for free <ArrowRight className="ml-2 h-5 w-5 text-primary" /></Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-center text-foreground mb-16">
              Everything you need for a fulfilling prayer journey
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow bg-card">
                  <CardHeader className="items-center">
                    {feature.icon}
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardTitle className="text-xl font-semibold mb-2 text-foreground">{feature.title}</CardTitle>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-center text-primary mb-16">
              Simple steps to spiritual growth
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorksSteps.map((step, index) => (
                <div key={index} className="flex flex-col items-center text-center p-6 rounded-lg bg-card shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Testimonials Section - Placeholder */}
        <section id="testimonials" className="py-16 md:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-center text-primary mb-16">
              Loved by Muslims like you
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: "Aisha K.", quote: "SUJUD has transformed my prayer habits. The daily reminders and inspirational content keep me motivated!", image: "https://placehold.co/100x100.png", hint: "woman portrait" },
                { name: "Omar S.", quote: "Tracking my prayers has never been easier. The personalized verses are a wonderful touch for reflection.", image: "https://placehold.co/100x100.png", hint: "man portrait" },
                { name: "Fatima B.", quote: "A beautiful and intuitive app. It's my go-to companion for staying consistent with my Salah and finding peace.", image: "https://placehold.co/100x100.png", hint: "woman smiling" },
              ].map((testimonial, index) => (
                <Card key={index} className="shadow-lg bg-card p-6">
                  <CardContent className="flex flex-col items-center text-center">
                    <Image src={testimonial.image} alt={testimonial.name} width={80} height={80} className="rounded-full mb-4" data-ai-hint={testimonial.hint} />
                    <blockquote className="text-muted-foreground italic mb-4">&ldquo;{testimonial.quote}&rdquo;</blockquote>
                    <p className="font-semibold text-foreground">- {testimonial.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20 md:py-32 bg-primary text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary-foreground mb-6">
              Embark on your path to consistent prayer today
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
              Join SUJUD and transform your spiritual routine. It's free to start, and the rewards are eternal.
            </p>
            <Button size="lg" variant="secondary" asChild className="shadow-lg hover:shadow-xl transition-shadow">
              <Link href="/signup" className="text-primary">Sign Up Now <ArrowRight className="ml-2 h-5 w-5 text-primary" /></Link>
            </Button>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
