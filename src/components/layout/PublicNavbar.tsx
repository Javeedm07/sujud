
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useState } from 'react';
// ThemeToggle import removed

export default function PublicNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    // { href: "#testimonials", label: "Testimonials" }, // Testimonials link removed
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
          <Image src="/logo.svg" alt="SUJUD Logo" width={32} height={32} />
          <span className="text-2xl font-bold font-headline text-primary">SUJUD</span>
        </Link>

        <div className="flex items-center gap-3">
          <nav className="hidden md:flex items-center gap-6 mr-3">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ThemeToggle removed */}

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="bg-gradient-to-br from-[#01A6F6] to-[#2D5AFA] text-primary-foreground hover:opacity-90">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background p-6">
                <div className="flex flex-col space-y-6">
                  <Link href="/" className="flex items-center gap-2 mb-6" onClick={() => setIsMobileMenuOpen(false)}>
                    <Image src="/logo.svg" alt="SUJUD Logo" width={32} height={32} />
                    <span className="text-2xl font-bold font-headline text-primary">SUJUD</span>
                  </Link>
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="border-t border-border pt-6 space-y-3">
                    <Button variant="outline" className="w-full" asChild onClick={() => setIsMobileMenuOpen(false)}>
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button className="w-full bg-gradient-to-br from-[#01A6F6] to-[#2D5AFA] text-primary-foreground hover:opacity-90" asChild onClick={() => setIsMobileMenuOpen(false)}>
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
